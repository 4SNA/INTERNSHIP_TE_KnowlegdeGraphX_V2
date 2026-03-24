package com.knowledgegraphx.backend.controller;

import com.knowledgegraphx.backend.service.QueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

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
        String question = (String) body.get("question");
        Long sessionId = Long.valueOf(body.get("sessionId").toString());
        String email = authentication.getName();
        
        String response = queryService.performQuery(question, sessionId, email);
        
        // Finalizing the citation extraction (Basic logic for demonstration)
        List<String> sources = java.util.Arrays.asList("Source Document Citation");
        
        java.util.Map<String, Object> responseBody = new java.util.HashMap<>();
        responseBody.put("answer", response);
        responseBody.put("sources", sources);
        
        return ResponseEntity.ok(responseBody);
    }

    @GetMapping("/history/{sessionId}")
    public ResponseEntity<List<com.knowledgegraphx.backend.dto.QueryHistoryResponse>> getHistory(@PathVariable Long sessionId) {
        List<com.knowledgegraphx.backend.model.QueryHistory> items = queryHistoryRepository.findBySessionIdOrderByTimestampDesc(sessionId);
        
        List<com.knowledgegraphx.backend.dto.QueryHistoryResponse> responses = items.stream().map(h -> 
            com.knowledgegraphx.backend.dto.QueryHistoryResponse.builder()
                .id(h.getId())
                .question(h.getQuestion())
                .response(h.getResponse())
                .timestamp(h.getTimestamp().toString())
                .build()
        ).collect(java.util.stream.Collectors.toList());
        
        return ResponseEntity.ok(responses);
    }
}
