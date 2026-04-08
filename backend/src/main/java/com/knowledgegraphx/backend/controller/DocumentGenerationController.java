package com.knowledgegraphx.backend.controller;

import com.knowledgegraphx.backend.service.DocumentGenerationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * KnowledgeGraphX Document Generation Controller
 *
 * Handles on-demand document generation requests (reports, summaries, notes, code, comparisons).
 */
@RestController
@RequestMapping("/generate")
@RequiredArgsConstructor
@Slf4j
public class DocumentGenerationController {

    private final DocumentGenerationService documentGenerationService;

    /**
     * POST /generate/document
     * Body: { "prompt": "...", "sessionId": 1, "type": "REPORT|SUMMARY|NOTES|COMPARISON|CODE|CUSTOM" }
     */
    @PostMapping("/document")
    public ResponseEntity<?> generateDocument(
            @RequestBody Map<String, Object> body,
            Authentication authentication
    ) {
        try {
            String prompt = (String) body.getOrDefault("prompt", "Generate a comprehensive overview.");
            Long sessionId = Long.valueOf(body.get("sessionId").toString());
            String type = (String) body.getOrDefault("type", "CUSTOM");
            String email = authentication != null ? authentication.getName() : "Anonymous";

            log.info("Document Generation: '{}' request by {} for session {}", type, email, sessionId);

            String generatedContent = documentGenerationService.generate(prompt, sessionId, type);

            return ResponseEntity.ok(Map.of(
                    "content", generatedContent,
                    "type", type,
                    "sessionId", sessionId,
                    "generatedBy", "KnowledgeGraphX Neural Engine"
            ));
        } catch (Exception e) {
            log.error("Document generation failed", e);
            return ResponseEntity.internalServerError().body(
                    Map.of("error", "Generation failed. Please try again.", "details", e.getMessage())
            );
        }
    }
}
