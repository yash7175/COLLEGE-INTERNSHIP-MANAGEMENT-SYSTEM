# Check if running as administrator
$isAdmin = ([Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()).IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)

if (-not $isAdmin) {
    Write-Host "[!] Requesting Administrator privileges..." -ForegroundColor Yellow
    Start-Process powershell -Verb RunAs -ArgumentList "-NoProfile -ExecutionPolicy Bypass -File `"$PSCommandPath`""
    exit 0
}

Write-Host "=====================================================" -ForegroundColor Cyan
Write-Host "Installing MariaDB / MySQL as Windows Service..." -ForegroundColor Cyan
Write-Host "=====================================================" -ForegroundColor Cyan

$serviceName = "MySQL"
$mysqldPath = "C:\Program Files\MariaDB 13.0\bin\mysqld.exe"
$configPath = "C:\Program Files\MariaDB 13.0\data\my.ini"

# Stop existing service if running
$existing = Get-Service -Name $serviceName -ErrorAction SilentlyContinue
if ($existing) {
    Write-Host "[*] Service $serviceName already exists. Stopping and updating..." -ForegroundColor Yellow
    Stop-Service -Name $serviceName -Force -ErrorAction SilentlyContinue
    & $mysqldPath --remove $serviceName
    Start-Sleep -Seconds 1
}

# Install service
Write-Host "[*] Registering service '$serviceName'..." -ForegroundColor Cyan
& $mysqldPath --install $serviceName --defaults-file="$configPath"

# Set Startup Type to Automatic
Set-Service -Name $serviceName -StartupType Automatic

# Start service
Write-Host "[*] Starting '$serviceName' service..." -ForegroundColor Cyan
Start-Service -Name $serviceName

Start-Sleep -Seconds 2

# Verify
$service = Get-Service -Name $serviceName -ErrorAction SilentlyContinue
if ($service -and $service.Status -eq 'Running') {
    Write-Host ""
    Write-Host "[SUCCESS] $serviceName service installed and running with Automatic startup!" -ForegroundColor Green
    Write-Host "The database server will now start automatically whenever your PC boots." -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "[WARN] Service installed but status is: $($service.Status)" -ForegroundColor Yellow
}

Start-Sleep -Seconds 3
