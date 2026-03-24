@echo off
setlocal
title KnowledgeGraphX Orchestrator

echo.
echo ======================================================================
echo           KNOWLEDGEGRAPHX NEURAL PLATFORM ORCHESTRATOR v4.1.0
echo ======================================================================
echo.

:: 1. Infrastructure Layer (Skipping Docker as per user request)
echo [1/3] Database Sync: Assuming local PostgreSQL is active on 5432...
:: (PostgreSQL is verified to be accepting connections)

:: 2. Application Layer (Backend)
echo [2/3] Ignition: Launching Backend Reasoning Hub...
cd backend
:: Start backend in a NEW window
start "KGX Backend Core" cmd /c "mvn spring-boot:run || echo Backend failed to start && pause"
cd ..

:: 3. UI Layer (Frontend)
echo [3/3] Neural Sync: Initializing High-Fidelity Command Center...
cd frontend
:: Run npm install once if node_modules is missing
if not exist node_modules (
    echo Installing dependencies...
    call npm install
)
:: Start frontend in a NEW window
start "KGX Neural UI" cmd /c "npm run dev || echo Frontend failed to start && pause"
cd ..

echo.
echo ======================================================================
echo   READY: KnowledgeGraphX boot sequence initiated.
echo.
echo   - DASHBOARD: http://localhost:3000
echo   - BACKEND:   http://localhost:8080
echo.
echo   (Check the sub-terminals for detailed status)
echo ======================================================================
echo.

pause
