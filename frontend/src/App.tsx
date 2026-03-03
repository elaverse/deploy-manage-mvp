import React, { useEffect, useState } from "react";
import { useDeployments } from "./hooks/useDeployments";
import { DeploymentTable } from "./components/DeploymentTable";
import { DeploymentModal } from "./components/DeploymentModal";
import { ChecklistModal } from "./components/ChecklistModal";
import { ApprovalModal } from "./components/ApprovalModal";
import { ServerErrorPanel } from "./components/ServerErrorPanel";
import { ConfirmModal } from "./components/ConfirmModal";
import type {
  Deployment,
  DeploymentCreateInput,
  PrecheckChecklistItem,
} from "./types/deployment";

function App() {
  const {
    deployments,
    loading,
    error,
    errorHistory,
    clearErrors,
    load,
    clearAll,
    create,
    update,
    updatePrecheckChecklist,
    remove,
    approveFirst,
    approveSecond,
    setCompleted,
  } = useDeployments();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingDeployment, setEditingDeployment] = useState<Deployment | null>(
    null
  );
  const [approvalOpen, setApprovalOpen] = useState(false);
  const [approvalType, setApprovalType] = useState<"first" | "second">("first");
  const [approvalDeployment, setApprovalDeployment] =
    useState<Deployment | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [completedConfirmOpen, setCompletedConfirmOpen] = useState(false);
  const [completedConfirmDeployment, setCompletedConfirmDeployment] =
    useState<Deployment | null>(null);
  const [checklistOpen, setChecklistOpen] = useState(false);
  const [checklistDeployment, setChecklistDeployment] =
    useState<Deployment | null>(null);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = () => {
    setModalMode("create");
    setEditingDeployment(null);
    setModalOpen(true);
  };

  const handleEdit = (d: Deployment) => {
    setModalMode("edit");
    setEditingDeployment(d);
    setModalOpen(true);
  };

  const handleModalSubmit = async (
    data: DeploymentCreateInput,
    id?: string
  ) => {
    if (id) {
      await update(id, data);
    } else {
      await create(data);
    }
    setModalOpen(false);
  };

  const handleDelete = async (d: Deployment) => {
    if (window.confirm("삭제하시겠습니까?")) {
      await remove(d.id);
    }
  };

  const handleFirstApprove = (d: Deployment) => {
    setApprovalType("first");
    setApprovalDeployment(d);
    setApprovalOpen(true);
  };

  const handleSecondApprove = (d: Deployment) => {
    setApprovalType("second");
    setApprovalDeployment(d);
    setApprovalOpen(true);
  };

  const handleApprovalSubmit = async (approver: string) => {
    if (!approvalDeployment) return;
    if (approvalType === "first") {
      await approveFirst(approvalDeployment.id, approver);
    } else {
      await approveSecond(approvalDeployment.id, approver);
    }
    setApprovalOpen(false);
    setApprovalDeployment(null);
  };

  const handleCompletedChange = async (
    d: Deployment,
    completed: boolean,
    postQcDone?: boolean
  ) => {
    if (completed) {
      setCompletedConfirmDeployment(d);
      setCompletedConfirmOpen(true);
    } else {
      await setCompleted(d.id, false, postQcDone);
    }
  };

  const handleCompletedConfirmYes = async () => {
    if (completedConfirmDeployment) {
      await setCompleted(completedConfirmDeployment.id, true, undefined);
      setCompletedConfirmOpen(false);
      setCompletedConfirmDeployment(null);
    }
  };

  const handleCompletedConfirmNo = () => {
    setCompletedConfirmOpen(false);
    setCompletedConfirmDeployment(null);
  };

  const handleClearAll = async () => {
    if (window.confirm("전체 배포 데이터를 초기화하시겠습니까?")) {
      await clearAll();
      setSelectedIds(new Set());
    }
  };

  const handleSelectionChange = (id: string, checked: boolean) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (checked) next.add(id);
      else next.delete(id);
      return next;
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(new Set(deployments.map((d) => d.id)));
    } else {
      setSelectedIds(new Set());
    }
  };

  const handleEditSelected = () => {
    const selected = deployments.filter((d) => selectedIds.has(d.id));
    if (selected.length === 0) return;
    if (selected.length === 1) {
      handleEdit(selected[0]);
    } else {
      handleEdit(selected[0]);
    }
  };

  const handleDeleteSelected = async () => {
    const selected = deployments.filter((d) => selectedIds.has(d.id));
    if (selected.length === 0) return;
    if (window.confirm(`선택한 ${selected.length}건을 삭제하시겠습니까?`)) {
      for (const d of selected) {
        await remove(d.id);
      }
      setSelectedIds(new Set());
    }
  };

  const handleChecklistSave = async (
    d: Deployment,
    checklist: PrecheckChecklistItem[]
  ): Promise<Deployment | null> => {
    const result = await updatePrecheckChecklist(d.id, checklist);
    if (!result) throw new Error("체크리스트 저장에 실패했습니다.");
    await load();
    return result;
  };

  const handleCheckboxChange = async (
    d: Deployment,
    field: "unit_test_done" | "uat_done" | "precheck_done" | "post_qc_done",
    value: boolean
  ) => {
    await update(d.id, { [field]: value });
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#000",
        color: "#fff",
      }}
    >
      <div
        style={{
          padding: 24,
          maxWidth: 1400,
          margin: "0 auto",
          paddingBottom: 120,
          border: "4px double #fff",
          marginTop: 16,
          marginBottom: 16,
          marginLeft: 16,
          marginRight: 16,
        }}
      >
      <h1 style={{ color: "#fff" }}>프로그램 배포 관리</h1>
      <div
        style={{
          marginBottom: 16,
          padding: "12px 16px",
          backgroundColor: "#1a1a2e",
          border: "1px solid #444",
          borderRadius: 6,
          fontSize: 13,
        }}
      >
        <span style={{ fontWeight: 600, marginRight: 8 }}>승인 흐름:</span>
        <span style={{ opacity: 0.95 }}>
          배포등록 → 단위테스트, UAT, 체크리스트 → 1차 승인 → 2차 승인 → 완료 체크 → 배포후 QC
        </span>
      </div>
      <div style={{ marginBottom: 16, display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button
          type="button"
          onClick={handleCreate}
          style={{
            padding: "10px 20px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          배포 등록
        </button>
        <button
          type="button"
          onClick={() => load()}
          disabled={loading}
          style={{
            padding: "10px 20px",
            backgroundColor: "#17a2b8",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: 14,
            opacity: loading ? 0.6 : 1,
          }}
        >
          조회
        </button>
        <button
          type="button"
          onClick={handleClearAll}
          style={{
            padding: "10px 20px",
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          초기화
        </button>
        <button
          type="button"
          onClick={handleEditSelected}
          disabled={selectedIds.size === 0}
          style={{
            padding: "10px 20px",
            backgroundColor: "#fd7e14",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: selectedIds.size > 0 ? "pointer" : "not-allowed",
            fontSize: 14,
            opacity: selectedIds.size > 0 ? 1 : 0.6,
          }}
        >
          선택 수정
        </button>
        <button
          type="button"
          onClick={handleDeleteSelected}
          disabled={selectedIds.size === 0}
          style={{
            padding: "10px 20px",
            backgroundColor: "#dc3545",
            color: "white",
            border: "none",
            borderRadius: 4,
            cursor: selectedIds.size > 0 ? "pointer" : "not-allowed",
            fontSize: 14,
            opacity: selectedIds.size > 0 ? 1 : 0.6,
          }}
        >
          선택 삭제
        </button>
      </div>
      {loading ? (
        <p style={{ color: "#fff" }}>로딩 중...</p>
      ) : (
        <>
        <DeploymentTable
          deployments={deployments}
          selectedIds={selectedIds}
          onSelectionChange={handleSelectionChange}
          onSelectAll={handleSelectAll}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onChecklistOpen={(d) => {
            setChecklistDeployment(d);
            setChecklistOpen(true);
          }}
          onFirstApprove={handleFirstApprove}
          onSecondApprove={handleSecondApprove}
          onCompletedChange={handleCompletedChange}
          onCheckboxChange={handleCheckboxChange}
        />
        <p style={{ marginTop: 16, fontSize: 13, opacity: 0.8, color: "#fff" }}>
          ※ 항목의 체크박스를 선택(체크)한 경우에만 해당 행의 수정이 가능합니다.
        </p>
        <p style={{ marginTop: 8, fontSize: 13, opacity: 0.8, color: "#fff" }}>
          ※ 완료 처리되면 수정 불가합니다.
        </p>
        <p style={{ marginTop: 8, fontSize: 12, opacity: 0.7, color: "#fff" }}>
          ※ 체크리스트를 모두 체크하면 사전 체크가 체크됩니다.
        </p>
        <p style={{ marginTop: 8, fontSize: 12, opacity: 0.7, color: "#fff" }}>
          흐름: 배포등록 → 단위테스트, UAT, 체크리스트 → 1차 승인 → 2차 승인 → 완료 체크 → 배포후 QC
        </p>
        </>
      )}

      <ChecklistModal
        open={checklistOpen}
        deployment={
          checklistDeployment
            ? deployments.find((d) => d.id === checklistDeployment.id) ??
              checklistDeployment
            : null
        }
        onClose={() => {
          setChecklistOpen(false);
          setChecklistDeployment(null);
        }}
        onSave={async (checklist) => {
          if (checklistDeployment) {
            const res = await handleChecklistSave(checklistDeployment, checklist);
            return res ?? null;
          }
        }}
      />

      <DeploymentModal
        open={modalOpen}
        mode={modalMode}
        deployment={editingDeployment}
        onClose={() => setModalOpen(false)}
        onSubmit={handleModalSubmit}
      />

      <ApprovalModal
        open={approvalOpen}
        type={approvalType}
        deployment={approvalDeployment}
        onClose={() => {
          setApprovalOpen(false);
          setApprovalDeployment(null);
        }}
        onSubmit={handleApprovalSubmit}
      />

      <ServerErrorPanel
        error={error}
        errorHistory={errorHistory}
        onClear={clearErrors}
      />

      <ConfirmModal
        open={completedConfirmOpen}
        message="실제 이행 처리되었나요?"
        onYes={handleCompletedConfirmYes}
        onNo={handleCompletedConfirmNo}
      />
      </div>
    </div>
  );
}

export default App;
