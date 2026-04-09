package com.knowledgegraphx.backend.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.knowledgegraphx.backend.dto.ExtractedEntityDTO;
import com.knowledgegraphx.backend.model.Document;
import com.knowledgegraphx.backend.model.KnowledgeEntity;
import com.knowledgegraphx.backend.model.KnowledgeRelationship;
import com.knowledgegraphx.backend.repository.KnowledgeEntityRepository;
import com.knowledgegraphx.backend.repository.KnowledgeRelationshipRepository;
import dev.langchain4j.model.chat.ChatLanguageModel;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;

@Service
@RequiredArgsConstructor
@Slf4j
public class EntityExtractionService {

    private final ChatLanguageModel chatLanguageModel;
    private final KnowledgeEntityRepository knowledgeEntityRepository;
    private final KnowledgeRelationshipRepository knowledgeRelationshipRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public void clearSessionGraph(Long sessionId) {
        log.info("Neural Purge: Irreversibly clearing knowledge graph for session {}", sessionId);
        knowledgeRelationshipRepository.deleteBySessionId(sessionId);
        knowledgeEntityRepository.deleteBySessionId(sessionId);
    }

    @Transactional
    public void extractAndSaveEntities(Document document, String text) {
        log.info("Neural Extraction: Processing document '{}' for global knowledge mapping", document.getFileName());

        if (text == null || text.isBlank()) {
            log.warn("Neural Extraction: No text provided for document {}", document.getFileName());
            return;
        }

        try {
            // Optimized Sampling: High-density clusters from start and mid
            int totalLen = text.length();
            String start = text.substring(0, Math.min(totalLen, 6000));
            String mid = totalLen > 15000 ? text.substring(totalLen/2 - 2000, totalLen/2 + 2000) : "";
            String contentSample = start + "\n[... Segment Gap ...]\n" + mid;

            String prompt = String.format("""
                    [FAST-EXTRACT] File: %s
                    Extract JSON graph.
                    RULES:
                    - ENTITIES: PEOPLE, ORGANIZATIONS, TECHNICAL, CONCEPTS.
                    - RELATIONS: Source -> Target (e.g. WORKS_AT, USES).
                    FORMAT: {"entities": [{"name": "..", "type": "..", "context": ".."}], "relationships": [{"source": "..", "target": "..", "relation": ".."}]}
                    CONTENT:
                    %s
                    """, document.getFileName(), contentSample);

            String response = chatLanguageModel.generate(prompt);
            log.debug("Neural Extraction: Engine response received.");
            
            String json = response.trim();
            // Robust JSON capture
            int firstBrace = json.indexOf("{");
            int lastBrace = json.lastIndexOf("}");
            if (firstBrace != -1 && lastBrace != -1 && lastBrace > firstBrace) {
                json = json.substring(firstBrace, lastBrace + 1);
            }
            
            ExtractedEntityDTO dto = objectMapper.readValue(json, ExtractedEntityDTO.class);
            
            if (dto == null || dto.getEntities() == null) {
                log.warn("Neural Extraction: No entities discovered in document {}.", document.getFileName());
                return;
            }

            // Step A: Strategic Entity Resolution
            Map<String, KnowledgeEntity> sessionEntities = new HashMap<>();
            
            for (ExtractedEntityDTO.EntityWrapper wrapper : dto.getEntities()) {
                String eName = wrapper.getName();
                if (eName == null || eName.isBlank()) continue;
                
                String eType = wrapper.getType() != null ? wrapper.getType().toUpperCase() : "CONCEPT";
                
                // Concurrent-safe resolution
                KnowledgeEntity entity = knowledgeEntityRepository
                        .findBySessionIdAndNameIgnoreCase(document.getSession().getId(), eName)
                        .orElseGet(() -> {
                            KnowledgeEntity newEntity = KnowledgeEntity.builder()
                                    .name(eName)
                                    .type(eType)
                                    .context(wrapper.getContext())
                                    .session(document.getSession())
                                    .documents(new java.util.HashSet<>())
                                    .build();
                            KnowledgeEntity saved = knowledgeEntityRepository.save(newEntity);
                            if (saved == null) throw new IllegalStateException("Neural Extraction: Failed to persist new entity.");
                            return saved;
                        });
                
                // Link document to entity
                entity.getDocuments().add(document);
                knowledgeEntityRepository.save(entity);
                sessionEntities.put(eName.toLowerCase(), entity);
            }

            // Step B: Relationship Mapping
            if (dto.getRelationships() != null) {
                List<KnowledgeRelationship> relationships = new ArrayList<>();
                for (ExtractedEntityDTO.RelationshipWrapper relWrapper : dto.getRelationships()) {
                    KnowledgeEntity source = sessionEntities.get(relWrapper.getSource().toLowerCase());
                    KnowledgeEntity target = sessionEntities.get(relWrapper.getTarget().toLowerCase());
                    
                    if (source != null && target != null) {
                        // Check if relationship already exists to avoid duplicates
                        boolean exists = knowledgeRelationshipRepository.existsBySourceIdAndTargetIdAndRelationType(
                            source.getId(), target.getId(), relWrapper.getRelation());
                            
                        if (!exists) {
                            relationships.add(KnowledgeRelationship.builder()
                                    .source(source)
                                    .target(target)
                                    .relationType(relWrapper.getRelation())
                                    .session(document.getSession())
                                    .build());
                        }
                    }
                }
                if (!relationships.isEmpty()) {
                    knowledgeRelationshipRepository.saveAll(relationships);
                }
            }
            
            log.info("Neural Extraction: Success. Doc '{}' -> {} entities, {} relationships.", 
                    document.getFileName(), sessionEntities.size(), dto.getRelationships() != null ? dto.getRelationships().size() : 0);

        } catch (Exception e) {
            log.error("Neural Extraction Failure for document {}: {}", document.getFileName(), e.getMessage());
        }
    }
}
