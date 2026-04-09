package com.knowledgegraphx.backend.service;

import dev.langchain4j.model.chat.ChatLanguageModel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

/**
 * KnowledgeGraphX Neural Query Rewriter
 * 
 * Implements a high-fidelity expansion strategy that transforms vague or 
 * misspelled user inquiries into structured, high-recall search queries.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class QueryRewriter {

    private final ChatLanguageModel chatLanguageModel;

    public String rewrite(String originalQuery, java.util.List<com.knowledgegraphx.backend.model.QueryHistory> history) {
        if (originalQuery == null || originalQuery.trim().isEmpty()) return originalQuery;
        if (originalQuery.length() < 10 && !originalQuery.contains(" ")) return originalQuery; // Skip short greetings

        try {
            String historyBuffer = history == null ? "" : history.stream()
                .limit(3)
                .map(h -> "User: " + h.getQuestion())
                .reduce("", (a, b) -> a + "\n" + b);

            String prompt = String.format("""
                You are the KnowledgeGraphX Query Optimizer. 
                Task: Transform the user query into a high-fidelity search term optimized for Vector Retrieval.
                Protocol:
                1. Correct typos and expand abbreviations.
                2. If the query refers to "this" or "that", use the history to resolve references.
                3. Focus ONLY on technical keywords and intent.
                4. Output ONLY the optimized string. No conversational filler.

                History: %s
                Query: %s
                Optimized Query:""", historyBuffer, originalQuery);

            String rewritten = chatLanguageModel.generate(prompt).trim();
            log.info("Neural Rewriter: Optimized '{}' -> '{}'", originalQuery, rewritten);
            return rewritten;
        } catch (Exception e) {
            log.warn("Neural Rewriter: Fallback to original due to engine timeout.");
            return originalQuery;
        }
    }
}
