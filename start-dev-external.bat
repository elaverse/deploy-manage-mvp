@echo off
chcp 65001 >nul
echo === 배포관리 개발 서버 (외부 접속용) ===
echo.
echo [1] 기존 실행창을 모두 닫은 뒤 이 배치를 실행하세요.
echo [2] 같은 네트워크의 다른 PC/휴대폰에서 접속 가능합니다.
echo.

start "Backend" cmd /k "cd /d %~dp0backend && set CORS_ALLOW_ALL=1 && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"
timeout /t 3 /nobreak >nul

start "Frontend" cmd /k "cd /d %~dp0frontend && set HOST=0.0.0.0 && npm start"

echo.
echo ========================================
echo   접속 URL
echo ========================================
echo   로컬:
echo     프론트엔드: http://localhost:3000
echo     백엔드 API: http://localhost:8000
echo.
echo   외부(다른 기기):
echo     ipconfig 로 IPv4 주소 확인 후
echo     프론트엔드: http://[본인IP]:3000
echo     API 문서:   http://[본인IP]:8000/docs
echo ========================================
echo.
echo ※ 방화벽에서 3000, 8000 포트 허용 필요
echo.
pause
