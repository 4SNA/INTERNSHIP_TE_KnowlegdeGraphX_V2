package com.knowledgegraphx.backend.controller;

import com.knowledgegraphx.backend.dto.LoginRequest;
import com.knowledgegraphx.backend.dto.RegisterRequest;
import com.knowledgegraphx.backend.model.User;
import com.knowledgegraphx.backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final com.knowledgegraphx.backend.repository.UserRepository userRepository;

    @PostMapping("/login/success")
    public ResponseEntity<?> loginUser(@Valid @RequestBody LoginRequest request) {
        String token = authService.login(request);
        com.knowledgegraphx.backend.model.User user = userRepository.findByEmail(request.getEmail()).orElseThrow();
        
        java.util.Map<String, Object> response = new java.util.HashMap<>();
        response.put("token", token);
        response.put("user", java.util.Map.of(
            "id", user.getId(),
            "name", user.getFullName(),
            "email", user.getEmail()
        ));
        
        return ResponseEntity.ok(response);
    }
}
