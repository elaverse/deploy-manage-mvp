import logging
from uuid import UUID

from app.exceptions import (
    DeploymentNotFoundError,
    SecondApprovalWithoutFirstError,
    FirstApprovalPrerequisitesError,
    CompletePrerequisitesError,
    PrecheckChecklistRequiredError,
)
from app.repositories.base import DeploymentRepositoryInterface
from app.repositories.factory import get_repository
from app.schemas import (
    DeploymentCreate,
    DeploymentUpdate,
    DeploymentResponse,
    FirstApprovalRequest,
    SecondApprovalRequest,
)
from app.services.s3_backup_service import S3JsonStorageService

logger = logging.getLogger(__name__)


class DeploymentService:
    def __init__(
        self,
        repository: DeploymentRepositoryInterface | None = None,
        s3_storage: S3JsonStorageService | None = None,
    ) -> None:
        self._repo = repository or get_repository()
        self._s3 = s3_storage or S3JsonStorageService()

    def _sync_to_s3(self, op: str, deployment: DeploymentResponse | None = None, deployment_id: UUID | None = None) -> None:
        """Supabase 연산 후 S3 동기화 - 비동기 후처리, 응답 지연 없음"""
        import threading

        def _do_sync() -> None:
            try:
                if op == "create" and deployment:
                    self._s3.create(deployment)
                elif op == "update" and deployment:
                    self._s3.update(deployment)
                elif op == "delete" and deployment_id:
                    self._s3.delete(deployment_id)
            except Exception as e:
                logger.warning("S3 sync failed (%s): %s", op, e)

        threading.Thread(target=_do_sync, daemon=True).start()

    def create(self, data: DeploymentCreate) -> DeploymentResponse:
        created = self._repo.create(data)
        self._sync_to_s3("create", created)
        return created

    def get_by_id(self, deployment_id: UUID) -> DeploymentResponse | None:
        return self._repo.get_by_id(deployment_id)

    def get_all(self) -> list[DeploymentResponse]:
        return list(self._repo.get_all())

    def update(self, deployment_id: UUID, data: DeploymentUpdate) -> DeploymentResponse | None:
        if data.precheck_done is True:
            deployment = self._repo.get_by_id(deployment_id)
            if deployment:
                checklist = data.precheck_checklist if data.precheck_checklist is not None else (deployment.precheck_checklist or [])
                all_checked = (
                    len(checklist) > 0
                    and all(
                        item.get("checked", False)
                        for item in checklist
                        if isinstance(item, dict)
                    )
                )
                if not all_checked:
                    raise PrecheckChecklistRequiredError()
        updated = self._repo.update(deployment_id, data)
        if updated:
            self._sync_to_s3("update", updated)
        return updated

    def update_precheck_checklist(
        self, deployment_id: UUID, checklist: list
    ) -> DeploymentResponse | None:
        """체크리스트 전용 저장. 전체 체크 시 precheck_done 자동 True."""
        deployment = self._repo.get_by_id(deployment_id)
        if not deployment:
            return None
        all_checked = (
            len(checklist) > 0
            and all(
                item.get("checked", False)
                for item in checklist
                if isinstance(item, dict)
            )
        )
        data = DeploymentUpdate(precheck_checklist=checklist)
        if all_checked:
            data.precheck_done = True
        return self.update(deployment_id, data)

    def delete(self, deployment_id: UUID) -> bool:
        ok = self._repo.delete(deployment_id)
        if ok:
            self._sync_to_s3("delete", deployment_id=deployment_id)
        return ok

    def clear_all(self) -> int:
        all_items = list(self._repo.get_all())
        for d in all_items:
            self._sync_to_s3("delete", deployment_id=d.id)
        return self._repo.clear_all()

    def first_approve(self, deployment_id: UUID, req: FirstApprovalRequest) -> DeploymentResponse:
        deployment = self._repo.get_by_id(deployment_id)
        if not deployment:
            raise DeploymentNotFoundError(str(deployment_id))
        if not (deployment.unit_test_done and deployment.uat_done and deployment.precheck_done):
            raise FirstApprovalPrerequisitesError()
        updated = self._repo.update(
            deployment_id,
            DeploymentUpdate(first_approval=True, first_approver=req.approver),
        )
        if not updated:
            raise DeploymentNotFoundError(str(deployment_id))
        self._sync_to_s3("update", updated)
        return updated

    def second_approve(self, deployment_id: UUID, req: SecondApprovalRequest) -> DeploymentResponse:
        deployment = self._repo.get_by_id(deployment_id)
        if not deployment:
            raise DeploymentNotFoundError(str(deployment_id))
        if not deployment.first_approval:
            raise SecondApprovalWithoutFirstError()
        updated = self._repo.update(
            deployment_id,
            DeploymentUpdate(second_approval=True, second_approver=req.approver),
        )
        if not updated:
            raise DeploymentNotFoundError(str(deployment_id))
        self._sync_to_s3("update", updated)
        return updated

    def set_completed(
        self,
        deployment_id: UUID,
        completed: bool,
        post_qc_done: bool | None = None,
    ) -> DeploymentResponse:
        deployment = self._repo.get_by_id(deployment_id)
        if not deployment:
            raise DeploymentNotFoundError(str(deployment_id))
        if completed and not deployment.second_approval:
            raise CompletePrerequisitesError()
        update_data = DeploymentUpdate(completed=completed)
        if post_qc_done is not None:
            update_data.post_qc_done = post_qc_done
        updated = self._repo.update(deployment_id, update_data)
        if not updated:
            raise DeploymentNotFoundError(str(deployment_id))
        self._sync_to_s3("update", updated)
        return updated
