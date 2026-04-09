package com.knowledgegraphx.backend.service;

import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.data.segment.TextSegment;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

/**
 * KnowledgeGraphX Document Generation Service
 *
 * Generates structured documents on-demand - reports, summaries, notes,
 * structured data, code snippets - from workspace intelligence and user intent.
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class DocumentGenerationService {

    private final VectorSearchService vectorSearchService;
    private final ChatLanguageModel chatModel;
    private final com.knowledgegraphx.backend.repository.KnowledgeEntityRepository knowledgeEntityRepository;
    private final com.knowledgegraphx.backend.repository.DocumentRepository documentRepository;

    public enum GenerationType { REPORT, SUMMARY, NOTES, COMPARISON, CODE, CUSTOM }

    /**
     * Generate a structured document of the requested type using workspace intelligence.
     */
    public String generate(String prompt, Long sessionId, String typeName) {
        log.info("Document Generator: Initiating {} generation for session {}", typeName, sessionId);

        GenerationType type;
        try {
            type = GenerationType.valueOf(typeName.toUpperCase());
        } catch (Exception e) {
            type = GenerationType.CUSTOM;
        }

        // Gather workspace intelligence
        List<TextSegment> segments = List.of();
        try {
            segments = vectorSearchService.searchRelevantChunks(prompt, sessionId, 30);
        } catch (Exception e) {
            log.warn("Document Generator: Vector search unavailable, continuing with entities.");
        }
 
        String context = segments.stream()
                .map(TextSegment::text)
                .collect(Collectors.joining("\n\n---\n\n"));
 
        List<com.knowledgegraphx.backend.model.KnowledgeEntity> entities =
                knowledgeEntityRepository.findBySessionId(sessionId);
        String entityContext = entities.stream()
                .map(e -> String.format("- %s [%s]: %s", e.getName(), e.getType(), e.getContext()))
                .limit(50)
                .collect(Collectors.joining("\n"));

        List<com.knowledgegraphx.backend.model.Document> docs = documentRepository.findBySessionId(sessionId);
        String docManifest = docs.stream()
                .map(d -> String.format("- %s (%s)", d.getFileName(), d.getFileType()))
                .collect(Collectors.joining("\n"));

        String systemPrompt = buildSystemPrompt(type, sessionId);
        String userPrompt = String.format("""
            USER REQUEST: %s

            WORKSPACE DOCUMENTS:
            %s

            KNOWLEDGE ENTITIES:
            %s

            DOCUMENT CONTEXT:
            %s
            """, prompt,
                docManifest.isEmpty() ? "None uploaded yet." : docManifest,
                entityContext.isEmpty() ? "No entities extracted." : entityContext,
                context.isEmpty() ? "No indexed content found. Generate based on general knowledge." : context);

        try {
            return chatModel.generate(
                    dev.langchain4j.data.message.SystemMessage.from(systemPrompt),
                    dev.langchain4j.data.message.UserMessage.from(userPrompt)
            ).content().text();
        } catch (Exception e) {
            log.error("Document Generator: AI synthesis failed", e);
            return "# Document Generation Failed\n\nThe AI engine encountered an issue. Please try again or rephrase your request.";
        }
    }

    private String buildSystemPrompt(GenerationType type, Long sessionId) {
        return switch (type) {
            case REPORT -> """
                You are the KnowledgeGraphX Executive Analyst (Expert Persona).
                MANDATORY: Generate a premium-grade intelligence dossier. 
                NO generic filler. Every sentence must add strategic value.

                MANDATORY STRUCTURE:
                # 📊 Executive Intelligence Dossier
                ## 🎯 Strategic Summary
                Direct expert answer providing definitive clarity on the request.

                ## 🔑 Core Findings & Evidence
                Data-dense bullet points with specific metrics and citations [Source | Section].

                ## 🔗 Neural Bridge Identification
                Logical patterns cross-referenced from the Knowledge Graph mapping.

                ## 🚀 Implementation Recommendations
                Actionable, numbered steps derived from situational analysis.
                """;

            case SUMMARY -> """
                You are the KnowledgeGraphX Lead Librarian.
                Generate a high-fidelity intelligence summary. NO robotic preamble.

                MANDATORY STRUCTURE:
                # 📋 Intelligence Summary
                ## 🎯 Definitive Takeaway
                1-2 expert sentences capturing the absolute core essence.

                ## 🧬 Critical Facts & Metrics
                Structured, data-rich list of the most important takeaways with sources.

                ## 💡 Expert Insight
                Deep analytical observation regarding the knowledge implications.
                """;

            case NOTES -> """
                You are the KnowledgeGraphX Smart Notes Engine.
                Generate organized, structured study/research notes in Markdown.

                MANDATORY FORMAT:
                # 📝 Research Notes
                ## Overview
                (Context and purpose of these notes)

                ## Core Concepts
                ### Concept 1
                (Explanation + examples)

                ### Concept 2
                (Explanation + examples)

                ## Key Definitions
                | Term | Definition |
                |------|------------|
                | ... | ... |

                ## Important Relationships
                (How concepts connect)

                ## Quick Reference
                (Bullet-point cheat sheet)

                ---
                *Smart Notes by KnowledgeGraphX*
                """;

            case COMPARISON -> """
                You are the KnowledgeGraphX Comparison Analyst.
                Generate a structured side-by-side comparison in Markdown.

                MANDATORY FORMAT:
                # ⚖️ Intelligence Comparison Report

                ## Overview
                (What is being compared and why)

                ## Side-by-Side Analysis
                | Dimension | Source 1 | Source 2 | ... |
                |-----------|----------|----------|-----|
                | ... | ... | ... | ... |

                ## Key Differences
                (Bullet points highlighting major distinctions)

                ## Key Similarities
                (Shared patterns and common ground)

                ## Verdict & Recommendations
                (Evidence-based conclusion)

                ---
                *Comparative Analysis by KnowledgeGraphX*
                """;

            case CODE -> """
                You are the KnowledgeGraphX Code Generation Engine.
                Generate clean, well-commented, production-quality code.

                Rules:
                - Always use proper syntax-highlighted code blocks.
                - Include comments explaining each major section.
                - Follow best practices for the language requested.
                - Include usage examples after the main code.
                - If no specific language is mentioned, use Python.

                FORMAT:
                # 💻 Code Generation

                ## Overview
                (What this code does)

                ```[language]
                [fully functional code]
                ```

                ## Usage Example
                ```[language]
                [example]
                ```

                ## How It Works
                (Step-by-step explanation)
                """;

            default -> String.format("""
                You are the KnowledgeGraphX Premium Document Generator for session %d.
                Generate a high-quality, well-structured Markdown document based on the user's request.

                Rules:
                - Use professional tone.
                - Structure the document logically with proper headings.
                - Incorporate data from the provided context when available.
                - If context is weak, use general knowledge and clearly note this.
                - End with a professional footer.
                """, sessionId);
        };
    }
}
