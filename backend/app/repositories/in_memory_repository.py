"""로컬 개발용 인메모리 저장소. Supabase 미설정 시 자동 사용."""
from datetime import datetime
from typing import Optional, Sequence
from uuid import UUID, uuid4

from app.repositories.base import DeploymentRepositoryInterface
from app.schemas import DeploymentCreate, DeploymentUpdate, DeploymentResponse


class InMemoryDeploymentRepository(DeploymentRepositoryInterface):
    def __init__(self) -> None:
        self._store: dict[str, DeploymentResponse] = {}

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
        return d

    def delete(self, deployment_id: UUID) -> bool:
        if str(deployment_id) in self._store:
            del self._store[str(deployment_id)]
            return True
        return False

    def clear_all(self) -> int:
        cnt = len(self._store)
        self._store.clear()
        return cnt
