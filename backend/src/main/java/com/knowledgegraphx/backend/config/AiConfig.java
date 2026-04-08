package com.knowledgegraphx.backend.config;

import dev.langchain4j.model.chat.ChatLanguageModel;
import dev.langchain4j.model.chat.StreamingChatLanguageModel;
import dev.langchain4j.store.embedding.EmbeddingStore;
import dev.langchain4j.data.segment.TextSegment;
import dev.langchain4j.store.embedding.inmemory.InMemoryEmbeddingStore;
import dev.langchain4j.store.embedding.pgvector.PgVectorEmbeddingStore;
import dev.langchain4j.model.embedding.EmbeddingModel;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Primary;

import java.time.Duration;

/**
 * KnowledgeGraphX AI Configuration
 *
 * LLM           : Ollama (local) — llama3
 * Embeddings    : HuggingFace BGE-Small-EN-v1.5 (Local, High-Fidelity)
 *                 Or HuggingFace Inference API (if token provided)
 * Vector Store  : PgVector (PostgreSQL)
 */
@Configuration
@Slf4j
public class AiConfig {

    @Value("${spring.datasource.url}")
    private String datasourceUrl;

    @Value("${spring.datasource.username}")
    private String datasourceUsername;

    @Value("${spring.datasource.password}")
    private String datasourcePassword;

    @Value("${ollama.base-url:http://localhost:11434}")
    private String ollamaBaseUrl;

    @Value("${ollama.model:mistral}")
    private String ollamaModel;

    @Value("${hf.api-token:disabled}")
    private String hfApiToken;

    @Value("${hf.model-id:sentence-transformers/all-MiniLM-L6-v2}")
    private String hfModelId;

    @Bean(name = "mistralChatModel")
    public ChatLanguageModel mistralChatModel() {
        log.info("Neural Engine: Registering High-Speed Logic Model (mistral)");
        return dev.langchain4j.model.ollama.OllamaChatModel.builder()
                .baseUrl(ollamaBaseUrl)
                .modelName("mistral")
                .temperature(0.7)
                .timeout(Duration.ofSeconds(120))
                .build();
    }

    @Bean(name = "llama3ChatModel")
    @Primary
    public ChatLanguageModel llama3ChatModel() {
        log.info("Neural Engine: Registering High-Fidelity Logic Model (mistral-fallback)");
        return dev.langchain4j.model.ollama.OllamaChatModel.builder()
                .baseUrl(ollamaBaseUrl)
                .modelName("mistral")
                .temperature(0.7)
                .timeout(Duration.ofSeconds(300))
                .build();
    }

    @Bean(name = "mistralStreamingModel")
    public StreamingChatLanguageModel mistralStreamingModel() {
        log.info("Neural Engine: Registering High-Speed Streaming Model (mistral)");
        return dev.langchain4j.model.ollama.OllamaStreamingChatModel.builder()
                .baseUrl(ollamaBaseUrl)
                .modelName("mistral")
                .temperature(0.7)
                .timeout(Duration.ofSeconds(120))
                .build();
    }

    @Bean(name = "llama3StreamingModel")
    @Primary
    public StreamingChatLanguageModel llama3StreamingModel() {
        log.info("Neural Engine: Registering High-Fidelity Streaming Model (mistral-fallback)");
        return dev.langchain4j.model.ollama.OllamaStreamingChatModel.builder()
                .baseUrl(ollamaBaseUrl)
                .modelName("mistral")
                .temperature(0.7)
                .timeout(Duration.ofSeconds(300))
                .build();
    }

    /**
     * Neural Intelligence Integration
     * 
     * Refactored to use Ollama for Embeddings to maintain D-Drive consistency.
     */
    @Bean
    @Primary
    public EmbeddingModel embeddingModel() {
        log.info("Neural Engine: Engaging Optimized Embedding Model (nomic-embed-text) at {}", ollamaBaseUrl);
        return dev.langchain4j.model.ollama.OllamaEmbeddingModel.builder()
                .baseUrl(ollamaBaseUrl)
                .modelName("nomic-embed-text") // Optimized: 274MB footprint
                .timeout(Duration.ofSeconds(180))
                .build();
    }

    @Bean
    public EmbeddingStore<TextSegment> embeddingStore() {
        try {
            log.info("Neural Memory: Initializing PgVector store (dimension 768)...");
            // Standardizing on nomic-embed-text (768) for high-concurrency discovery
            return PgVectorEmbeddingStore.builder()
                    .host(extractHost(datasourceUrl))
                    .port(extractPort(datasourceUrl))
                    .database(extractDb(datasourceUrl))
                    .user(datasourceUsername)
                    .password(datasourcePassword)
                    .table("knowledge_embeddings_v2") // Matches nomic-embed-text
                    .dimension(768) // Matches nomic-embed-text
                    .build();
        } catch (Exception e) {
            log.warn("Neural Memory: Persistent storage failed. Using InMemory fallback.");
            return new InMemoryEmbeddingStore<>();
        }
    }

    private String extractHost(String url) {
        if (url == null || !url.contains("//")) return "localhost";
        return url.split("//")[1].split(":")[0];
    }

    private int extractPort(String url) {
        try {
            if (url == null || !url.contains(":")) return 5432;
            String[] parts = url.split(":");
            if (parts.length < 4) return 5432;
            return Integer.parseInt(parts[3].split("/")[0]);
        } catch (Exception e) { return 5432; }
    }

    private String extractDb(String url) {
        if (url == null || !url.contains("/")) return "knowledgegraphx";
        return url.substring(url.lastIndexOf("/") + 1);
    }
}
