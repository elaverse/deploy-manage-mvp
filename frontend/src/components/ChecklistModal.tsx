import React, { useEffect, useState } from "react";
import type { Deployment, PrecheckChecklistItem } from "../types/deployment";
import {
  mergeChecklistWithTemplate,
  PRECHECK_CHECKLIST_TEMPLATE,
} from "../data/precheckChecklist";

interface ChecklistModalProps {
  open: boolean;
  deployment: Deployment | null;
  onClose: () => void;
  onSave: (
    checklist: PrecheckChecklistItem[]
  ) => void | Promise<Deployment | null | void>;
}

export function ChecklistModal({
  open,
  deployment,
  onClose,
  onSave,
}: ChecklistModalProps) {
  const [items, setItems] = useState<PrecheckChecklistItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (open && deployment) {
      setItems(mergeChecklistWithTemplate(deployment.precheck_checklist));
      setSaveError(null);
      setSaveSuccess(false);
    }
  }, [open, deployment?.id]);

  const handleToggle = (index: number) => {
    const next = items.map((it, i) =>
      i === index ? { ...it, checked: !it.checked } : it
    );
    setItems(next);
  };

  const handleCheckAll = () => {
    setItems(items.map((it) => ({ ...it, checked: true })));
  };

  const handleUncheckAll = () => {
    setItems(items.map((it) => ({ ...it, checked: false })));
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      const result = await onSave(items);
      if (result?.precheck_checklist) {
        setItems(mergeChecklistWithTemplate(result.precheck_checklist));
        setSaveSuccess(true);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : "저장 실패";
      setSaveError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleLeave = async () => {
    try {
      await onSave(items);
      onClose();
    } catch {
      onClose();
    }
  };

  const totalCount = items.length || PRECHECK_CHECKLIST_TEMPLATE.length;
  const checkedCount = items.filter((it) => it.checked).length;
  const allChecked = totalCount > 0 && items.length > 0 && items.every((it) => it.checked);

  if (!open || !deployment) return null;

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
        zIndex: 1001,
      }}
      onClick={handleLeave}
    >
      <div
        style={{
          backgroundColor: "#000",
          color: "#fff",
          padding: 24,
          borderRadius: 8,
          maxWidth: 900,
          width: "95%",
          maxHeight: "90vh",
          overflow: "auto",
          border: "4px double #fff",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h2 style={{ marginTop: 0, color: "#fff" }}>
          이행 체크리스트 · {deployment.content || "(내용 없음)"}
        </h2>
        {saveError && (
          <p style={{ color: "#f44336", fontSize: 13, marginBottom: 12 }}>
            {saveError}
          </p>
        )}
        {saveSuccess && (
          <p style={{ color: "#4caf50", fontSize: 13, marginBottom: 12 }}>
            저장되었습니다. 나가기를 누르면 메인 화면의 체크 현황에 반영됩니다.
          </p>
        )}
        <p style={{ fontSize: 13, opacity: 0.9, marginBottom: 8 }}>
          {allChecked
            ? "체크리스트를 다 체크하면 사전체크가 ✓됩니다"
            : `모든 항목 체크 완료 시 사전체크 가능 (${checkedCount}/${totalCount})`}
        </p>
        <div
          style={{
            display: "flex",
            gap: 8,
            marginBottom: 16,
            flexWrap: "wrap",
          }}
        >
          <button
            type="button"
            onClick={handleCheckAll}
            disabled={deployment.completed}
            style={{ ...secondaryBtn, fontSize: 12 }}
          >
            일괄 체크
          </button>
          <button
            type="button"
            onClick={handleUncheckAll}
            disabled={deployment.completed}
            style={{ ...secondaryBtn, fontSize: 12 }}
          >
            일괄 해지
          </button>
        </div>
        <div style={{ overflowX: "auto", marginBottom: 16 }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 13,
              border: "1px solid #444",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#1a1a1a" }}>
                <th style={thStyle}>구분</th>
                <th style={thStyle}>점검 항목</th>
                <th style={thStyle}>세부 확인 질문</th>
                <th style={thStyle}>확인 방법</th>
                <th style={{ ...thStyle, width: 60 }}>체크</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, idx) => (
                <tr
                  key={`${it.category}-${it.check_item}-${idx}`}
                  style={{
                    borderBottom: "1px solid #333",
                    backgroundColor: it.checked ? "#0d2b0d" : "transparent",
                  }}
                >
                  <td style={tdStyle}>{it.category}</td>
                  <td style={tdStyle}>{it.check_item}</td>
                  <td style={tdStyle}>{it.question}</td>
                  <td style={tdStyle}>{it.verification_method}</td>
                  <td style={tdStyle}>
                    <input
                      type="checkbox"
                      checked={it.checked}
                      onChange={() => handleToggle(idx)}
                      disabled={deployment.completed}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 8,
          }}
        >
          <span style={{ fontSize: 13, opacity: 0.9 }}>
            체크 현황: {checkedCount}/{totalCount}
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" onClick={handleLeave} style={secondaryBtn}>
              나가기
            </button>
            <button
              type="button"
              onClick={handleSave}
              style={primaryBtn}
              disabled={deployment.completed || saving}
            >
              {saving ? "저장 중..." : "저장"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: "8px 10px",
  textAlign: "left",
  fontWeight: 600,
  borderBottom: "1px solid #444",
};
const tdStyle: React.CSSProperties = {
  padding: "8px 10px",
  borderBottom: "1px solid #333",
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
