# 프로그램 배포 관리 - 원클릭 실행 + 접속 URL 표시
# 빌드, 서버 시작, 터널(선택) 실행 후 실제 접속 URL을 표시합니다.

$ErrorActionPreference = "Stop"
$ProjectRoot = $PSScriptRoot

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  프로그램 배포 관리 - 실행" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# 1. 빌드
Write-Host "[1/4] 프론트엔드 빌드 중..." -ForegroundColor Yellow
Push-Location "$ProjectRoot\frontend"
try {
    npm run build 2>&1 | Out-Null
    if ($LASTEXITCODE -ne 0) {
        npm install
        npm run build
    }
} finally {
    Pop-Location
}
if ($LASTEXITCODE -ne 0) { Write-Host "빌드 실패" -ForegroundColor Red; pause; exit 1 }
Write-Host "      빌드 완료." -ForegroundColor Green
Write-Host ""

# 2. 백엔드 설정
Write-Host "[2/4] 백엔드 설정 확인..." -ForegroundColor Yellow
$env:CORS_ALLOW_ALL = "1"
if (-not (Test-Path "$ProjectRoot\backend\.env")) {
    if (Test-Path "$ProjectRoot\backend\.env.example") {
        Copy-Item "$ProjectRoot\backend\.env.example" "$ProjectRoot\backend\.env"
    }
}
pip install -q fastapi uvicorn pydantic-settings supabase 2>$null
Write-Host ""

# 3. 서버 시작 (별도 창)
Write-Host "[3/4] 서버 시작 중..." -ForegroundColor Yellow
Start-Process cmd -ArgumentList "/k", "cd /d `"$ProjectRoot\backend`" && set CORS_ALLOW_ALL=1 && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000" -WindowStyle Normal
Start-Sleep -Seconds 5
Write-Host "      서버 실행됨." -ForegroundColor Green
Write-Host ""

# 4. 접속 URL 표시
Write-Host "[4/4] 접속 URL 확인 중..." -ForegroundColor Yellow

# 이 PC IP 주소 조회
$ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notmatch "Loopback" -and $_.IPAddress -notmatch "^169" } | Select-Object -First 1).IPAddress
if (-not $ip) { $ip = "확인필요" }

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  접속 가능한 URL" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "  이 PC:         " -NoNewline
Write-Host "http://localhost:8000" -ForegroundColor White -BackgroundColor DarkBlue
Write-Host ""
Write-Host "  같은 네트워크: " -NoNewline
Write-Host "http://${ip}:8000" -ForegroundColor White -BackgroundColor DarkBlue
Write-Host ""
Write-Host "  (위 주소를 복사하여 브라우저에 붙여넣으세요)" -ForegroundColor Gray
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  서버가 실행 중입니다. 종료하려면 아무 키나 누르세요." -ForegroundColor Gray
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# cloudflared 있으면 터널도 시작 (별도 프로세스로 실행, URL 추출)
$tunnelProc = $null
$cloudflared = Get-Command cloudflared -ErrorAction SilentlyContinue
$tunnelLog = "$ProjectRoot\tunnel_output.txt"
if ($cloudflared) {
    Write-Host "  [선택] 외부(인터넷) 접속 URL 생성 중..." -ForegroundColor Yellow
    Remove-Item $tunnelLog -ErrorAction SilentlyContinue
    $tunnelProc = Start-Process -FilePath "cloudflared" -ArgumentList "tunnel","--url","http://localhost:8000" -RedirectStandardError $tunnelLog -RedirectStandardOutput "$ProjectRoot\tunnel_out.txt" -PassThru -WindowStyle Hidden
    Start-Sleep -Seconds 15
    $content = Get-Content $tunnelLog -Raw -ErrorAction SilentlyContinue
    $tunnelUrl = [regex]::Match($content, "https://[a-z0-9-]+\.trycloudflare\.com").Value
    if ($tunnelUrl) {
        Write-Host ""
        Write-Host "  외부(인터넷):   " -NoNewline
        Write-Host $tunnelUrl -ForegroundColor White -BackgroundColor DarkGreen
        Write-Host ""
    }
} else {
    Write-Host "  ※ 외부 URL: run-with-tunnel.bat 또는 run-with-ngrok.bat 실행" -ForegroundColor Gray
}

Write-Host ""
pause

# 정리 (터널만 종료, 서버 창은 사용자가 직접 닫기)
if ($tunnelProc) { Stop-Process -Id $tunnelProc.Id -Force -ErrorAction SilentlyContinue }
Remove-Item $tunnelLog -ErrorAction SilentlyContinue
