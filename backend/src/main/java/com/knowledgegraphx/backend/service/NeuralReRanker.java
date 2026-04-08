package com.knowledgegraphx.backend.service;

import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.model.chat.ChatLanguageModel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * KnowledgeGraphX Neural Re-ranker
 * 
 * Implements an LLM-driven Cross-Encoder strategy to evaluate 
 * the semantic completeness and relevance of retrieved document fragments.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class NeuralReRanker {

    private final ChatLanguageModel chatLanguageModel;

    public List<TextSegment> rerank(String query, List<TextSegment> candidates, int finalLimit) {
        if (candidates == null || candidates.isEmpty()) return new ArrayList<>();
        if (candidates.size() <= finalLimit) return candidates.stream().limit(finalLimit).collect(Collectors.toList());

        log.info("Neural Re-ranker: Evaluating {} fragments for research alignment: '{}'", candidates.size(), query);

        try {
            log.info("Neural Ranker: Engaging local LLM reasoning cross-encoder.");
            StringBuilder promptBuilder = new StringBuilder();
            promptBuilder.append("You are a research assistant. Analyze the following document fragments for relevance to the query.\n\n");
            promptBuilder.append("QUERY: ").append(query).append("\n\n");
            
            for (int i = 0; i < candidates.size(); i++) {
                promptBuilder.append("ID ").append(i).append(": ").append(candidates.get(i).text()).append("\n\n");
            }
            
            promptBuilder.append("Select the top ").append(finalLimit)
                .append(" IDs most useful for answering the query. List IDs ONLY, separated by commas (e.g. 2,0,5).");

            String decision = chatLanguageModel.generate(promptBuilder.toString()).trim();
            log.info("Neural Ranker Result: IDs [{}]", decision);

            return Arrays.stream(decision.split(","))
                    .map(String::trim)
                    .filter(s -> s.matches("\\d+"))
                    .map(Integer::parseInt)
                    .filter(idx -> idx >= 0 && idx < candidates.size())
                    .limit(finalLimit)
                    .map(candidates::get)
                    .collect(Collectors.toList());

        } catch (Exception e) {
            log.error("Neural Ranker Failed: {}. System falling back to raw vector proximity.", e.getMessage());
            return candidates.stream().limit(finalLimit).collect(Collectors.toList());
        }
    }
}
