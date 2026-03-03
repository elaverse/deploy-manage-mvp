import json
import logging
from datetime import datetime
from typing import Any
from uuid import UUID

import httpx

from app.config import get_settings
from app.schemas import DeploymentResponse

logger = logging.getLogger(__name__)


class S3JsonStorageService:
    """S3 JSON API 기반 입·수·삭·조회 서비스"""

    def __init__(self) -> None:
        settings = get_settings()
        self._base_url = settings.json_api_base_url.rstrip("/")
        self._token = settings.json_api_token
        self._delete_enabled = settings.json_api_delete_enabled
        self._enabled = bool(self._token.strip())
        self._upload_url = f"{self._base_url}/common/app/itsm/jsonUpload"
        self._download_url = f"{self._base_url}/common/app/itsm/jsonDownload"
        self._delete_url = f"{self._base_url}/common/app/itsm/jsonDelete"

    def _get_headers(self) -> dict[str, str]:
        return {
            "Authorization": f"Bearer {self._token}",
            "Content-Type": "application/x-www-form-urlencoded",
        }

    def _auth_header(self) -> dict[str, str]:
        return {"Authorization": f"Bearer {self._token}"}

    def _to_json_safe(self, obj: Any) -> Any:
        if hasattr(obj, "isoformat"):
            return obj.isoformat()
        if isinstance(obj, dict):
            return {k: self._to_json_safe(v) for k, v in obj.items()}
        if isinstance(obj, list):
            return [self._to_json_safe(v) for v in obj]
        return obj

    def _deploy_to_payload(self, deployment: DeploymentResponse) -> dict[str, Any]:
        payload = deployment.model_dump(mode="json")
        payload["synced_at"] = datetime.utcnow().isoformat() + "Z"
        return self._to_json_safe(payload)

    def _json_file_name(self, deployment_id: UUID) -> str:
        """deployment_{id} 형태 (수정/삭제 시 동일 키 유지)"""
        return f"deployment_{deployment_id}"

    def create(self, deployment: DeploymentResponse) -> str:
        """입력: S3에 JSON 업로드"""
        if not self._enabled:
            return ""
        json_file_name = self._json_file_name(deployment.id)
        data_str = json.dumps(self._deploy_to_payload(deployment), ensure_ascii=False, indent=2)

        with httpx.Client(verify=False, timeout=10.0) as client:
            resp = client.post(
                self._upload_url,
                headers=self._get_headers(),
                data={"jsonFileName": json_file_name, "data": data_str},
            )
            resp.raise_for_status()

        logger.info("S3 create: %s", json_file_name)
        return f"{json_file_name}.json"

    def update(self, deployment: DeploymentResponse) -> str:
        """수정: 동일 파일명으로 업로드 (덮어쓰기)"""
        return self.create(deployment)

    def read(self, deployment_id: UUID) -> dict[str, Any]:
        """조회: S3에서 JSON 다운로드"""
        json_file_name = self._json_file_name(deployment_id)

        with httpx.Client(verify=False, timeout=10.0) as client:
            resp = client.get(
                self._download_url,
                headers=self._auth_header(),
                params={"jsonFileName": json_file_name},
            )
            resp.raise_for_status()
            return resp.json()

    def delete(self, deployment_id: UUID) -> bool:
        """삭제: S3에서 JSON 삭제"""
        if not self._enabled:
            return True
        if not self._delete_enabled:
            return True
        json_file_name = self._json_file_name(deployment_id)

        with httpx.Client(verify=False, timeout=10.0) as client:
            resp = client.post(
                self._delete_url,
                headers=self._get_headers(),
                data={"jsonFileName": json_file_name},
            )
            if resp.status_code == 404:
                return True
            resp.raise_for_status()
            return True

    def download_by_filename(self, json_file_name: str) -> dict[str, Any]:
        """파일명으로 조회 (.json 확장자 제외)"""
        name = json_file_name.removesuffix(".json") if json_file_name.endswith(".json") else json_file_name

        with httpx.Client(verify=False, timeout=10.0) as client:
            resp = client.get(
                self._download_url,
                headers=self._auth_header(),
                params={"jsonFileName": name},
            )
            resp.raise_for_status()
            return resp.json()


# 하위 호환
class S3BackupService(S3JsonStorageService):
    """legacy: backup_deployment 호환"""

    def backup_deployment(self, deployment: DeploymentResponse) -> str:
        return self.create(deployment)

    def download_deployment(self, json_file_name: str) -> dict[str, Any]:
        return self.download_by_filename(json_file_name)
