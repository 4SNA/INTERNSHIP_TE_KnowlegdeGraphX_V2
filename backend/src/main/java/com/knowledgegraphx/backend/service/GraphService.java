package com.knowledgegraphx.backend.service;

import com.knowledgegraphx.backend.dto.graph.IntelligenceEdge;
import com.knowledgegraphx.backend.dto.graph.KnowledgeNetwork;
import com.knowledgegraphx.backend.dto.graph.NeuralNode;
import com.knowledgegraphx.backend.repository.DocumentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class GraphService {

    private final DocumentRepository documentRepository;
    private final com.knowledgegraphx.backend.repository.KnowledgeEntityRepository knowledgeEntityRepository;
    private final com.knowledgegraphx.backend.repository.KnowledgeRelationshipRepository knowledgeRelationshipRepository;

    public KnowledgeNetwork generateNetwork(Long sessionId) {
        log.info("Neural Sync: Generating Intelligence Graph from persistence for session {}", sessionId);
        
        List<com.knowledgegraphx.backend.model.Document> documents = documentRepository.findBySessionId(sessionId);
        List<com.knowledgegraphx.backend.model.KnowledgeEntity> entities = knowledgeEntityRepository.findBySessionId(sessionId);
        List<com.knowledgegraphx.backend.model.KnowledgeRelationship> relationships = knowledgeRelationshipRepository.findBySessionId(sessionId);

        List<NeuralNode> nodes = new ArrayList<>();
        List<IntelligenceEdge> edges = new ArrayList<>();

        // 1. Add Document Nodes
        for (com.knowledgegraphx.backend.model.Document doc : documents) {
            nodes.add(NeuralNode.builder()
                    .id("doc_" + doc.getId())
                    .label(doc.getFileName())
                    .type("document")
                    .strength(1.0)
                    .build());
        }

        // 2. Add Entity Nodes and Link to Documents
        for (com.knowledgegraphx.backend.model.KnowledgeEntity entity : entities) {
            nodes.add(NeuralNode.builder()
                    .id("entity_" + entity.getId())
                    .label(entity.getName())
                    .type(entity.getType().toLowerCase())
                    .strength(0.8)
                    .context(entity.getContext())
                    .build());

            if (entity.getDocument() != null) {
                edges.add(IntelligenceEdge.builder()
                        .source("doc_" + entity.getDocument().getId())
                        .target("entity_" + entity.getId())
                        .label("contains")
                        .weight(1.0)
                        .build());
            }
        }

        // 3. Add Entity-to-Entity Relationships
        for (com.knowledgegraphx.backend.model.KnowledgeRelationship rel : relationships) {
            edges.add(IntelligenceEdge.builder()
                    .source("entity_" + rel.getSource().getId())
                    .target("entity_" + rel.getTarget().getId())
                    .label(rel.getRelationType())
                    .weight(1.5)
                    .build());
        }

        return KnowledgeNetwork.builder()
                .nodes(nodes)
                .edges(edges)
                .build();
    }

    public Map<String, Object> analyzeIntelligenceAudit(Long sessionId) {
        log.info("Neural Audit: Performing deep-dive relationship scan for session {}", sessionId);
        List<com.knowledgegraphx.backend.model.KnowledgeRelationship> relationships = knowledgeRelationshipRepository.findBySessionId(sessionId);
        
        Map<String, Object> response = new HashMap<>();
        List<String> insights = new ArrayList<>();
        
        if (relationships.isEmpty()) {
            insights.add("No significant semantic bridges detected yet. Upload more inter-related documents to ignite cross-doc intelligence.");
        } else {
            insights.add(String.format("Detected %d synaptic bridges across the workspace.", relationships.size()));
            relationships.stream().limit(5).forEach(rel -> {
                insights.add(String.format("Found connection: %s -> (%s) -> %s", 
                    rel.getSource().getName(), rel.getRelationType(), rel.getTarget().getName()));
            });
        }
        
        response.put("insights", insights);
        response.put("auditTimestamp", System.currentTimeMillis());
        return response;
    }
}
