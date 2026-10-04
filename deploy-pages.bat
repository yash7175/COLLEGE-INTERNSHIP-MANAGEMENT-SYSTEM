@echo off
title Deploy Frontend to GitHub Pages
powershell -ExecutionPolicy Bypass -File "%~dp0scripts\deploy-gh-pages.ps1"
pause
