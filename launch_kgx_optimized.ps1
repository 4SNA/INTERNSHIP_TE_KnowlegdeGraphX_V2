# KnowledgeGraphX - High-Fidelity Neural Dashboard & Orchestrator
# Designed for deep visibility and blink-fast synchronization.

$ErrorActionPreference = "SilentlyContinue"
$projectRoot = "D:\KnowledgeGraphX"
$env:SPRING_PROFILES_ACTIVE = "local"
$env:PGPASSWORD = "password"

function Show-Dashboard {
    param($redis, $postgres, $ollama, $backend, $frontend)
    Clear-Host
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host " [BRAIN] KNOWLEDGEGRAPHX LIVE NEURAL DASHBOARD" -ForegroundColor Cyan
    Write-Host " [STATUS] Real-time System Integrity Monitoring" -ForegroundColor Cyan
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host ""
    
    $rColor = if ($redis -eq "ONLINE") { "Green" } else { "Red" }
    $pColor = if ($postgres -eq "ONLINE") { "Green" } else { "Red" }
    $oColor = if ($ollama -eq "ONLINE") { "Green" } else { "Red" }
    $bColor = if ($backend -eq "READY") { "Green" } else { "Yellow" }
    $fColor = if ($frontend -eq "ACTIVE") { "Green" } else { "Yellow" }

    Write-Host " [INFRASTRUCTURE]" -ForegroundColor White
    Write-Host "   Redis Memory    : " -NoNewline; Write-Host "$redis" -ForegroundColor $rColor
    Write-Host "   Postgres Vector : " -NoNewline; Write-Host "$postgres" -ForegroundColor $pColor
    Write-Host "   Ollama Reasoning: " -NoNewline; Write-Host "$ollama" -ForegroundColor $oColor
    Write-Host ""
    Write-Host " [APPLICATIONS]" -ForegroundColor White
    Write-Host "   Neural Backend  : " -NoNewline; Write-Host "$backend" -ForegroundColor $bColor
    Write-Host "   Neural Frontend : " -NoNewline; Write-Host "$frontend" -ForegroundColor $fColor
    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host " [URLS]" -ForegroundColor White
    Write-Host "   Dashboard: http://localhost:3000"
    Write-Host "   API Docs : http://localhost:8080/swagger-ui"
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host " Press CTRL+C to stop the dashboard. (Engines will remain active)"
}

# 1. Credentials Sync
if (Test-Path "$projectRoot\.env") {
    Get-Content "$projectRoot\.env" | Where-Object { $_ -match '=' -and $_ -notmatch '^#' } | ForEach-Object {
        $name, $value = $_.Split('=', 2)
        if ($name -and $value) { [System.Environment]::SetEnvironmentVariable($name.Trim(), $value.Trim(), "Process") }
    }
}

# 2. Ignition
Write-Host "Initializing Neural Ignition..." -ForegroundColor Yellow

# Start Backend if not already running
if (-not (Get-NetTCPConnection -LocalPort 8080 -ErrorAction SilentlyContinue)) {
    Write-Host " -> Launching Backend Hub..." -ForegroundColor Gray
    $backendDir = "$projectRoot\backend"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "title KGX-BACKEND; color 0a; cd '$backendDir'; mvn spring-boot:run `"-Dspring-boot.run.arguments=--spring.jpa.show-sql=false`""
}

# Start Frontend if not already running
if (-not (Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue)) {
    Write-Host " -> Launching Frontend Dashboard..." -ForegroundColor Gray
    $frontendDir = "$projectRoot\frontend"
    Start-Process powershell -ArgumentList "-NoExit", "-Command", "title KGX-FRONTEND; color 0b; cd '$frontendDir'; npm run dev -- --port 3000"
}

# 3. Live Dashboard Loop
while ($true) {
    $redisStat = if (Get-NetTCPConnection -LocalPort 6379 -ErrorAction SilentlyContinue) { "ONLINE" } else { "OFFLINE" }
    $pgStat = if (Get-NetTCPConnection -LocalPort 5432 -ErrorAction SilentlyContinue) { "ONLINE" } else { "OFFLINE" }
    $ollamaStat = if (Get-NetTCPConnection -LocalPort 11434 -ErrorAction SilentlyContinue) { "ONLINE" } else { "OFFLINE" }
    
    $backendStat = "STARTING"
    try {
        $resp = Invoke-WebRequest -Uri "http://localhost:8080/api/diagnostics/engine/health" -Method Get -TimeoutSec 1 -ErrorAction Stop
        if ($resp.StatusCode -eq 200) { $backendStat = "READY" }
    } catch {}
    
    $frontendStat = if (Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue) { "ACTIVE" } else { "STARTING" }

    Show-Dashboard $redisStat $pgStat $ollamaStat $backendStat $frontendStat
    Start-Sleep -Seconds 3
}
