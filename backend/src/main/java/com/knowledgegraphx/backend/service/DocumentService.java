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
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.apache.poi.xwpf.usermodel.*;
import com.opencsv.CSVReader;

import java.io.InputStream;

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
    private final org.springframework.data.redis.core.StringRedisTemplate redisTemplate;
    private final EntityExtractionService entityExtractionService;
    private final org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate;
    private final Tika tika = new Tika();

    private void evictSessionAiCache(Long sessionId) {
        try {
            String pattern = "ai:query:" + sessionId + ":*";
            java.util.Set<String> keys = redisTemplate.keys(pattern);
            if (keys != null && !keys.isEmpty()) {
                redisTemplate.delete(keys);
                log.info("Neural Purge: Evicted {} cached AI responses for session {}", keys.size(), sessionId);
            }
        } catch (Exception e) {
            log.warn("Neural Purge: Failed to clear session cache for session {}: {}", sessionId, e.getMessage());
        }
    }

    @org.springframework.beans.factory.annotation.Value("${app.upload-dir}")
    private String uploadDir;

    private Path root;

    @jakarta.annotation.PostConstruct
    public void init() {
        this.root = Paths.get(uploadDir);
        try {
            if (!Files.exists(root)) {
                Files.createDirectories(root);
                log.info("Neural Registry: Initialized upload root at {}", root.toAbsolutePath());
            }
        } catch (IOException e) {
            log.error("Neural Registry: CRITICAL ERROR - Could not initialize upload root: {}", e.getMessage());
        }
    }

    @Transactional
    public Document uploadDocument(MultipartFile file, Long sessionId, String userEmail) throws IOException {
        if (!Files.exists(root)) {
            Files.createDirectories(root);
        }

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));

        Session session = sessionRepository.findById(java.util.Objects.requireNonNull(sessionId))
                .orElseThrow(() -> new RuntimeException("Session not found"));

        String rawName = file.getOriginalFilename();
        String originalFilename = rawName != null ? rawName : "neural_asset_" + System.currentTimeMillis();

        int lastIndex = originalFilename.lastIndexOf(".");
        String extension = lastIndex != -1 ? originalFilename.substring(lastIndex) : ".bin";
        String storedFilename = UUID.randomUUID().toString() + extension;
        Path filePath = root.resolve(storedFilename);

        Files.copy(file.getInputStream(), filePath);

        Document document = Document.builder()
                .fileName(originalFilename)
                .fileType(file.getContentType())
                .fileSize(file.getSize())
                .filePath(filePath.toString())
                .uploadedBy(java.util.Objects.requireNonNull(user, "Neural Ingestion: User record cannot be null."))
                .session(java.util.Objects.requireNonNull(session, "Neural Ingestion: Session record cannot be null."))
                .build();

        Document savedDoc = documentRepository.save(document);
        if (savedDoc == null) throw new IllegalStateException("Neural Ingestion: Database failed to persist document.");

        // 10. Neural Indexing & Global Intelligence Mapping
        java.util.concurrent.CompletableFuture.runAsync(() -> {
            try {
                String extractedText = extractText(savedDoc);
                log.info("Neural Sync: Extracted {} characters of intelligence from {}", extractedText.length(),
                        savedDoc.getFileName());
                // Phase A: Semantic Indexing (Vector) - Handled sequentially to prevent Ollama
                // Model Memory Thrashing
                try {
                    vectorSearchService.ingestDocument(extractedText, sessionId, savedDoc.getId(),
                            savedDoc.getFileName());
                    log.info("Neural Sync: Vectorization successful for doc {}", savedDoc.getFileName());
                } catch (Exception e) {
                    log.error("Neural Sync: Vectorization failed for doc {}: {}. RAG results may be degraded.",
                            savedDoc.getFileName(), e.getMessage());
                }

                // Phase B: Intelligence Mapping (Entities & Graph) - Runs only AFTER vectors
                // are complete
                synchronized (this) {
                    try {
                        entityExtractionService.extractAndSaveEntities(savedDoc, extractedText);
                        log.info("Neural Sync: Entity mapping successful for doc {}", savedDoc.getFileName());
                        // Notify all session clients that the graph has been updated
                        try {
                            java.util.Map<String, Object> graphUpdate = new java.util.HashMap<>();
                            graphUpdate.put("type", "GRAPH_UPDATED");
                            graphUpdate.put("sessionId", sessionId);
                            graphUpdate.put("fileName", savedDoc.getFileName());
                            messagingTemplate.convertAndSend("/topic/session/" + sessionId, graphUpdate);
                        } catch (Exception msgErr) {
                            log.warn("Neural Sync: Could not broadcast graph update event: {}", msgErr.getMessage());
                        }
                    } catch (Exception e) {
                        log.error(
                                "Neural Sync: Intelligence mapping failed for doc {}: {}. Knowledge Graph and branching nodes will be empty.",
                                savedDoc.getFileName(), e.getMessage());
                    }
                    Thread.sleep(300); // Reduced guard interval - was 2000ms
                }

                evictSessionAiCache(sessionId);
                evictSessionAiCache(sessionId);

            } catch (Exception e) {
                log.error("Neural Sync: Native text extraction failed for doc {}: {}", savedDoc.getFileName(),
                        e.getMessage());
            }
        });

        return savedDoc;
    }

    public String extractText(Document document) {
        Path path = Paths.get(document.getFilePath());
        String fileName = document.getFileName().toLowerCase();

        try {
            String extracted = "";
            log.info("Engaging Native Document Processor for: {}", fileName);

            if (fileName.endsWith(".pdf")) {
                try (PDDocument pdfDocument = PDDocument.load(path.toFile())) {
                    PDFTextStripper stripper = new PDFTextStripper();
                    stripper.setSortByPosition(true); // Preserves column/table alignment better
                    stripper.setStartPage(1);
                    extracted = stripper.getText(pdfDocument);
                }
            } else if (fileName.endsWith(".docx")) {
                try (InputStream is = Files.newInputStream(path);
                        XWPFDocument docx = new XWPFDocument(is)) {
                    StringBuilder sb = new StringBuilder();
                    for (IBodyElement element : docx.getBodyElements()) {
                        if (element instanceof XWPFParagraph) {
                            sb.append(((XWPFParagraph) element).getText()).append("\n");
                        } else if (element instanceof XWPFTable) {
                            XWPFTable table = (XWPFTable) element;
                            sb.append("\n[TABLE START]\n");
                            for (XWPFTableRow row : table.getRows()) {
                                sb.append("| ");
                                for (XWPFTableCell cell : row.getTableCells()) {
                                    sb.append(cell.getText().trim()).append(" | ");
                                }
                                sb.append("\n");
                            }
                            sb.append("[TABLE END]\n\n");
                        }
                    }
                    extracted = sb.toString();
                }
            } else if (fileName.endsWith(".csv")) {
                try (CSVReader csvReader = new CSVReader(new java.io.InputStreamReader(Files.newInputStream(path)))) {
                    StringBuilder sb = new StringBuilder();
                    List<String[]> allRows = csvReader.readAll();

                    if (!allRows.isEmpty()) {
                        String[] headers = allRows.get(0);
                        for (int i = 1; i < allRows.size(); i++) {
                            String[] row = allRows.get(i);
                            sb.append("Row ").append(i).append(": ");
                            for (int j = 0; j < Math.min(row.length, headers.length); j++) {
                                String val = row[j].trim();
                                if (!val.isEmpty()) {
                                    sb.append("[").append(headers[j].trim()).append("]: ").append(val).append(" | ");
                                }
                            }
                            sb.append("\n");
                        }
                    }
                    extracted = sb.toString();
                }
            } else {
                extracted = tika.parseToString(path);
            }

            return normalizeOutput(extracted, fileName);
        } catch (Exception e) {
            log.error("Failed to extract text from document: {}", document.getFileName(), e);
            return "";
        }
    }

    private String normalizeOutput(String text, String fileName) {
        if (text == null || text.isBlank())
            return "";

        // 1. Core Cleanup: Remove non-printable control characters
        String cleaned = text.replaceAll("[\\p{Cntrl}&&[^\r\n\t]]", "");

        // 2. Junk Pattern Suppression: Remove repetitive noise and boilerplate
        cleaned = cleaned.replaceAll("(?i)page \\d+ of \\d+", "") // Page numbers
                .replaceAll("(?i)confidential", "")
                .replaceAll("(?i)internal use only", "")
                .replaceAll("_{3,}", "") // Long underscores
                .replaceAll("={3,}", "") // Long equals
                .replaceAll("\\*{3,}", ""); // Long asterisks

        // 3. Structural Normalization
        cleaned = cleaned.replaceAll("(?m)^[ \t]*\r?\n", "\n") // Empty lines with whitespace
                .replaceAll("[ ]+", " ") // Double spaces
                .replaceAll("[\\r\\n]{3,}", "\n\n") // Excessive vertical space
                .trim();

        // 4. Traceability Tagging
        return "[Source: " + fileName + "]\n\n" + cleaned;
    }

    @org.springframework.transaction.annotation.Transactional
    public void deleteDocument(Long documentId, String userEmail) {
        Document document = documentRepository.findById(java.util.Objects.requireNonNull(documentId))
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
            Long sessionId = document.getSession().getId();
            documentRepository.delete(document);
            // Invalidate the AI cache so the next question accounts for missing data
            evictSessionAiCache(sessionId);
        } catch (IOException e) {
            log.error("Failed to delete document file: {}", document.getFileName(), e);
            throw new RuntimeException("Failed to delete document file");
        }
    }

    public void reindexDocuments(Long sessionId) {
        List<Document> documents = documentRepository.findBySessionId(sessionId);
        log.info("Neural Registry: Sequential high-fidelity re-indexing triggered for {} documents in session {}", documents.size(), sessionId);

        java.util.concurrent.CompletableFuture.runAsync(() -> {
            synchronized(this) {
                // Clear existing vectors and entities to prevent duplicates on re-index
                vectorSearchService.deleteVectorsBySession(sessionId);
                try {
                    entityExtractionService.clearSessionGraph(sessionId);
                } catch (Exception e) {
                    log.warn("Neural Sync: Failed to clear session graph nodes, potential for duplicates.");
                }

                for (Document doc : documents) {
                    try {
                        log.info("Neural Sync: Processing document {} | Sequential Lock Engaged", doc.getFileName());
                        String extractedText = extractText(doc);
                        
                        // Vector Ingestion
                        vectorSearchService.ingestDocument(extractedText, sessionId, doc.getId(), doc.getFileName());
                        
                        // Entity Extraction
                        entityExtractionService.extractAndSaveEntities(doc, extractedText);
                        
                        log.info("Neural Sync: Document {} processing complete.", doc.getFileName());
                        
                        // Cool-down to prevent Ollama context thrashing
                        Thread.sleep(2000);
                        
                    } catch (Exception e) {
                        log.error("Neural Sync: Re-indexing failure for doc {}: {}", doc.getFileName(), e.getMessage(), e);
                    }
                }
                evictSessionAiCache(sessionId);
                log.info("Neural Sync: Full session re-indexing operation completed successfully.");
            }
        });
    }

    @org.springframework.context.event.EventListener(org.springframework.boot.context.event.ApplicationReadyEvent.class)
    @Transactional
    public void onApplicationReady() {
        log.info(
                "Neural Intelligence Hub initialized and ready. Workspace discovery pulse now in standby mode (On-Demand).");
    }
}
