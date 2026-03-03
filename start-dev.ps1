# 배포관리 개발 서버 동시 실행 (백엔드 + 프론트엔드)
$backendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    cd backend
    uvicorn app.main:app --host 0.0.0.0 --port 8000
}
Write-Host "백엔드 시작 중... (http://localhost:8000)" -ForegroundColor Green
Start-Sleep -Seconds 3
$frontendJob = Start-Job -ScriptBlock {
    Set-Location $using:PWD
    cd frontend
    npm start
}
Write-Host "프론트엔드 시작 중... (http://localhost:3000)" -ForegroundColor Green
Write-Host ""
Write-Host "종료: Get-Job | Stop-Job" -ForegroundColor Yellow
Receive-Job $backendJob, $frontendJob -Wait
