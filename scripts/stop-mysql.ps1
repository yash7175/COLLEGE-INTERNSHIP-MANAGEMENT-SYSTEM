# Stop-MySQL script for College Internship Management System
Write-Host "[*] Stopping MariaDB/MySQL processes..." -ForegroundColor Cyan

$processes = Get-Process mysqld, mariadbd -ErrorAction SilentlyContinue

if ($processes) {
    $processes | Stop-Process -Force
    Write-Host "[OK] Stopped MariaDB / MySQL process." -ForegroundColor Green
} else {
    Write-Host "[INFO] No active mysqld or mariadbd processes found." -ForegroundColor Yellow
}
