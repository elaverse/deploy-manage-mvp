import pytest
from uuid import uuid4
from unittest.mock import MagicMock
from datetime import date, time, datetime
from app.schemas import DeploymentCreate, DeploymentResponse, FirstApprovalRequest, SecondApprovalRequest
from app.repositories.base import DeploymentRepositoryInterface
from app.services.deployment_service import DeploymentService


def make_deployment(
    first_approval: bool = False,
    second_approval: bool = False,
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
        executor="user1",
        deploy_manager="manager1",
        work_card_number="WC001",
        first_approval=first_approval,
        first_approver=None,
        second_approval=second_approval,
        second_approver=None,
        completed=completed,
        post_qc_done=False,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
    )


class MockRepository(DeploymentRepositoryInterface):
    def __init__(self) -> None:
        self._data: dict = {}

    def create(self, data: DeploymentCreate) -> DeploymentResponse:
        d = make_deployment()
        d = d.model_copy(update={
            "deploy_date": data.deploy_date,
            "deploy_time": data.deploy_time,
            "content": data.content,
        })
        self._data[str(d.id)] = d
        return d

    def get_by_id(self, deployment_id) -> DeploymentResponse | None:
        return self._data.get(str(deployment_id))

    def get_all(self):
        return list(self._data.values())

    def update(self, deployment_id, data):
        d = self._data.get(str(deployment_id))
        if not d:
            return None
        update_dict = data.model_dump(exclude_none=True)
        d = d.model_copy(update=update_dict)
        self._data[str(deployment_id)] = d
        return d

    def delete(self, deployment_id) -> bool:
        if str(deployment_id) in self._data:
            del self._data[str(deployment_id)]
            return True
        return False

    def clear_all(self) -> int:
        cnt = len(self._data)
        self._data.clear()
        return cnt


class MockS3Backup:
    def __init__(self) -> None:
        self.backed_up: list[DeploymentResponse] = []

    def create(self, deployment: DeploymentResponse) -> str:
        self.backed_up.append(deployment)
        return f"deployment_{deployment.id}.json"

    def update(self, deployment: DeploymentResponse) -> str:
        return self.create(deployment)

    def delete(self, deployment_id) -> bool:
        return True


@pytest.fixture
def mock_repo() -> MockRepository:
    return MockRepository()


@pytest.fixture
def mock_s3() -> MockS3Backup:
    return MockS3Backup()


@pytest.fixture
def service(mock_repo: MockRepository, mock_s3: MockS3Backup) -> DeploymentService:
    return DeploymentService(repository=mock_repo, s3_storage=mock_s3)
