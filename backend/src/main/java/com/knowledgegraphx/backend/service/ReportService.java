package com.knowledgegraphx.backend.service;

import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.data.segment.TextSegment;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Slf4j
@RequiredArgsConstructor
public class ReportService {

    private final VectorSearchService vectorSearchService;
    private final ChatLanguageModel chatModel;
    private final com.knowledgegraphx.backend.repository.KnowledgeEntityRepository knowledgeEntityRepository;

    public String generateSessionReport(Long sessionId) {
        log.info("Neural Synthesis: Generating executive intelligence summary for session {}", sessionId);

        // 1. Fetch key segments from the session (up to 20 for context)
        List<TextSegment> segments = vectorSearchService.searchRelevantChunks("key insights summaries summary research",
                sessionId, 20);

        if (segments.isEmpty()) {
            return "# Session Report\n\nNo document intelligence has been ingested yet for this session.";
        }

        String context = segments.stream()
                .map(TextSegment::text)
                .collect(Collectors.joining("\n\n---\n\n"));

        // 2. Fetch extracted entities for additional signal
        List<com.knowledgegraphx.backend.model.KnowledgeEntity> entities = knowledgeEntityRepository
                .findBySessionId(sessionId);
        String entitySummary = entities.stream()
                .map(e -> String.format("- %s [%s]: %s", e.getName(), e.getType(), e.getContext()))
                .limit(25)
                .collect(Collectors.joining("\n"));

        // 2. High-Fidelity Synthesis Protocol: PREMIUM EXECUTIVE REPORT
        String prompt = String.format("""
                You are the KnowledgeGraphX Lead Research Partner (Expert Persona). 
                MANDATORY: Follow this NEURAL REASONING PROCESS:
                1. Analyze retrieved context fragments for key strategic facts.
                2. Cross-reference with the Knowledge Entity registry (%s).
                3. Build a logical, expert-level summary with ZERO generic filler text.

                STRUCTURE:
                # 📊 Executive Intelligence Dossier: Session %d
                ## 🎯 Primary Intelligence Focus
                Definitive answer summarizing the core research themes. High-level and professional.

                ## 🧩 Critical Intelligence Nodes
                Data-dense bullet points of facts, metrics, and findings. Cite sources clearly.

                ## 🛰️ Neural Workspace Trajectory
                Expert insight into the Knowledge Graph's predictive value and proposed research directions.

                Context Fragments:
                %s
                """, entitySummary, sessionId, context);

        return chatModel.generate(prompt);
    }
}
