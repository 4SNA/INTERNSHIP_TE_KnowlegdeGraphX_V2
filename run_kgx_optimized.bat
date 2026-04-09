@echo off
TITLE KnowledgeGraphX - Neural Bootloader
COLOR 0A
CD /D "%~dp0"

echo ============================================================
echo  [SYSTEM] KnowledgeGraphX Optimized Ignition
echo  [MODE]   High-Speed Neural Pulse
echo ============================================================
echo.

powershell -ExecutionPolicy Bypass -File "./launch_kgx_optimized.ps1"

pause
