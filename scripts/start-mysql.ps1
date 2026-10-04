# Start-MySQL script for College Internship Management System
$Port = 3306
$MariaDbPath = "C:\Program Files\MariaDB 13.0\bin\mysqld.exe"
$ConfigFile = "C:\Program Files\MariaDB 13.0\data\my.ini"

Write-Host "[*] Checking MySQL / MariaDB status on port $Port..." -ForegroundColor Cyan

$conn = Test-NetConnection -ComputerName 127.0.0.1 -Port $Port -WarningAction SilentlyContinue

if ($conn.TcpTestSucceeded) {
    Write-Host "[OK] MySQL / MariaDB is already running on port $Port." -ForegroundColor Green
    exit 0
}

Write-Host "[!] Port $Port is not active. Starting MariaDB server..." -ForegroundColor Yellow

if (Test-Path $MariaDbPath) {
    # Launch completely detached via Win32_Process so it survives parent shell exit
    $cmd = "`"$MariaDbPath`" --defaults-file=`"$ConfigFile`" --console"
    $res = ([wmiclass]"win32_process").Create($cmd)
    
    if ($res.ReturnValue -ne 0) {
        Write-Host "[WARN] WMI creation failed with code $($res.ReturnValue). Falling back to Start-Process..." -ForegroundColor Yellow
        Start-Process -FilePath $MariaDbPath -ArgumentList "--defaults-file=`"$ConfigFile`"", "--console" -WindowStyle Hidden
    }

    Start-Sleep -Seconds 3

    $verify = Test-NetConnection -ComputerName 127.0.0.1 -Port $Port -WarningAction SilentlyContinue
    if ($verify.TcpTestSucceeded) {
        Write-Host "[SUCCESS] MariaDB server started successfully on port $Port!" -ForegroundColor Green
        exit 0
    } else {
        Write-Host "[WARN] MariaDB process launched but port $Port is not responding yet. Please check C:\Program Files\MariaDB 13.0\data for logs." -ForegroundColor Yellow
        exit 1
    }
} else {
    Write-Host "[ERROR] Could not find MariaDB at $MariaDbPath." -ForegroundColor Red
    exit 1
}
