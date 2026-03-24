package com.knowledgegraphx.backend.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class QueryHistoryResponse {
    private Long id;
    private String question;
    private String response;
    private String timestamp;
}
