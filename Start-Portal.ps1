# PowerShell Launcher for Tamil Nadu Healthcare Portal
$nodePath = "C:\Program Files\Adobe\Adobe Creative Cloud Experience\libs\node.exe"

if (-not (Test-Path $nodePath)) {
    $found = Get-Command node -ErrorAction SilentlyContinue
    if ($found) {
        $nodePath = $found.Source
    } else {
        Write-Error "Node.js executable could not be found."
        exit 1
    }
}

Write-Host "Starting Tamil Nadu Healthcare Backend Server on http://localhost:5000..." -ForegroundColor Green
Start-Process "http://localhost:5000"
& $nodePath "server\server.js"
