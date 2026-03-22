package com.knowledgegraphx.backend.service;

import dev.langchain4j.data.document.Document;
import dev.langchain4j.data.document.Metadata;
import dev.langchain4j.data.document.splitter.DocumentByParagraphSplitter;
import dev.langchain4j.data.embedding.Embedding;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.model.embedding.onnx.allminilml6v2q.AllMiniLmL6V2QuantizedEmbeddingModel;
import dev.langchain4j.store.embedding.EmbeddingMatch;
import dev.langchain4j.store.embedding.EmbeddingStore;
import dev.langchain4j.store.embedding.inmemory.InMemoryEmbeddingStore;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
public class VectorSearchService {

    private final EmbeddingModel embeddingModel;
    private final EmbeddingStore<TextSegment> embeddingStore;

    public VectorSearchService() {
        this.embeddingModel = new AllMiniLmL6V2QuantizedEmbeddingModel();
        this.embeddingStore = new InMemoryEmbeddingStore<>();
    }

    public void ingestDocument(String text, Long sessionId, Long documentId) {
        Document document = Document.from(text, Metadata.from("sessionId", sessionId.toString()));
        DocumentByParagraphSplitter splitter = new DocumentByParagraphSplitter(500, 50);
        
        List<TextSegment> segments = splitter.split(document);
        log.info("Splitting document into {} chunks", segments.size());

        for (TextSegment segment : segments) {
            segment.metadata().add("documentId", documentId.toString());
            Embedding embedding = embeddingModel.embed(segment).content();
            embeddingStore.add(embedding, segment);
        }
    }

    public List<TextSegment> searchRelevantChunks(String query, Long sessionId, int limit) {
        Embedding queryEmbedding = embeddingModel.embed(query).content();
        
        // Search all and filter manually for the sessionId (In-Memory limitation)
        List<EmbeddingMatch<TextSegment>> relevant = embeddingStore.findRelevant(queryEmbedding, limit);
        
        return relevant.stream()
                .map(EmbeddingMatch::embedded)
                .filter(segment -> segment.metadata().getString("sessionId").equals(sessionId.toString()))
                .collect(Collectors.toList());
    }
}
