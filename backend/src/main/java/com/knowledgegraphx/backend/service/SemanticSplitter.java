package com.knowledgegraphx.backend.service;

import dev.langchain4j.data.document.Document;
import dev.langchain4j.data.embedding.Embedding;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.model.output.Response;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * KnowledgeGraphX Semantic Processor
 * 
 * Implemented with high-fidelity intelligence splitting and null-safe embedding gates.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class SemanticSplitter {

    private final EmbeddingModel embeddingModel;

    public List<TextSegment> split(Document document, int targetChunkSize, double similarityThreshold) {
        String text = document.text();
        String docName = document.metadata().getString("fileName");
        
        String[] paragraphs = text.split("\\n+");
        List<TextSegment> finalSegments = new ArrayList<>();
        List<String> windowBuffer = new ArrayList<>();

        log.info("Neural Splitter: Semantic assessment of {} fragments for [Doc: {}].", paragraphs.length, docName);

        StringBuilder currentCluster = new StringBuilder();
        Embedding currentClusterEmbedding = null;
        String currentHeading = "";

        for (String paragraph : paragraphs) {
            String cleanPara = paragraph.trim();
            if (cleanPara.isEmpty()) continue;

            if (cleanPara.length() < 100 && !cleanPara.matches(".*[.!?]$")) {
                currentHeading = cleanPara;
            }

            List<String> sentences = splitIntoSentences(cleanPara);
            if (sentences.isEmpty()) continue;

            for (String sentence : sentences) {
                if (currentCluster.length() == 0) {
                    if (!currentHeading.isEmpty() && !sentence.contains(currentHeading)) {
                        currentCluster.append("[").append(currentHeading).append("] ");
                    }
                    currentCluster.append(sentence);
                    currentClusterEmbedding = getSafeEmbedding(sentence);
                    windowBuffer.add(sentence);
                } else {
                    Embedding sentenceEmbedding = getSafeEmbedding(sentence);
                    
                    boolean topicShift = false;
                    if (currentClusterEmbedding != null && sentenceEmbedding != null) {
                        double similarity = calculateCosineSimilarity(currentClusterEmbedding, sentenceEmbedding);
                        topicShift = similarity < similarityThreshold;
                    }
                    
                    boolean sizeThresholdReached = currentCluster.length() + sentence.length() > targetChunkSize;

                    if (topicShift || sizeThresholdReached) {
                        finalSegments.add(TextSegment.from(currentCluster.toString().trim(), document.metadata().copy()));
                        
                        StringBuilder overlap = new StringBuilder();
                        if (!currentHeading.isEmpty()) overlap.append("[").append(currentHeading).append("] ");
                        
                        int overlapCount = Math.max(1, windowBuffer.size() / 6);
                        List<String> tail = new ArrayList<>(windowBuffer.subList(Math.max(0, windowBuffer.size() - overlapCount), windowBuffer.size()));
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
                        if (currentClusterEmbedding != null && sentenceEmbedding != null) {
                            currentClusterEmbedding = averageEmbeddings(currentClusterEmbedding, sentenceEmbedding);
                        } else if (sentenceEmbedding != null) {
                            currentClusterEmbedding = sentenceEmbedding;
                        }
                    }
                }
            }
        }

        if (currentCluster.length() > 0) {
            finalSegments.add(TextSegment.from(currentCluster.toString().trim(), document.metadata().copy()));
        }

        log.info("Neural Synthesis: Generated {} context-rich semantic nodes.", finalSegments.size());
        return finalSegments;
    }

    private Embedding getSafeEmbedding(String text) {
        try {
            Response<Embedding> resp = embeddingModel.embed(text);
            return (resp != null) ? resp.content() : null;
        } catch (Exception e) {
            log.warn("Neural Splitter: Semantic blip detected during vector mapping. Neutralizing gate.");
            return null;
        }
    }

    private Embedding averageEmbeddings(Embedding e1, Embedding e2) {
        float[] v1 = e1.vector();
        float[] v2 = e2.vector();
        if (v1 == null || v2 == null) return e1; // Fallback
        
        float[] avg = new float[v1.length];
        for (int i = 0; i < v1.length; i++) {
            avg[i] = (v1[i] + v2[i]) / 2.0f;
        }
        return new Embedding(avg);
    }

    private List<String> splitIntoSentences(String text) {
        if (text == null || text.isBlank()) return new ArrayList<>();
        
        // Optimized regex: Splitting by punctuation followed by ANY whitespace or line breaks
        String[] parts = text.split("(?<=[.!?])\\s+");
        List<String> result = new ArrayList<>();
        
        if (parts.length == 1 && !parts[0].isEmpty()) {
            // Backup for standard splitting if regex fails to find clusters
            result.add(parts[0].trim());
        } else {
            for (String p : parts) {
                String s = p.trim();
                if (s.length() > 2) result.add(s);
            }
        }
        return result;
    }


    private double calculateCosineSimilarity(Embedding e1, Embedding e2) {
        if (e1 == null || e2 == null) return 0;
        float[] v1 = e1.vector();
        float[] v2 = e2.vector();
        if (v1.length != v2.length) return 0;
        
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
