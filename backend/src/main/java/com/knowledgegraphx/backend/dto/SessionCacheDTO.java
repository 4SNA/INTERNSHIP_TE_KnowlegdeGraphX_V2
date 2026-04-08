package com.knowledgegraphx.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.io.Serializable;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SessionCacheDTO implements Serializable {
    private static final long serialVersionUID = 1L;
    
    private Long sessionId;
    private String sessionCode;
    private String createdByEmail;
    private String createdByName;
}
