from abc import ABC, abstractmethod
from typing import Optional, Sequence
from uuid import UUID
from app.schemas import DeploymentCreate, DeploymentUpdate, DeploymentResponse


class DeploymentRepositoryInterface(ABC):
    @abstractmethod
    def create(self, data: DeploymentCreate) -> DeploymentResponse:
        pass

    @abstractmethod
    def get_by_id(self, deployment_id: UUID) -> Optional[DeploymentResponse]:
        pass

    @abstractmethod
    def get_all(self) -> Sequence[DeploymentResponse]:
        pass

    @abstractmethod
    def update(self, deployment_id: UUID, data: DeploymentUpdate) -> Optional[DeploymentResponse]:
        pass

    @abstractmethod
    def delete(self, deployment_id: UUID) -> bool:
        pass

    @abstractmethod
    def clear_all(self) -> int:
        """전체 삭제, 삭제된 건수 반환"""
        pass
