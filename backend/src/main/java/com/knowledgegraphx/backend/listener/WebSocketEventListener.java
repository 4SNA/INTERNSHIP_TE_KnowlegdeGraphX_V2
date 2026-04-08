package com.knowledgegraphx.backend.listener;

import com.knowledgegraphx.backend.dto.ChatMessage;
import com.knowledgegraphx.backend.controller.MessageController;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.messaging.simp.SimpMessageSendingOperations;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.messaging.SessionDisconnectEvent;

import java.util.ArrayList;
import java.util.Map;
import java.util.Set;

@Component
@RequiredArgsConstructor
@Slf4j
public class WebSocketEventListener {

    private final SimpMessageSendingOperations messagingTemplate;
    private final MessageController messageController;

    @EventListener
    public void handleWebSocketDisconnectListener(SessionDisconnectEvent event) {
        StompHeaderAccessor headerAccessor = StompHeaderAccessor.wrap(event.getMessage());
        Map<String, Object> sessionAttributes = headerAccessor.getSessionAttributes();

        if (sessionAttributes != null) {
            String username = (String) sessionAttributes.get("username");
            String sessionId = (String) sessionAttributes.get("sessionId");

            if (username != null && sessionId != null) {
                log.info("User Disconnected : {} from session {}", username, sessionId);

                // Remove from active list
                Map<String, Set<ChatMessage>> allSessionUsers = messageController.getSessionUsersMap();
                if (allSessionUsers.containsKey(sessionId)) {
                    allSessionUsers.get(sessionId).removeIf(u -> u.getSender().equals(username));
                    
                    // Broadcast updated list to everyone left
                    log.info("Broadcasting updated roster for session {}. Remaining: {}", sessionId, allSessionUsers.get(sessionId).size());
                    messagingTemplate.convertAndSend("/topic/session/" + sessionId, 
                            new ArrayList<>(allSessionUsers.get(sessionId)));
                }
            }
        }
    }
}
