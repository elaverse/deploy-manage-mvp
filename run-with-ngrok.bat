@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

echo ========================================
echo   고정 외부 접속 URL - ngrok
echo ========================================
echo.

:: ngrok 확인
where ngrok >nul 2>&1
if %errorlevel% neq 0 (
    echo [설치 필요] ngrok 다운로드:
    echo   https://ngrok.com/download
    echo   또는: winget install ngrok.ngrok
    echo.
    echo   가입 후 Domains에서 무료 고정 도메인 발급
    echo   자세한 방법: 고정URL_설정_가이드.md
    echo.
    pause
    exit /b 1
)

:: ngrok-config.txt에서 도메인 읽기
set "NGROK_DOMAIN="
if exist "%~dp0ngrok-config.txt" (
    for /f "tokens=2 delims==" %%a in ('findstr /v "^#" "%~dp0ngrok-config.txt" 2^>nul ^| findstr "domain"') do (
        set "NGROK_DOMAIN=%%a"
        set "NGROK_DOMAIN=!NGROK_DOMAIN: =!"
    )
)

echo [확인] 서버가 http://localhost:8000 에서 실행 중이어야 합니다.
echo        run-public.bat 을 먼저 실행하세요.
echo.
if defined NGROK_DOMAIN (
    set "PLACEHOLDER=0"
    if "!NGROK_DOMAIN!"=="YOUR_DOMAIN.ngrok-free.app" set "PLACEHOLDER=1"
    if "!NGROK_DOMAIN!"=="abc123.ngrok-free.app" set "PLACEHOLDER=1"
    if "!PLACEHOLDER!"=="1" (
        echo [설정 필요] ngrok-config.txt 에서 domain 값을 변경하세요.
        echo   abc123, YOUR_DOMAIN 은 예시입니다.
        echo   ngrok 대시보드 Domains에서 발급받은 실제 도메인 입력.
        echo   가이드: 고정URL_설정_가이드.md
        echo.
    ) else (
        echo   고정 URL: https://!NGROK_DOMAIN!
        echo.
    )
)
pause

echo.
echo 터널 시작 중...
echo ========================================

if defined NGROK_DOMAIN (
    set "USE_STATIC=0"
    if not "!NGROK_DOMAIN!"=="YOUR_DOMAIN.ngrok-free.app" if not "!NGROK_DOMAIN!"=="abc123.ngrok-free.app" set "USE_STATIC=1"
    if "!USE_STATIC!"=="1" (
        echo.
        echo   접속 URL: https://!NGROK_DOMAIN!
        echo   (위 주소로 어디서나 접속 가능)
        echo.
        echo ========================================
        ngrok http 8000 --domain=!NGROK_DOMAIN!
    ) else (
        echo [임시 모드] ngrok-config.txt 에 올바른 도메인 설정 시 고정 URL 사용
        ngrok http 8000
    )
) else (
    ngrok http 8000
)

pause
