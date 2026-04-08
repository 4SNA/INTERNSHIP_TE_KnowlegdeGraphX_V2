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
    private String senderEmail;
    private String avatarUrl;
    private Long sessionId;
    private MessageType type;
    private String messageId;
    private java.util.List<String> suggestedQueries;
    private boolean isStreaming;
    private boolean isFinal;

    public enum MessageType {
        CHAT, JOIN, LEAVE, AI_QUERY, AI_RESPONSE, STREAM_CHUNK
    }
}
