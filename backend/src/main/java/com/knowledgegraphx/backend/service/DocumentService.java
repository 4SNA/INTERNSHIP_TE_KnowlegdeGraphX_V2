package com.knowledgegraphx.backend.service;

import com.knowledgegraphx.backend.model.Document;
import com.knowledgegraphx.backend.model.Session;
import com.knowledgegraphx.backend.model.User;
import com.knowledgegraphx.backend.repository.DocumentRepository;
import com.knowledgegraphx.backend.repository.SessionRepository;
import com.knowledgegraphx.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.tika.Tika;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.boot.context.event.ApplicationReadyEvent;
import org.springframework.context.event.EventListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class DocumentService {

    private final DocumentRepository documentRepository;
    private final SessionRepository sessionRepository;
    private final UserRepository userRepository;
    private final VectorSearchService vectorSearchService;
    private final SessionService sessionService;
    private final Tika tika = new Tika();

    private final Path root = Paths.get("uploads");

    @Transactional
    public Document uploadDocument(MultipartFile file, Long sessionId, String userEmail) throws IOException {
        if (!Files.exists(root)) {
            Files.createDirectories(root);
        }

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
        
        Session session = sessionRepository.findById(sessionId)
                .orElseThrow(() -> new RuntimeException("Session not found"));

        String originalFilename = file.getOriginalFilename();
        String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
        String storedFilename = UUID.randomUUID().toString() + extension;
        Path filePath = root.resolve(storedFilename);

        Files.copy(file.getInputStream(), filePath);

        Document document = Document.builder()
                .fileName(originalFilename)
                .fileType(file.getContentType())
                .fileSize(file.getSize())
                .filePath(filePath.toString())
                .uploadedBy(user)
                .session(session)
                .build();

        Document savedDoc = documentRepository.save(document);
        
        // Semantic Indexing
        String extractedText = extractText(savedDoc);
        vectorSearchService.ingestDocument(extractedText, sessionId, savedDoc.getId());
        
        return savedDoc;
    }

    public String extractText(Document document) {
        try {
            Path path = Paths.get(document.getFilePath());
            return tika.parseToString(path);
        } catch (Exception e) {
            log.error("Failed to extract text from document: {}", document.getFileName(), e);
            return "";
        }
    }

    @Transactional
    public void deleteDocument(Long documentId, String userEmail) {
        Document document = documentRepository.findById(documentId)
                .orElseThrow(() -> new RuntimeException("Document not found"));

        if (!document.getUploadedBy().getEmail().equals(userEmail)) {
            throw new RuntimeException("Access denied: You can only delete your own documents");
        }

        try {
            // Delete physical file
            Files.deleteIfExists(Paths.get(document.getFilePath()));
            // Clear semantic vectors
            vectorSearchService.deleteVectorsByDocumentId(documentId);
            // Delete from DB
            documentRepository.delete(document);
        } catch (IOException e) {
            log.error("Failed to delete document file: {}", document.getFileName(), e);
            throw new RuntimeException("Failed to delete document file");
        }
    }
    
    @EventListener(ApplicationReadyEvent.class)
    @Transactional
    public void onApplicationReady() {
        System.out.println("Neural Graph Sync: Initializing system-wide document re-indexing...");
        List<Document> allDocs = documentRepository.findAll();
        for (Document doc : allDocs) {
            try {
                Path filePath = root.resolve(doc.getFileName());
                if (Files.exists(filePath)) {
                    String text = tika.parseToString(filePath.toFile());
                    vectorSearchService.ingestDocument(text, doc.getSession().getId(), doc.getId());
                }
            } catch (Exception e) {
                System.err.println("Failed to re-index document " + doc.getId() + ": " + e.getMessage());
            }
        }
        System.out.println("Neural Graph Sync: Re-indexing complete for " + allDocs.size() + " documents.");

        // WORKSPACE RECOVERY AUDIT
        System.out.println("Workspace Registry: Auditing session ownership...");
        sessionService.auditSessionOwnership();
    }
}
