import pytest
from fastapi.testclient import TestClient
from unittest.mock import patch
from datetime import date, time, datetime
from uuid import uuid4

from app.main import app
from app.schemas import DeploymentResponse

client = TestClient(app)


def make_response(
    first_approval: bool = False,
    first_approver: str | None = None,
    second_approval: bool = False,
    second_approver: str | None = None,
    completed: bool = False,
) -> DeploymentResponse:
    return DeploymentResponse(
        id=uuid4(),
        deploy_date=date(2025, 2, 27),
        deploy_time=time(10, 0, 0),
        content="test",
        unit_test_done=False,
        uat_done=False,
        precheck_done=False,
        executor="u1",
        deploy_manager="m1",
        work_card_number="W1",
        first_approval=first_approval,
        first_approver=first_approver,
        second_approval=second_approval,
        second_approver=second_approver,
        completed=completed,
        post_qc_done=False,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )


@patch("app.controllers.deployment_controller._service")
def test_first_approval(mock_service) -> None:
    d = make_response(first_approval=True, first_approver="a1")
    mock_service.first_approve.return_value = d
    resp = client.post(
        f"/deployments/{d.id}/first-approval",
        json={"approver": "a1"},
    )
    assert resp.status_code == 200
    assert resp.json()["first_approval"] is True
    assert resp.json()["first_approver"] == "a1"


@patch("app.controllers.deployment_controller._service")
def test_second_approval_without_first_returns_400(mock_service) -> None:
    from app.exceptions import SecondApprovalWithoutFirstError

    mock_service.second_approve.side_effect = SecondApprovalWithoutFirstError()
    resp = client.post(
        f"/deployments/{uuid4()}/second-approval",
        json={"approver": "a2"},
    )
    assert resp.status_code == 400
    assert "first approval" in resp.json()["detail"].lower()
