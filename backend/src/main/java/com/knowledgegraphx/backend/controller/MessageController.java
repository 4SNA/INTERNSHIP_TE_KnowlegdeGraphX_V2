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
    public ChatMessage addUser(
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
        log.info("Broadcasting user join to session {}", sessionId);
        return chatMessage;
    }
}
