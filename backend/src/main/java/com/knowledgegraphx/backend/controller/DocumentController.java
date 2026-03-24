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
    public ResponseEntity<com.knowledgegraphx.backend.dto.DocumentResponse> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("sessionId") Long sessionId,
            Authentication authentication
    ) throws IOException {
        String email = authentication.getName();
        
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        Document document = documentService.uploadDocument(file, sessionId, email);
        return ResponseEntity.ok(convertToResponse(document));
    }

    @GetMapping("/{sessionId}")
    public ResponseEntity<List<com.knowledgegraphx.backend.dto.DocumentResponse>> getDocuments(@PathVariable Long sessionId) {
        List<Document> documents = documentRepository.findBySessionId(sessionId);
        List<com.knowledgegraphx.backend.dto.DocumentResponse> responses = documents.stream()
                .map(this::convertToResponse)
                .toList();
        return ResponseEntity.ok(responses);
    }

    private com.knowledgegraphx.backend.dto.DocumentResponse convertToResponse(Document doc) {
        return com.knowledgegraphx.backend.dto.DocumentResponse.builder()
                .id(doc.getId())
                .fileName(doc.getFileName())
                .fileType(doc.getFileType())
                .fileSize(doc.getFileSize())
                .createdAt(doc.getCreatedAt())
                .build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDocument(
            @PathVariable Long id,
            Authentication authentication
    ) {
        documentService.deleteDocument(id, authentication.getName());
        return ResponseEntity.ok().build();
    }
}
