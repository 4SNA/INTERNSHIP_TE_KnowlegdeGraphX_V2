package com.knowledgegraphx.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.knowledgegraphx.backend.dto.ExtractedEntityDTO;
import com.knowledgegraphx.backend.model.Document;
import com.knowledgegraphx.backend.model.KnowledgeEntity;
import com.knowledgegraphx.backend.model.KnowledgeRelationship;
import com.knowledgegraphx.backend.repository.KnowledgeEntityRepository;
import dev.langchain4j.model.chat.ChatLanguageModel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class EntityExtractionService {

    private final ChatLanguageModel chatLanguageModel;
    private final KnowledgeEntityRepository knowledgeEntityRepository;
    private final com.knowledgegraphx.backend.repository.KnowledgeRelationshipRepository knowledgeRelationshipRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public void extractAndSaveEntities(Document document, String text) {
        log.info("Neural Extraction: Processing document '{}' for global knowledge mapping", document.getFileName());

        if (text == null || text.isBlank()) {
            log.warn("Neural Extraction: No text provided for document {}", document.getFileName());
            return;
        }

        // 1. Clear existing entities (Cascade handles relationships)
        try {
            knowledgeEntityRepository.deleteByDocumentId(document.getId());
        } catch (Exception e) {
            log.warn("Neural Extraction: Failed to clear previous graph nodes for doc {}", document.getFileName());
        }

        try {
            String contentSample = text.substring(0, Math.min(text.length(), 6500));

            String prompt = String.format("""
                    Analyze the following text from document '%s' and extract key intelligence.
                    
                    Part 1: Entities (Nodes)
                    Categorize by: PEOPLE, ORGANIZATION, CONCEPT, KEYWORD.
                    - name: Unique identifier for the entity.
                    - context: 1-2 sentences of how it appears in this document.

                    Part 2: Relationships (Edges)
                    Identify logical connections between the entities extracted above.
                    Examples: "A belongs to B", "X is related to Y", "Concept A explains Concept B".
                    - source: Name of first entity.
                    - target: Name of second entity.
                    - relation: Short phrase describing the connection.

                    Format:
                    Return exactly in this JSON format:
                    {
                      "entities": [{ "name": "...", "type": "...", "context": "..." }],
                      "relationships": [{ "source": "...", "target": "...", "relation": "..." }]
                    }

                    Limit to 15 entities and 10 high-value relationships. No preamble.
                    
                    Text:
                    %s
                    """, document.getFileName(), contentSample);

            String response = chatLanguageModel.generate(prompt);
            String json = response.replaceAll("(?s)```json(.*?)```", "$1")
                                 .replaceAll("(?s)```(.*?)```", "$1")
                                 .trim();
            
            ExtractedEntityDTO dto = objectMapper.readValue(json, ExtractedEntityDTO.class);
            
            // Step A: Save Entities and Map Names
            Map<String, KnowledgeEntity> savedEntities = new HashMap<>();
            if (dto.getEntities() != null) {
                for (ExtractedEntityDTO.EntityWrapper wrapper : dto.getEntities()) {
                    KnowledgeEntity entity = KnowledgeEntity.builder()
                            .name(wrapper.getName())
                            .type(wrapper.getType().toUpperCase())
                            .context(wrapper.getContext())
                            .document(document)
                            .session(document.getSession())
                            .build();
                    KnowledgeEntity saved = knowledgeEntityRepository.save(entity);
                    savedEntities.put(wrapper.getName().toLowerCase(), saved);
                }
            }

            // Step B: Resolve and Save Relationships
            if (dto.getRelationships() != null) {
                List<KnowledgeRelationship> relsToSave = new ArrayList<>();
                for (ExtractedEntityDTO.RelationshipWrapper wrapper : dto.getRelationships()) {
                    KnowledgeEntity source = savedEntities.get(wrapper.getSource().toLowerCase());
                    KnowledgeEntity target = savedEntities.get(wrapper.getTarget().toLowerCase());
                    
                    if (source != null && target != null) {
                        relsToSave.add(KnowledgeRelationship.builder()
                                .source(source)
                                .target(target)
                                .relationType(wrapper.getRelation())
                                .session(document.getSession())
                                .build());
                    }
                }
                knowledgeRelationshipRepository.saveAll(relsToSave);
                log.info("Neural Extraction: Synced {} nodes and {} relationships for doc {}", 
                    savedEntities.size(), relsToSave.size(), document.getFileName());
            }

        } catch (Exception e) {
            log.error("Neural Extraction Failure for document {}: {}", document.getFileName(), e.getMessage());
        }
    }
}
