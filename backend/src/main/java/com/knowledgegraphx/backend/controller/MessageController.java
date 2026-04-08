package com.knowledgegraphx.backend.controller;

import com.knowledgegraphx.backend.dto.ChatMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

@Controller
@RequiredArgsConstructor
@Slf4j
public class MessageController {

    private final java.util.Map<String, java.util.Set<com.knowledgegraphx.backend.dto.ChatMessage>> sessionUsers = new java.util.concurrent.ConcurrentHashMap<>();

    @MessageMapping("/chat.sendMessage/{sessionId}")
    @SendTo("/topic/session/{sessionId}")
    public ChatMessage sendMessage(
            @DestinationVariable String sessionId,
            @Payload ChatMessage chatMessage
    ) {
        log.info("Broadcasting chat message to session {}", sessionId);
        return chatMessage;
    }

    @MessageMapping("/chat.addUser/{sessionId}")
    @SendTo("/topic/session/{sessionId}")
    public java.util.List<ChatMessage> addUser(
            @DestinationVariable String sessionId,
            @Payload ChatMessage chatMessage,
            SimpMessageHeaderAccessor headerAccessor
    ) {
        // Add username in web socket session safely
        java.util.Map<String, Object> attributes = headerAccessor.getSessionAttributes();
        if (attributes != null) {
            attributes.put("username", chatMessage.getSender());
            attributes.put("sessionId", sessionId);
        }

        sessionUsers.computeIfAbsent(sessionId, k -> java.util.concurrent.ConcurrentHashMap.newKeySet());
        chatMessage.setType(ChatMessage.MessageType.JOIN);
        sessionUsers.get(sessionId).add(chatMessage);
        
        log.info("User {} joined session {}. Total active: {}", chatMessage.getSender(), sessionId, sessionUsers.get(sessionId).size());
        
        // Broadcast the entire active user set to sync everyone
        return new java.util.ArrayList<>(sessionUsers.get(sessionId));
    }

    public java.util.Map<String, java.util.Set<ChatMessage>> getSessionUsersMap() {
        return sessionUsers;
    }
}
