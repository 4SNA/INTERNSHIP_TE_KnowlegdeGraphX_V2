package com.knowledgegraphx.backend.dto.graph;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class NeuralNode {
    private String id;
    private String label;
    private String type; // "document", "concept", etc.
    private Double strength; // 0.0 to 1.0
    private String context;
}
