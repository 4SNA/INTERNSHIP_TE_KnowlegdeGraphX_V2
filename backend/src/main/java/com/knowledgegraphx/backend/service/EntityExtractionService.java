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
            // Neural Multi-Segment Intelligence: Sampling 10k from Start, 10k from Mid, 10k from End
            int totalLen = text.length();
            String start = text.substring(0, Math.min(totalLen, 10000));
            String mid = totalLen > 20000 ? text.substring(totalLen/2 - 5000, totalLen/2 + 5000) : "";
            String end = totalLen > 30000 ? text.substring(totalLen - 10000) : "";
            
            String contentSample = start + "\n[... Segment Break ...]\n" + mid + "\n[... Segment Break ...]\n" + end;

            String prompt = String.format("""
                    You are the KnowledgeGraphX Neural Analyst (Expert-Level). 
                    Your mission is 100%% semantic discovery for document: '%s'.
                    
                    TASK PERIMETER:
                    1. IDENTIFY ALL ENTITIES: People, Organizations, Skills, Technical Metrics, Key Topics, and Locations.
                    2. STUDY INTERNAL RELATIONSHIPS: How do these entities interact within this specific document?
                    3. MULTI-DOCUMENT CONTEXT: Focus on identifying shared hubs that could link to other research materials.
                    
                    SCHEMA NODES:
                    - PERSON, ORGANIZATION, SKILL, EXPERIENCE, METRIC, IDENTIFIER, TOPIC, DATE, LOCATION.
                    
                    OUTPUT PROTOCOL (MANDATORY JSON):
                    {
                      "entities": [{ "name": "...", "type": "...", "context": "Detailed evidence sentence" }],
                      "relationships": [{ "source": "...", "target": "...", "relation": "..." }]
                    }
                    
                    Goal: Be exhaustive. If it appears in the text, it must be in the graph. 
                    If this is a RESUME, extract all SKILLS and previous ORGANIZATIONS.
                    
                    Source Text Segments:
                    %s
                    """, document.getFileName(), contentSample);

            String response = chatLanguageModel.generate(prompt);
            String json = response.replaceAll("(?s)```json(.*?)```", "$1")
                                 .replaceAll("(?s)```(.*?)```", "$1")
                                 .trim();
            
            ExtractedEntityDTO dto = objectMapper.readValue(json, ExtractedEntityDTO.class);
            
            // Step A: Save Entities and Map Names (with Global Session Resolution)
            Map<String, KnowledgeEntity> savedEntities = new HashMap<>();
            if (dto.getEntities() != null) {
                for (ExtractedEntityDTO.EntityWrapper wrapper : dto.getEntities()) {
                    String eName = wrapper.getName();
                    String eType = wrapper.getType().toUpperCase();
                    
                    // Resolution: Check if this entity already exists in this session (Global Cross-Doc Linking)
                    KnowledgeEntity saved = knowledgeEntityRepository
                            .findBySessionIdAndNameIgnoreCase(document.getSession().getId(), eName)
                            .orElseGet(() -> {
                                KnowledgeEntity entity = KnowledgeEntity.builder()
                                        .name(eName)
                                        .type(eType)
                                        .context(wrapper.getContext())
                                        .session(java.util.Objects.requireNonNull(document.getSession(), "Neural Ingestion: Document must belong to a session."))
                                        .build();
                                entity.getDocuments().add(document);
                                return java.util.Objects.requireNonNull(knowledgeEntityRepository.save(entity), "Neural Ingestion: Entity persistence failed.");
                            });
                    
                    // Bridge Detection: Link this document to a shared conceptual hub (Global Cross-Doc Linking)
                    saved.getDocuments().add(document);
                    knowledgeEntityRepository.save(saved);
                    
                    if (saved.getDocuments().size() > 1) {
                        log.info("Neural Bridge: Global entity '{}' now synaptically links {} documents.", 
                                eName, saved.getDocuments().size());
                    }
                            
                    savedEntities.put(eName.toLowerCase(), saved);
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
