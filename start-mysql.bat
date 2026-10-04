@echo off
echo Starting MySQL / MariaDB Server...
powershell -ExecutionPolicy Bypass -File "%~dp0scripts\start-mysql.ps1"
pause
