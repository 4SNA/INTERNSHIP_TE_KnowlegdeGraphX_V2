# KnowledgeGraphX - Neural Platform Orchestrator v1.2 (Legacy Sync)
# High-fidelity dashboard for managing AI research nodes. Synchronized for localhost.

$ErrorActionPreference = "SilentlyContinue"

Clear-Host
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host " [BRAIN] KNOWLEDGEGRAPHX NEURAL PLATFORM ORCHESTRATOR" -ForegroundColor Cyan
Write-Host " [NETWORK] High-Fidelity Research OS Initialization" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# 1. ENVIRONMENT CONFIGURATION
$projectRoot = "D:\KnowledgeGraphX"
$env:SPRING_PROFILES_ACTIVE = "local"
$env:PGPASSWORD = "password"

# Inject .env credentials
if (Test-Path "$projectRoot\.env") {
    Write-Host "[1/7] SECURE: Injecting Neural Credentials..." -NoNewline
    Get-Content "$projectRoot\.env" | Where-Object { $_ -match '=' -and $_ -notmatch '^#' } | ForEach-Object {
        $name, $value = $_.Split('=', 2)
        if ($name -and $value) {
            [System.Environment]::SetEnvironmentVariable($name.Trim(), $value.Trim(), "Process")
        }
    }
    Write-Host " DONE" -ForegroundColor Green
}

# 2. REDIS PULSE CHECK
Write-Host "[2/7] PULSE: Synchronizing Redis Memory Layer (Port 6379)..." -NoNewline
if (Get-NetTCPConnection -LocalPort 6379 -ErrorAction SilentlyContinue) {
    Write-Host " ONLINE" -ForegroundColor Green
} else {
    Write-Host " OFFLINE" -ForegroundColor Red
    Start-Service -Name Memurai -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    if (Get-NetTCPConnection -LocalPort 6379 -ErrorAction SilentlyContinue) { Write-Host "     RESOLVED: Redis Restored." -ForegroundColor Green }
}

# 3. DATABASE PULSE CHECK
Write-Host "[3/7] REGISTRY: Synchronizing Neural Registry (PostgreSQL Port 5432)..." -NoNewline
if (Get-NetTCPConnection -LocalPort 5432 -ErrorAction SilentlyContinue) {
    Write-Host " ONLINE" -ForegroundColor Green
} else {
    Write-Host " OFFLINE" -ForegroundColor Red
    Start-Service -Name "postgresql-x64-17" -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    if (Get-NetTCPConnection -LocalPort 5432 -ErrorAction SilentlyContinue) { Write-Host "     RESOLVED: Database Restored." -ForegroundColor Green }
}

# 4. OLLAMA SYNC
Write-Host "[4/7] LOGIC: Synchronizing Reasoning Core (Ollama Port 11434)..." -NoNewline
if (Get-NetTCPConnection -LocalPort 11434 -ErrorAction SilentlyContinue) {
    Write-Host " ONLINE" -ForegroundColor Green
} else {
    Write-Host " OFFLINE" -ForegroundColor Red
    Start-Process ollama -ArgumentList "serve" -WindowStyle Hidden
    Start-Sleep -Seconds 3
    if (Get-NetTCPConnection -LocalPort 11434 -ErrorAction SilentlyContinue) { Write-Host "     RESOLVED: Ollama Active." -ForegroundColor Green }
}

# 5. BACKEND IGNITION
Write-Host "[5/7] IGNITION: Launching Backend Reasoning Hub (Port 8080)..." -ForegroundColor Cyan
$backendDir = "$projectRoot\backend"
$existingBackend = Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue
if ($existingBackend) { Stop-Process -Id $existingBackend[0].OwningProcess -Force }

Start-Process powershell -ArgumentList "-NoExit", "-Command", "title KGX-BACKEND; color 0a; cd '$backendDir'; mvn spring-boot:run"

# 6. FRONTEND IGNITION
Write-Host "[6/7] GRAPHICS: Rendering Neural Dashboard (Port 3000)..." -ForegroundColor Cyan
$frontendDir = "$projectRoot\frontend"
$existingFrontend = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($existingFrontend) { Stop-Process -Id $existingFrontend[0].OwningProcess -Force }

Start-Process powershell -ArgumentList "-NoExit", "-Command", "title KGX-FRONTEND; color 0b; cd '$frontendDir'; npm run dev -- --port 3000"

# 7. HEALTH VERIFICATION
Write-Host "[7/7] DIAGNOSTICS: Verifying System Integrity..." -ForegroundColor Yellow
$retries = 20
$success = $false
while ($retries -gt 0) {
    Write-Host "     Awaiting System Ready ($retries attempts left)..." -ForegroundColor Gray
    try {
        $resp = Invoke-WebRequest -Uri "http://localhost:8080/api/diagnostics/engine/health" -Method Get -TimeoutSec 2 -ErrorAction Stop
        if ($resp.StatusCode -eq 200) {
            $success = $true
            break
        }
    } catch {}
    $retries--
    Start-Sleep -Seconds 3
}

if ($success) {
    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host " SUCCESS: ALL SYSTEMS NOMINAL - KnowledgeGraphX is Pulse-Active!" -ForegroundColor Green
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host " [URL] DASHBOARD: http://localhost:3000" -ForegroundColor White
    Write-Host " [URL] BACKEND  : http://localhost:8080" -ForegroundColor White
    Write-Host " [DIR] PROJECT  : $projectRoot" -ForegroundColor White
    Write-Host "============================================================" -ForegroundColor Cyan
} else {
    Write-Host " ERROR: Backend is taking too long to start. Check KGX-BACKEND window." -ForegroundColor Red
}

Write-Host "Press any key to finish (Processes will remain active in secondary windows)..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
