@echo off
set "OLLAMA_MODELS=D:\ollama\models"
set "MAVEN_OPTS=-Dmaven.repo.local=D:\.m2\repository"

echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 🚀 KNOWLEDGEGRAPHX - DRIVE D NEURAL LAUNCHER
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

echo [1/3] SYNCING AI BRAIN (Drive D)...
ollama pull llama3

echo.
echo [2/3] STARTING NEURAL BACKEND (Drive D)...
cd backend
start "KGX-BACKEND" mvn org.springframework.boot:spring-boot-maven-plugin:3.4.1:run -Dmaven.repo.local=D:\.m2\repository -Dspring-boot.run.profiles=local

echo.
echo [3/3] STARTING INTELLIGENCE UI...
cd ../frontend
start "KGX-FRONTEND" npm run dev

echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo ✅ DEPLOYMENT INITIATED. 
echo - UI: http://localhost:3000
echo - API: http://localhost:8080
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
pause
