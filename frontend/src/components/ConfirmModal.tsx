import React from "react";

interface ConfirmModalProps {
  open: boolean;
  message: string;
  onYes: () => void;
  onNo: () => void;
}

export function ConfirmModal({
  open,
  message,
  onYes,
  onNo,
}: ConfirmModalProps) {
  if (!open) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "rgba(0,0,0,0.7)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1100,
      }}
    >
      <div
        style={{
          backgroundColor: "#000",
          color: "#fff",
          padding: 24,
          borderRadius: 8,
          maxWidth: 400,
          border: "4px double #fff",
        }}
      >
        <p style={{ margin: "0 0 20px", fontSize: 16 }}>{message}</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <button
            type="button"
            onClick={onYes}
            style={{
              padding: "10px 24px",
              backgroundColor: "#28a745",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            Y (예)
          </button>
          <button
            type="button"
            onClick={onNo}
            style={{
              padding: "10px 24px",
              backgroundColor: "#dc3545",
              color: "#fff",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
              fontSize: 14,
            }}
          >
            N (아니오)
          </button>
        </div>
      </div>
    </div>
  );
}
