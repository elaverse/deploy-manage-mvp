# 고정 외부 접속 URL 설정

Cloudflare Quick Tunnel은 실행할 때마다 URL이 바뀝니다.  
**고정 URL**을 쓰려면 아래 두 방법 중 하나를 사용하세요.

---

## 방법 1: ngrok (추천, 무료 고정 도메인)

ngrok 가입 후 **한 번만** 도메인을 등록하면, 이후 항상 같은 주소로 접속할 수 있습니다.

### 1단계: ngrok 가입 및 설정

1. https://ngrok.com 가입 (무료)
2. 대시보드 → **Cloud Edge** → **Domains**
3. **"Claim your free domain"** 클릭 → `2a3b4c5d-xxxx.ngrok-free.app` 형태의 **본인 전용** 도메인 발급
   - ⚠️ `abc123.ngrok-free.app` 는 예시입니다. 반드시 대시보드에 표시된 실제 도메인을 사용하세요.
4. 대시보드 → **Your Authtoken** 복사
5. `ngrok config add-authtoken [복사한 토큰]` 실행 (ngrok 설치 후)

### 2단계: ngrok 설치

- https://ngrok.com/download 에서 다운로드
- 또는: `winget install ngrok.ngrok`

### 3단계: ngrok-config.txt 생성

프로젝트 루트에 `ngrok-config.txt` 파일을 만들고, 아래 내용에서 **YOUR_DOMAIN**만 발급받은 도메인으로 바꿉니다.

```
# ngrok 설정 (run-with-ngrok.bat에서 사용)
# 1. https://ngrok.com 가입
# 2. Domains에서 무료 도메인 발급 (예: abc123.ngrok-free.app)
# 3. 아래 도메인을 발급받은 값으로 변경
domain=YOUR_DOMAIN.ngrok-free.app
```

예시: `domain=2a3b4c5d-1234-5678-abcd.ngrok-free.app`  
(본인 ngrok 대시보드에 표시된 도메인을 그대로 입력)

### 4단계: 실행

1. `run-public.bat` 실행 (서버 시작)
2. `run-with-ngrok.bat` 실행  
3. **고정 URL**: `https://[발급받은 도메인]` 로 접속

---

### ERR_NGROK_3200 "endpoint is offline" 발생 시

- `abc123.ngrok-free.app` 같은 **예시 도메인**을 사용한 경우입니다.
- ngrok 대시보드 → Domains 에서 **본인이 발급받은 실제 도메인**을 확인해 `ngrok-config.txt` 에 정확히 입력하세요.

---

## 방법 2: Cloudflare Tunnel (고정 도메인, 본인 도메인 필요)

본인 소유 도메인(예: mydomain.com)이 있으면 Cloudflare에서 고정 서브도메인을 만들 수 있습니다.

1. https://dash.cloudflare.com 에서 도메인 추가
2. `cloudflared tunnel login`
3. `cloudflared tunnel create deploy-manage`
4. `cloudflared tunnel route dns deploy-manage deploy.mydomain.com`
5. config.yml 작성 후 `cloudflared tunnel run deploy-manage`

도메인이 있으면 위 설정으로 `https://deploy.mydomain.com` 같은 고정 URL을 사용할 수 있습니다.

---

## 방법 3: 클라우드 배포 (서버 불필요)

PC에서 터널을 띄우지 않고, 클라우드에 바로 배포해 고정 URL을 사용할 수 있습니다.

- **Railway**: https://railway.app (무료 크레딧)
- **Render**: https://render.com (무료 티어)
- 접속 URL 예: `https://deploy-manage-production.up.railway.app` 형태로 고정 URL 제공
