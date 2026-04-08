# KnowledgeGraphX - Drive D Capacity Migration Script
# Sets environment variables to redirect AI and Build engines to Drive D

[Environment]::SetEnvironmentVariable("OLLAMA_MODELS", "D:\ollama\models", "User")
[Environment]::SetEnvironmentVariable("MAVEN_OPTS", "-Dmaven.repo.local=D:\.m2\repository", "User")

# Create necessary directories on D:
New-Item -ItemType Directory -Path "D:\ollama\models" -Force
New-Item -ItemType Directory -Path "D:\.m2\repository" -Force
New-Item -ItemType Directory -Path "D:\KnowledgeGraphX\data\postgres" -Force
New-Item -ItemType Directory -Path "D:\KnowledgeGraphX\data\redis" -Force
New-Item -ItemType Directory -Path "D:\KnowledgeGraphX\uploads" -Force

Write-Host "✅ Drive D Configuration COMPLETE." -ForegroundColor Green
Write-Host "OLLAMA_MODELS      -> D:\ollama\models"
Write-Host "MAVEN_OPTS         -> -Dmaven.repo.local=D:\.m2\repository"
Write-Host "POSTGRES DATA      -> D:\KnowledgeGraphX\data\postgres"
Write-Host "REDIS DATA         -> D:\KnowledgeGraphX\data\redis"
Write-Host "UPLOADS DIRECTORY  -> D:\KnowledgeGraphX\uploads"
Write-Host ""
Write-Host "⚠️ PLEASE RESTART YOUR COMPUTER OR LOG OUT AND LOG IN for all changes to take effect." -ForegroundColor Yellow
Write-Host "Alternatively, restart Ollama from the system tray."
