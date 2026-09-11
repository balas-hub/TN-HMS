@echo off
setlocal enabledelayedexpansion
title Tamil Nadu Health Care - SQL Database Feeder

cd /d "%~dp0"

echo ===================================================================
echo  TAMIL NADU HEALTH CARE ^& PAN-INDIA MEDICAL CENTRE
echo  FEEDING PATIENT CLINICAL DATA INTO SQL DATABASE [hospital.db]
echo ===================================================================
echo.

set "NODE_EXEC="

if exist "%~dp0bin\node.exe" (
    set "NODE_EXEC=%~dp0bin\node.exe"
) else (
    where node >nul 2>nul
    if %ERRORLEVEL% equ 0 (
        set "NODE_EXEC=node"
    ) else if exist "%ProgramFiles%\nodejs\node.exe" (
        set "NODE_EXEC=%ProgramFiles%\nodejs\node.exe"
    ) else if exist "%ProgramFiles(x86)%\nodejs\node.exe" (
        set "NODE_EXEC=%ProgramFiles(x86)%\nodejs\node.exe"
    ) else if exist "%LOCALAPPDATA%\Programs\nodejs\node.exe" (
        set "NODE_EXEC=%LOCALAPPDATA%\Programs\nodejs\node.exe"
    ) else if exist "C:\Program Files\Adobe\Adobe Creative Cloud Experience\libs\node.exe" (
        set "NODE_EXEC=C:\Program Files\Adobe\Adobe Creative Cloud Experience\libs\node.exe"
    )
)

if not defined NODE_EXEC (
    echo [!] Node.js runtime not found. Please run start.bat first to set up the runtime.
    pause
    exit /b 1
)

"!NODE_EXEC!" "%~dp0server\db\feed.js"

echo.
pause
