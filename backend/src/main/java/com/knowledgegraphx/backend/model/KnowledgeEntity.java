package com.knowledgegraphx.backend.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "knowledge_entities")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class KnowledgeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String type; // PEOPLE, ORGANIZATION, CONCEPT, KEYWORD

    @Column(columnDefinition = "TEXT")
    private String context;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
        name = "document_entities",
        joinColumns = @JoinColumn(name = "entity_id"),
        inverseJoinColumns = @JoinColumn(name = "document_id")
    )
    @com.fasterxml.jackson.annotation.JsonIgnore
    @Builder.Default
    private java.util.Set<Document> documents = new java.util.HashSet<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private Session session;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
