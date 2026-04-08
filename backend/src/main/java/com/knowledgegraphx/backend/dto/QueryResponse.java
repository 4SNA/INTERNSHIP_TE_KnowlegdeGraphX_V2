package com.knowledgegraphx.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class QueryResponse {
    private String answer;
    private List<String> sources;
    private List<String> suggestedQueries;
    private String messageId;
}
