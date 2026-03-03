import { useState, useCallback } from "react";
import type {
  Deployment,
  DeploymentCreateInput,
  DeploymentUpdateInput,
  PrecheckChecklistItem,
} from "../types/deployment";

// proxy 사용 시 빈 문자열 (프론트와 동일 origin → CORS 없음), 없으면 직접 URL
const API_BASE = process.env.REACT_APP_API_URL ?? "";

const API_URL = (path: string) =>
  API_BASE ? `${API_BASE.replace(/\/$/, "")}${path}` : path;

async function parseJsonResponse<T>(res: Response): Promise<T> {
  const contentType = res.headers.get("content-type") || "";
  if (!contentType.includes("application/json")) {
    const text = await res.text();
    if (text.trim().startsWith("<")) {
      throw new Error(
        res.status >= 500
          ? "백엔드 오류(500). Supabase .env 설정 및 deployment_management 테이블 확인"
          : "서버 연결 확인"
      );
    }
    throw new Error(res.ok ? "Invalid JSON response" : text || res.statusText);
  }
  return res.json();
}

async function fetchDeployments(): Promise<Deployment[]> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);
  const res = await fetch(API_URL("/deployments"), { signal: controller.signal });
  clearTimeout(timeout);
  if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);
  return parseJsonResponse<Deployment[]>(res);
}

