package com.knowledgegraphx.backend.repository;

import com.knowledgegraphx.backend.model.Session;
import com.knowledgegraphx.backend.model.SessionUser;
import com.knowledgegraphx.backend.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SessionUserRepository extends JpaRepository<SessionUser, Long> {
    List<SessionUser> findBySessionId(Long sessionId);
    List<SessionUser> findByUserId(Long userId);
    Optional<SessionUser> findBySessionAndUser(Session session, User user);
    Boolean existsBySessionAndUser(Session session, User user);
}
