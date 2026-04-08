package com.knowledgegraphx.backend.dto.graph;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class IntelligenceEdge {
    private String source;
    private String target;
    private String label; // Relationship name
    private Double weight; // Link strength
}
