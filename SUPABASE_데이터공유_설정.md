# Supabase 설정 - 데이터 공유 (여러 PC에서 입력/수정/삭제 동기화)

여러 PC에서 같은 데이터를 보고 수정하려면 **Supabase**(클라우드 DB) 설정이 필요합니다.

## 1. Supabase 프로젝트 생성

1. https://supabase.com 접속 후 가입/로그인
2. **New Project** 클릭
3. 프로젝트 이름, 비밀번호 설정 후 생성 (약 2분 소요)

## 2. API 키 확인

1. 프로젝트 대시보드 → **Settings** (⚙️) → **API**
2. 다음 값 복사:
   - **Project URL** → `SUPABASE_URL`
   - **anon public** key → `SUPABASE_KEY`

## 3. 테이블 생성 (SQL 실행)

1. Supabase 대시보드 → **SQL Editor**
2. 아래 SQL 전체 복사 후 **Run** 실행:

```sql
CREATE TABLE IF NOT EXISTS deployment_management (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    deploy_date DATE NOT NULL,
    deploy_time TIME NOT NULL,
    content TEXT NOT NULL DEFAULT '',
    unit_test_done BOOLEAN NOT NULL DEFAULT FALSE,
    uat_done BOOLEAN NOT NULL DEFAULT FALSE,
    precheck_done BOOLEAN NOT NULL DEFAULT FALSE,
    executor VARCHAR(255) NOT NULL DEFAULT '',
    deploy_manager VARCHAR(255) NOT NULL DEFAULT '',
    work_card_number VARCHAR(255) NOT NULL DEFAULT '',
    first_approval BOOLEAN NOT NULL DEFAULT FALSE,
    first_approver VARCHAR(255),
    second_approval BOOLEAN NOT NULL DEFAULT FALSE,
    second_approver VARCHAR(255),
    completed BOOLEAN NOT NULL DEFAULT FALSE,
    post_qc_done BOOLEAN NOT NULL DEFAULT FALSE,
    precheck_checklist JSONB DEFAULT '[]',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_deployment_management_deploy_date ON deployment_management(deploy_date DESC);
CREATE INDEX IF NOT EXISTS idx_deployment_management_completed ON deployment_management(completed);
```

## 4. backend/.env 설정

`backend` 폴더에 `.env` 파일 생성 (또는 수정):

```
SUPABASE_URL=https://xxxxxxxx.supabase.co
SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9....
```

> ⚠️ 같은 Supabase URL/KEY를 **모든 PC**에서 사용하면 데이터가 공유됩니다.

## 5. 완료

- PC A, PC B 모두 위와 같이 동일한 `.env` 설정
- 어느 PC에서 서버를 실행하든 같은 데이터가 표시됩니다.
