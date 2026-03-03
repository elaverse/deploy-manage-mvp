import os
from pathlib import Path

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from app.controllers.deployment_controller import router as deployment_controller
from app.repositories.factory import get_repository

app = FastAPI(title="Deployment Management API", version="1.0.0")

# API 경로: /api/deployments, /api/health (정적 파일과 분리)
app.include_router(deployment_controller, prefix="/api")


@app.get("/api/health")
def health():
    repo = get_repository()
    return {"status": "ok", "storage": type(repo).__name__}


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """모든 예외를 JSON으로 반환 (HTML 500 방지)"""
    from fastapi import HTTPException

    if isinstance(exc, HTTPException):
        return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})
    return JSONResponse(
        status_code=500,
        content={
            "detail": str(exc),
            "error": "서버 오류. Supabase .env 설정 및 deployment_management 테이블 확인.",
        },
    )


# 외부 접속 시: CORS_ALLOW_ALL=1 로 설정하면 모든 origin 허용
_cors_origins = ["http://localhost:3000", "http://127.0.0.1:3000"]
if os.getenv("CORS_ALLOW_ALL", "").lower() in ("1", "true", "yes"):
    _cors_origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=_cors_origins,
    allow_credentials=_cors_origins != ["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# 프로덕션: React 빌드 서빙 (frontend/build 존재 시)
_BASE_DIR = Path(__file__).resolve().parent.parent.parent
_FRONTEND_BUILD = _BASE_DIR / "frontend" / "build"
if _FRONTEND_BUILD.exists():
    app.mount("/static", StaticFiles(directory=_FRONTEND_BUILD / "static"), name="static")

    @app.get("/{full_path:path}")
    def serve_spa(full_path: str):
        """API 아닌 경로는 index.html (SPA)"""
        if full_path.startswith("api/") or full_path == "api":
            from fastapi import HTTPException
            raise HTTPException(404)
        file_path = _FRONTEND_BUILD / full_path
        if file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(_FRONTEND_BUILD / "index.html")
