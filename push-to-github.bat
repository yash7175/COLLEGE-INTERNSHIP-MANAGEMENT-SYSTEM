@echo off
title Push to GitHub - College Internship Management System
echo ======================================================================
echo Pushing local commits to GitHub repository:
echo https://github.com/yash7175/COLLEGE-INTERNSHIP-MANAGEMENT-SYSTEM.git
echo ======================================================================
echo.
cd /d "%~dp0"
git push -u origin main
echo.
if %ERRORLEVEL% EQU 0 (
    echo [SUCCESS] Everything pushed to GitHub successfully!
) else (
    echo [ERROR] Git push failed. Please check the output above.
)
echo.
pause
