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
    private final dev.langchain4j.model.chat.ChatLanguageModel chatModel;

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

            if (entity.getDocuments() != null) {
                for (com.knowledgegraphx.backend.model.Document doc : entity.getDocuments()) {
                    edges.add(IntelligenceEdge.builder()
                            .source("doc_" + doc.getId())
                            .target("entity_" + entity.getId())
                            .label("contains")
                            .weight(1.0)
                            .build());
                }
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

        // 4. Automated Neural Bridging: Direct Doc-to-Doc connections based on shared entities
        Map<String, Set<Long>> entityToDocIds = new HashMap<>();
        for (com.knowledgegraphx.backend.model.KnowledgeEntity entity : entities) {
            if (entity.getDocuments() != null) {
                Set<Long> docIds = new HashSet<>();
                for (com.knowledgegraphx.backend.model.Document d : entity.getDocuments()) docIds.add(d.getId());
                entityToDocIds.put("entity_" + entity.getId(), docIds);
            }
        }

        for (int i = 0; i < documents.size(); i++) {
            for (int j = i + 1; j < documents.size(); j++) {
                com.knowledgegraphx.backend.model.Document d1 = documents.get(i);
                com.knowledgegraphx.backend.model.Document d2 = documents.get(j);
                
                long sharedCount = entities.stream()
                        .filter(e -> e.getDocuments().contains(d1) && e.getDocuments().contains(d2))
                        .count();
                
                if (sharedCount > 0) {
                    edges.add(IntelligenceEdge.builder()
                            .source("doc_" + d1.getId())
                            .target("doc_" + d2.getId())
                            .label("thematic overlap")
                            .weight(2.0)
                            .build());
                }
            }
        }

        return KnowledgeNetwork.builder()
                .nodes(nodes)
                .edges(edges)
                .build();
    }

    public Map<String, Object> analyzeIntelligenceAudit(Long sessionId) {
        log.info("Neural Audit: Performing deep-dive relationship scan for session {}", sessionId);
        
        List<com.knowledgegraphx.backend.model.KnowledgeEntity> entities = knowledgeEntityRepository.findBySessionId(sessionId);
        List<com.knowledgegraphx.backend.model.KnowledgeRelationship> relationships = knowledgeRelationshipRepository.findBySessionId(sessionId);
        
        if (entities.isEmpty()) {
            return Map.of("insights", List.of("Neural memory is currently empty. Upload documents to ignite discovery."), "auditTimestamp", System.currentTimeMillis());
        }

        String entityMap = entities.stream()
            .map(e -> e.getName() + " (" + e.getType() + ")")
            .limit(40)
            .collect(java.util.stream.Collectors.joining(", "));
            
        String relMap = relationships.stream()
            .map(r -> r.getSource().getName() + " -" + r.getRelationType() + "-> " + r.getTarget().getName())
            .limit(20)
            .collect(java.util.stream.Collectors.joining("\n"));

        String prompt = String.format("""
            You are the KnowledgeGraphX Neural Audit Engine. 
            Analyze the current state of a research workspace and identify hidden semantic bridges or strategic insights.
            
            Current Entities: %s
            Existing Explicit Relationships:
            %s
            
            Task:
            1. Suggest 3-5 'Deep Insights' or 'Hidden Patterns' that might exist between these entities.
            2. Be specific and expert-level. 
            3. Answer in short, data-dense bullet points.
            """, entityMap, relMap);

        String aiResponse = chatModel.generate(prompt);
        List<String> insights = Arrays.stream(aiResponse.split("\n"))
            .filter(line -> line.trim().startsWith("-") || line.trim().startsWith("*") || (line.length() > 20 && !line.contains("```")))
            .map(line -> line.replaceAll("^[-* ]+", "").trim())
            .filter(line -> !line.isEmpty())
            .limit(6)
            .collect(java.util.stream.Collectors.toList());

        Map<String, Object> response = new HashMap<>();
        response.put("insights", insights);
        response.put("auditTimestamp", System.currentTimeMillis());
        return response;
    }
}
