@echo off
title College Internship Management System (CIMS)
echo ======================================================================
echo          COLLEGE INTERNSHIP MANAGEMENT SYSTEM (CIMS)
echo ======================================================================
echo.

cd /d "%~dp0"

:: 1. Ensure MySQL database is up and running
echo [1/3] Checking MySQL database status on port 3306...
powershell -ExecutionPolicy Bypass -File "%~dp0scripts\start-mysql.ps1"
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Failed to start MySQL database. Please check your MySQL setup.
    pause
    exit /b %ERRORLEVEL%
)

echo.
:: 2. Schedule browser launch once servers are initialized
echo [2/3] Launching web browser (http://localhost:5173)...
start "" powershell -NoProfile -Command "Start-Sleep -Seconds 3; Start-Process 'http://localhost:5173'"

echo.
:: 3. Launch Backend and Frontend concurrently
echo [3/3] Starting Backend API (Port 5000) and Frontend App (Port 5173)...
echo.
echo Press Ctrl+C at any time to stop the dev servers.
echo ======================================================================
echo.

npm run dev
