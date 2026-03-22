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

    public List<User> getSessionUsers(Long sessionId) {
        return sessionUserRepository.findBySessionId(sessionId).stream()
                .map(SessionUser::getUser)
                .collect(Collectors.toList());
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
