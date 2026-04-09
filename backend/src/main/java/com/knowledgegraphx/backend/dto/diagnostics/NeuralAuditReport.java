package com.knowledgegraphx.backend.dto.diagnostics;

import lombok.Builder;
import lombok.Data;
import java.util.List;
import java.util.Map;

@Data
@Builder
public class NeuralAuditReport {
    private IndexStats indexStats;
    private List<RecentQueryAudit> recentQueries;
    private EngineStatus engineStatus;
    private long timestamp;

    @Data
    @Builder
    public static class IndexStats {
        private long documentCount;
        private long entityCount;
        private long relationshipCount;
        private long vectorSegmentCount;
    }

    @Data
    @Builder
    public static class RecentQueryAudit {
        private String query;
        private double averageContextScore;
        private int contextDepth;
        private String status; // SUCCESS, DEGRADED, FAILED
    }

    @Data
    @Builder
    public static class EngineStatus {
        private boolean databaseHealthy;
        private boolean ollamaHealthy;
        private boolean redisHealthy;
        private Map<String, String> modelPulse; // modelName -> status
    }
}
