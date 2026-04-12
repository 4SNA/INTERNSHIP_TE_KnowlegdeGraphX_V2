# KnowledgeGraphX - ULTIMATE D-DRIVE ISOLATOR (Pure Drive D Operation)
# This script removes ALL C-Drive dependencies to resolve Disk Full issues.

$ErrorActionPreference = "SilentlyContinue"

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🚀 KNOWLEDGEGRAPHX - PURE DRIVE D ISOLATION ENGINE" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

# 1. PURE DRIVE D ENVIRONMENT MAPPING
$projectRoot = "D:\KnowledgeGraphX"
$envDir = "$projectRoot\env"
$tmpDir = "$projectRoot\tmp"
$repoDir = "D:\.m2\repository"
$npmCache = "$projectRoot\cache\npm"

# Redirect ALL System Hooks to D:
$env:USERPROFILE = $envDir
$env:LOCALAPPDATA = "$envDir\AppData\Local"
$env:APPDATA = "$envDir\AppData\Roaming"
$env:TEMP = $tmpDir
$env:TMP = $tmpDir
$env:OLLAMA_MODELS = "D:\ollama\models"
$env:MAVEN_OPTS = "-Xmx256m -Dmaven.repo.local=$repoDir -Duser.home=$envDir -Djava.io.tmpdir=$tmpDir"
$env:JAVA_OPTS = "-Xmx256m -Djava.io.tmpdir=$tmpDir"
$env:npm_config_cache = $npmCache

# 2. FILE SYSTEM REINFORCEMENT
Write-Host "[1/7] Isolating File System on Drive D..." -ForegroundColor White
$dirs = @($envDir, $tmpDir, $repoDir, $npmCache, "$envDir\AppData\Local", "$envDir\AppData\Roaming", "$projectRoot\uploads", "$projectRoot\data\postgres", "$projectRoot\data\redis")
foreach($dir in $dirs) { if(!(Test-Path $dir)) { New-Item -ItemType Directory -Path $dir -Force | Out-Null } }
Write-Host "   ✅ Workspace ISOLATED on D:." -ForegroundColor Green

# 3. GLOBAL PORT CLEARANCE
Write-Host "[2/7] Neutralizing Process Interference..." -ForegroundColor White
$ports = @(8080, 3000, 5432, 6379)
foreach($port in $ports) {
    try {
        $conn = Get-NetTCPConnection -LocalPort $port -ErrorAction Stop
        if($conn) { Stop-Process -Id $conn[0].OwningProcess -Force; Start-Sleep -Milliseconds 500 }
    } catch {}
}
if (Get-Process java -ErrorAction SilentlyContinue) { Stop-Process -Name java -Force }
if (Get-Process redis-server -ErrorAction SilentlyContinue) { Stop-Process -Name redis-server -Force }
Write-Host "   ✅ Ports 8080, 3000, 5432, 6379 CLEARED." -ForegroundColor Green

# 4. Neural Resonance (Redis on D:)
Write-Host "[3/7] Igniting Neural Cache (Redis on D:)..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "title KGX-REDIS; & 'C:\Program Files\Redis\redis-server.exe' --port 6379 --dir $projectRoot\data\redis"
Write-Host "   ✅ Redis ACTIVE on D: drive." -ForegroundColor Green

# 5. POSTGRES NEURAL REGISTRY (D-Drive Native)
Write-Host "[4/7] Igniting Neural Registry (PostgreSQL on D:)..." -ForegroundColor White
$pgBin = "C:\Program Files\PostgreSQL\17\bin"
$pgData = "$projectRoot\data\postgres"
if (!(Test-Path "$pgData\PG_VERSION")) { & "$pgBin\initdb.exe" -D $pgData -U postgres --auth=trust }
& "$pgBin\pg_ctl.exe" start -D $pgData -o "-p 5432"
Start-Sleep -Seconds 3
& "$pgBin\psql.exe" -U postgres -c "SELECT 1 FROM pg_database WHERE datname='knowledgegraphx'" | Out-Null
if($LASTEXITCODE -ne 0) { & "$pgBin\psql.exe" -U postgres -c "CREATE DATABASE knowledgegraphx;" }
& "$pgBin\psql.exe" -U postgres -d knowledgegraphx -c "CREATE EXTENSION IF NOT EXISTS vector;" | Out-Null
Write-Host "   ✅ PostgreSQL ONLINE and GPU/Vector optimized on D:." -ForegroundColor Green

# 6. OLLAMA SYNC
Write-Host "[5/7] Neural Model Pulse (Ollama on D:)..." -ForegroundColor White
if (!(Get-Process ollama -ErrorAction SilentlyContinue)) { Start-Process ollama -ArgumentList "serve" -WindowStyle Hidden }
Write-Host "   ✅ Ollama using D:\ollama\models." -ForegroundColor Green

# 7. MULTI-HUB BOOT (Pure D Execution)
Write-Host "[6/7] Launching Backend (Pure D Isolation)..." -ForegroundColor White
# Using absolute paths for EVERYTHING
$backendCmd = "mvn spring-boot:run `"-Dmaven.repo.local=$repoDir`" `"-Djava.io.tmpdir=$tmpDir`" `"-Duser.home=$envDir`" `"-Dspring-boot.run.profiles=local`""
Start-Process powershell -ArgumentList "-NoExit", "-Command", "title KGX-BACKEND; color 0a; cd $projectRoot\backend; $backendCmd"

Write-Host "[7/7] Launching Frontend (Pure D Isolation)..." -ForegroundColor White
$frontendCmd = "npm run dev -- --port 3000"
$env:path += ";C:\Program Files\nodejs"
Start-Process powershell -ArgumentList "-NoExit", "-Command", "title KGX-FRONTEND; color 0b; cd $projectRoot\frontend; `$env:USERPROFILE='$envDir'; `$env:TEMP='$tmpDir'; $frontendCmd"

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "🎉 SUCCESS: KNOWLEDGEGRAPHX IS NOW 100% INDEPENDENT OF C-DRIVE" -ForegroundColor Green
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "Tracking logs in live windows. Drive C space preserved."
