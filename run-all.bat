@echo off
chcp 65001 >nul
:: PowerShell로 실행 (URL 자동 표시)
powershell -ExecutionPolicy Bypass -File "%~dp0run-all.ps1"
pause
