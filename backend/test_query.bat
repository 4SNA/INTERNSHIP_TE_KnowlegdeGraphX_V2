@echo off
echo === Original Query ===
curl -X POST http://localhost:8080/query/ask -H "Content-Type: application/json" -H "Authorization: Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiaWF0IjoxNzc0NzcxMjY1LCJleHAiOjE3NzQ4NTc2NjV9.LHG0vBopKpyOfPjK8ZuAGWEvQzDRnJZQc3KIWGlXNAiRn8x_gL_F4p8kjiNyofeKXPJrGfLDm1wpm9icP15skA" -d "{\"question\":\"What is the value of test in the database?\",\"sessionId\":18}"
echo.
echo === Typo Query (Should map to relevant chunks) ===
curl -X POST http://localhost:8080/query/ask -H "Content-Type: application/json" -H "Authorization: Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiJ0ZXN0QGV4YW1wbGUuY29tIiwiaWF0IjoxNzc0NzcxMjY1LCJleHAiOjE3NzQ4NTc2NjV9.LHG0vBopKpyOfPjK8ZuAGWEvQzDRnJZQc3KIWGlXNAiRn8x_gL_F4p8kjiNyofeKXPJrGfLDm1wpm9icP15skA" -d "{\"question\":\"val of tast in db?\",\"sessionId\":18}"
