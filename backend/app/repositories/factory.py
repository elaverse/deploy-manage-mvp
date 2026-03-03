"""환경에 따라 Repository 선택. Supabase 미설정 시 파일 저장소 사용(재기동 후 데이터 유지)."""
from app.config import get_settings
from app.repositories.base import DeploymentRepositoryInterface
from app.repositories.supabase_repository import SupabaseDeploymentRepository
from app.repositories.file_persistent_repository import FilePersistentDeploymentRepository

_use_file_store: bool | None = None


def get_repository() -> DeploymentRepositoryInterface:
    global _use_file_store
    if _use_file_store is None:
        settings = get_settings()
        url = (settings.supabase_url or "").strip()
        key = (settings.supabase_key or "").strip()
        _use_file_store = not url or not key or "placeholder" in url.lower()
    if _use_file_store:
        return FilePersistentDeploymentRepository()
    return SupabaseDeploymentRepository()
