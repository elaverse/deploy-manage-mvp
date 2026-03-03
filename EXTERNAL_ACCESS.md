# 외부 접속 설정 가이드

## 접속 URL

같은 PC에서 실행 시:
- **프론트엔드(배포관리 화면)**: http://localhost:3000
- **백엔드 API**: http://localhost:8000
- **API 문서**: http://localhost:8000/docs

---

## 외부(다른 PC/기기)에서 접속하려면

### 1. PC의 IP 주소 확인

**Windows (명령 프롬프트):**
```
ipconfig
```
`IPv4 주소`(예: 192.168.0.100) 확인

### 2. 방화벽 열기

- **포트 3000** (프론트엔드) - 인바운드 허용
- **포트 8000** (백엔드) - 인바운드 허용

Windows 방화벽:
```
netsh advfirewall firewall add rule name="배포관리-프론트" dir=in action=allow protocol=TCP localport=3000
netsh advfirewall firewall add rule name="배포관리-백엔드" dir=in action=allow protocol=TCP localport=8000
```

### 3. 서버 실행 (외부 접속용)

**`start-dev-external.bat`** 실행

또는 수동 실행:
```bat
:: 터미널 1 - 백엔드
cd backend
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload

:: 터미널 2 - 프론트엔드 (0.0.0.0으로 수신하여 외부 접속 허용)
cd frontend
set HOST=0.0.0.0 && npm start
```

### 4. 접속 URL (외부)

PC IP가 `192.168.0.100`인 경우:
- **배포관리 화면**: http://192.168.0.100:3000
- **API 문서**: http://192.168.0.100:8000/docs

같은 LAN(공유기)에 연결된 모든 기기에서 위 주소로 접속 가능합니다.

---

## 인터넷(공인 IP)으로 접속

- 공유기에서 포트 포워딩(3000, 8000) 설정
- 공인 IP 또는 DDNS 주소로 접속
- HTTPS/보안 설정 권장
