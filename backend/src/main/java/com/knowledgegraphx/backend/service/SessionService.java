package com.knowledgegraphx.backend.service;

import com.knowledgegraphx.backend.model.Session;
import com.knowledgegraphx.backend.model.SessionUser;
import com.knowledgegraphx.backend.model.User;
import com.knowledgegraphx.backend.repository.SessionRepository;
import com.knowledgegraphx.backend.repository.SessionUserRepository;
import com.knowledgegraphx.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Random;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SessionService {

    private final SessionRepository sessionRepository;
    private final SessionUserRepository sessionUserRepository;
    private final UserRepository userRepository;
    private final VectorSearchService vectorSearchService;

    @Transactional
    public Session createSession(String creatorEmail) {
        User creator = userRepository.findByEmail(creatorEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + creatorEmail));

        String code = generateUniqueCode();
        
        Session session = Session.builder()
                .sessionCode(code)
                .createdBy(creator)
                .build();
        
        Session savedSession = sessionRepository.save(session);

        // Creator automatically joins as ADMIN
        SessionUser sessionUser = SessionUser.builder()
                .session(savedSession)
                .user(creator)
                .role(SessionUser.UserRole.ADMIN)
                .build();
        
        sessionUserRepository.save(sessionUser);
        
        return savedSession;
    }

    @Transactional
    public Session joinSession(String code, String userEmail) {
        Session session = sessionRepository.findBySessionCode(code)
                .orElseThrow(() -> new RuntimeException("Invalid session code"));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + userEmail));

        if (sessionUserRepository.existsBySessionAndUser(session, user)) {
            return session; // Already in session
        }

        SessionUser sessionUser = SessionUser.builder()
                .session(session)
                .user(user)
                .role(SessionUser.UserRole.COLLABORATOR)
                .build();

        sessionUserRepository.save(sessionUser);
        
        return session;
    }

    @Transactional
    public void terminateSession(String code, String userEmail) {
        Session session = sessionRepository.findBySessionCode(code)
                .orElseThrow(() -> new RuntimeException("Invalid session code"));

        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + userEmail));

        // Only creator can terminate
        if (!session.getCreatedBy().getId().equals(user.getId())) {
            throw new RuntimeException("Unauthorized: Only workspace creator can terminate the session.");
        }

        System.out.println("Neural Termination: Destroying workspace " + code + " and purging all associated intelligence...");
        
        // Clean up documents and vectors first if necessary (Cascade handles DB, but we need vector cleanup)
        vectorSearchService.deleteVectorsBySession(session.getId());
        
        sessionRepository.delete(session);
    }

    public List<User> getSessionUsers(Long sessionId) {
        return sessionUserRepository.findBySessionId(sessionId).stream()
                .map(SessionUser::getUser)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<java.util.Map<String, Object>> getUserSessionsRich(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found: " + userEmail));
                
        return sessionUserRepository.findByUserId(user.getId()).stream()
                .map(su -> {
                    Session s = su.getSession();
                    java.util.Map<String, Object> map = new java.util.HashMap<>();
                    map.put("sessionId", s.getId());
                    map.put("sessionCode", s.getSessionCode());
                    map.put("memberCount", s.getCollaborators().size());
                    map.put("collaborators", s.getCollaborators().stream()
                            .map(c -> c.getUser().getAvatarUrl())
                            .filter(java.util.Objects::nonNull)
                            .collect(Collectors.toList()));
                    map.put("collaboratorNames", s.getCollaborators().stream()
                            .map(c -> c.getUser().getFullName())
                            .filter(java.util.Objects::nonNull)
                            .collect(Collectors.toList()));
                    
                    return map;
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public void auditSessionOwnership() {
        List<Session> sessions = sessionRepository.findAll();
        for (Session s : sessions) {
            User creator = s.getCreatedBy();
            if (creator != null && !sessionUserRepository.existsBySessionAndUser(s, creator)) {
                SessionUser su = SessionUser.builder()
                        .session(s)
                        .user(creator)
                        .role(SessionUser.UserRole.ADMIN)
                        .build();
                sessionUserRepository.save(su);
            }
        }
    }

    private String generateUniqueCode() {
        String characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        StringBuilder code;
        do {
            code = new StringBuilder();
            Random rnd = new Random();
            for (int i = 0; i < 8; i++) {
                code.append(characters.charAt(rnd.nextInt(characters.length())));
                if (i == 3) code.append("-");
            }
        } while (sessionRepository.existsBySessionCode(code.toString()));
        
        return code.toString();
    }
}
