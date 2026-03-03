from datetime import time
from typing import Optional, Sequence
from uuid import UUID
from supabase import create_client, Client
from app.config import get_settings
from app.schemas import DeploymentCreate, DeploymentUpdate, DeploymentResponse
from app.repositories.base import DeploymentRepositoryInterface


class SupabaseDeploymentRepository(DeploymentRepositoryInterface):
    def __init__(self) -> None:
        settings = get_settings()
        self._client: Client = create_client(
            settings.supabase_url,
            settings.supabase_key,
        )
        self._table = "deployment_management"

    def _parse_time_value(self, val) -> time:
        if val is None:
            return time(0, 0, 0)
        s = str(val)
        if ":" in s:
            parts = s.split(":")
            return time(
                int(parts[0]) if parts[0] else 0,
                int(parts[1]) if len(parts) > 1 and parts[1] else 0,
                int(parts[2]) if len(parts) > 2 and parts[2] else 0,
            )
        return time(0, 0, 0)

    def _row_to_response(self, row: dict) -> DeploymentResponse:
        return DeploymentResponse(
            id=row["id"],
            deploy_date=row["deploy_date"],
            deploy_time=self._parse_time_value(row.get("deploy_time")),
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
            created_at=row["created_at"],
            updated_at=row["updated_at"],
        )

    def create(self, data: DeploymentCreate) -> DeploymentResponse:
        payload = {
            "deploy_date": data.deploy_date.isoformat(),
            "deploy_time": data.deploy_time.strftime("%H:%M:%S"),
            "content": data.content,
            "precheck_checklist": getattr(data, "precheck_checklist", None) or [],
            "unit_test_done": data.unit_test_done,
            "uat_done": data.uat_done,
            "precheck_done": data.precheck_done,
            "executor": data.executor,
            "deploy_manager": data.deploy_manager,
            "work_card_number": data.work_card_number,
            "completed": data.completed,
            "post_qc_done": data.post_qc_done,
            "first_approval": data.first_approval,
            "first_approver": data.first_approver,
            "second_approval": data.second_approval,
            "second_approver": data.second_approver,
        }
        result = self._client.table(self._table).insert(payload).execute()
        rows = result.data
        if not rows:
            raise ValueError("Insert failed")
        return self._row_to_response(rows[0])

    def get_by_id(self, deployment_id: UUID) -> Optional[DeploymentResponse]:
        result = self._client.table(self._table).select("*").eq("id", str(deployment_id)).execute()
        if not result.data:
            return None
        return self._row_to_response(result.data[0])

    def get_all(self) -> Sequence[DeploymentResponse]:
        result = self._client.table(self._table).select("*").order("deploy_date", desc=True).execute()
        return [self._row_to_response(row) for row in result.data]

    def update(self, deployment_id: UUID, data: DeploymentUpdate) -> Optional[DeploymentResponse]:
        payload: dict = {}
        if data.deploy_date is not None:
            payload["deploy_date"] = data.deploy_date.isoformat()
        if data.deploy_time is not None:
            payload["deploy_time"] = data.deploy_time.strftime("%H:%M:%S")
        if data.content is not None:
            payload["content"] = data.content
        if data.unit_test_done is not None:
            payload["unit_test_done"] = data.unit_test_done
        if data.uat_done is not None:
            payload["uat_done"] = data.uat_done
        if data.precheck_done is not None:
            payload["precheck_done"] = data.precheck_done
        if data.executor is not None:
            payload["executor"] = data.executor
        if data.deploy_manager is not None:
            payload["deploy_manager"] = data.deploy_manager
        if data.work_card_number is not None:
            payload["work_card_number"] = data.work_card_number
        if data.precheck_checklist is not None:
            payload["precheck_checklist"] = data.precheck_checklist
        if data.completed is not None:
            payload["completed"] = data.completed
        if data.post_qc_done is not None:
            payload["post_qc_done"] = data.post_qc_done
        if data.first_approval is not None:
            payload["first_approval"] = data.first_approval
        if data.first_approver is not None:
            payload["first_approver"] = data.first_approver
        if data.second_approval is not None:
            payload["second_approval"] = data.second_approval
        if data.second_approver is not None:
            payload["second_approver"] = data.second_approver

        if not payload:
            return self.get_by_id(deployment_id)

        result = (
            self._client.table(self._table)
            .update(payload)
            .eq("id", str(deployment_id))
            .execute()
        )
        if not result.data:
            return None
        return self._row_to_response(result.data[0])

    def delete(self, deployment_id: UUID) -> bool:
        result = self._client.table(self._table).delete().eq("id", str(deployment_id)).execute()
        return len(result.data) > 0

    def clear_all(self) -> int:
        rows = self._client.table(self._table).select("id").execute()
        ids = [r["id"] for r in rows.data]
        if not ids:
            return 0
        for uid in ids:
            self._client.table(self._table).delete().eq("id", str(uid)).execute()
        return len(ids)
