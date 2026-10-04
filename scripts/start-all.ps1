# Automated All-in-One Startup Script for CIMS
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "         COLLEGE INTERNSHIP MANAGEMENT SYSTEM (CIMS)" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""

$rootDir = Split-Path -Parent $PSScriptRoot

# 1. Start MySQL
Write-Host "[1/3] Checking MySQL database status on port 3306..." -ForegroundColor Yellow
& "$PSScriptRoot\start-mysql.ps1"

# 2. Schedule Browser
Write-Host "[2/3] Scheduling browser launch at http://localhost:5173..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoProfile -Command `"Start-Sleep -Seconds 3; Start-Process 'http://localhost:5173'`"" -WindowStyle Hidden

# 3. Launch dev servers
Write-Host "[3/3] Starting Backend API (Port 5000) and Frontend App (Port 5173)..." -ForegroundColor Green
Write-Host "Press Ctrl+C to terminate the dev servers." -ForegroundColor DarkGray
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""

Set-Location $rootDir
npm run dev
