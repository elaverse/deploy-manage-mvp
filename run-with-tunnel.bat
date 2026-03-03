@echo off
chcp 65001 >nul
echo ========================================
echo   외부(인터넷) 접속 - Cloudflare Quick Tunnel
echo   (실행할 때마다 URL이 바뀝니다)
echo ========================================
echo.

:: cloudflared 확인
where cloudflared >nul 2>&1
if %errorlevel% neq 0 (
    echo [설치 필요] cloudflared 다운로드:
    echo   https://github.com/cloudflare/cloudflared/releases
    echo   또는: winget install Cloudflare.cloudflared
    echo.
    echo   ※ 고정 URL이 필요하면 run-with-ngrok.bat 사용
    echo     (고정URL_설정_가이드.md 참고)
    echo.
    pause
    exit /b 1
)

echo [확인] 서버가 http://localhost:8000 에서 실행 중이어야 합니다.
echo        run-public.bat 을 먼저 실행하세요.
echo.
echo [안내] 터널 시작 후 아래에 표시되는
echo   "https://xxxx.trycloudflare.com" 주소로 접속하세요.
echo   (매 실행마다 URL이 바뀝니다. 고정 URL은 run-with-ngrok.bat 사용)
echo.
pause

echo.
echo ========================================
echo   터널 시작... 접속 URL을 찾아보세요
echo ========================================
cloudflared tunnel --url http://localhost:8000 2>&1

echo.
echo [터널 종료됨]
pause
