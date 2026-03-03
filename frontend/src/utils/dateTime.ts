/** API 전송용 날짜 (YYYY-MM-DD) */
export function formatDateForApi(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return new Date().toISOString().slice(0, 10);
  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) return trimmed;
  const d = new Date(trimmed);
  if (!isNaN(d.getTime())) {
    return d.toISOString().slice(0, 10);
  }
  return new Date().toISOString().slice(0, 10);
}

/** API 전송용 시간 (HH:MM:SS) */
export function formatTimeForApi(value: string): string {
  const trimmed = value.trim().replace(/\s/g, "");
  if (!trimmed) return "00:00:00";
  const match = trimmed.match(/^(\d{1,2}):(\d{0,2}):?(\d{0,2})?$/);
  if (match) {
    const h = Math.min(23, Math.max(0, parseInt(match[1], 10)));
    const m = Math.min(59, Math.max(0, parseInt(match[2] || "0", 10)));
    const s = Math.min(59, Math.max(0, parseInt(match[3] || "0", 10)));
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }
  if (trimmed.length <= 5 && trimmed.includes(":")) {
    const parts = trimmed.split(":");
    const h = Math.min(23, Math.max(0, parseInt(parts[0] || "0", 10)));
    const m = Math.min(59, Math.max(0, parseInt(parts[1] || "0", 10)));
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`;
  }
  return "00:00:00";
}

/** time input value용 (HH:MM) - API 응답에서 추출 */
export function toTimeInputValue(apiTime: string | undefined): string {
  if (!apiTime) return "00:00";
  const s = String(apiTime);
  if (s.length >= 5) return s.slice(0, 5);
  return "00:00";
}
