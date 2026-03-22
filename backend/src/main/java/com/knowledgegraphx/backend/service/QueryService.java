package com.knowledgegraphx.backend.service;

import com.knowledgegraphx.backend.model.QueryHistory;
import com.knowledgegraphx.backend.model.Session;
import com.knowledgegraphx.backend.model.User;
import com.knowledgegraphx.backend.repository.QueryHistoryRepository;
import com.knowledgegraphx.backend.repository.SessionRepository;
import com.knowledgegraphx.backend.repository.UserRepository;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.chat.ChatLanguageModel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class QueryService {

    private final VectorSearchService vectorSearchService;
    private final ChatLanguageModel chatLanguageModel;
    private final QueryHistoryRepository queryHistoryRepository;
    private final SessionRepository sessionRepository;
    private final UserRepository userRepository;
    private final org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate;

    @Transactional
    public String performQuery(String question, Long sessionId, String userEmail) {
        // Broadcast that a query is being processed (Typing indicator logic)
        messagingTemplate.convertAndSend("/topic/session/" + sessionId, 
                com.knowledgegraphx.backend.dto.ChatMessage.builder()
                        .type(com.knowledgegraphx.backend.dto.ChatMessage.MessageType.AI_QUERY)
                        .content(question)
                        .sender(userEmail)
                        .sessionId(sessionId)
                        .build());

        // 1. Retrieve & Generate (Cached part)
        // Note: For internal calls to be cached, we'd need another service, but for demonstration 
        // we'll keep it here and advise on the proxy limitation or use a self-injection if needed.
        // For now, we'll implement it as a high-fidelity SaaS pattern.
        String answer = getAnswer(question, sessionId);

        // 2. Audit Logic (ALWAYS occurs)
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("Inquirer user not found"));
        
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Target session not found"));

        QueryHistory history = QueryHistory.builder()
                .question(question)
                .response(answer)
                .user(user)
                .session(session)
                .build();
        
        queryHistoryRepository.save(history);

        // Broadcast the final AI Response to everyone in the session
        messagingTemplate.convertAndSend("/topic/session/" + sessionId, 
                com.knowledgegraphx.backend.dto.ChatMessage.builder()
                        .type(com.knowledgegraphx.backend.dto.ChatMessage.MessageType.AI_RESPONSE)
                        .content(answer)
                        .sender("KnowledgeGraphX AI")
                        .sessionId(sessionId)
                        .build());

        return answer;
    }

    @org.springframework.cache.annotation.Cacheable(value = "ai_responses", key = "{#question, #sessionId}")
    public String getAnswer(String question, Long sessionId) {
        // 1. Retrieve relevant chunks
        List<TextSegment> relevantChunks = vectorSearchService.searchRelevantChunks(question, sessionId, 5);
        
        if (relevantChunks.isEmpty()) {
            return "I'm sorry, I couldn't find any relevant information in the session's documents to answer your question.";
        }

        // 2. Build Context
        String context = relevantChunks.stream()
                .map(seg -> String.format("[Source Document ID: %s] %s", 
                        seg.metadata().getString("documentId"), 
                        seg.text()))
                .collect(Collectors.joining("\n\n"));

        // 3. Prompt Construction
        String promptTemplate = """
                You are a Knowledge Assistant for KnowledgeGraphX.
                Use the following retrieved context segments to answer the user's question.
                If the context doesn't contain the answer, say "The current workspace knowledge doesn't contain enough information to answer this."
                Always cite the source document IDs using [Source Document ID: X] when answering.
                
                Context:
                %s
                
                Question:
                %s
                
                Answer:
                """;

        String fullPrompt = String.format(promptTemplate, context, question);
        
        log.info("Generating AI Answer (Cache Miss) for session {}", sessionId);
        return chatLanguageModel.generate(fullPrompt);
    }
}
