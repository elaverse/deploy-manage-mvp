@echo off
chcp 65001 >nul
echo === 배포관리 개발 서버 ===
echo.
echo [1] 기존 실행창을 모두 닫은 뒤 이 배치를 실행하세요.
echo [2] 수정사항 반영: 프론트는 자동 새로고침, 백엔드는 --reload 적용
echo.

start "Backend" cmd /k "cd /d %~dp0backend && uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload"
timeout /t 3 /nobreak >nul

start "Frontend" cmd /k "cd /d %~dp0frontend && npm start"

echo.
echo ========================================
echo   접속 URL
echo ========================================
echo   프론트엔드(배포관리 화면): http://localhost:3000
echo   백엔드 API: http://localhost:8000
echo   API 문서: http://localhost:8000/docs
echo ========================================
echo.
echo 두 창을 닫으면 종료됩니다.
echo 반영이 안 되면 브라우저에서 Ctrl+Shift+R (강력 새로고침)
pause
