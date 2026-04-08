package com.knowledgegraphx.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ExtractedEntityDTO {
    private List<EntityWrapper> entities;
    private List<RelationshipWrapper> relationships;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class EntityWrapper {
        private String name;
        private String type; // PEOPLE, ORGANIZATION, CONCEPT, KEYWORD
        private String context;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class RelationshipWrapper {
        private String source; // Entity name
        private String target; // Entity name
        private String relation; // belongs to, related to, explains, etc.
    }
}
