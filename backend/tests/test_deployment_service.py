import pytest
from uuid import uuid4
from app.exceptions import DeploymentNotFoundError, SecondApprovalWithoutFirstError
from app.schemas import DeploymentCreate, FirstApprovalRequest, SecondApprovalRequest
from app.services.deployment_service import DeploymentService


def test_first_approve(service: DeploymentService) -> None:
    create_data = DeploymentCreate(
        deploy_date="2025-02-27",
        deploy_time="10:00:00",
        content="test",
        executor="user1",
        deploy_manager="mgr1",
    )
    created = service.create(create_data)
    result = service.first_approve(created.id, FirstApprovalRequest(approver="approver1"))
    assert result.first_approval is True
    assert result.first_approver == "approver1"


def test_second_approve_requires_first(service: DeploymentService) -> None:
    create_data = DeploymentCreate(
        deploy_date="2025-02-27",
        deploy_time="10:00:00",
        content="test",
        executor="user1",
        deploy_manager="mgr1",
    )
    created = service.create(create_data)
    with pytest.raises(SecondApprovalWithoutFirstError):
        service.second_approve(created.id, SecondApprovalRequest(approver="approver2"))


def test_second_approve_after_first(service: DeploymentService) -> None:
    create_data = DeploymentCreate(
        deploy_date="2025-02-27",
        deploy_time="10:00:00",
        content="test",
        executor="user1",
        deploy_manager="mgr1",
    )
    created = service.create(create_data)
    service.first_approve(created.id, FirstApprovalRequest(approver="approver1"))
    result = service.second_approve(created.id, SecondApprovalRequest(approver="approver2"))
    assert result.first_approval is True
    assert result.second_approval is True
    assert result.second_approver == "approver2"


def test_first_approve_not_found(service: DeploymentService) -> None:
    with pytest.raises(DeploymentNotFoundError):
        service.first_approve(uuid4(), FirstApprovalRequest(approver="a"))


def test_completed_triggers_s3_backup(service: DeploymentService, mock_s3) -> None:
    create_data = DeploymentCreate(
        deploy_date="2025-02-27",
        deploy_time="10:00:00",
        content="test",
        executor="user1",
        deploy_manager="mgr1",
    )
    created = service.create(create_data)
    service.first_approve(created.id, FirstApprovalRequest(approver="a1"))
    service.second_approve(created.id, SecondApprovalRequest(approver="a2"))
    result = service.set_completed(created.id, True)
    assert result.completed is True
    assert len(mock_s3.backed_up) >= 1
    completed_backups = [d for d in mock_s3.backed_up if d.completed]
    assert len(completed_backups) == 1
    assert completed_backups[0].id == created.id
