package com.knowledgegraphx.backend.repository;

import com.knowledgegraphx.backend.model.QueryHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QueryHistoryRepository extends JpaRepository<QueryHistory, Long> {
    List<QueryHistory> findBySessionIdOrderByTimestampDesc(Long sessionId);
    List<QueryHistory> findByUserIdOrderByTimestampDesc(Long userId);
    List<QueryHistory> findTop10ByUserIdOrderByTimestampDesc(Long userId);
}
