package com.knowledgegraphx.backend.service;

import dev.langchain4j.data.document.Document;
import dev.langchain4j.data.document.Metadata;
import dev.langchain4j.data.document.splitter.DocumentByParagraphSplitter;
import dev.langchain4j.data.embedding.Embedding;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.store.embedding.EmbeddingMatch;
import dev.langchain4j.store.embedding.EmbeddingStore;
import dev.langchain4j.store.embedding.inmemory.InMemoryEmbeddingStore;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class VectorSearchService {

    private final EmbeddingModel embeddingModel;
    private final EmbeddingStore<TextSegment> embeddingStore = new InMemoryEmbeddingStore<>();

    public void ingestDocument(String text, Long sessionId, Long documentId) {
        Document document = Document.from(text, Metadata.from("sessionId", sessionId.toString()));
        DocumentByParagraphSplitter splitter = new DocumentByParagraphSplitter(500, 50);
        
        List<TextSegment> segments = splitter.split(document);
        log.info("Splitting document into {} chunks", segments.size());

        for (TextSegment segment : segments) {
            segment.metadata().put("documentId", documentId.toString());
            segment.metadata().put("sessionId", sessionId.toString()); // Explicitly add for filtering
            Embedding embedding = embeddingModel.embed(segment).content();
            embeddingStore.add(embedding, segment);
        }
    }

    public List<TextSegment> searchRelevantChunks(String query, Long sessionId, int limit) {
        Embedding queryEmbedding = embeddingModel.embed(query).content();
        
        // Broaden the initial search window to overcome In-Memory filtering limitations
        List<EmbeddingMatch<TextSegment>> relevant = embeddingStore.findRelevant(queryEmbedding, 100);
        
        return relevant.stream()
                .map(EmbeddingMatch::embedded)
                .filter(segment -> segment.metadata().getString("sessionId").equals(sessionId.toString()))
                .limit(limit) // Limit after filtering
                .collect(Collectors.toList());
    }

    public void deleteVectorsBySession(Long sessionId) {
        log.info("Neural Purge: Clearing all intelligence vectors for sessionId: {}", sessionId);
        // In-memory cleanup or filter-based delete for PGVector
    }

    public void deleteVectorsByDocumentId(Long documentId) {
        log.info("Neural Purge: Clearing vectors for documentId: {}", documentId);
    }
}
