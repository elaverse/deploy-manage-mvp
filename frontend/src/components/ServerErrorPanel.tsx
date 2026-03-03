import React, { useState } from "react";

export interface ErrorEntry {
  id: number;
  message: string;
  timestamp: string;
}

interface ServerErrorPanelProps {
  error: string | null;
  errorHistory: ErrorEntry[];
  onClear: () => void;
}

export function ServerErrorPanel({
  error,
  errorHistory,
  onClear,
}: ServerErrorPanelProps) {
  const [collapsed, setCollapsed] = useState(true);
  const hasErrors = error || errorHistory.length > 0;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: "#000",
        color: "#fff",
        borderTop: "4px double #fff",
        fontFamily: "monospace",
        fontSize: 13,
        boxShadow: "0 -2px 10px rgba(0,0,0,0.2)",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "8px 16px",
          backgroundColor: "#111",
          cursor: "pointer",
        }}
        onClick={() => setCollapsed((c) => !c)}
      >
        <span style={{ fontWeight: 600 }}>
          서버 에러 {hasErrors ? `(${errorHistory.length}건)` : "(에러 없음)"}
        </span>
        <span style={{ fontSize: 18 }}>{collapsed ? "▲" : "▼"}</span>
      </div>

      {!collapsed && (
        <div style={{ maxHeight: 200, overflowY: "auto" }}>
          {!hasErrors && (
            <div
              style={{
                padding: "16px",
                color: "#8bc34a",
                textAlign: "center",
              }}
            >
              최근 서버 에러 없음
            </div>
          )}
          {errorHistory
            .slice()
            .reverse()
            .map((e) => (
              <div
                key={e.id}
                style={{
                  padding: "8px 16px",
                  borderBottom: "1px solid #333",
                  color: "#ccc",
                }}
              >
                <span style={{ color: "#8bc34a", marginRight: 8 }}>
                  {e.timestamp}
                </span>
                {e.message}
              </div>
            ))}
          {hasErrors && (
          <div
            style={{
              padding: 8,
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onClear();
              }}
              style={{
                padding: "6px 12px",
                backgroundColor: "#555",
                color: "#fff",
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
                fontSize: 12,
              }}
            >
              에러 초기화
            </button>
          </div>
          )}
        </div>
      )}
    </div>
  );
}
