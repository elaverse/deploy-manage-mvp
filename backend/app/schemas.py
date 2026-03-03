from datetime import date, time, datetime
from typing import Optional, Any
from pydantic import BaseModel, Field
from uuid import UUID


class DeploymentCreate(BaseModel):
    deploy_date: date
    deploy_time: time
    content: str = ""
    unit_test_done: bool = False
    uat_done: bool = False
    precheck_done: bool = False
    executor: str = ""
    deploy_manager: str = ""
    work_card_number: str = ""
    precheck_checklist: list[dict[str, Any]] = []
    completed: bool = False
    post_qc_done: bool = False
    first_approval: bool = False
    first_approver: Optional[str] = None
    second_approval: bool = False
    second_approver: Optional[str] = None


class DeploymentUpdate(BaseModel):
    deploy_date: Optional[date] = None
    deploy_time: Optional[time] = None
    content: Optional[str] = None
    unit_test_done: Optional[bool] = None
    uat_done: Optional[bool] = None
    precheck_done: Optional[bool] = None
    executor: Optional[str] = None
    deploy_manager: Optional[str] = None
    work_card_number: Optional[str] = None
    first_approval: Optional[bool] = None
    first_approver: Optional[str] = None
    second_approval: Optional[bool] = None
    second_approver: Optional[str] = None
    completed: Optional[bool] = None
    post_qc_done: Optional[bool] = None
    precheck_checklist: Optional[list[dict[str, Any]]] = None


class PrecheckChecklistUpdate(BaseModel):
    """체크리스트 전용 수정 - 저장 및 사전체크 자동 반영"""
    precheck_checklist: list[dict[str, Any]] = Field(default_factory=list)


class FirstApprovalRequest(BaseModel):
    approver: str = Field(..., min_length=1)


class SecondApprovalRequest(BaseModel):
    approver: str = Field(..., min_length=1)


class DeploymentResponse(BaseModel):
    id: UUID
    deploy_date: date
    deploy_time: time
    content: str
    unit_test_done: bool
    uat_done: bool
    precheck_done: bool
    executor: str
    deploy_manager: str
    work_card_number: str
    first_approval: bool
    first_approver: Optional[str]
    second_approval: bool
    second_approver: Optional[str]
    completed: bool
    post_qc_done: bool
    precheck_checklist: list[dict[str, Any]] = []
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
