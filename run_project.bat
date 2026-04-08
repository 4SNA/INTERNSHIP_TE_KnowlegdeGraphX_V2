@echo off
title KnowledgeGraphX One-Click Launcher
setlocal

:: 1. SET DRIVE D CONTEXT
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo 🚀 KNOWLEDGEGRAPHX - ULTIMATE ONE-CLICK LAUNCHER (DRIVE D)
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.

:: 2. RUN SELF-HEALING POWERSHELL ORCHESTRATOR
:: This handles environment, DB, Redis, AI Sync, and Port cleanup
powershell -ExecutionPolicy Bypass -File "%~dp0run_on_d.ps1"

echo.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo ✅ SYSTEM ORCHESTRATION INITIATED.
echo    Backend and Frontend are starting in separate windows.
echo    Please wait 1-2 minutes for the first boot.
echo ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
echo.
pause
