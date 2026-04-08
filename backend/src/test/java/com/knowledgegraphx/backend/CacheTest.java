package com.knowledgegraphx.backend;

import com.knowledgegraphx.backend.model.Session;
import com.knowledgegraphx.backend.model.User;
import com.knowledgegraphx.backend.repository.SessionRepository;
import com.knowledgegraphx.backend.service.SessionService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class CacheTest {

    @Autowired
    private SessionRepository sessionRepository;

    @Autowired
    private SessionService sessionService;

    @Autowired
    private com.knowledgegraphx.backend.service.QueryService queryService;

    @Autowired
    private org.springframework.data.redis.core.StringRedisTemplate redisTemplate;

    @Test
    public void testAiCacheEfficiency() {
        String testQuestion = "How does the neural knowledge matrix function?";
        Long testSessionId = 999123L;
        String user = "system_test@kgx.ai";
        
        // Ensure clean state
        redisTemplate.delete("ai:query:" + testSessionId + ":" + testQuestion.toLowerCase());

        System.out.println("--- AI SYSTEM CACHE BENCHMARK ---");
        
        // 1. First Call (Should be a CACHE MISS)
        long start1 = System.currentTimeMillis();
        queryService.performQuery(testQuestion, testSessionId, user);
        long dur1 = System.currentTimeMillis() - start1;
        System.out.println("[Step 1] Initial call latency: " + dur1 + "ms (Cache MISS expected)");
        
        // 2. Second Call (Should be a CACHE HIT)
        long start2 = System.currentTimeMillis();
        queryService.performQuery(testQuestion, testSessionId, user);
        long dur2 = System.currentTimeMillis() - start2;
        System.out.println("[Step 2] Identical call latency: " + dur2 + "ms (Cache HIT expected)");
        
        // Verification: Cache hit should be significantly faster (usually under 50ms vs 200ms+ for AI)
        System.out.println("[System Info] Performance Gain: " + (dur1 - dur2) + "ms");
        assertTrue(dur2 < dur1, "Cache hit was NOT faster than initial AI call!");
        assertTrue(dur2 < 100, "Cache hit latency too high (>100ms)");

        System.out.println("--- AI SYSTEM CACHE VERIFIED ---");
    }
}
