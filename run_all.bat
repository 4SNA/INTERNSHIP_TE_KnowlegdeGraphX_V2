@echo off
setlocal
title KnowledgeGraphX Orchestrator

echo.
echo ======================================================================
echo           KNOWLEDGEGRAPHX NEURAL PLATFORM ORCHESTRATOR v4.0.1
echo ======================================================================
echo.

:: 1. Infrastructure Layer (Docker)
echo [1/3] Engaging Neural Infrastructure (PostgreSQL + Redis)...
docker-compose up -d db redis
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Failed to engage Docker infrastructure. 
    echo Please ensure Docker Desktop is running.
    echo.
    pause
    exit /b %ERRORLEVEL%
)

:: Wait for DB to be ready
echo Waiting for services to stabilize... 
timeout /t 5 /nobreak > nul

:: 2. Application Layer (Backend)
echo [2/3] Ignition: Launching Backend Reasoning Hub...
start "KGX Backend Core" cmd /c "cd backend && mvn spring-boot:run || echo Backend failed to start && pause"

:: 3. UI Layer (Frontend)
echo [3/3] Neural Sync: Initializing High-Fidelity Command Center...
start "KGX Neural UI" cmd /c "cd frontend && npm run dev || echo Frontend failed to start && pause"

echo.
echo ======================================================================
echo   READY: KnowledgeGraphX is now operational.
echo.
echo   - DASHBOARD: http://localhost:3000
echo   - API DOCS:  http://localhost:8080/swagger-ui.html (if active)
echo.
echo   (Close these terminal windows to stop the services)
echo ======================================================================
echo.

pause