async function createDeployment(data: DeploymentCreateInput): Promise<Deployment> {
  const res = await fetch(API_URL("/deployments"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to create: ${res.status}`);
  return parseJsonResponse<Deployment>(res);
}

async function updateDeployment(id: string, data: DeploymentUpdateInput): Promise<Deployment> {
  const res = await fetch(API_URL(`/deployments/${id}`), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(`Failed to update: ${res.status}`);
  return parseJsonResponse<Deployment>(res);
}

async function savePrecheckChecklistApi(
  id: string,
  checklist: PrecheckChecklistItem[]
): Promise<Deployment> {
  const payload = checklist.map((it) => ({
    category: it.category,
    check_item: it.check_item,
    question: it.question,
    verification_method: it.verification_method,
    checked: Boolean(it.checked),
  }));
  const res = await fetch(API_URL(`/deployments/${id}/precheck-checklist`), {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ precheck_checklist: payload }),
  });
  if (!res.ok) throw new Error(`Failed to save checklist: ${res.status}`);
  return parseJsonResponse<Deployment>(res);
}

async function deleteDeployment(id: string): Promise<void> {
  const res = await fetch(API_URL(`/deployments/${id}`), { method: "DELETE" });
  if (!res.ok) throw new Error(`Failed to delete: ${res.status}`);
}

async function clearAllDeployments(): Promise<number> {
  const res = await fetch(API_URL("/deployments/clear"), { method: "DELETE" });
  if (!res.ok) throw new Error(`Failed to clear: ${res.status}`);
  const data = await parseJsonResponse<{ deleted: number }>(res);
  return data.deleted;
}

async function firstApprove(id: string, approver: string): Promise<Deployment> {
  const res = await fetch(API_URL(`/deployments/${id}/first-approval`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ approver }),
  });
  if (!res.ok) throw new Error(`Failed first approval: ${res.status}`);
  return parseJsonResponse<Deployment>(res);
}

async function secondApprove(id: string, approver: string): Promise<Deployment> {
  const res = await fetch(API_URL(`/deployments/${id}/second-approval`), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ approver }),
  });
  if (!res.ok) throw new Error(`Failed second approval: ${res.status}`);
  return parseJsonResponse<Deployment>(res);
}

async function completeDeployment(
  id: string,
  completed: boolean,
  postQcDone?: boolean
): Promise<Deployment> {
  const params = new URLSearchParams({ completed: String(completed) });
  if (postQcDone !== undefined) params.set("post_qc_done", String(postQcDone));
  const res = await fetch(API_URL(`/deployments/${id}/complete?${params}`), {
    method: "PATCH",
  });
  if (!res.ok) throw new Error(`Failed to complete: ${res.status}`);
  return parseJsonResponse<Deployment>(res);
}

let errorId = 0;
const MAX_ERROR_HISTORY = 20;

export function useDeployments() {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setErrorState] = useState<string | null>(null);
  const [errorHistory, setErrorHistory] = useState<
    { id: number; message: string; timestamp: string }[]
  >([]);

  const setError = useCallback((msg: string | null) => {
    setErrorState(msg);
    if (msg) {
      const ts = new Date().toLocaleTimeString("ko-KR");
      setErrorHistory((prev) => {
        const next = [...prev, { id: ++errorId, message: msg, timestamp: ts }];
        return next.slice(-MAX_ERROR_HISTORY);
      });
    }
  }, []);

  const clearErrors = useCallback(() => {
    setErrorState(null);
    setErrorHistory([]);
  }, []);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchDeployments();
      setDeployments(data);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setError(
        msg.includes("fetch") || msg.includes("Failed") || msg.includes("abort")
          ? "백엔드 연결 실패. start-dev.bat 실행 또는 cd backend && uvicorn app.main:app --port 8000"
          : msg
      );
    } finally {
      setLoading(false);
    }
  }, [setError]);

  const create = useCallback(async (data: DeploymentCreateInput): Promise<Deployment | null> => {
    setError(null);
    try {
      const created = await createDeployment(data);
      setDeployments((prev) => [created, ...prev]);
      return created;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setError(msg.includes("fetch") || msg.includes("Failed") ? "백엔드 연결 실패" : msg);
      return null;
    }
  }, [setError]);

  const update = useCallback(
    async (id: string, data: DeploymentUpdateInput): Promise<Deployment | null> => {
      setError(null);
      try {
        const updated = await updateDeployment(id, data);
        setDeployments((prev) =>
          prev.map((d) => (d.id === id ? updated : d))
        );
        return updated;
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Unknown error";
        setError(msg.includes("fetch") || msg.includes("Failed") ? "백엔드 연결 실패" : msg);
        return null;
      }
    },
    [setError]
  );

  const clearAll = useCallback(async (): Promise<boolean> => {
    setError(null);
    try {
      const count = await clearAllDeployments();
      setDeployments([]);
      return count >= 0;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setError(msg.includes("fetch") || msg.includes("Failed") ? "백엔드 연결 실패" : msg);
      return false;
    }
  }, [setError]);

  const remove = useCallback(async (id: string): Promise<boolean> => {
    setError(null);
    try {
      await deleteDeployment(id);
      setDeployments((prev) => prev.filter((d) => d.id !== id));
      return true;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setError(msg.includes("fetch") || msg.includes("Failed") ? "백엔드 연결 실패" : msg);
      return false;
    }
  }, [setError]);

  const approveFirst = useCallback(async (id: string, approver: string): Promise<Deployment | null> => {
    setError(null);
    try {
      const updated = await firstApprove(id, approver);
      setDeployments((prev) =>
        prev.map((d) => (d.id === id ? updated : d))
      );
      return updated;
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setError(msg.includes("fetch") || msg.includes("Failed") ? "백엔드 연결 실패" : msg);
      return null;
    }
  }, [setError]);

  const approveSecond = useCallback(
    async (id: string, approver: string): Promise<Deployment | null> => {
      setError(null);
      try {
        const updated = await secondApprove(id, approver);
        setDeployments((prev) =>
          prev.map((d) => (d.id === id ? updated : d))
        );
        return updated;
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Unknown error";
        setError(msg.includes("fetch") || msg.includes("Failed") ? "백엔드 연결 실패" : msg);
        return null;
      }
    },
    [setError]
  );

  const setCompleted = useCallback(
    async (id: string, completed: boolean, postQcDone?: boolean): Promise<Deployment | null> => {
      setError(null);
      try {
        const updated = await completeDeployment(id, completed, postQcDone);
        setDeployments((prev) =>
          prev.map((d) => (d.id === id ? updated : d))
        );
        return updated;
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Unknown error";
        setError(msg.includes("fetch") || msg.includes("Failed") ? "백엔드 연결 실패" : msg);
        return null;
      }
    },
    [setError]
  );

  const updatePrecheckChecklist = useCallback(
    async (id: string, checklist: PrecheckChecklistItem[]): Promise<Deployment | null> => {
      setError(null);
      try {
        const updated = await savePrecheckChecklistApi(id, checklist);
        setDeployments((prev) =>
          prev.map((d) => (d.id === id ? updated : d))
        );
        return updated;
      } catch (e) {
        const msg = e instanceof Error ? e.message : "Unknown error";
        setError(msg.includes("fetch") || msg.includes("Failed") ? "백엔드 연결 실패" : msg);
        return null;
      }
    },
    [setError]
  );

  return {
    deployments,
    loading,
    error,
    errorHistory,
    clearErrors,
    load,
    clearAll,
    create,
    update,
    remove,
    approveFirst,
    approveSecond,
    setCompleted,
    updatePrecheckChecklist,
  };
}
