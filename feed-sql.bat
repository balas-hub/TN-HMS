@echo off
title Tamil Nadu Health Care - SQL Database Feeder
echo ===================================================================
echo  TAMIL NADU HEALTH CARE ^& PAN-INDIA MEDICAL CENTRE
echo  FEEDING PATIENT CLINICAL DATA INTO SQL DATABASE (hospital.db)
echo ===================================================================
echo.

if exist "C:\Program Files\Adobe\Adobe Creative Cloud Experience\libs\node.exe" (
  "C:\Program Files\Adobe\Adobe Creative Cloud Experience\libs\node.exe" server\db\feed.js
) else (
  node server\db\feed.js
)

echo.
pause
