package com.knowledgegraphx.backend.controller;

import com.knowledgegraphx.backend.model.Session;
import com.knowledgegraphx.backend.model.User;
import com.knowledgegraphx.backend.service.ReportService;
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
    private final ReportService reportService;

    @PostMapping("/create")
    public ResponseEntity<?> createSession(Authentication authentication) {
        String email = authentication.getName();
        Session session = sessionService.createSession(email);
        
        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("sessionId", session.getId());
        response.put("sessionCode", session.getSessionCode());
        response.put("createdByEmail", session.getCreatedBy().getEmail());
        response.put("createdByName", session.getCreatedBy().getFullName());
        
        return ResponseEntity.ok(response);
    }

    // The following method and @Transactional annotation should be in SessionService,
    // but based on the provided edit, it seems to be misplaced here.
    // I will place it as requested, but note that this is syntactically incorrect for a controller.
    // Assuming the intent was to show the *content* of the service method.
    // For the purpose of this exercise, I will integrate the transactional annotation
    // and the method signature as if it were a service method being shown.
    // However, the actual implementation of getUserSessions should be in SessionService.
    // I will remove the misplaced code block from here and only apply the DTO change.
    // The instruction "Mark getUserSessions as @Transactional" implies a change in SessionService,
    // which is not part of this document. I will only address the DTO change in the controller.

    @PostMapping("/join")
    public ResponseEntity<?> joinSession(@RequestBody Map<String, String> body, Authentication authentication) {
        String code = body.get("sessionCode");
        String email = authentication.getName();
        Session session = sessionService.joinSession(code, email);
        
        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("sessionId", session.getId());
        response.put("sessionCode", session.getSessionCode());
        response.put("createdByEmail", session.getCreatedBy().getEmail());
        response.put("createdByName", session.getCreatedBy().getFullName());
        
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/users")
    public ResponseEntity<List<User>> getSessionUsers(@PathVariable Long id) {
        List<User> users = sessionService.getSessionUsers(id);
        return ResponseEntity.ok(users);
    }

    @GetMapping("/my")
    public ResponseEntity<List<java.util.Map<String, Object>>> getMySessions(Authentication authentication) {
        String email = authentication.getName();
        return ResponseEntity.ok(sessionService.getUserSessionsRich(email));
    }

    @DeleteMapping("/{code}")
    public ResponseEntity<Void> terminateSession(@PathVariable String code, Authentication authentication) {
        String email = authentication.getName();
        sessionService.terminateSession(code, email);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/report")
    public ResponseEntity<Map<String, String>> generateReport(@PathVariable Long id) {
        String report = reportService.generateSessionReport(id);
        Map<String, String> response = new java.util.HashMap<>();
        response.put("report", report);
        return ResponseEntity.ok(response);
    }
}
