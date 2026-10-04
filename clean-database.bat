@echo off
title Reset Database - College Internship Management System
echo ======================================================================
echo          PURGE MOCK DATA - COLLEGE INTERNSHIP MANAGEMENT SYSTEM
echo ======================================================================
echo.
echo This will remove all mock internships, applications, student records,
echo and faculty accounts, preserving only the clean Administrator account.
echo.
set /p CONFIRM="Are you sure you want to proceed? (Y/N): "
if /i "%CONFIRM%" NEQ "Y" (
    echo Operation cancelled by user.
    pause
    exit /b 0
)

cd /d "%~dp0"
npm run db:clean
echo.
pause
