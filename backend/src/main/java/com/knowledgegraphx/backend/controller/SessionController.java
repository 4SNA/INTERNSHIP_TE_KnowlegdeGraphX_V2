package com.knowledgegraphx.backend.controller;

import com.knowledgegraphx.backend.model.Session;
import com.knowledgegraphx.backend.model.User;
import com.knowledgegraphx.backend.service.SessionService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/session")
@RequiredArgsConstructor
public class SessionController {

    private final SessionService sessionService;

    @PostMapping("/create")
    public ResponseEntity<?> createSession(Authentication authentication) {
        String email = authentication.getName();
        Session session = sessionService.createSession(email);
        
        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("sessionId", session.getId());
        response.put("sessionCode", session.getSessionCode());
        
        return ResponseEntity.ok(response);
    }

    @PostMapping("/join")
    public ResponseEntity<?> joinSession(@RequestBody Map<String, String> body, Authentication authentication) {
        String code = body.get("sessionCode");
        String email = authentication.getName();
        Session session = sessionService.joinSession(code, email);
        
        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("sessionId", session.getId());
        response.put("sessionCode", session.getSessionCode());
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/users")
    public ResponseEntity<List<User>> getSessionUsers(@PathVariable Long id) {
        List<User> users = sessionService.getSessionUsers(id);
        return ResponseEntity.ok(users);
    }
}
