package com.knowledgegraphx.backend.controller;

import com.knowledgegraphx.backend.service.QueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Objects;

@RestController
@RequestMapping("/query")
@RequiredArgsConstructor
public class QueryController {

    private final QueryService queryService;
    private final com.knowledgegraphx.backend.repository.QueryHistoryRepository queryHistoryRepository;

    @PostMapping("/ask")
    public ResponseEntity<?> askQuestion(
            @RequestBody Map<String, Object> body,
            Authentication authentication
    ) {
        String question = (body.get("question") != null) ? body.get("question").toString() : "";
        Long sessionId = (body.get("sessionId") != null) ? Long.valueOf(body.get("sessionId").toString()) : -1L;
        String email = (authentication != null && authentication.getName() != null) ? authentication.getName() : "Anonymous Researcher";
        
        if (sessionId == -1L) {
            return ResponseEntity.badRequest().body("Invalid sessionId");
        }

        com.knowledgegraphx.backend.dto.QueryResponse responseBody = queryService.performQuery(
                Objects.requireNonNull(question),
                Objects.requireNonNull(sessionId),
                Objects.requireNonNull(email));
        
        return ResponseEntity.ok(responseBody);
    }

    @GetMapping("/history/{sessionId}")
    public ResponseEntity<?> getHistory(@PathVariable Long sessionId) {
        try {
            java.util.List<com.knowledgegraphx.backend.model.QueryHistory> items = queryHistoryRepository.findBySessionIdOrderByTimestampDesc(sessionId);
            if (items == null) return ResponseEntity.ok(new java.util.ArrayList<>());
            
            java.util.List<com.knowledgegraphx.backend.dto.QueryHistoryResponse> responses = items.stream().map(h -> 
                com.knowledgegraphx.backend.dto.QueryHistoryResponse.builder()
                    .id(h.getId())
                    .question(h.getQuestion())
                    .response(h.getResponse())
                    .timestamp(h.getTimestamp().toString())
                    .senderEmail(h.getUser().getEmail())
                    .suggestedQueries(h.getSuggestedQueries() != null ? 
                        java.util.Arrays.asList(h.getSuggestedQueries().split(";")) : 
                        java.util.Collections.emptyList())
                    .build()
            ).collect(java.util.stream.Collectors.toList());
            
            return ResponseEntity.ok(responses);
        } catch (Exception e) {
            return ResponseEntity.ok(new java.util.ArrayList<>());
        }
    }
}
