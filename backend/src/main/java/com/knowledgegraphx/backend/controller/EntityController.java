package com.knowledgegraphx.backend.controller;

import com.knowledgegraphx.backend.model.KnowledgeEntity;
import com.knowledgegraphx.backend.repository.KnowledgeEntityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/entities")
@RequiredArgsConstructor
public class EntityController {

    private final KnowledgeEntityRepository knowledgeEntityRepository;

    @GetMapping("/session/{sessionId}")
    public ResponseEntity<List<KnowledgeEntity>> getSessionEntities(@PathVariable Long sessionId) {
        return ResponseEntity.ok(knowledgeEntityRepository.findBySessionId(sessionId));
    }

    private final com.knowledgegraphx.backend.service.EntityExtractionService entityExtractionService;
    private final com.knowledgegraphx.backend.repository.DocumentRepository documentRepository;
    private final com.knowledgegraphx.backend.service.DocumentService documentService;

    @PostMapping("/reindex/{documentId}")
    public ResponseEntity<Void> reindexDocument(@PathVariable Long documentId) {
        documentRepository.findById(documentId).ifPresent(doc -> {
            String text = documentService.extractText(doc);
            entityExtractionService.extractAndSaveEntities(doc, text);
        });
        return ResponseEntity.ok().build();
    }
}
