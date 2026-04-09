package com.knowledgegraphx.backend.service;

import dev.langchain4j.data.document.Document;
import dev.langchain4j.data.document.Metadata;

import dev.langchain4j.data.embedding.Embedding;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.store.embedding.EmbeddingMatch;
import dev.langchain4j.store.embedding.EmbeddingStore;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import dev.langchain4j.store.embedding.EmbeddingSearchRequest;
import dev.langchain4j.store.embedding.filter.Filter;
import dev.langchain4j.store.embedding.filter.comparison.IsEqualTo;

@Service
@Slf4j
@RequiredArgsConstructor
public class VectorSearchService {

    private final EmbeddingModel embeddingModel;
    private final EmbeddingStore<TextSegment> embeddingStore;
    private final SemanticSplitter semanticSplitter;

    public void ingestDocument(String text, Long sessionId, Long documentId, String fileName) {
        log.info("Neural Sync: Ingesting asset '{}' (ID: {}) for session {}", fileName, documentId, sessionId);
        
        Metadata docMetadata = Metadata.from("sessionId", sessionId.toString());
        docMetadata.put("documentId", documentId.toString());
        docMetadata.put("fileName", fileName);
        
        Document document = Document.from(text, docMetadata);
        
        // 1. Unified Semantic Splitting
        List<TextSegment> segments = semanticSplitter.split(document, 1500, 0.72);
        log.info("Neural Sync: Vectorizing doc into {} high-fidelity segments", segments.size());

        java.util.stream.IntStream.range(0, segments.size()).forEach(i -> {
            TextSegment segment = segments.get(i);
            
            // 2. High-Fidelity Metadata Attachment
            segment.metadata().put("documentId", documentId.toString());
            segment.metadata().put("sessionId", sessionId.toString());
            segment.metadata().put("fileName", fileName);
            segment.metadata().put("chunkIndex", String.valueOf(i));
            
            // 3. Section Intelligence: Extract section context from semantic headers
            String segText = segment.text();
            if (segText.startsWith("[") && segText.contains("]")) {
                int endIdx = segText.indexOf("]");
                String section = segText.substring(1, endIdx);
                segment.metadata().put("section", section);
                log.debug("Neural Metadata: Indexed section '{}' for chunk {}", section, i);
            }

            try {
                dev.langchain4j.model.output.Response<Embedding> response = embeddingModel.embed(segment);
                if (response != null && response.content() != null && response.content().dimension() > 0) {
                    embeddingStore.add(response.content(), segment);
                } else {
                    log.error("CRITICAL FALLBACK: Generated an empty vector model for node {}", i);
                }
            } catch (Exception e) {
                log.error("Failed to vectorize node [{}]: {}", i, e.getMessage());
            }
        });
    }

    public List<TextSegment> searchRelevantChunks(String query, Long sessionId, int limit) {
        String normalizedQuery = query.toLowerCase().trim();
        List<String> keywords = extractKeywords(normalizedQuery);
        
        log.info("Neural Hybrid Hub: Initiating dual-stage scan (Semantic + Keyword) for: '{}'", normalizedQuery);

        // Phase 1: Wide Semantic Recall (Recall pool of 50 fragments for higher variety)
        Embedding queryEmbedding = embeddingModel.embed(query).content();
        Filter metadataFilter = new IsEqualTo("sessionId", sessionId.toString());
        
        EmbeddingSearchRequest searchRequest = EmbeddingSearchRequest.builder()
                .queryEmbedding(queryEmbedding)
                .filter(metadataFilter)
                .maxResults(50) 
                .minScore(0.55) 
                .build();
                
        List<EmbeddingMatch<TextSegment>> semanticMatches = embeddingStore.search(searchRequest).matches();
        
        // Phase 2: Hybrid Combined Scoring (60% Semantic / 40% Keyword)
        class ScoredSegment {
            TextSegment segment;
            double score;
            ScoredSegment(TextSegment s, double sc) { this.segment = s; this.score = sc; }
        }
 
        List<ScoredSegment> scoredSegments = new ArrayList<>();
        for (EmbeddingMatch<TextSegment> match : semanticMatches) {
            double semanticScore = match.score();
            double keywordBoost = calculateKeywordBoost(match.embedded().text().toLowerCase(), keywords);
            double weightedScore = (semanticScore * 0.6) + (keywordBoost * 0.4);
            scoredSegments.add(new ScoredSegment(match.embedded(), weightedScore));
        }
 
        // Phase 3: Rank by Hybrid Score & Apply Quality Gate (0.65 threshold)
        scoredSegments.sort((a, b) -> Double.compare(b.score, a.score));
 
        // Phase 4: Final Selection (Absorb top high-fidelity fragments up to requested limit)
        List<TextSegment> finalResults = scoredSegments.stream()
                .filter(s -> s.score >= 0.50) // Optimized quality gate for local LLMs
                .limit(limit)                 
                .map(s -> s.segment)
                .collect(Collectors.toList());
        
        log.info("=== NEURAL FINAL SELECTION [{} Chunks - Quality Gate: 0.55] ===", finalResults.size());
        for (int i = 0; i < finalResults.size(); i++) {
             TextSegment segment = finalResults.get(i);
             log.info("Final Selection [{}]: {}...", i+1, segment.text().length() > 100 ? segment.text().substring(0, 100).replace("\n", " ") : segment.text());
        }
        
        return finalResults;
    }

    private List<String> extractKeywords(String q) {
        // High-value keyword extraction: ignores small bridge words/prepositions
        java.util.Set<String> stopWords = java.util.Set.of("what", "where", "how", "this", "that", "there", "with", "from", "your", "their");
        String[] words = q.split("\\W+");
        List<String> keywords = new ArrayList<>();
        for (String w : words) {
            if (w.length() > 3 && !stopWords.contains(w)) {
                keywords.add(w);
            }
        }
        return keywords;
    }

    private double calculateKeywordBoost(String text, List<String> keywords) {
        if (keywords.isEmpty()) return 0;
        long matches = keywords.stream().filter(text::contains).count();
        // Each keyword match adds up to 0.05 to the score, capped at 0.25 total boost
        return Math.min((matches / (double) keywords.size()) * 0.25, 0.25);
    }



    public void deleteVectorsBySession(Long sessionId) {
        log.info("Neural Purge: Irreversibly clearing all vectors for sessionId: {}", sessionId);
        Filter sessionFilter = new IsEqualTo("sessionId", sessionId.toString());
        embeddingStore.removeAll(sessionFilter);
    }

    public void deleteVectorsByDocumentId(Long documentId) {
        log.info("Neural Purge: Removing intelligence segments for documentId: {}", documentId);
        Filter documentFilter = new IsEqualTo("documentId", documentId.toString());
        embeddingStore.removeAll(documentFilter);
    }
}
