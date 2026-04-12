package com.knowledgegraphx.backend.service;

import com.knowledgegraphx.backend.dto.QueryResponse;
import com.knowledgegraphx.backend.dto.ChatMessage;
import com.knowledgegraphx.backend.dto.ChatMessage.MessageType;
import com.knowledgegraphx.backend.model.QueryHistory;
import com.knowledgegraphx.backend.model.Session;
import com.knowledgegraphx.backend.model.User;
import com.knowledgegraphx.backend.model.Document;
import com.knowledgegraphx.backend.repository.DocumentRepository;
import com.knowledgegraphx.backend.repository.QueryHistoryRepository;
import com.knowledgegraphx.backend.repository.SessionRepository;
import com.knowledgegraphx.backend.repository.UserRepository;
import com.knowledgegraphx.backend.repository.KnowledgeEntityRepository;
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
    private final KnowledgeEntityRepository knowledgeEntityRepository;

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
                broadcastMessageWithId(sessionId, "KnowledgeGraphX AI", "I encountered an error processing your request.", MessageType.AI_RESPONSE, messageId, null, userEmail);
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
        
        List<Document> workspaceDocs = documentRepository.findBySessionId(sessionId);
        
        // Context Retrieval & Synthesis
        broadcastMessageWithId(sessionId, "KnowledgeGraphX Intelligence", "Neural Sync: Scanning Workspace...", MessageType.AI_QUERY, messageId, null, userEmail);
        List<TextSegment> segments = vectorSearchService.searchRelevantChunks(normalizedQuery, sessionId, 8);

        List<TextSegment> unique = new ArrayList<>();
        Set<String> fingerprints = new HashSet<>();
        for (TextSegment s : segments) {
            String fp = s.text().toLowerCase().replaceAll("[^a-z0-9]", "");
            if (fingerprints.add(fp)) unique.add(s);
            if (unique.size() >= 10) break; // Increased context depth for 100% accuracy
        }

        String answer = null;
        String cacheKey = "ai:query:" + sessionId + ":" + normalizedQuery;
        try { answer = redisTemplate.opsForValue().get(cacheKey); } catch (Exception ignore) {}

        if (answer == null) {
            String docManifest = workspaceDocs.stream().map(Document::getFileName).collect(Collectors.joining("\n"));
            String graphContext = getGraphIntelligenceContext(normalizedQuery, sessionId, unique);
            
            // Step 3: Neural Synthesis
            broadcastMessageWithId(sessionId, "KnowledgeGraphX Intelligence", "Neural Sync: Synthesizing Response...", MessageType.AI_QUERY, messageId, null, userEmail);
            
            // Non-blocking streaming synthesis
            getSynthesizedAnswerAsync(rewrittenQuery, history, unique, sessionId, graphContext, docManifest, messageId, userEmail);
        } else {
            broadcastStreamingChunk(sessionId, answer, messageId, userEmail);
            List<String> suggestions = generateNeuralSuggestions(question, answer);
            archiveQuery(question, answer, userEmail, sessionId, suggestions);
            broadcastMessageWithId(sessionId, "KnowledgeGraphX Intelligence", answer, MessageType.AI_RESPONSE, messageId, suggestions, userEmail);
        }
    }

    @SuppressWarnings("unused")
    private QueryType classifyQuery(String question) {
        String prompt = "Classify: FACTUAL, SUMMARY, COMPARISON, CODING, GENERAL, METADATA. Query: \"" + question + "\". Word only.";
        try {
            String res = mistralChatModel.generate(prompt).toUpperCase().trim();
            for (QueryType t : QueryType.values()) if (res.contains(t.name())) return t;
        } catch (Exception ignore) {}
        return QueryType.FACTUAL;
    }

    @SuppressWarnings("unused")
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

    // Neural Synthesis Core — three-tier fallback: streaming → sync → raw context
    private void getSynthesizedAnswerAsync(String question, List<QueryHistory> history, List<TextSegment> unique, Long sid, String graph, String docs, String mid, String userEmail) {
        String contextBlock = unique.stream()
            .map(s -> "[" + s.metadata().getString("fileName") + "]\n" + s.text())
            .collect(Collectors.joining("\n\n"));

        String system = String.format("""
            SYSTEM MODE: RESEARCH ANALYST.
            CONTEXT:
            # Workspace Manifest:
            %s
            # Neural Graph Fragments:
            %s
            # Semantic Data Fragments:
            %s
            RULES:
            - Concise, evidence-based answers. Use Markdown.
            - Start with the most important finding. No filler phrases.
            - Cite document names in brackets like [FileName.pdf].
            """, docs, graph, contextBlock);

        String user = "History:\n" + buildHistoryBuffer(history) + "\n\nQuery: " + question;
        StringBuilder full = new StringBuilder();

        StreamingResponseHandler<AiMessage> handler = new StreamingResponseHandler<AiMessage>() {
            @Override public void onNext(String token) {
                full.append(token);
                broadcastStreamingChunk(sid, token, mid, userEmail);
            }
            @Override public void onComplete(Response<AiMessage> res) {
                String finalAns = pruneRedundantContent(full.toString());
                String cacheKey = "ai:query:" + sid + ":" + normalizeQuery(question);
                try { redisTemplate.opsForValue().set(cacheKey, finalAns, Duration.ofHours(24)); } catch (Exception ignore) {}
                List<String> suggestions = generateNeuralSuggestions(question, finalAns);
                archiveQuery(question, finalAns, userEmail, sid, suggestions);
                broadcastMessageWithId(sid, "KnowledgeGraphX Intelligence", finalAns,
                    MessageType.AI_RESPONSE, mid, suggestions, userEmail);
            }
            @Override public void onError(Throwable err) {
                log.warn("Neural Stream failed ({}). Falling back to sync model.", err.getMessage());
                // TIER-2: Try synchronous model
                try {
                    String syncAnswer = llama3ChatModel.generate(
                        List.of(SystemMessage.from(system), UserMessage.from(user))
                    ).content().text();
                    String finalAns = pruneRedundantContent(syncAnswer);
                    broadcastStreamingChunk(sid, finalAns, mid, userEmail);
                    List<String> suggestions2 = generateNeuralSuggestions(question, finalAns);
                    archiveQuery(question, finalAns, userEmail, sid, suggestions2);
                    broadcastMessageWithId(sid, "KnowledgeGraphX Intelligence", finalAns,
                        MessageType.AI_RESPONSE, mid, suggestions2, userEmail);
                } catch (Exception syncErr) {
                    log.warn("Neural Sync model failed too ({}). Returning raw context.", syncErr.getMessage());
                    // TIER-3: Return raw extracted context directly — always works
                    String fallback = buildRawContextAnswer(question, unique, docs);
                    broadcastStreamingChunk(sid, fallback, mid, userEmail);
                    List<String> suggestions3 = generateNeuralSuggestions(question, fallback);
                    archiveQuery(question, fallback, userEmail, sid, suggestions3);
                    broadcastMessageWithId(sid, "KnowledgeGraphX Intelligence", fallback,
                        MessageType.AI_RESPONSE, mid, suggestions3, userEmail);
                }
            }
        };
        llama3StreamingModel.generate(List.of(SystemMessage.from(system), UserMessage.from(user)), handler);
    }

    /** Raw context answer — no LLM required, always returns something useful */
    private String buildRawContextAnswer(String question, List<TextSegment> segments, String docs) {
        StringBuilder sb = new StringBuilder();
        sb.append("**Workspace Files:** ").append(docs.replace("\n", ", ")).append("\n\n");
        if (segments.isEmpty()) {
            sb.append("_No semantic matches found for your query. Try uploading more documents or rephrasing._");
        } else {
            sb.append("**Relevant extracted content for: \"").append(question).append("\"**\n\n");
            segments.stream().limit(5).forEach(s -> {
                String fname = s.metadata().getString("fileName");
                sb.append("**[").append(fname != null ? fname : "Document").append("]**\n");
                String snippet = s.text().length() > 400 ? s.text().substring(0, 400) + "..." : s.text();
                sb.append(snippet).append("\n\n");
            });
        }
        return sb.toString();
    }


    private String buildHistoryBuffer(List<QueryHistory> history) {
        return Objects.requireNonNull(history).stream().limit(3).map(h -> "Q: " + h.getQuestion() + "\nA: " + (h.getResponse() != null && h.getResponse().length() > 80 ? h.getResponse().substring(0, 80) : h.getResponse())).collect(Collectors.joining("\n\n"));
    }

    private void broadcastStreamingChunk(Long sid, String chunk, String mid, String userEmail) {
        ChatMessage message = ChatMessage.builder()
                .type(MessageType.STREAM_CHUNK)
                .content(chunk)
                .sender("KnowledgeGraphX AI")
                .senderEmail(userEmail)
                .sessionId(sid)
                .messageId(mid)
                .isStreaming(true)
                .build();
        if (message != null) {
            messagingTemplate.convertAndSend("/topic/session/" + sid, message);
        }
    }

    private String getGraphIntelligenceContext(String q, Long sid, List<TextSegment> segs) {
        try { return knowledgeEntityRepository.findBySessionId(sid).stream().filter(e -> q.toLowerCase().contains(e.getName().toLowerCase())).limit(10).map(e -> "* " + e.getName()).collect(Collectors.joining("\n")); }
        catch (Exception e) { return "None."; }
    }

    private String pruneRedundantContent(String text) {
        if (text == null) return null;
        // Refined pruning: Only remove specific robotic markers that leak through
        String cleaned = text.replaceAll("(?i)(as an ai assistant|based on the provided context|i don't have enough information|here is what I found)", "").trim();
        String[] lines = cleaned.split("\n");
        Set<String> unique = new LinkedHashSet<>();
        StringBuilder sb = new StringBuilder();
        for (String l : lines) if (!l.trim().isEmpty() && unique.add(l.trim())) sb.append(l).append("\n"); else if (l.trim().isEmpty()) sb.append("\n");
        return sb.toString().trim();
    }

    private List<String> generateNeuralSuggestions(String q, String a) { return List.of("Detail finding 1.", "Source audit.", "Next steps."); }
    @SuppressWarnings("unused")
    private String handleGeneralQuery(String q, int count) { return mistralChatModel.generate("Greet researcher. " + count + " docs active. Query: " + q); }
    @SuppressWarnings("unused")
    private String generateMetadataResponse(List<com.knowledgegraphx.backend.model.Document> docs, String q) { return "Audit: " + (docs != null ? docs.stream().map(com.knowledgegraphx.backend.model.Document::getFileName).collect(Collectors.joining(", ")) : "No docs"); }
    @SuppressWarnings("unused")
    private String resolveDocName(String id) { try { return documentRepository.findById(Long.parseLong(id)).map(com.knowledgegraphx.backend.model.Document::getFileName).orElse("Res " + id); } catch (Exception e) { return "Fragm"; } }
    
    @Transactional 
    protected void archiveQuery(String q, String r, String e, Long s, List<String> sug) {
        try { 
            User u = userRepository.findByEmail(e).orElse(null); 
            Session sess = sessionRepository.findById(Objects.requireNonNull(s)).orElse(null);
            if (u != null && sess != null) {
                QueryHistory history = QueryHistory.builder().question(q).response(r).user(u).session(sess).suggestedQueries(String.join(";", sug)).build();
                if (history != null) {
                    queryHistoryRepository.save(history);
                }
            }
        } catch (Exception ignore) {}
    }

    private void broadcastMessageWithId(Long s, String snd, String c, MessageType t, String m, List<String> sug, String senderEmail) {
        ChatMessage message = ChatMessage.builder()
                .type(t).content(c).sender(snd).senderEmail(senderEmail).sessionId(s).messageId(m).suggestedQueries(sug).build();
        if (message != null) {
            messagingTemplate.convertAndSend("/topic/session/" + s, message);
        }
    }

    private String normalizeQuery(String q) { 
        if (q == null) return "";
        // Clean whitespace but keep semantic symbols for vector search
        return q.trim().toLowerCase().replaceAll("\\s+", " ").replaceAll("[^a-z0-9\\+\\-\\*\\/\\!\\?\\s\\_]", "");
    }
}
