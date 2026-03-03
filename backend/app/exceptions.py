from fastapi import HTTPException


class DeploymentNotFoundError(Exception):
    def __init__(self, deployment_id: str) -> None:
        self.deployment_id = deployment_id
        super().__init__(f"Deployment not found: {deployment_id}")


class SecondApprovalWithoutFirstError(Exception):
    def __init__(self) -> None:
        super().__init__("Second approval requires first approval")


class FirstApprovalPrerequisitesError(Exception):
    def __init__(self) -> None:
        super().__init__(
            "1차 승인은 단위테스트·UAT·사전체크가 모두 완료되어야 합니다"
        )


class CompletePrerequisitesError(Exception):
    def __init__(self) -> None:
        super().__init__("완료는 2차 승인 이후에 가능합니다")


class PrecheckChecklistRequiredError(Exception):
    def __init__(self) -> None:
        super().__init__("체크리스트를 모두 완료해야 사전체크 가능합니다")


def deployment_not_found_exception(deployment_id: str) -> HTTPException:
    return HTTPException(status_code=404, detail=f"Deployment not found: {deployment_id}")


def second_approval_without_first_exception() -> HTTPException:
    return HTTPException(
        status_code=400,
        detail="Second approval requires first approval to be completed",
    )


def first_approval_prerequisites_exception() -> HTTPException:
    return HTTPException(
        status_code=400,
        detail="단위테스트·UAT·사전체크가 모두 완료되어야 1차 승인이 가능합니다",
    )


def complete_prerequisites_exception() -> HTTPException:
    return HTTPException(
        status_code=400,
        detail="2차 승인 이후에 완료 처리가 가능합니다",
    )


def precheck_checklist_required_exception() -> HTTPException:
    return HTTPException(
        status_code=400,
        detail="체크리스트를 다 체크 하지 않으면 사전 체크는 수정할 수 없습니다",
    )
