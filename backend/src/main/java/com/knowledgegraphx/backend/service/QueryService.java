package com.knowledgegraphx.backend.service;

import com.knowledgegraphx.backend.dto.QueryResponse;
import com.knowledgegraphx.backend.model.QueryHistory;
import com.knowledgegraphx.backend.model.Session;
import com.knowledgegraphx.backend.model.User;
import com.knowledgegraphx.backend.repository.DocumentRepository;
import com.knowledgegraphx.backend.repository.QueryHistoryRepository;
import com.knowledgegraphx.backend.repository.SessionRepository;
import com.knowledgegraphx.backend.repository.UserRepository;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.chat.StreamingChatLanguageModel;
import dev.langchain4j.model.StreamingResponseHandler;
import dev.langchain4j.model.output.Response;
import dev.langchain4j.data.message.AiMessage;
import dev.langchain4j.data.message.SystemMessage;
import dev.langchain4j.data.message.UserMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;
import java.util.Collections;
import java.util.HashSet;
import java.util.ArrayList;
import java.util.Set;
import java.util.LinkedHashSet;
import java.util.concurrent.CompletableFuture;
import java.util.concurrent.TimeUnit;
import java.util.Objects;
import java.time.Duration;

@Service
@RequiredArgsConstructor
@Slf4j
public class QueryService {

    private final VectorSearchService vectorSearchService;
    @org.springframework.beans.factory.annotation.Qualifier("mistralChatModel")
    private final ChatLanguageModel mistralChatModel;
    @org.springframework.beans.factory.annotation.Qualifier("llama3ChatModel")
    private final ChatLanguageModel llama3ChatModel;
    @org.springframework.beans.factory.annotation.Qualifier("mistralStreamingModel")
    private final StreamingChatLanguageModel mistralStreamingModel;
    @org.springframework.beans.factory.annotation.Qualifier("llama3StreamingModel")
    private final StreamingChatLanguageModel llama3StreamingModel;
    private final QueryHistoryRepository queryHistoryRepository;
    private final SessionRepository sessionRepository;
    private final UserRepository userRepository;
    private final DocumentRepository documentRepository;
    private final QueryRewriter queryRewriter;
    private final org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate;
    private final org.springframework.data.redis.core.StringRedisTemplate redisTemplate;
    private final com.knowledgegraphx.backend.repository.KnowledgeEntityRepository knowledgeEntityRepository;

    public enum QueryType { FACTUAL, SUMMARY, COMPARISON, CODING, GENERAL, METADATA }

