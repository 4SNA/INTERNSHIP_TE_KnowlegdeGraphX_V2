package com.knowledgegraphx.backend.repository;

import com.knowledgegraphx.backend.model.Session;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface SessionRepository extends JpaRepository<Session, Long> {
    Optional<Session> findBySessionCode(String sessionCode);
    Boolean existsBySessionCode(String sessionCode);
}
