package com.knowledgegraphx.backend.service;

import dev.langchain4j.data.document.Document;
import dev.langchain4j.data.embedding.Embedding;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.embedding.EmbeddingModel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * KnowledgeGraphX Semantic Processor
 * 
 * Implements a high-fidelity intelligence splitting strategy that uses 
 * vector divergence (cosine similarity) to detect topic shifts instead of 
 * arbitrary character counting.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class SemanticSplitter {

    private final EmbeddingModel embeddingModel;

    /**
     * Splits a document into semantic clusters.
     * 
     * @param document The source document
     * @param targetChunkSize The ideal chunk size in characters (approximate)
     * @param similarityThreshold Threshold below which a topic shift is detected (0.0 to 1.0)
     * @return List of TextSegments with intact metadata
     */
    public List<TextSegment> split(Document document, int targetChunkSize, double similarityThreshold) {
        String text = document.text();
        String docName = document.metadata().getString("fileName");
        
        // 1. Structural Phase: Split by logical blocks (paragraphs)
        String[] paragraphs = text.split("\\n+");
        List<TextSegment> finalSegments = new ArrayList<>();
        List<String> windowBuffer = new ArrayList<>(); // For overlap

        log.info("Neural Splitter: Processing {} base paragraphs for semantic clustering [Doc: {}].", paragraphs.length, docName);

        StringBuilder currentCluster = new StringBuilder();
        Embedding currentClusterEmbedding = null;
        String currentHeading = "";

        for (String paragraph : paragraphs) {
            String cleanPara = paragraph.trim();
            if (cleanPara.isEmpty()) continue;

            // Heading Detection: Simple heuristic (short, no ending punctuation)
            if (cleanPara.length() < 100 && !cleanPara.matches(".*[.!?]$")) {
                currentHeading = cleanPara;
            }

            List<String> sentences = splitIntoSentences(cleanPara);
            if (sentences.isEmpty()) continue;

            for (String sentence : sentences) {
                if (currentCluster.length() == 0) {
                    // Initialize with current heading if available
                    if (!currentHeading.isEmpty() && !sentence.contains(currentHeading)) {
                        currentCluster.append("[").append(currentHeading).append("] ");
                    }
                    currentCluster.append(sentence);
                    currentClusterEmbedding = embeddingModel.embed(sentence).content();
                    windowBuffer.add(sentence);
                } else {
                    Embedding sentenceEmbedding = embeddingModel.embed(sentence).content();
                    double similarity = calculateCosineSimilarity(currentClusterEmbedding, sentenceEmbedding);
                    
                    boolean topicShift = similarity < similarityThreshold;
                    boolean sizeThresholdReached = currentCluster.length() + sentence.length() > targetChunkSize;

                    if (topicShift || sizeThresholdReached) {
                        // CLOSE CLUSTER
                        finalSegments.add(TextSegment.from(currentCluster.toString().trim(), document.metadata().copy()));
                        
                        // OVERLAP LOGIC: Retain last ~15% for context continuity
                        StringBuilder overlap = new StringBuilder();
                        if (!currentHeading.isEmpty()) overlap.append("[").append(currentHeading).append("] ");
                        
                        int overlapCount = Math.max(1, windowBuffer.size() / 6); // approx 15%
                        List<String> tail = windowBuffer.subList(Math.max(0, windowBuffer.size() - overlapCount), windowBuffer.size());
                        for (String s : tail) overlap.append(s).append(" ");
                        
                        currentCluster = new StringBuilder(overlap.toString());
                        currentCluster.append(sentence);
                        currentClusterEmbedding = sentenceEmbedding;
                        
                        windowBuffer.clear();
                        windowBuffer.addAll(tail);
                        windowBuffer.add(sentence);
                    } else {
                        currentCluster.append(" ").append(sentence);
                        windowBuffer.add(sentence);
                        // Expensive full-text re-embedding avoided; using moving average for stability
                        currentClusterEmbedding = averageEmbeddings(currentClusterEmbedding, sentenceEmbedding);
                    }
                }
            }
        }

        // Flush final cluster
        if (currentCluster.length() > 0) {
            finalSegments.add(TextSegment.from(currentCluster.toString().trim(), document.metadata().copy()));
        }

        log.info("Neural Synthesis: Generated {} context-rich semantic chunks.", finalSegments.size());
        return finalSegments;
    }

    private Embedding averageEmbeddings(Embedding e1, Embedding e2) {
        float[] v1 = e1.vector();
        float[] v2 = e2.vector();
        float[] avg = new float[v1.length];
        for (int i = 0; i < v1.length; i++) {
            avg[i] = (v1[i] + v2[i]) / 2.0f;
        }
        return new Embedding(avg);
    }


    private List<String> splitIntoSentences(String text) {
        // Robust regex for sentence splitting in academic and technical text
        // Looks for terminators (.!?) followed by space/newline and uppercase char
        String[] parts = text.split("(?<=[.!?])\\s+(?=[A-Z])");
        List<String> result = new ArrayList<>();
        for (String p : parts) {
            String s = p.trim();
            if (s.length() > 2) result.add(s);
        }
        return result;
    }

    private double calculateCosineSimilarity(Embedding e1, Embedding e2) {
        float[] v1 = e1.vector();
        float[] v2 = e2.vector();
        double dotProduct = 0;
        double norm1 = 0;
        double norm2 = 0;
        for (int i = 0; i < v1.length; i++) {
            dotProduct += v1[i] * v2[i];
            norm1 += v1[i] * v1[i];
            norm2 += v2[i] * v2[i];
        }
        if (norm1 == 0 || norm2 == 0) return 0;
        return dotProduct / (Math.sqrt(norm1) * Math.sqrt(norm2));
    }
}
