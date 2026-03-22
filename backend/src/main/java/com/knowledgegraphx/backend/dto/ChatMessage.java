package com.knowledgegraphx.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChatMessage {
    private String content;
    private String sender;
    private Long sessionId;
    private MessageType type;

    public enum MessageType {
        CHAT, JOIN, LEAVE, AI_QUERY, AI_RESPONSE
    }
}
