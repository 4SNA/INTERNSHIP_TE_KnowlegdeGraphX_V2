@echo off
setlocal enabledelayedexpansion
title KnowledgeGraphX Neural Platform Oracle v6.0

:: Styling
color 0f
echo.
echo  ======================================================================
echo.
echo     ██╗  ██╗███╗   ██╗ ██████╗ ██╗    ██╗██╗     ███████╗██████╗  ██████╗ ███████╗
echo     ██║ ██╔╝████╗  ██║██╔═══██╗██║    ██║██║     ██╔════╝██╔══██╗██╔════╝ ██╔════╝
echo     █████╔╝ ██╔██╗ ██║██║   ██║██║ █╗ ██║██║     █████╗  ██║  ██║██║  ███╗█████╗
echo     ██╔═██╗ ██║╚██╗██║██║   ██║██║███╗██║██║     ██╔══╝  ██║  ██║██║   ██║██╔══╝
echo     ██║  ██╗██║ ╚████║╚██████╔╝╚███╔███╔╝███████╗███████╗██████╔╝╚██████╔╝███████╗
echo     ╚═╝  ╚═╝╚═╝  ╚═══╝ ╚═════╝  ╚══╝╚══╝ ╚══════╝╚══════╝╚═════╝  ╚═════╝ ╚══════╝
echo.
echo           KNOWLEDGEGRAPHX NEURAL PLATFORM ORCHESTRATOR v6.0
echo  ======================================================================
echo.

:: 1. Load Environment Sequences
echo [1/4] INJECTING Neural Credentials from .env ...
if exist ".env" (
    for /f "usebackq eol=# tokens=1,* delims==" %%A in (".env") do (
        if not "%%A"=="" (
            set "%%A=%%B"
        )
    )
    echo    SUCCESS: Secrets injected into runtime boundary.
) else (
    echo    WARNING: .env missing. Core AI services may exhaust.
)
echo.

:: 2. Boot Redis Memory Layer
echo [2/4] IGNITION: Pulse Check on Redis Memory Layer (Port 6379)...
:: Check if redis is already running
tasklist /fi "imagename eq redis-server.exe" 2>NUL | find /I /N "redis-server.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo    SUCCESS: Redis is already pulse-active in the background.
) else (
    echo    WARNING: Redis inactive. Attempting local server launch...
    start "KGX Redis Hub" cmd /c "title Redis Hub && color 0c && echo [BOOT SEQUENCE INITIATED] Loading Cache Matrix... && redis-server"
    echo    STATUS: Redis launch sequence sent. Awaiting persistence...
    timeout /t 3 > nul
)
echo.

:: 3. Boot Reasoning Core
echo [3/4] IGNITION: Launching Backend Reasoning Hub (Port 8080)...
start "KGX Backend Hub" cmd /k "title KGX Backend Core && color 0a && cd backend && set SPRING_PROFILES_ACTIVE=local && echo [BOOT SEQUENCE INITIATED] Loading Intelligence Matrix... && mvn spring-boot:run"
echo    STATUS: Backend thread spawned.
echo.

:: 4. Boot UI Layer
echo [4/4] NEURAL SYNC: Initializing High-Fidelity Front-End (Port 3000)...
start "KGX Neural UI" cmd /k "title KGX Command Center && color 0b && cd frontend && echo [BOOT SEQUENCE INITIATED] Rendering Dashboard... && npm run dev"
echo    STATUS: Frontend thread spawned.
echo.

echo  ======================================================================
echo.
echo   READY: All KnowledgeGraphX nodes have been pulse-activated.
echo.
echo   - COMMAND DASHBOARD: http://localhost:3000
echo   - REASONING ENGINE : http://localhost:8080
echo   - REDIS PERSISTENCE: Running (Local/Service)
echo.
echo   You may now minimize this orchestrator window.
echo  ======================================================================
echo.

pause
