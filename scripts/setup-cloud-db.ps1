# Cloud Database Setup Script for CIMS
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "         CIMS - CLOUD MYSQL DATABASE INITIALIZATION" -ForegroundColor Cyan
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "This script pushes your database schema and provisions the initial"
Write-Host "Administrator account on your cloud MySQL database (TiDB Cloud / Aiven)."
Write-Host ""

$CloudUrl = Read-Host "Paste your Cloud MySQL DATABASE_URL"

if ([string]::IsNullOrWhiteSpace($CloudUrl) -or -not ($CloudUrl.StartsWith("mysql://"))) {
    Write-Host "[ERROR] Invalid database URL. It must start with 'mysql://'." -ForegroundColor Red
    pause
    exit 1
}

Write-Host ""
Write-Host "[1/3] Setting target cloud database environment..." -ForegroundColor Yellow
$env:DATABASE_URL = $CloudUrl.Trim()

Write-Host "[2/3] Synchronizing schema to cloud database (prisma db push)..." -ForegroundColor Yellow
npx prisma db push --schema=backend/prisma/schema.prisma

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to push schema to cloud database. Please verify connection credentials and network access." -ForegroundColor Red
    pause
    exit 1
}

Write-Host ""
Write-Host "[3/3] Provisioning clean Administrator account on cloud database..." -ForegroundColor Yellow
npx ts-node backend/prisma/clean.ts

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "======================================================================" -ForegroundColor Green
    Write-Host "[SUCCESS] Cloud MySQL database initialized successfully!" -ForegroundColor Green
    Write-Host "======================================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next Step: In your Render.com dashboard under Environment Variables,"
    Write-Host "set DATABASE_URL to this exact connection string." -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host "[WARN] Schema was pushed, but admin account provisioning encountered an issue." -ForegroundColor Yellow
}

pause
