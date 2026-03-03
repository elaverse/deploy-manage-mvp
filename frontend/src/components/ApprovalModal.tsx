import React, { useState } from "react";
import type { Deployment } from "../types/deployment";

interface ApprovalModalProps {
  open: boolean;
  type: "first" | "second";
  deployment: Deployment | null;
  onClose: () => void;
  onSubmit: (approver: string) => void;
}

export function ApprovalModal({
  open,
  type,
  deployment,
  onClose,
  onSubmit,
}: ApprovalModalProps) {
  const [approver, setApprover] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (approver.trim()) {
      onSubmit(approver.trim());
      setApprover("");
      onClose();
    }
  };

  if (!open) return null;

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
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "#000",
          color: "#fff",
          padding: 24,
          borderRadius: 8,
          maxWidth: 360,
          width: "90%",
          border: "4px double #fff",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3 style={{ marginTop: 0, color: "#fff" }}>
          {type === "first" ? "1차 승인" : "2차 승인"}
        </h3>
        {deployment && (
          <p style={{ color: "#ccc", fontSize: 14 }}>
            배포일: {deployment.deploy_date} / {deployment.content.slice(0, 30)}
            ...
          </p>
        )}
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 16 }}>
            <label>승인자</label>
            <input
              type="text"
              value={approver}
              onChange={(e) => setApprover(e.target.value)}
              placeholder="승인자 이름"
              required
              style={{
                display: "block",
                width: "100%",
                padding: 8,
                marginTop: 4,
                boxSizing: "border-box",
                backgroundColor: "#1a1a1a",
                color: "#fff",
                border: "1px solid #444",
              }}
            />
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button type="button" onClick={onClose} style={secondaryBtn}>
              취소
            </button>
            <button type="submit" style={primaryBtn}>
              승인
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

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
