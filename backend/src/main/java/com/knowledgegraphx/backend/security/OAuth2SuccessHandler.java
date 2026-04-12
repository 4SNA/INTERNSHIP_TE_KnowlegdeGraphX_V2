package com.knowledgegraphx.backend.security;

import com.knowledgegraphx.backend.model.User;
import com.knowledgegraphx.backend.repository.UserRepository;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import java.io.IOException;
import java.time.LocalDateTime;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    @Value("${app.frontendUrl:http://localhost:3000}")
    private String frontendUrl;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response, Authentication authentication) throws IOException, ServletException {
        OAuth2AuthenticationToken oauthToken = (OAuth2AuthenticationToken) authentication;
        String registrationId = oauthToken.getAuthorizedClientRegistrationId(); // "google" or "github"
        OAuth2User oAuth2User = oauthToken.getPrincipal();

        String email;
        String name;
        String avatar;
        String providerId;
        User.AuthProvider provider;

        if ("github".equals(registrationId)) {
            // GitHub OAuth attributes
            email = oAuth2User.getAttribute("email");
            name = oAuth2User.getAttribute("login"); // GitHub login/username
            String ghName = oAuth2User.getAttribute("name");
            if (ghName != null && !ghName.isBlank()) {
                name = ghName;
            }
            avatar = oAuth2User.getAttribute("avatar_url");
            providerId = String.valueOf(oAuth2User.getAttribute("id"));
            provider = User.AuthProvider.github;

            // GitHub may not return email if it's private
            if (email == null || email.isBlank()) {
                email = oAuth2User.getAttribute("login") + "@github.user";
            }
        } else {
            // Google OAuth attributes
            email = oAuth2User.getAttribute("email");
            name = oAuth2User.getAttribute("name");
            avatar = oAuth2User.getAttribute("picture");
            providerId = oAuth2User.getAttribute("sub");
            provider = User.AuthProvider.google;
        }

        final String finalEmail = email;
        final String finalName = name;
        final String finalAvatar = avatar;
        final String finalProviderId = providerId;
        final User.AuthProvider finalProvider = provider;

        // Sync with DB - find or create user
        User user = userRepository.findByEmail(finalEmail).orElseGet(() -> {
            User newUser = User.builder()
                    .email(finalEmail)
                    .fullName(finalName)
                    .avatarUrl(finalAvatar)
                    .provider(finalProvider)
                    .providerId(finalProviderId)
                    .build();
            User saved = userRepository.save(newUser);
            if (saved.getId() == null) throw new IllegalStateException("Neural Auth: Failed to persist OAuth2 user.");
            return saved;
        });


        // Update last login and avatar if changed
        user.setLastLogin(LocalDateTime.now());
        if (finalAvatar != null) {
            user.setAvatarUrl(finalAvatar);
        }
        userRepository.save(user);

        String token = jwtUtil.generateToken(user.getEmail());
        String targetUrl = UriComponentsBuilder.fromUriString(frontendUrl + "/oauth-callback")
                .queryParam("token", token)
                .build().toUriString();

        getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
