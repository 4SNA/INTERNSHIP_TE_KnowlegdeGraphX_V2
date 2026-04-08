package com.knowledgegraphx.backend.controller;

import com.knowledgegraphx.backend.dto.graph.KnowledgeNetwork;
import com.knowledgegraphx.backend.service.GraphService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/sessions")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class GraphController {

    private final GraphService graphService;

    @GetMapping("/{sessionId}/graph")
    public ResponseEntity<KnowledgeNetwork> getKnowledgeNetwork(@PathVariable Long sessionId) {
        return ResponseEntity.ok(graphService.generateNetwork(sessionId));
    }

    @GetMapping("/{sessionId}/analyze-path")
    public ResponseEntity<java.util.Map<String, Object>> analyzeRelationshipPath(@PathVariable Long sessionId) {
        return ResponseEntity.ok(graphService.analyzeIntelligenceAudit(sessionId));
    }
}
