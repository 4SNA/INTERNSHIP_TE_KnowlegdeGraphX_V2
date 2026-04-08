package com.knowledgegraphx.backend.dto.graph;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class KnowledgeNetwork {
    private List<NeuralNode> nodes;
    private List<IntelligenceEdge> edges;
}
