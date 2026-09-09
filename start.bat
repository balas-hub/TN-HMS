@echo off
title Tamil Nadu Health Care & Pan-India Medical Centre Portal
echo ===================================================================
echo  Starting Tamil Nadu Healthcare Portal (React + Node.js Backend)
echo ===================================================================

set NODE_EXEC="C:\Program Files\Adobe\Adobe Creative Cloud Experience\libs\node.exe"

if exist %NODE_EXEC% (
    echo Using Node.js runtime from: %NODE_EXEC%
    start "" http://localhost:5000
    %NODE_EXEC% server\server.js
) else (
    where node >nul 2>nul
    if %ERRORLEVEL% equ 0 (
        echo Using system Node.js
        start "" http://localhost:5000
        node server\server.js
    ) else (
        echo [ERROR] Node.js executable not found.
        pause
    )
)
