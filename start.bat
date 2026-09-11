@echo off
setlocal enabledelayedexpansion
title Tamil Nadu Health Care ^& Pan-India Medical Centre Portal

:: Ensure working directory is the folder where start.bat is located
cd /d "%~dp0"

echo ===================================================================
echo   TAMIL NADU HEALTH CARE ^& PAN-INDIA MEDICAL CENTRE
echo   Portal Launcher ^& Automatic Requirement Check
echo ===================================================================
echo.

set "NODE_EXEC="

:: 1. Check project-local portable Node.js runtime in .\bin\
if exist "%~dp0bin\node.exe" (
    set "NODE_EXEC=%~dp0bin\node.exe"
    echo [+] Using local project Node.js runtime: !NODE_EXEC!
    goto :FOUND_NODE
)

:: 2. Check if system Node.js is available in PATH
where node >nul 2>nul
if %ERRORLEVEL% equ 0 (
    for /f "delims=" %%i in ('where node 2^>nul') do (
        set "NODE_EXEC=%%i"
        echo [+] Using system Node.js: !NODE_EXEC!
        goto :FOUND_NODE
    )
)

:: 3. Check common Windows installation locations
if exist "%ProgramFiles%\nodejs\node.exe" (
    set "NODE_EXEC=%ProgramFiles%\nodejs\node.exe"
    echo [+] Found Node.js in Program Files: !NODE_EXEC!
    goto :FOUND_NODE
)

if exist "%ProgramFiles(x86)%\nodejs\node.exe" (
    set "NODE_EXEC=%ProgramFiles(x86)%\nodejs\node.exe"
    echo [+] Found Node.js in Program Files x86: !NODE_EXEC!
    goto :FOUND_NODE
)

if exist "%LOCALAPPDATA%\Programs\nodejs\node.exe" (
    set "NODE_EXEC=%LOCALAPPDATA%\Programs\nodejs\node.exe"
    echo [+] Found Node.js in LocalAppData: !NODE_EXEC!
    goto :FOUND_NODE
)

if exist "C:\Program Files\Adobe\Adobe Creative Cloud Experience\libs\node.exe" (
    set "NODE_EXEC=C:\Program Files\Adobe\Adobe Creative Cloud Experience\libs\node.exe"
    echo [+] Found Node.js runtime: !NODE_EXEC!
    goto :FOUND_NODE
)

:: 4. If Node.js is not found anywhere, automatically install portable Node.js
echo [!] Node.js runtime was not detected on this computer.
echo [+] Setting up portable Node.js runtime automatically [v22 LTS]...
echo [+] No administrator privileges required.
echo.

if not exist "%~dp0bin" mkdir "%~dp0bin"

where curl.exe >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo [*] Downloading portable Node.js binary via curl...
    curl.exe -L --progress-bar -o "%~dp0bin\node.exe" "https://nodejs.org/dist/v22.14.0/win-x64/node.exe"
) else (
    echo [*] Downloading portable Node.js binary via PowerShell...
    powershell -NoProfile -ExecutionPolicy Bypass -Command "[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12; (New-Object System.Net.WebClient).DownloadFile('https://nodejs.org/dist/v22.14.0/win-x64/node.exe', '%~dp0bin\node.exe')"
)

if exist "%~dp0bin\node.exe" (
    set "NODE_EXEC=%~dp0bin\node.exe"
    echo.
    echo [+] Portable Node.js runtime downloaded and configured successfully!
    goto :FOUND_NODE
) else (
    echo.
    echo [ERROR] Could not automatically download Node.js.
    echo Please verify your internet connection or install Node.js manually from:
    echo   https://nodejs.org/
    echo.
    pause
    exit /b 1
)

:FOUND_NODE
echo [*] Testing Node.js runtime...
"!NODE_EXEC!" -v
if %ERRORLEVEL% neq 0 (
    echo [ERROR] Node.js binary at "!NODE_EXEC!" failed to execute.
    pause
    exit /b 1
)

:: Check SQL Database initialization
if not exist "%~dp0server\db\hospital.db" (
    echo [*] Initializing SQL Database [hospital.db] with clinical seed data...
    "!NODE_EXEC!" "%~dp0server\db\feed.js"
    echo.
)

:: Check if port 5000 is currently occupied
netstat -ano | findstr /R /C:":5000 .*LISTENING" >nul 2>nul
if %ERRORLEVEL% equ 0 (
    echo [WARNING] Port 5000 is already in use by another process.
    echo If another instance is running, close it or use a different port.
    echo.
)

echo ===================================================================
echo  Starting Tamil Nadu Healthcare Portal [Backend API + Frontend]
echo  Server Address: http://localhost:5000
echo  Citizen Portal: http://localhost:5000/client
echo  Doctor Desk   : http://localhost:5000/doctor
echo ===================================================================
echo.

:: Launch the browser automatically after 2 seconds
start "" cmd /c "timeout /t 2 /nobreak >nul & start http://localhost:5000"

:: Start the server
"!NODE_EXEC!" "%~dp0server\server.js"

if %ERRORLEVEL% neq 0 (
    echo.
    echo [ERROR] Server terminated with error code %ERRORLEVEL%.
)

echo.
echo Server has stopped.
pause
