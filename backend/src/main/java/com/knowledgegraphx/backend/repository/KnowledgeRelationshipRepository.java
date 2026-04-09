package com.knowledgegraphx.backend.repository;

import com.knowledgegraphx.backend.model.KnowledgeRelationship;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface KnowledgeRelationshipRepository extends JpaRepository<KnowledgeRelationship, Long> {
    List<KnowledgeRelationship> findBySessionId(Long sessionId);
    List<KnowledgeRelationship> findBySourceIdOrTargetId(Long sourceId, Long targetId);
    
    @org.springframework.transaction.annotation.Transactional
    void deleteBySessionId(Long sessionId);

    boolean existsBySourceIdAndTargetIdAndRelationType(Long sourceId, Long targetId, String relationType);
}
