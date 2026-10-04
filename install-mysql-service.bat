@echo off
echo ========================================================
echo Installing MariaDB / MySQL as Automatic Windows Service
echo ========================================================
powershell -Command "Start-Process powershell -Verb RunAs -ArgumentList '-NoProfile -ExecutionPolicy Bypass -File \"%~dp0scripts\install-windows-service.ps1\"'"
echo Administrator approval window opened. Please click 'Yes' to confirm.
pause
