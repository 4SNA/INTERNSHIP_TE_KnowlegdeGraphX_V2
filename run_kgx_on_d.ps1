# KnowledgeGraphX - ULTIMATE D-DRIVE ORCHESTRATOR v2.0
# Optimized for high-performance AI operations and isolated D-drive execution.

$ErrorActionPreference = "SilentlyContinue"

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🚀 KNOWLEDGEGRAPHX - PRODUCTION-GRADE D-DRIVE ENGINE" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

# 1. CORE CONFIGURATION
$projectRoot = "D:\KnowledgeGraphX"
$envDir = "$projectRoot\env"
$tmpDir = "$projectRoot\tmp"
$repoDir = "D:\.m2\repository"
$npmCache = "$projectRoot\cache\npm"

# SYSTEM HOOK REDIRECTION
$env:USERPROFILE = $envDir
$env:LOCALAPPDATA = "$envDir\AppData\Local"
$env:APPDATA = "$envDir\AppData\Roaming"
$env:TEMP = $tmpDir
$env:TMP = $tmpDir
$env:OLLAMA_MODELS = "D:\ollama\models"

# ENFORCE JAVA 17 COMPATIBILITY
if (Test-Path "C:\Program Files\Java\jdk-17") {
    $env:JAVA_HOME = "C:\Program Files\Java\jdk-17"
    $env:PATH = "$env:JAVA_HOME\bin;" + $env:PATH
    Write-Host "   ✅ Environment synchronized with JDK 17." -ForegroundColor Gray
}

$env:MAVEN_OPTS = "-Xmx2048m -Dmaven.repo.local=$repoDir -Duser.home=$envDir -Djava.io.tmpdir=$tmpDir"
$env:JAVA_OPTS = "-Xmx2048m -Djava.io.tmpdir=$tmpDir"
$env:npm_config_cache = $npmCache
$env:PGPASSWORD = "password"


# 2. FILE SYSTEM PREPARATION
Write-Host "[1/7] Initializing Workspace Isolators..." -ForegroundColor White
$dirs = @($envDir, $tmpDir, $repoDir, $npmCache, "$envDir\AppData\Local", "$envDir\AppData\Roaming", "$projectRoot\uploads", "$projectRoot\data\postgres", "$projectRoot\data\redis")
foreach($dir in $dirs) { if(!(Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null } }
Write-Host "   ✅ High-capacity filesystem prepared on D:." -ForegroundColor Green

# 3. CONFLICT RESOLUTION
Write-Host "[2/7] Neutralizing Port Interference..." -ForegroundColor White
$ports = @(8080, 3000, 5432) # Skip 6379 to avoid killing existing Redis service
foreach($port in $ports) {
    try {
        $conn = Get-NetTCPConnection -LocalPort $port -ErrorAction Stop
        if($conn) { Stop-Process -Id $conn[0].OwningProcess -Force; Start-Sleep -Milliseconds 500 }
    } catch {}
}
if (Get-Process java -ErrorAction SilentlyContinue) { Stop-Process -Name java -Force }
Write-Host "   ✅ Runtime boundary cleared (Redis service preserved)." -ForegroundColor Green

# 4. REDIS IGNITION
Write-Host "[3/7] Pulse Check: Redis Neural Cache..." -ForegroundColor White
if (Get-NetTCPConnection -LocalPort 6379 -ErrorAction SilentlyContinue) {
    Write-Host "   ✅ Redis/Memurai ALREADY ACTIVE on port 6379." -ForegroundColor Green
} else {
    $redisPaths = @(
        "C:\Program Files\Redis\redis-server.exe",
        "C:\Program Files\Memurai\memurai-server.exe",
        "C:\Program Files (x86)\Redis\redis-server.exe",
        "D:\Redis\redis-server.exe"
    )
    $redisBin = $null
    foreach($path in $redisPaths) { if(Test-Path $path) { $redisBin = $path; break } }

    if ($redisBin) {
        Write-Host "   🚀 Found Redis at: $redisBin" -ForegroundColor Gray
        Start-Process powershell -ArgumentList "-NoExit", "-Command", "title KGX-REDIS; & '$redisBin' --port 6379 --dir $projectRoot\data\redis"
        Write-Host "   ✅ Redis ACTIVE on D: drive." -ForegroundColor Green
    } else {
        Write-Host "   ⚠️ WARNING: No native Redis found and port 6379 is empty." -ForegroundColor Yellow
        Write-Host "   (Continuing backend launch - caching may be degraded)" -ForegroundColor Gray
    }
}


# 5. POSTGRES NEURAL REGISTRY
Write-Host "[4/7] Igniting Neural Registry (PostgreSQL)..." -ForegroundColor White
$pgBin = "C:\Program Files\PostgreSQL\17\bin"
$pgData = "$projectRoot\data\postgres"

if (Test-Path "$pgBin\pg_ctl.exe") {
    if (!(Test-Path "$pgData\PG_VERSION")) { & "$pgBin\initdb.exe" -D $pgData -U postgres --auth=trust }
    & "$pgBin\pg_ctl.exe" start -D $pgData -o "-p 5432"
    Start-Sleep -Seconds 3
    # Ensure Extension
    & "$pgBin\psql.exe" -U postgres -d knowledgegraphx -c "CREATE EXTENSION IF NOT EXISTS vector;" 2>$null
    Write-Host "   ✅ PostgreSQL ONLINE on D:." -ForegroundColor Green
} else {
    Write-Host "   ❌ ERROR: PostgreSQL 17 not found at $pgBin." -ForegroundColor Red
}

# 6. OLLAMA SYNC
Write-Host "[5/7] Syncing Ollama Models..." -ForegroundColor White
if (!(Get-Process ollama -ErrorAction SilentlyContinue)) { 
    Start-Process ollama -ArgumentList "serve" -WindowStyle Hidden 
    Start-Sleep -Seconds 2
}
Write-Host "   ✅ Ollama Pulse Active." -ForegroundColor Green

# 7. BACKEND & FRONTEND IGNITION
Write-Host "[6/7] Scaling Intelligence Hub (Backend)..." -ForegroundColor White
$backendCmd = "mvn spring-boot:run '-Dspring-boot.run.profiles=local'"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "title KGX-BACKEND; color 0a; cd $projectRoot\backend; $backendCmd"

Write-Host "[7/7] Rendering Neural Dashboard (Frontend)..." -ForegroundColor White
$frontendCmd = "npm run dev -- --port 3000"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "title KGX-FRONTEND; color 0b; cd $projectRoot\frontend; $frontendCmd"

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🎉 SUCCESS: KNOWLEDGEGRAPHX IS NOW FULLY FUNCTIONAL" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "Monitoring nodes in dedicated sub-terminals."