    public QueryResponse performQuery(@org.springframework.lang.NonNull String question, @org.springframework.lang.NonNull Long sessionId, @org.springframework.lang.NonNull String userEmail) {
        String messageId = java.util.UUID.randomUUID().toString();
        log.info("Neural Sync: Query Transaction {} for session {}", messageId, sessionId);
        
        if (question.trim().isEmpty()) {
            return QueryResponse.builder().answer("Neural Pulse Active. How can I assist?").sources(Collections.emptyList()).build();
        }

        List<QueryHistory> history = queryHistoryRepository.findTop5BySessionIdOrderByTimestampDesc(sessionId);
        if (history == null) history = new ArrayList<>();
        
        String rewrittenQuery = queryRewriter.rewrite(question, history);
        Collections.reverse(history);
        String normalizedQuery = normalizeQuery(rewrittenQuery);
        
        List<com.knowledgegraphx.backend.model.Document> workspaceDocs = documentRepository.findBySessionId(sessionId);
        broadcastMessageWithId(sessionId, userEmail, question, com.knowledgegraphx.backend.dto.ChatMessage.MessageType.AI_QUERY, messageId, null);

        try {
            CompletableFuture<List<TextSegment>> segmentsFuture = CompletableFuture.supplyAsync(() -> {
                try {
                    List<TextSegment> raw = vectorSearchService.searchRelevantChunks(normalizedQuery, sessionId, 6);
                    List<TextSegment> unique = new ArrayList<>();
                    Set<String> fingerprints = new HashSet<>();
                    for (TextSegment s : raw) {
                        String fp = s.text().toLowerCase().replaceAll("[^a-z0-9]", "");
                        if (fingerprints.add(fp)) unique.add(s);
                        if (unique.size() >= 3) break;
                    }
                    return unique;
                } catch (Exception e) { return new ArrayList<>(); }
            });

            List<TextSegment> segments = segmentsFuture.get(10, TimeUnit.SECONDS);
            String docManifest = workspaceDocs.stream().map(com.knowledgegraphx.backend.model.Document::getFileName).collect(Collectors.joining("\n"));
            String graphContext = getGraphIntelligenceContext(normalizedQuery, sessionId, segments);

            Set<String> distinctSources = new HashSet<>();
            for (TextSegment seg : segments) {
                String dId = seg.metadata().getString("documentId");
                if (dId != null) distinctSources.add(resolveDocName(dId));
            }

            String answer = null;
            String cacheKey = "ai:query:" + sessionId + ":" + normalizedQuery;
            try { answer = redisTemplate.opsForValue().get(cacheKey); } catch (Exception ignore) {}

            if (answer == null) {
                answer = getSynthesizedAnswerFast(normalizedQuery, history, segments, sessionId, graphContext, docManifest, messageId);
                if (answer != null) answer = pruneRedundantContent(answer);
                
                try { 
                    if (answer != null) {
                        redisTemplate.opsForValue().set(cacheKey, answer, Objects.requireNonNull(Duration.ofHours(12))); 
                    }
                } catch (Exception ignore) {}
            } else {
                broadcastStreamingChunk(sessionId, answer, messageId);
            }

            List<String> suggestions = generateNeuralSuggestions(question, answer);
            archiveQuery(question, answer, userEmail, sessionId, suggestions);
            broadcastMessageWithId(sessionId, "KnowledgeGraphX AI", answer, com.knowledgegraphx.backend.dto.ChatMessage.MessageType.AI_RESPONSE, messageId, suggestions);

            return QueryResponse.builder().answer(answer).sources(new ArrayList<>(distinctSources)).suggestedQueries(suggestions).messageId(messageId).build();

        } catch (Exception e) {
            log.error("Neural Exhaustion", e);
            return QueryResponse.builder().answer("I encountered an internal error.").sources(Collections.emptyList()).build();
        }
    }

    private QueryType classifyQuery(String question) {
        String prompt = "Classify: FACTUAL, SUMMARY, COMPARISON, CODING, GENERAL, METADATA. Query: \"" + question + "\". Word only.";
        try {
            String res = mistralChatModel.generate(prompt).toUpperCase().trim();
            for (QueryType t : QueryType.values()) if (res.contains(t.name())) return t;
        } catch (Exception ignore) {}
        return QueryType.FACTUAL;
    }

    private String generateResearchPlan(String q, List<TextSegment> segs, String graph, QueryType t, String c, String history) {
        String prompt = String.format("""
            SYSTEM PLANNER: ARCHITECT MODE.
            Archetype: %s | Confidence: %s | History: %s
            TASKS:
            1. MULTI-DOCUMENT SCAN: Cross-file correlations.
            2. REASONING PATH: Unified structural path.
            Query: %s | Context: %s
            """, t, c, history, q, Objects.requireNonNull(segs).stream().map(TextSegment::text).collect(Collectors.joining("\n")));
        return mistralChatModel.generate(prompt);
    }

    private String getSynthesizedAnswerFast(String q, List<QueryHistory> hist, List<TextSegment> segs, Long sid, String graph, String manifest, String mid) {
        String context = Objects.requireNonNull(segs).stream().map(TextSegment::text).collect(Collectors.joining("\n\n"));
        String hBuffer = buildHistoryBuffer(hist);
        
        String system = "Persona: KnowledgeGraphX Partner. Be extremely direct and accurate. Avoid filler phrases. Answer the question immediately based on the provided context.";
        String user = String.format("HISTORY:\n%s\n\nASSETS:\n%s\n\nGRAPH:\n%s\n\nCONTEXT:\n%s\n\nUSER QUERY:\n%s\n\nRespond directly.", hBuffer, manifest, graph, context, q);
        
        CompletableFuture<String> response = new CompletableFuture<>();
        StringBuilder full = new StringBuilder();
        StreamingResponseHandler<AiMessage> handler = new StreamingResponseHandler<AiMessage>() {
            @Override public void onNext(String token) { full.append(token); broadcastStreamingChunk(sid, token, mid); }
            @Override public void onComplete(Response<AiMessage> res) { response.complete(full.toString()); }
            @Override public void onError(Throwable err) { response.completeExceptionally(err); }
        };
        try {
            llama3StreamingModel.generate(List.of(SystemMessage.from(system), UserMessage.from(user)), handler);
            return response.get(120, TimeUnit.SECONDS);
        } catch (Exception e) { return "Recovery: Generation interrupted."; }
    }

