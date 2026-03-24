package com.knowledgegraphx.backend.service;

import com.knowledgegraphx.backend.model.QueryHistory;
import com.knowledgegraphx.backend.model.Session;
import com.knowledgegraphx.backend.model.User;
import com.knowledgegraphx.backend.repository.DocumentRepository;
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
    private final DocumentRepository documentRepository;
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

        // 1. Retrieve & Generate
        String answer = getAnswer(question, sessionId);

        // 2. Audit Logic
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

        // Broadcast the final AI Response
        messagingTemplate.convertAndSend("/topic/session/" + sessionId, 
                com.knowledgegraphx.backend.dto.ChatMessage.builder()
                        .type(com.knowledgegraphx.backend.dto.ChatMessage.MessageType.AI_RESPONSE)
                        .content(answer)
                        .sender("KnowledgeGraphX AI")
                        .sessionId(sessionId)
                        .build());

        return answer;
    }

    public String getAnswer(String question, Long sessionId) {
        // 1. Retrieve relevant chunks
        List<TextSegment> relevantChunks = vectorSearchService.searchRelevantChunks(question, sessionId, 10);
        
        // 2. Retrieve all documents in this session for context anchoring
        List<com.knowledgegraphx.backend.model.Document> sessionDocs = documentRepository.findBySessionId(sessionId);
        String docList = sessionDocs.stream()
                .map(d -> String.format("- %s (ID: %d)", d.getFileName(), d.getId()))
                .collect(Collectors.joining("\n"));

        // 3. Build Context
        String context = relevantChunks.isEmpty() 
            ? "No direct semantic matches found." 
            : relevantChunks.stream()
                .map(seg -> String.format("[Source Document ID: %s] %s", 
                        seg.metadata().getString("documentId"), 
                        seg.text()))
                .collect(Collectors.joining("\n\n"));

        // 4. Prompt Construction
        String promptTemplate = """
                You are a Knowledge Assistant for KnowledgeGraphX.
                You are operating in a workspace with the following indexed documents:
                %s
                
                Using the following retrieved context segments (if any) and your knowledge of the document list, answer the user's question.
                If the user asks about a specific file from the list above but no context segments are provided, you can mention that the file exists but no detailed content was retrieved.
                Always cite the source document IDs using [Source Document ID: X] when answering from context.
                
                Retrieved Context:
                %s
                
                Question:
                %s
                
                Answer:
                """;

        String fullPrompt = String.format(promptTemplate, docList, context, question);
        
        log.info("Generating AI Answer for session {}", sessionId);
        return chatLanguageModel.generate(fullPrompt);
    }
}
