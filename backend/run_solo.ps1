# KnowledgeGraphX - Backend Runner
$env:JAVA_HOME = "C:\Program Files\Java\jdk-17"
$env:PATH = "$env:JAVA_HOME\bin;" + $env:PATH
$env:SPRING_PROFILES_ACTIVE = "local"

# Load .env
if (Test-Path "../.env") {
    Get-Content "../.env" | ForEach-Object {
        if ($_ -match '^(.*?)=(.*)$') {
            $name = $matches[1].Trim()
            $value = $matches[2].Trim()
            [Environment]::SetEnvironmentVariable($name, $value, "Process")
        }
    }
}

cd D:\KnowledgeGraphX\backend
java -Xmx2048m -jar D:\KnowledgeGraphX\backend\target\backend-0.0.1-SNAPSHOT.jar
