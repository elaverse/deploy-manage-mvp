"""로컬 개발용 파일 기반 저장소. 재기동 후에도 데이터 유지."""
import json
import logging
from datetime import date, datetime, time
from pathlib import Path
from typing import Optional, Sequence
from uuid import UUID, uuid4

from app.repositories.base import DeploymentRepositoryInterface
from app.schemas import DeploymentCreate, DeploymentUpdate, DeploymentResponse

logger = logging.getLogger(__name__)
DATA_FILE = Path(__file__).resolve().parent.parent.parent / "data" / "deployments.json"


def _ensure_data_dir():
    DATA_FILE.parent.mkdir(parents=True, exist_ok=True)


def _row_to_deployment(row: dict) -> DeploymentResponse:
    deploy_date_val = row.get("deploy_date")
    if isinstance(deploy_date_val, str):
        deploy_date_val = date.fromisoformat(deploy_date_val[:10])
    deploy_time = row.get("deploy_time", "00:00:00")
    if isinstance(deploy_time, str) and ":" in deploy_time:
        parts = deploy_time.split(":")
        deploy_time = time(
            int(parts[0]) if len(parts) > 0 else 0,
            int(parts[1]) if len(parts) > 1 else 0,
            int(parts[2]) if len(parts) > 2 else 0,
        )
    created_at = row.get("created_at")
    if isinstance(created_at, str):
        created_at = datetime.fromisoformat(created_at.replace("Z", "+00:00"))
    updated_at = row.get("updated_at")
    if isinstance(updated_at, str):
        updated_at = datetime.fromisoformat(updated_at.replace("Z", "+00:00"))
    return DeploymentResponse(
        id=UUID(row["id"]) if isinstance(row["id"], str) else row["id"],
        deploy_date=deploy_date_val,
        deploy_time=deploy_time,
        content=row.get("content", "") or "",
        unit_test_done=row.get("unit_test_done", False),
        uat_done=row.get("uat_done", False),
        precheck_done=row.get("precheck_done", False),
        executor=row.get("executor", "") or "",
        deploy_manager=row.get("deploy_manager", "") or "",
        work_card_number=row.get("work_card_number", "") or "",
        first_approval=row.get("first_approval", False),
        first_approver=row.get("first_approver"),
        second_approval=row.get("second_approval", False),
        second_approver=row.get("second_approver"),
        completed=row.get("completed", False),
        post_qc_done=row.get("post_qc_done", False),
        precheck_checklist=row.get("precheck_checklist") or [],
        created_at=created_at,
        updated_at=updated_at,
    )


class FilePersistentDeploymentRepository(DeploymentRepositoryInterface):
    """JSON 파일에 저장. 재기동 후에도 체크리스트 등 데이터 유지."""

    def __init__(self) -> None:
        self._store: dict[str, DeploymentResponse] = {}
        self._load()

    def _load(self) -> None:
        _ensure_data_dir()
        if not DATA_FILE.exists():
            return
        try:
            with open(DATA_FILE, "r", encoding="utf-8") as f:
                data = json.load(f)
            for row in data.get("deployments", []):
                try:
                    d = _row_to_deployment(row)
                    self._store[str(d.id)] = d
                except Exception as e:
                    logger.warning("Skip invalid deployment row: %s", e)
        except Exception as e:
            logger.warning("Failed to load deployments.json: %s", e)

    def _save(self) -> None:
        _ensure_data_dir()
        try:
            deployments = [
                _deployment_to_row(d)
                for d in sorted(
                    self._store.values(),
                    key=lambda x: (x.deploy_date, x.deploy_time),
                    reverse=True,
                )
            ]
            with open(DATA_FILE, "w", encoding="utf-8") as f:
                json.dump({"deployments": deployments}, f, ensure_ascii=False, indent=2)
        except Exception as e:
            logger.warning("Failed to save deployments.json: %s", e)

    def create(self, data: DeploymentCreate) -> DeploymentResponse:
        now = datetime.utcnow()
        d = DeploymentResponse(
            id=uuid4(),
            deploy_date=data.deploy_date,
            deploy_time=data.deploy_time,
            content=data.content,
            unit_test_done=data.unit_test_done,
            uat_done=data.uat_done,
            precheck_done=data.precheck_done,
            executor=data.executor,
            deploy_manager=data.deploy_manager,
            work_card_number=data.work_card_number,
            first_approval=data.first_approval,
            first_approver=data.first_approver,
            second_approval=data.second_approval,
            second_approver=data.second_approver,
            completed=data.completed,
            post_qc_done=data.post_qc_done,
            precheck_checklist=getattr(data, "precheck_checklist", None) or [],
            created_at=now,
            updated_at=now,
        )
        self._store[str(d.id)] = d
        self._save()
        return d

    def get_by_id(self, deployment_id: UUID) -> Optional[DeploymentResponse]:
        return self._store.get(str(deployment_id))

    def get_all(self) -> Sequence[DeploymentResponse]:
        return sorted(
            self._store.values(),
            key=lambda x: (x.deploy_date, x.deploy_time),
            reverse=True,
        )

    def update(self, deployment_id: UUID, data: DeploymentUpdate) -> Optional[DeploymentResponse]:
        d = self._store.get(str(deployment_id))
        if not d:
            return None
        update_dict = data.model_dump(exclude_none=True)
        d = d.model_copy(update={**update_dict, "updated_at": datetime.utcnow()})
        self._store[str(deployment_id)] = d
        self._save()
        return d

    def delete(self, deployment_id: UUID) -> bool:
        if str(deployment_id) in self._store:
            del self._store[str(deployment_id)]
            self._save()
            return True
        return False

    def clear_all(self) -> int:
        cnt = len(self._store)
        self._store.clear()
        self._save()
        return cnt


def _deployment_to_row(d: DeploymentResponse) -> dict:
    row = d.model_dump(mode="json")
    if hasattr(d.deploy_time, "strftime"):
        row["deploy_time"] = d.deploy_time.strftime("%H:%M:%S")
    if hasattr(d.deploy_date, "isoformat"):
        row["deploy_date"] = d.deploy_date.isoformat()
    if hasattr(d.created_at, "isoformat"):
        row["created_at"] = d.created_at.isoformat()
    if hasattr(d.updated_at, "isoformat"):
        row["updated_at"] = d.updated_at.isoformat()
    return row
