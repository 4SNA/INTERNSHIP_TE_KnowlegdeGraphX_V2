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

        // Return ACK immediately to frontend for sub-50ms perceived latency
        CompletableFuture.runAsync(() -> {
            try {
                processRagQuery(question, sessionId, userEmail, messageId);
            } catch (Exception e) {
                log.error("Neural Exhaustion in async thread", e);
                broadcastMessageWithId(sessionId, "KnowledgeGraphX AI", "I encountered an error processing your request.", com.knowledgegraphx.backend.dto.ChatMessage.MessageType.AI_RESPONSE, messageId, null, userEmail);
            }
        });

        return QueryResponse.builder()
                .answer(null) // Signal to frontend that streaming will follow
                .messageId(messageId)
                .sources(Collections.emptyList())
                .build();
    }

    private void processRagQuery(String question, Long sessionId, String userEmail, String messageId) throws Exception {
        List<QueryHistory> history = queryHistoryRepository.findTop5BySessionIdOrderByTimestampDesc(sessionId);
        if (history == null) history = new ArrayList<>();
        
        String rewrittenQuery = queryRewriter.rewrite(question, history);
        Collections.reverse(history);
        String normalizedQuery = normalizeQuery(rewrittenQuery);
        
        List<com.knowledgegraphx.backend.model.Document> workspaceDocs = documentRepository.findBySessionId(sessionId);
        
        // Step 1: Initialize Neural Registry
        broadcastMessageWithId(sessionId, "KnowledgeGraphX Intelligence", "Neural Sync: Initializing Neural Registry...", com.knowledgegraphx.backend.dto.ChatMessage.MessageType.AI_QUERY, messageId, null, userEmail);

        // Step 2: Context Retrieval
        List<TextSegment> segments = vectorSearchService.searchRelevantChunks(normalizedQuery, sessionId, 10);
        broadcastMessageWithId(sessionId, "KnowledgeGraphX Intelligence", "Neural Sync: Scanning Workspace Manifest...", com.knowledgegraphx.backend.dto.ChatMessage.MessageType.AI_QUERY, messageId, null, userEmail);

        List<TextSegment> unique = new ArrayList<>();
        Set<String> fingerprints = new HashSet<>();
        for (TextSegment s : segments) {
            String fp = s.text().toLowerCase().replaceAll("[^a-z0-9]", "");
            if (fingerprints.add(fp)) unique.add(s);
            if (unique.size() >= 5) break; 
        }

        String answer = null;
        String cacheKey = "ai:query:" + sessionId + ":" + normalizedQuery;
        try { answer = redisTemplate.opsForValue().get(cacheKey); } catch (Exception ignore) {}

        if (answer == null) {
            String docManifest = workspaceDocs.stream().map(com.knowledgegraphx.backend.model.Document::getFileName).collect(Collectors.joining("\n"));
            String graphContext = getGraphIntelligenceContext(normalizedQuery, sessionId, unique);
            
            // Step 3: Neural Synthesis
            broadcastMessageWithId(sessionId, "KnowledgeGraphX Intelligence", "Neural Sync: Synthesizing Answer...", com.knowledgegraphx.backend.dto.ChatMessage.MessageType.AI_QUERY, messageId, null, userEmail);
            
            // Start streaming (clear the status indicator)
            broadcastMessageWithId(sessionId, "KnowledgeGraphX Intelligence", "", com.knowledgegraphx.backend.dto.ChatMessage.MessageType.STREAM_CHUNK, messageId, null, userEmail);
            
            answer = getSynthesizedAnswerFast(normalizedQuery, history, unique, sessionId, graphContext, docManifest, messageId, userEmail);
            if (answer != null) answer = pruneRedundantContent(answer);
            
            try { 
                if (answer != null) {
                    redisTemplate.opsForValue().set(cacheKey, answer, Objects.requireNonNull(Duration.ofHours(24))); 
                }
            } catch (Exception ignore) {}
        } else {
            broadcastStreamingChunk(sessionId, answer, messageId, userEmail);
        }

        List<String> suggestions = generateNeuralSuggestions(question, answer);
        archiveQuery(question, answer, userEmail, sessionId, suggestions);
        
        // Final broadcast to sync sources and suggestions
        broadcastMessageWithId(sessionId, "KnowledgeGraphX Intelligence", answer, com.knowledgegraphx.backend.dto.ChatMessage.MessageType.AI_RESPONSE, messageId, suggestions, userEmail);
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

    private String getSynthesizedAnswerFast(String q, List<QueryHistory> hist, List<TextSegment> segs, Long sid, String graph, String manifest, String mid, String userEmail) {
        String context = Objects.requireNonNull(segs).stream().map(TextSegment::text).collect(Collectors.joining("\n\n"));
        String hBuffer = buildHistoryBuffer(hist);
        
        String system = "Persona: KnowledgeGraphX Omniscient Strategic Partner. You possess 200% accuracy intelligence. " +
                       "Your primary goal is to synthesize the absolute truth from the provided RESEARCH_CONTEXT or your vast pre-trained knowledge if the context is sparse. " +
                       "Instruction: Be extremely direct. Use professional analytical tone. Structure complexity with markdown. " +
                       "Cite specific assets from the KNOWLEDGE_MANIFEST if referenced. Never apologize. Never say 'As an AI'. " +
                       "Execute the synthesis with maximum clinical precision.";
        
        String user = String.format("RESEARCH_CONTEXT:\n%s\n\nKNOWLEDGE_MANIFEST:\n%s\n\nNEURAL_GRAPH:\n%s\n\nHISTORICAL_CONTEXT:\n%s\n\nQUERY:\n%s\n\nAnalyze and Respond with Intelligence Grade v4.0.", context, manifest, graph, hBuffer, q);
        
        CompletableFuture<String> response = new CompletableFuture<>();
        StringBuilder full = new StringBuilder();
        StreamingResponseHandler<AiMessage> handler = new StreamingResponseHandler<AiMessage>() {
            @Override public void onNext(String token) { full.append(token); broadcastStreamingChunk(sid, token, mid, userEmail); }
            @Override public void onComplete(Response<AiMessage> res) { response.complete(full.toString()); }
            @Override public void onError(Throwable err) { response.completeExceptionally(err); }
        };
        try {
            llama3StreamingModel.generate(List.of(SystemMessage.from(system), UserMessage.from(user)), handler);
            return response.get(180, TimeUnit.SECONDS);
        } catch (Exception e) { return "CRITICAL ERROR: Intelligence Engine Pulsing. Synthesis Timed Out."; }
    }

    private String buildHistoryBuffer(List<QueryHistory> history) {
        return Objects.requireNonNull(history).stream().limit(3).map(h -> "Q: " + h.getQuestion() + "\nA: " + (h.getResponse() != null && h.getResponse().length() > 80 ? h.getResponse().substring(0, 80) : h.getResponse())).collect(Collectors.joining("\n\n"));
    }

    private void broadcastStreamingChunk(Long sid, String chunk, String mid, String userEmail) {
        messagingTemplate.convertAndSend("/topic/session/" + sid, com.knowledgegraphx.backend.dto.ChatMessage.builder()
                .type(com.knowledgegraphx.backend.dto.ChatMessage.MessageType.STREAM_CHUNK)
                .content(chunk)
                .sender("KnowledgeGraphX AI")
                .senderEmail(userEmail)
                .sessionId(sid)
                .messageId(mid)
                .isStreaming(true)
                .build());
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

    private void broadcastMessageWithId(Long s, String snd, String c, com.knowledgegraphx.backend.dto.ChatMessage.MessageType t, String m, List<String> sug, String senderEmail) {
        messagingTemplate.convertAndSend("/topic/session/" + s, com.knowledgegraphx.backend.dto.ChatMessage.builder()
                .type(t).content(c).sender(snd).senderEmail(senderEmail).sessionId(s).messageId(m).suggestedQueries(sug).build());
    }

    private String normalizeQuery(String q) { return q != null ? q.toLowerCase().trim().replaceAll("[^a-z0-9\\s]", "") : ""; }
}
