# PowerShell Launcher for Tamil Nadu Healthcare Portal
$projectRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $projectRoot

$nodePath = Join-Path $projectRoot "bin\node.exe"

if (-not (Test-Path $nodePath)) {
    $found = Get-Command node -ErrorAction SilentlyContinue
    if ($found) {
        $nodePath = $found.Source
    } elseif (Test-Path "$env:ProgramFiles\nodejs\node.exe") {
        $nodePath = "$env:ProgramFiles\nodejs\node.exe"
    } elseif (Test-Path "${env:ProgramFiles(x86)}\nodejs\node.exe") {
        $nodePath = "${env:ProgramFiles(x86)}\nodejs\node.exe"
    } elseif (Test-Path "$env:LOCALAPPDATA\Programs\nodejs\node.exe") {
        $nodePath = "$env:LOCALAPPDATA\Programs\nodejs\node.exe"
    } elseif (Test-Path "C:\Program Files\Adobe\Adobe Creative Cloud Experience\libs\node.exe") {
        $nodePath = "C:\Program Files\Adobe\Adobe Creative Cloud Experience\libs\node.exe"
    } else {
        Write-Host "[!] Node.js runtime not found. Running start.bat to configure..." -ForegroundColor Yellow
        cmd.exe /c start.bat
        exit 0
    }
}

Write-Host "Starting Tamil Nadu Healthcare Backend Server on http://localhost:5000..." -ForegroundColor Green
Start-Process "http://localhost:5000"
& $nodePath (Join-Path $projectRoot "server\server.js")
