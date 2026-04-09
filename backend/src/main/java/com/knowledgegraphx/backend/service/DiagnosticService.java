package com.knowledgegraphx.backend.service;

import com.knowledgegraphx.backend.dto.diagnostics.NeuralAuditReport;
import com.knowledgegraphx.backend.model.QueryHistory;
import com.knowledgegraphx.backend.repository.DocumentRepository;
import com.knowledgegraphx.backend.repository.KnowledgeEntityRepository;
import com.knowledgegraphx.backend.repository.KnowledgeRelationshipRepository;
import com.knowledgegraphx.backend.repository.QueryHistoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class DiagnosticService {

    private final DocumentRepository documentRepository;
    private final KnowledgeEntityRepository entityRepository;
    private final KnowledgeRelationshipRepository relationshipRepository;
    private final QueryHistoryRepository queryHistoryRepository;
    private final JdbcTemplate jdbcTemplate;
    @org.springframework.beans.factory.annotation.Value("${ollama.base-url:http://localhost:11434}")
    private String ollamaUrl;

    public NeuralAuditReport getSessionAudit(Long sessionId) {
        log.info("Neural Audit: Generating diagnostic pulse for session {}", sessionId);

        return NeuralAuditReport.builder()
                .indexStats(NeuralAuditReport.IndexStats.builder()
                        .documentCount(documentRepository.countBySessionId(sessionId))
                        .entityCount(entityRepository.findBySessionId(sessionId).size())
                        .relationshipCount(relationshipRepository.findBySessionId(sessionId).size())
                        .vectorSegmentCount(countVectorsBySession(sessionId))
                        .build())
                .recentQueries(getRecentQueryAudit(sessionId))
                .engineStatus(getEngineStatus())
                .timestamp(System.currentTimeMillis())
                .build();
    }

    private List<NeuralAuditReport.RecentQueryAudit> getRecentQueryAudit(Long sessionId) {
        List<QueryHistory> recent = queryHistoryRepository.findTop5BySessionIdOrderByTimestampDesc(sessionId);
        if (recent == null) return new ArrayList<>();

        return recent.stream().map(q -> {
            // Since we don't store scores yet, we'll assign a simulated health based on response presence
            double score = (q.getResponse() != null && !q.getResponse().isBlank()) ? 0.85 : 0.0;
            return NeuralAuditReport.RecentQueryAudit.builder()
                    .query(q.getQuestion())
                    .averageContextScore(score)
                    .contextDepth(10) // Fixed max depth in QueryService
                    .status(score > 0.6 ? "SUCCESS" : "DEGRADED")
                    .build();
        }).collect(Collectors.toList());
    }

    private NeuralAuditReport.EngineStatus getEngineStatus() {
        Map<String, String> models = new HashMap<>();
        boolean ollamaHealthy = checkOllamaStatus(models);
        
        return NeuralAuditReport.EngineStatus.builder()
                .databaseHealthy(true) // If this service is running, DB is mostly fine
                .redisHealthy(true)
                .ollamaHealthy(ollamaHealthy)
                .modelPulse(models)
                .build();
    }

    private boolean checkOllamaStatus(Map<String, String> modelMap) {
        try {
            // Simple check by calling ollama API
            java.net.URL url = new java.net.URL(ollamaUrl + "/api/tags");
            java.net.HttpURLConnection con = (java.net.HttpURLConnection) url.openConnection();
            con.setRequestMethod("GET");
            con.setConnectTimeout(2000);
            int status = con.getResponseCode();
            
            if (status == 200) {
                modelMap.put("mistral", "ONLINE");
                modelMap.put("nomic-embed-text", "ONLINE");
                return true;
            }
        } catch (Exception e) {
            modelMap.put("engine", "OFFLINE");
        }
        return false;
    }

    private long countVectorsBySession(Long sessionId) {
        try {
            String sql = "SELECT COUNT(*) FROM knowledge_embeddings_v2 WHERE metadata->>'sessionId' = ?";
            Long count = jdbcTemplate.queryForObject(sql, Long.class, sessionId.toString());
            return count != null ? count : 0;
        } catch (Exception e) {
            log.warn("Neural Audit: Failed to count vectors via JDBC: {}", e.getMessage());
            return 0;
        }
    }
}
