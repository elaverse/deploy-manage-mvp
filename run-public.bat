@echo off
setlocal enabledelayedexpansion
chcp 65001 >nul
echo ========================================
echo   프로그램 배포 관리 - 원클릭 실행
echo   (외부 접속 + 데이터 공유)
echo ========================================
echo.

:: Node/npm 확인
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo [오류] Node.js가 설치되어 있지 않습니다.
    echo        https://nodejs.org 에서 설치 후 다시 실행하세요.
    pause
    exit /b 1
)

:: Python 확인
where python >nul 2>&1
if %errorlevel% neq 0 (
    echo [오류] Python이 설치되어 있지 않습니다.
    echo        https://python.org 에서 설치 후 다시 실행하세요.
    pause
    exit /b 1
)

echo [1/3] 프론트엔드 빌드 중...
cd /d "%~dp0frontend"
call npm run build 2>nul
if %errorlevel% neq 0 (
    echo      npm install 실행 중...
    call npm install
    call npm run build
)
if %errorlevel% neq 0 (
    echo [오류] 빌드 실패
    pause
    exit /b 1
)
echo      빌드 완료.
echo.

echo [2/3] 백엔드 설정 확인...
cd /d "%~dp0backend"
if not exist .env if exist .env.example copy .env.example .env >nul
pip install -q fastapi uvicorn pydantic-settings supabase 2>nul
echo.

echo [3/3] 서버 시작...
set CORS_ALLOW_ALL=1
start "배포관리-서버" cmd /k "cd /d %~dp0backend && set CORS_ALLOW_ALL=1 && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000"

timeout /t 4 /nobreak >nul

echo.
echo ========================================
echo   접속 URL
echo ========================================
echo.
echo   이 PC:        http://localhost:8000
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    set "IP=%%a"
    set "IP=!IP: =!"
    echo   같은 네트워크: http://!IP!:8000
    goto :ip_done
)
:ip_done
echo.
echo   ※ 데이터 공유: SUPABASE_데이터공유_설정.md 참고
echo.
echo   외부(인터넷) URL을 원하면:
echo   run-with-tunnel.bat 실행 또는 cloudflared 사용
echo.
echo ========================================
echo   창을 닫으면 서버가 종료됩니다.
echo ========================================
echo.
pause
