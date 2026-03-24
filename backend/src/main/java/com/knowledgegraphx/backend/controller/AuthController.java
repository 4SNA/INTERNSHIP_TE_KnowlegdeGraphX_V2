package com.knowledgegraphx.backend.controller;

import com.knowledgegraphx.backend.dto.LoginRequest;
import com.knowledgegraphx.backend.dto.RegisterRequest;
import com.knowledgegraphx.backend.model.User;
import com.knowledgegraphx.backend.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        User user = authService.registerUser(request);

        String token = authService.generateTokenForUser(user.getEmail());

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("user", Map.of(
            "id", user.getId(),
            "name", user.getFullName(),
            "email", user.getEmail(),
            "avatarUrl", user.getAvatarUrl() != null ? user.getAvatarUrl() : "",
            "provider", user.getProvider().name()
        ));
        response.put("message", "Registration successful");

        return ResponseEntity.ok(response);
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@Valid @RequestBody LoginRequest request) {
        String token = authService.login(request);
        User user = authService.getUserByEmail(request.getEmail());

        Map<String, Object> response = new HashMap<>();
        response.put("token", token);
        response.put("user", Map.of(
            "id", user.getId(),
            "name", user.getFullName(),
            "email", user.getEmail(),
            "avatarUrl", user.getAvatarUrl() != null ? user.getAvatarUrl() : "",
            "provider", user.getProvider().name()
        ));

        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal UserDetails userDetails) {
        User user = authService.getUserByEmail(userDetails.getUsername());

        Map<String, Object> response = new HashMap<>();
        response.put("id", user.getId());
        response.put("name", user.getFullName());
        response.put("email", user.getEmail());
        response.put("avatarUrl", user.getAvatarUrl() != null ? user.getAvatarUrl() : "");
        response.put("provider", user.getProvider().name());

        return ResponseEntity.ok(response);
    }

    @PostMapping("/validate")
    public ResponseEntity<?> validateToken() {
        // If this endpoint is reached, the JWT filter already validated the token
        return ResponseEntity.ok(Map.of("valid", true));
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
            @AuthenticationPrincipal UserDetails userDetails,
            @RequestBody com.knowledgegraphx.backend.dto.ProfileUpdateRequest request) {
        
        User user = authService.updateProfile(userDetails.getUsername(), request);
        
        return ResponseEntity.ok(Map.of(
            "id", user.getId(),
            "name", user.getFullName(),
            "email", user.getEmail(),
            "avatarUrl", user.getAvatarUrl() != null ? user.getAvatarUrl() : "",
            "provider", user.getProvider().name()
        ));
    }
}
