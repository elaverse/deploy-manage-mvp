from uuid import UUID
from fastapi import APIRouter, HTTPException, status
from app.exceptions import (
    DeploymentNotFoundError,
    SecondApprovalWithoutFirstError,
    FirstApprovalPrerequisitesError,
    CompletePrerequisitesError,
    PrecheckChecklistRequiredError,
    deployment_not_found_exception,
    second_approval_without_first_exception,
    first_approval_prerequisites_exception,
    complete_prerequisites_exception,
    precheck_checklist_required_exception,
)
from app.schemas import (
    DeploymentCreate,
    DeploymentUpdate,
    DeploymentResponse,
    PrecheckChecklistUpdate,
    FirstApprovalRequest,
    SecondApprovalRequest,
)
from app.services.deployment_service import DeploymentService
from app.services.s3_backup_service import S3JsonStorageService

router = APIRouter(prefix="/deployments", tags=["deployments"])
_service = DeploymentService()
_s3_storage = S3JsonStorageService()


@router.post("", response_model=DeploymentResponse)
def create_deployment(data: DeploymentCreate) -> DeploymentResponse:
    return _service.create(data)


@router.get("", response_model=list[DeploymentResponse])
def list_deployments() -> list[DeploymentResponse]:
    return _service.get_all()


@router.delete("/clear", status_code=status.HTTP_200_OK)
def clear_all_deployments() -> dict:
    """전체 배포 데이터 초기화"""
    count = _service.clear_all()
    return {"deleted": count}


@router.get("/{deployment_id}", response_model=DeploymentResponse)
def get_deployment(deployment_id: UUID) -> DeploymentResponse:
    deployment = _service.get_by_id(deployment_id)
    if not deployment:
        raise deployment_not_found_exception(str(deployment_id))
    return deployment


@router.patch("/{deployment_id}/precheck-checklist", response_model=DeploymentResponse)
def update_precheck_checklist(
    deployment_id: UUID, data: PrecheckChecklistUpdate
) -> DeploymentResponse:
    """체크리스트 저장 (전용). 전체 체크 시 precheck_done 자동 반영."""
    deployment = _service.update_precheck_checklist(
        deployment_id, data.precheck_checklist
    )
    if not deployment:
        raise deployment_not_found_exception(str(deployment_id))
    return deployment


@router.patch("/{deployment_id}", response_model=DeploymentResponse)
def update_deployment(deployment_id: UUID, data: DeploymentUpdate) -> DeploymentResponse:
    try:
        deployment = _service.update(deployment_id, data)
        if not deployment:
            raise deployment_not_found_exception(str(deployment_id))
        return deployment
    except PrecheckChecklistRequiredError:
        raise precheck_checklist_required_exception()


@router.delete("/{deployment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_deployment(deployment_id: UUID) -> None:
    ok = _service.delete(deployment_id)
    if not ok:
        raise deployment_not_found_exception(str(deployment_id))


@router.post("/{deployment_id}/first-approval", response_model=DeploymentResponse)
def first_approve(deployment_id: UUID, req: FirstApprovalRequest) -> DeploymentResponse:
    try:
        return _service.first_approve(deployment_id, req)
    except DeploymentNotFoundError as e:
        raise deployment_not_found_exception(e.deployment_id)
    except FirstApprovalPrerequisitesError:
        raise first_approval_prerequisites_exception()
    except SecondApprovalWithoutFirstError:
        raise second_approval_without_first_exception()


@router.post("/{deployment_id}/second-approval", response_model=DeploymentResponse)
def second_approve(deployment_id: UUID, req: SecondApprovalRequest) -> DeploymentResponse:
    try:
        return _service.second_approve(deployment_id, req)
    except DeploymentNotFoundError as e:
        raise deployment_not_found_exception(e.deployment_id)
    except SecondApprovalWithoutFirstError:
        raise second_approval_without_first_exception()


@router.patch("/{deployment_id}/complete", response_model=DeploymentResponse)
def complete_deployment(
    deployment_id: UUID,
    completed: bool = True,
    post_qc_done: bool | None = None,
) -> DeploymentResponse:
    try:
        return _service.set_completed(deployment_id, completed, post_qc_done)
    except DeploymentNotFoundError as e:
        raise deployment_not_found_exception(e.deployment_id)
    except CompletePrerequisitesError:
        raise complete_prerequisites_exception()


@router.get("/backup/download")
def download_backup(json_file_name: str):
    """S3 JSON 조회. jsonFileName: 파일명 (.json 확장자 제외)"""
    return _s3_storage.download_by_filename(json_file_name)


@router.get("/{deployment_id}/s3")
def get_deployment_from_s3(deployment_id: UUID):
    """S3에서 해당 배포 JSON 조회"""
    return _s3_storage.read(deployment_id)