    private String buildHistoryBuffer(List<QueryHistory> history) {
        return Objects.requireNonNull(history).stream().limit(3).map(h -> "Q: " + h.getQuestion() + "\nA: " + (h.getResponse() != null && h.getResponse().length() > 80 ? h.getResponse().substring(0, 80) : h.getResponse())).collect(Collectors.joining("\n\n"));
    }

    private void broadcastStreamingChunk(Long sid, String chunk, String mid) {
        messagingTemplate.convertAndSend("/topic/session/" + sid, com.knowledgegraphx.backend.dto.ChatMessage.builder().type(com.knowledgegraphx.backend.dto.ChatMessage.MessageType.STREAM_CHUNK).content(chunk).sessionId(sid).messageId(mid).isStreaming(true).build());
    }

    private String getGraphIntelligenceContext(String q, Long sid, List<TextSegment> segs) {
        try { return knowledgeEntityRepository.findBySessionId(sid).stream().filter(e -> q.toLowerCase().contains(e.getName().toLowerCase())).limit(10).map(e -> "* " + e.getName()).collect(Collectors.joining("\n")); }
        catch (Exception e) { return "None."; }
    }

    private String pruneRedundantContent(String text) {
        if (text == null) return null;
        String cleaned = text.replaceAll("(?i)(as an ai|based on context|understood|here is the|please let me know|i analyzed)", "").trim();
        String[] lines = cleaned.split("\n");
        Set<String> unique = new LinkedHashSet<>();
        StringBuilder sb = new StringBuilder();
        for (String l : lines) if (!l.trim().isEmpty() && unique.add(l.trim())) sb.append(l).append("\n"); else if (l.trim().isEmpty()) sb.append("\n");
        return sb.toString().trim();
    }

    private String handleGeneralQuery(String q, int count) { return mistralChatModel.generate("Greet researcher. " + count + " docs active. Query: " + q); }
    private String generateMetadataResponse(List<com.knowledgegraphx.backend.model.Document> docs, String q) { return "Audit: " + (docs != null ? docs.stream().map(com.knowledgegraphx.backend.model.Document::getFileName).collect(Collectors.joining(", ")) : "No docs"); }
    private List<String> generateNeuralSuggestions(String q, String a) { return List.of("Detail finding 1.", "Source audit.", "Next steps."); }
    private String resolveDocName(String id) { try { return documentRepository.findById(Long.parseLong(id)).map(com.knowledgegraphx.backend.model.Document::getFileName).orElse("Res " + id); } catch (Exception e) { return "Fragm"; } }
    
    @Transactional 
    protected void archiveQuery(String q, String r, String e, Long s, List<String> sug) {
        try { 
            User u = userRepository.findByEmail(e).orElse(null); 
            Session sess = sessionRepository.findById(s).orElse(null);
            if (u != null && sess != null) {
                queryHistoryRepository.save(QueryHistory.builder().question(q).response(r).user(u).session(sess).suggestedQueries(String.join(";", sug)).build());
            }
        } catch (Exception ignore) {}
    }

    private void broadcastMessageWithId(Long s, String snd, String c, com.knowledgegraphx.backend.dto.ChatMessage.MessageType t, String m, List<String> sug) {
        messagingTemplate.convertAndSend("/topic/session/" + s, com.knowledgegraphx.backend.dto.ChatMessage.builder().type(t).content(c).sender(snd).sessionId(s).messageId(m).suggestedQueries(sug).build());
    }

    private String normalizeQuery(String q) { return q != null ? q.toLowerCase().trim().replaceAll("[^a-z0-9\\s]", "") : ""; }
}
