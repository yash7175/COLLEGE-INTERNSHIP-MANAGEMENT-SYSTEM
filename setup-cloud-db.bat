@echo off
title Setup Cloud MySQL Database - CIMS
echo ======================================================================
echo           INITIALIZE CLOUD MYSQL DATABASE FOR RENDER
echo ======================================================================
echo.
cd /d "%~dp0"
powershell -ExecutionPolicy Bypass -File "%~dp0scripts\setup-cloud-db.ps1"
