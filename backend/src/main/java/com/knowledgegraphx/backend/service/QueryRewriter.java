package com.knowledgegraphx.backend.service;

import dev.langchain4j.model.chat.ChatLanguageModel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * KnowledgeGraphX Neural Query Rewriter
 *
 * Uses fast local normalization to avoid adding a full LLM round-trip
 * before each chat response. Falls back to the original query on edge cases.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class QueryRewriter {

    @SuppressWarnings("unused")
    private final ChatLanguageModel chatLanguageModel; // Kept for future use

    public String rewrite(String originalQuery, java.util.List<com.knowledgegraphx.backend.model.QueryHistory> history) {
        if (originalQuery == null || originalQuery.trim().isEmpty()) return originalQuery;

        // Fast local normalization — no LLM call, no latency
        String q = originalQuery.trim();

        // 1. Resolve common context pronouns using last question in history
        if (history != null && !history.isEmpty()) {
            String lastQ = history.get(0).getQuestion();
            if (q.toLowerCase().startsWith("what about") || q.toLowerCase().startsWith("tell me more")) {
                q = lastQ + " " + q;
            }
        }

        // 2. Common abbreviation expansion
        q = q.replaceAll("(?i)\\bdb\\b", "database")
             .replaceAll("(?i)\\bml\\b", "machine learning")
             .replaceAll("(?i)\\bai\\b", "artificial intelligence")
             .replaceAll("(?i)\\bapi\\b", "API interface")
             .replaceAll("(?i)\\bskills\\b", "technical skills experience");

        // 3. Strip excessive whitespace
        q = q.replaceAll("\\s+", " ").trim();

        log.debug("Neural Rewriter [FAST]: '{}' -> '{}'", originalQuery, q);
        return q;
    }
}
