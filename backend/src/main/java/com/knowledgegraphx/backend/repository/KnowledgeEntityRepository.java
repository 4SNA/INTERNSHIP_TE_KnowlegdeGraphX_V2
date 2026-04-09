package com.knowledgegraphx.backend.repository;

import com.knowledgegraphx.backend.model.KnowledgeEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface KnowledgeEntityRepository extends JpaRepository<KnowledgeEntity, Long> {
    List<KnowledgeEntity> findBySessionId(Long sessionId);
    List<KnowledgeEntity> findByDocumentsId(Long documentId);
    
    java.util.Optional<KnowledgeEntity> findBySessionIdAndNameIgnoreCase(Long sessionId, String name);

    @org.springframework.transaction.annotation.Transactional
    void deleteByDocumentsId(Long documentId);

    @org.springframework.transaction.annotation.Transactional
    void deleteBySessionId(Long sessionId);
}
