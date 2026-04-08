@echo off
echo === General AI Query (Fallback to LLM) ===
curl -X POST http://localhost:8080/query/ask -H "Content-Type: application/json" -H "Authorization: Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiaWF0IjoxNzc0NzcxMjY1LCJleHAiOjE3NzQ4NTc2NjV9.LHG0vBopKpyOfPjK8ZuAGWEvQzDRnJZQc3KIWGlXNAiRn8x_gL_F4p8kjiNyofeKXPJrGfLDm1wpm9icP15skA" -d "{\"question\":\"Explain binary search algorithm briefly.\",\"sessionId\":18}"
echo.
