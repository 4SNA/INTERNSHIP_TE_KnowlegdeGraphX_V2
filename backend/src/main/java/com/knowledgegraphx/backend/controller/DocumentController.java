package com.knowledgegraphx.backend.controller;

import com.knowledgegraphx.backend.model.Document;
import com.knowledgegraphx.backend.service.DocumentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/documents")
@RequiredArgsConstructor
public class DocumentController {

    private final DocumentService documentService;
    private final com.knowledgegraphx.backend.repository.DocumentRepository documentRepository;

    @PostMapping("/upload")
    public ResponseEntity<Document> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("sessionId") Long sessionId,
            Authentication authentication
    ) throws IOException {
        String email = authentication.getName();
        
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        Document document = documentService.uploadDocument(file, sessionId, email);
        return ResponseEntity.ok(document);
    }

    @GetMapping("/{sessionId}")
    public ResponseEntity<List<Document>> getDocuments(@PathVariable Long sessionId) {
        return ResponseEntity.ok(documentRepository.findBySessionId(sessionId));
    }
}
