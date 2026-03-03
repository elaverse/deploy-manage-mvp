# 클라우드 배포 - 고정 접속 URL

## 배포 후 받는 URL

| 서비스 | 접속 URL 형태 | 비고 |
|--------|---------------|------|
| **Render.com** | `https://deploy-manage-XXXX.onrender.com` | 배포 완료 시 대시보드에 표시 |

---

## 한 번에 배포 (3단계)

### 1. GitHub에 올리기
```bash
cd c:\Pgm\test_implement-mvp
git init
git add .
git commit -m "deploy"
git remote add origin https://github.com/[본인계정]/[저장소명].git
git push -u origin main
```

### 2. Render 배포
1. **deploy-to-render.html** 파일을 브라우저로 열기
2. 저장소 URL 입력 후 **"Render에서 배포하기"** 클릭
3. Render 가입/로그인 → **Apply** 클릭
4. 5~10분 대기 (빌드 중)

### 3. 접속 URL 확인
- Render 대시보드 → 해당 서비스 클릭 → 상단 **"Visit"** 또는 URL 표시
- 형식: `https://deploy-manage-[랜덤].onrender.com`

---

## 직접 배포 (브라우저)

1. https://render.com 가입
2. **New +** → **Web Service**
3. **Connect a repository** → GitHub 연결 → 이 프로젝트 선택
4. 설정:
   - **Name**: deploy-manage
   - **Runtime**: Docker
   - **Instance Type**: Free
5. **Create Web Service**
6. 배포 완료 후 상단에 표시되는 URL 클릭

---

## 배포 후 데이터 공유

- **Settings** → **Environment** → **Add Environment Variable**
- `SUPABASE_URL` = Supabase 대시보드 Project URL
- `SUPABASE_KEY` = Supabase anon public key
- 저장 후 자동 재배포 (1~2분)

이후 위 URL로 접속 시 Supabase 데이터가 적용됩니다.
