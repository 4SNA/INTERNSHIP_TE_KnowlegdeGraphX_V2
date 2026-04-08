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
            // Stability optimization: reducing context window to prevent memory overflows
            String contentSample = text.substring(0, Math.min(text.length(), 3500));

            String prompt = String.format("""
                    You are the KnowledgeGraphX Neural Extraction Engine. 
                    Analyze document '%s' and map the underlying semantic architecture into explicit Nodes and Edges.
                    
                    PART 1: HIGH-FIDELITY NODES
                    Extract and categorize based on the following specific schema:
                    - PERSON: Identity names (e.g., "John Doe").
                    - INSTITUTION: Colleges, Universities, or Department Names.
                    - SUBJECT: Academic modules or distinct curriculum items.
                    - MARKS: Numeric scores, grades (A, B+), or rankings.
                    - IDENTIFIER: Unique keys like Roll Numbers, PRNs, or Seat IDs.
                    - TOPIC: CORE technical keywords or central themes.
                    - DATE: Significant timestamps (e.g., "May 2024").
                    - PERCENTILE: Success metrics and comparative performance data.
                    
                    PART 2: SYNAPTIC EDGES (Logic Links)
                    Identify 100%% of logical intersections using active, descriptive verbs.
                    Relationship Examples: "Student (PERSON) achieved 92 (MARKS)", "Seat_101 (IDENTIFIER) belongs to Jane (PERSON)".
                    
                    OUTPUT PROTOCOL:
                    Return ONLY a JSON object:
                    {
                      "entities": [{ "name": "...", "type": "...", "context": "Detailed evidence string from text" }],
                      "relationships": [{ "source": "...", "target": "...", "relation": "..." }]
                    }
                    
                    Constraint: Maximize discovery density. Ensure all unique identifiers are captured.
                    
                    Text:
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
                                        .document(document)
                                        .session(java.util.Objects.requireNonNull(document.getSession(), "Neural Ingestion: Document must belong to a session."))
                                        .build();
                                return java.util.Objects.requireNonNull(knowledgeEntityRepository.save(entity), "Neural Ingestion: Entity persistence failed.");
                            });
                    
                    // Bridge Detection: Link this document to a shared conceptual hub if already present
                    if (saved.getDocument() != null && !saved.getDocument().getId().equals(document.getId())) {
                        log.info("Neural Bridge: Global entity '{}' found. Documents '{}' and '{}' are now synaptically linked.", 
                                eName, saved.getDocument().getFileName(), document.getFileName());
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
