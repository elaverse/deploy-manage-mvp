import React from "react";
import type { Deployment } from "../types/deployment";
import { getDeploymentStatus } from "../utils/status";
import { mergeChecklistWithTemplate } from "../data/precheckChecklist";

interface DeploymentTableProps {
  deployments: Deployment[];
  selectedIds: Set<string>;
  onSelectionChange: (id: string, checked: boolean) => void;
  onSelectAll: (checked: boolean) => void;
  onEdit: (d: Deployment) => void;
  onDelete: (d: Deployment) => void;
  onChecklistOpen: (d: Deployment) => void;
  onFirstApprove: (d: Deployment) => void;
  onSecondApprove: (d: Deployment) => void;
  onCompletedChange: (d: Deployment, completed: boolean, postQcDone?: boolean) => void;
  onCheckboxChange: (
    d: Deployment,
    field: "unit_test_done" | "uat_done" | "precheck_done" | "post_qc_done",
    value: boolean
  ) => void;
}

export function DeploymentTable({
  deployments,
  selectedIds,
  onSelectionChange,
  onSelectAll,
  onEdit,
  onDelete,
  onChecklistOpen,
  onFirstApprove,
  onSecondApprove,
  onCompletedChange,
  onCheckboxChange,
}: DeploymentTableProps) {
  return (
    <div style={{ overflowX: "auto", color: "#fff" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px", color: "#fff", border: "1px solid #444" }}>
        <thead>
          <tr style={{ backgroundColor: "#1a1a1a" }}>
            <th style={thStyle}>
              <input
                type="checkbox"
                checked={deployments.length > 0 && deployments.every((d) => selectedIds.has(d.id))}
                onChange={(e) => onSelectAll(e.target.checked)}
              />
            </th>
            <th style={thStyle}>상태</th>
            <th style={thStyle}>배포일</th>
            <th style={thStyle}>배포시간</th>
            <th style={thStyle}>내용</th>
            <th style={thStyle}>단위테스트</th>
            <th style={thStyle}>UAT</th>
            <th style={thStyle}>사전체크</th>
            <th style={thStyle}>실행자</th>
            <th style={thStyle}>배포관리</th>
            <th style={thStyle}>작업카드</th>
            <th style={thStyle}>승인</th>
            <th style={thStyle}>완료</th>
            <th style={thStyle}>배포후 QC</th>
            <th style={thStyle}>체크리스트</th>
            <th style={thStyle}>작업</th>
          </tr>
        </thead>
        <tbody>
          {deployments.map((d) => {
            const status = getDeploymentStatus(d);
            const checklist = mergeChecklistWithTemplate(d.precheck_checklist);
            const allChecklistDone =
              checklist.length > 0 && checklist.every((it) => it.checked);
            const canCheckPrecheck =
              !d.completed && allChecklistDone;
            const canFirstApprove =
              !d.first_approval &&
              !d.completed &&
              d.unit_test_done &&
              d.uat_done &&
              d.precheck_done;
            const canSecondApprove =
              d.first_approval && !d.second_approval && !d.completed;
            const canComplete = d.second_approval && !d.completed;
            const isSelected = selectedIds.has(d.id);

            return (
              <tr key={d.id} style={{ borderBottom: "1px solid #444", backgroundColor: selectedIds.has(d.id) ? "#1e3a5f" : "#000" }}>
                <td style={tdStyle}>
                  <input
                    type="checkbox"
                    checked={selectedIds.has(d.id)}
                    onChange={(e) => onSelectionChange(d.id, e.target.checked)}
                  />
                </td>
                <td style={tdStyle}>
                  <span style={statusStyle(status)}>{status}</span>
                </td>
                <td style={tdStyle}>{d.deploy_date}</td>
                <td style={tdStyle}>
                  {typeof d.deploy_time === "string"
                    ? d.deploy_time.slice(0, 8)
                    : d.deploy_time}
                </td>
                <td style={{ ...tdStyle, maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis" }}>
                  {d.content}
                </td>
                <td style={tdStyle}>
                  <input
                    type="checkbox"
                    checked={d.unit_test_done}
                    onChange={(e) =>
                      onCheckboxChange(d, "unit_test_done", e.target.checked)
                    }
                    disabled={!isSelected || d.completed}
                    title={!isSelected ? "항목 선택 시 수정 가능" : undefined}
                  />
                </td>
                <td style={tdStyle}>
                  <input
                    type="checkbox"
                    checked={d.uat_done}
                    onChange={(e) =>
                      onCheckboxChange(d, "uat_done", e.target.checked)
                    }
                    disabled={!isSelected || d.completed}
                    title={!isSelected ? "항목 선택 시 수정 가능" : undefined}
                  />
                </td>
                <td style={tdStyle}>
                  <input
                    type="checkbox"
                    checked={d.precheck_done}
                    onChange={(e) =>
                      onCheckboxChange(d, "precheck_done", e.target.checked)
                    }
                    disabled={!isSelected || d.completed || !canCheckPrecheck}
                    title={
                      !isSelected
                        ? "항목 선택 시 수정 가능"
                        : !allChecklistDone
                          ? "체크리스트 전체 완료 후 사전체크 가능"
                          : undefined
                    }
                  />
                </td>
                <td style={tdStyle}>{d.executor}</td>
                <td style={tdStyle}>{d.deploy_manager}</td>
                <td style={tdStyle}>{d.work_card_number}</td>
                <td style={tdStyle}>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    <button
                      type="button"
                      onClick={() => onFirstApprove(d)}
                      disabled={!isSelected || !canFirstApprove}
                      title={
                        !isSelected
                          ? "항목 선택 시 수정 가능"
                          : !canFirstApprove
                            ? "단위테스트·UAT·사전체크 완료 후 1차 승인 가능"
                            : undefined
                      }
                      style={{
                        ...btnStyle,
                        opacity: isSelected && canFirstApprove ? 1 : 0.5,
                        cursor: isSelected && canFirstApprove ? "pointer" : "not-allowed",
                      }}
                    >
                      1차
                    </button>
                    <button
                      type="button"
                      onClick={() => onSecondApprove(d)}
                      disabled={!isSelected || !canSecondApprove}
                      title={!isSelected ? "항목 선택 시 수정 가능" : undefined}
                      style={{
                        ...btnStyle,
                        opacity: isSelected && canSecondApprove ? 1 : 0.5,
                        cursor: isSelected && canSecondApprove ? "pointer" : "not-allowed",
                      }}
                    >
                      2차
                    </button>
                  </div>
                </td>
                <td style={tdStyle}>
                  <input
                    type="checkbox"
                    checked={d.completed}
                    onChange={(e) =>
                      onCompletedChange(d, e.target.checked, undefined)
                    }
                    disabled={!isSelected || !canComplete}
                    title={!isSelected ? "항목 선택 시 수정 가능" : undefined}
                  />
                </td>
                <td style={tdStyle}>
                  <input
                    type="checkbox"
                    checked={d.post_qc_done}
                    onChange={(e) =>
                      onCheckboxChange(d, "post_qc_done", e.target.checked)
                    }
                    disabled={!isSelected || !d.completed}
                    title={
                      !isSelected
                        ? "항목 선택 시 수정 가능"
                        : !d.completed
                          ? "완료 체크 후 배포후 QC 체크 가능"
                          : undefined
                    }
                  />
                </td>
                <td style={tdStyle}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <button
                      type="button"
                      onClick={() => onChecklistOpen(d)}
                      disabled={!isSelected || d.completed}
                      title={!isSelected ? "항목 선택 시 수정 가능" : undefined}
                      style={{
                        ...btnStyle,
                        fontSize: 11,
                        opacity: isSelected && !d.completed ? 1 : 0.5,
                        cursor: isSelected && !d.completed ? "pointer" : "not-allowed",
                      }}
                    >
                      체크리스트
                    </button>
                    <span
                      style={{
                        fontSize: 11,
                        opacity: allChecklistDone ? 0.9 : 0.7,
                      }}
                    >
                      {checklist.filter((it) => it.checked).length}/{checklist.length}
                      {allChecklistDone && " ✓"}
                    </span>
                  </div>
                </td>
                <td style={tdStyle}>
                  <div style={{ display: "flex", gap: 4 }}>
                    <button
                      type="button"
                      onClick={() => onEdit(d)}
                      disabled={!isSelected}
                      title={!isSelected ? "항목 선택 시 수정 가능" : undefined}
                      style={{
                        ...btnStyle,
                        opacity: isSelected ? 1 : 0.5,
                        cursor: isSelected ? "pointer" : "not-allowed",
                      }}
                    >
                      수정
                    </button>
                    <button
                      type="button"
                      onClick={() => onDelete(d)}
                      disabled={!isSelected}
                      title={!isSelected ? "항목 선택 시 수정 가능" : undefined}
                      style={{
                        ...btnStyle,
                        backgroundColor: "#dc3545",
                        opacity: isSelected ? 1 : 0.5,
                        cursor: isSelected ? "pointer" : "not-allowed",
                      }}
                    >
                      삭제
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: "10px 8px",
  textAlign: "left",
  fontWeight: 600,
  color: "#fff",
  borderBottom: "1px solid #444",
};

const tdStyle: React.CSSProperties = {
  padding: "8px",
  color: "#fff",
  borderBottom: "1px solid #333",
};

const btnStyle: React.CSSProperties = {
  padding: "4px 8px",
  fontSize: 12,
  backgroundColor: "#007bff",
  color: "white",
  border: "none",
  borderRadius: 4,
};

function statusStyle(status: string): React.CSSProperties {
  const colors: Record<string, string> = {
    대기: "#6c757d",
    "1차승인": "#fd7e14",
    "2차승인": "#20c997",
    완료: "#28a745",
  };
  return {
    padding: "2px 6px",
    borderRadius: 4,
    backgroundColor: colors[status] || "#eee",
    color: "white",
    fontSize: 12,
  };
}
