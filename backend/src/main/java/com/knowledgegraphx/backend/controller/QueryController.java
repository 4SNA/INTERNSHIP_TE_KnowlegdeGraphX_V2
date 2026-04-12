package com.knowledgegraphx.backend.controller;

import com.knowledgegraphx.backend.service.QueryService;
import com.knowledgegraphx.backend.model.QueryHistory;
import com.knowledgegraphx.backend.repository.QueryHistoryRepository;
import com.knowledgegraphx.backend.dto.QueryResponse;
import com.knowledgegraphx.backend.dto.QueryHistoryResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Objects;
import java.util.List;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/query")
@RequiredArgsConstructor
public class QueryController {

    private final QueryService queryService;
    private final QueryHistoryRepository queryHistoryRepository;

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

        QueryResponse responseBody = queryService.performQuery(
                Objects.requireNonNull(question),
                Objects.requireNonNull(sessionId),
                Objects.requireNonNull(email));
        
        return ResponseEntity.ok(responseBody);
    }

    @GetMapping("/history/{sessionId}")
    public ResponseEntity<?> getHistory(@PathVariable Long sessionId) {
        try {
            List<QueryHistory> items = queryHistoryRepository.findBySessionIdOrderByTimestampDesc(sessionId);
            if (items == null) return ResponseEntity.ok(new ArrayList<>());
            
            List<QueryHistoryResponse> responses = items.stream().map(h -> 
                QueryHistoryResponse.builder()
                    .id(h.getId())
                    .question(h.getQuestion())
                    .response(h.getResponse())
                    .timestamp(h.getTimestamp().toString())
                    .senderEmail(h.getUser() != null ? h.getUser().getEmail() : "system")
                    .suggestedQueries(h.getSuggestedQueries() != null ? 
                        Arrays.asList(h.getSuggestedQueries().split(";")) : 
                        Collections.emptyList())
                    .build()
            ).collect(Collectors.toList());
            
            return ResponseEntity.ok(responses);
        } catch (Exception e) {
            return ResponseEntity.ok(new ArrayList<>());
        }
    }
}

