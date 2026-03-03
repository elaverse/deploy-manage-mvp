import React, { useEffect, useState } from "react";
import type { Deployment, DeploymentCreateInput } from "../types/deployment";
import { formatDateForApi, formatTimeForApi, toTimeInputValue } from "../utils/dateTime";
import { createEmptyChecklist, mergeChecklistWithTemplate } from "../data/precheckChecklist";

interface DeploymentModalProps {
  open: boolean;
  mode: "create" | "edit";
  deployment: Deployment | null;
  onClose: () => void;
  onSubmit: (data: DeploymentCreateInput, id?: string) => void;
}

const getInitialForm = (): DeploymentCreateInput => ({
  deploy_date: new Date().toISOString().slice(0, 10),
  deploy_time: "10:00:00",
  content: "",
  unit_test_done: false,
  uat_done: false,
  precheck_done: false,
  precheck_checklist: createEmptyChecklist(),
  executor: "",
  deploy_manager: "",
  work_card_number: "",
  completed: false,
  post_qc_done: false,
  first_approval: false,
  first_approver: null,
  second_approval: false,
  second_approver: null,
});

export function DeploymentModal({
  open,
  mode,
  deployment,
  onClose,
  onSubmit,
}: DeploymentModalProps) {
  const [form, setForm] = useState<DeploymentCreateInput>(getInitialForm);

  useEffect(() => {
    if (mode === "edit" && deployment) {
      const dateStr =
        typeof deployment.deploy_date === "string"
          ? deployment.deploy_date.slice(0, 10)
          : new Date().toISOString().slice(0, 10);
      const timeInput = toTimeInputValue(
        typeof deployment.deploy_time === "string" ? deployment.deploy_time : undefined
      );
      setForm({
        deploy_date: dateStr,
        deploy_time: formatTimeForApi(timeInput),
        content: deployment.content,
        unit_test_done: deployment.unit_test_done,
        uat_done: deployment.uat_done,
        precheck_done: deployment.precheck_done,
        precheck_checklist: deployment.precheck_checklist,
        executor: deployment.executor,
        deploy_manager: deployment.deploy_manager,
        work_card_number: deployment.work_card_number,
        completed: deployment.completed,
        post_qc_done: deployment.post_qc_done,
        first_approval: deployment.first_approval,
        first_approver: deployment.first_approver,
        second_approval: deployment.second_approval,
        second_approver: deployment.second_approver,
      });
    } else {
      setForm(getInitialForm());
    }
  }, [open, mode, deployment]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(
      {
        ...form,
        deploy_date: formatDateForApi(form.deploy_date),
        deploy_time: formatTimeForApi(form.deploy_time),
        precheck_checklist: form.precheck_checklist ?? (mode === "create" ? createEmptyChecklist() : []),
      },
      deployment?.id
    );
    onClose();
  };

  if (!open) return null;

  const checklist = mergeChecklistWithTemplate(
    mode === "edit" ? deployment?.precheck_checklist : []
  );
  const allChecklistDone =
    checklist.length > 0 && checklist.every((it) => it.checked);
  const canCheckPrecheck = mode === "edit" && allChecklistDone;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "#000",
          color: "#fff",
          padding: 24,
          borderRadius: 8,
          maxWidth: 480,
          width: "90%",
          maxHeight: "90vh",
          overflow: "auto",
          border: "4px double #fff",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ marginTop: 0, color: "#fff" }}>
          {mode === "create" ? "배포 등록" : "배포 수정"}
        </h2>
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 12, color: "#fff" }}>
            <label style={{ display: "block", marginBottom: 4 }}>
              배포 일시
            </label>
            <div
              style={{
                display: "flex",
                gap: 8,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <input
                type="date"
                value={form.deploy_date}
                onChange={(e) =>
                  setForm((f) => ({ ...f, deploy_date: e.target.value }))
                }
                required
                style={{ ...inputStyle, flex: "1 1 140px", minWidth: 0 }}
              />
              <input
                type="time"
                value={form.deploy_time.slice(0, 5)}
                onChange={(e) =>
                  setForm((f) => ({
                    ...f,
                    deploy_time: formatTimeForApi(e.target.value),
                  }))
                }
                step="60"
                required
                style={{ ...inputStyle, flex: "0 0 100px", minWidth: 80 }}
              />
            </div>
            <small style={{ opacity: 0.7, marginTop: 4, display: "block" }}>
              날짜(YYYY-MM-DD) · 시간(시:분)
            </small>
          </div>
          <div style={{ marginBottom: 12, color: "#fff" }}>
            <label>내용</label>
            <textarea
              value={form.content}
              onChange={(e) =>
                setForm((f) => ({ ...f, content: e.target.value }))
              }
              rows={3}
              style={{ ...inputStyle, resize: "vertical" }}
            />
          </div>
          <div style={{ marginBottom: 12, display: "flex", gap: 16, color: "#fff" }}>
            <label>
              <input
                type="checkbox"
                checked={form.unit_test_done}
                onChange={(e) =>
                  setForm((f) => ({ ...f, unit_test_done: e.target.checked }))
                }
              />
              단위테스트
            </label>
            <label>
              <input
                type="checkbox"
                checked={form.uat_done}
                onChange={(e) =>
                  setForm((f) => ({ ...f, uat_done: e.target.checked }))
                }
              />
              UAT
            </label>
            <label
              title={
                mode === "create"
                  ? "신규 등록 시 사전체크 불가. 등록 후 체크리스트 완료 시 수정에서 체크 가능"
                  : !canCheckPrecheck
                    ? "체크리스트 전체 완료 후 사전체크 가능"
                    : undefined
              }
            >
              <input
                type="checkbox"
                checked={form.precheck_done}
                onChange={(e) =>
                  setForm((f) => ({ ...f, precheck_done: e.target.checked }))
                }
                disabled={!canCheckPrecheck}
              />
              사전체크
            </label>
            <label>
              <input
                type="checkbox"
                checked={form.completed ?? false}
                onChange={(e) =>
                  setForm((f) => ({ ...f, completed: e.target.checked }))
                }
              />
              완료
            </label>
            <label>
              <input
                type="checkbox"
                checked={form.post_qc_done ?? false}
                onChange={(e) =>
                  setForm((f) => ({ ...f, post_qc_done: e.target.checked }))
                }
              />
              배포 후 QC
            </label>
            <label>
              <input
                type="checkbox"
                checked={form.first_approval ?? false}
                onChange={(e) =>
                  setForm((f) => ({ ...f, first_approval: e.target.checked }))
                }
              />
              1차 승인
            </label>
            <label>
              <input
                type="checkbox"
                checked={form.second_approval ?? false}
                onChange={(e) =>
                  setForm((f) => ({ ...f, second_approval: e.target.checked }))
                }
              />
              2차 승인
            </label>
          </div>
          <div style={{ marginBottom: 12, display: "flex", gap: 16, flexWrap: "wrap", color: "#fff" }}>
            <div>
              <label style={{ display: "block", marginBottom: 4 }}>1차 승인자</label>
              <input
                type="text"
                value={form.first_approver ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, first_approver: e.target.value || null }))
                }
                placeholder="1차 승인 체크 시 입력"
                style={{ ...inputStyle, width: 140 }}
              />
            </div>
            <div>
              <label style={{ display: "block", marginBottom: 4 }}>2차 승인자</label>
              <input
                type="text"
                value={form.second_approver ?? ""}
                onChange={(e) =>
                  setForm((f) => ({ ...f, second_approver: e.target.value || null }))
                }
                placeholder="2차 승인 체크 시 입력"
                style={{ ...inputStyle, width: 140 }}
              />
            </div>
          </div>
          <div style={{ marginBottom: 12, color: "#fff" }}>
            <label>실행자</label>
            <input
              type="text"
              value={form.executor}
              onChange={(e) =>
                setForm((f) => ({ ...f, executor: e.target.value }))
              }
              style={inputStyle}
            />
          </div>
          <div style={{ marginBottom: 12, color: "#fff" }}>
            <label>배포관리</label>
            <input
              type="text"
              value={form.deploy_manager}
              onChange={(e) =>
                setForm((f) => ({ ...f, deploy_manager: e.target.value }))
              }
              style={inputStyle}
            />
          </div>
          <div style={{ marginBottom: 16, color: "#fff" }}>
            <label>작업카드번호</label>
            <input
              type="text"
              value={form.work_card_number}
              onChange={(e) =>
                setForm((f) => ({ ...f, work_card_number: e.target.value }))
              }
              style={inputStyle}
            />
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button type="button" onClick={onClose} style={secondaryBtn}>
              취소
            </button>
            <button type="submit" style={primaryBtn}>
              {mode === "create" ? "등록" : "수정"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  display: "block",
  width: "100%",
  padding: 8,
  marginTop: 4,
  boxSizing: "border-box",
  backgroundColor: "#1a1a1a",
  color: "#fff",
  border: "1px solid #444",
};

const primaryBtn: React.CSSProperties = {
  padding: "8px 16px",
  backgroundColor: "#007bff",
  color: "white",
  border: "none",
  borderRadius: 4,
  cursor: "pointer",
};

const secondaryBtn: React.CSSProperties = {
  ...primaryBtn,
  backgroundColor: "#6c757d",
};
