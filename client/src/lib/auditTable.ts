export type AuditTableRow = string[];
export type AuditSort = { index: number; direction: "asc" | "desc" };

export const AUDIT_PAGE_SIZE = 10;

export type AuditFilterRecord = {
  createdAt: Date;
  requestId: number | null;
  actorId: number;
  actorRole: string;
  action: string;
  previousState: string | null;
  newState: string | null;
  result: string;
  reason?: string | null;
};

export type AuditFilters = {
  text?: string;
  requestId?: string;
  userId?: string;
  role?: string;
  event?: string;
  state?: string;
  from?: string;
  to?: string;
};

export function filterAuditRecords<T extends AuditFilterRecord>(records: T[], filters: AuditFilters) {
  const text = filters.text?.trim().toLowerCase() || "";
  const requestId = filters.requestId?.trim().toLowerCase() || "";
  const userId = filters.userId?.trim().toLowerCase() || "";
  const from = filters.from ? new Date(`${filters.from}T00:00:00.000Z`) : null;
  const to = filters.to ? new Date(`${filters.to}T23:59:59.999Z`) : null;
  return records.filter(record => {
    const searchable = `${record.createdAt.toISOString()} ${record.requestId ?? "SYSTEM"} ${record.actorId} ${record.actorRole} ${record.action} ${record.previousState ?? ""} ${record.newState ?? ""} ${record.result} ${record.reason ?? ""}`.toLowerCase();
    const timestamp = record.createdAt.getTime();
    return (!text || searchable.includes(text))
      && (!requestId || String(record.requestId ?? "SYSTEM").toLowerCase().includes(requestId))
      && (!userId || String(record.actorId).toLowerCase().includes(userId))
      && (!filters.role || filters.role === "ALL" || record.actorRole === filters.role)
      && (!filters.event || filters.event === "ALL" || record.action === filters.event)
      && (!filters.state || filters.state === "ALL" || record.newState === filters.state || record.previousState === filters.state || record.result === filters.state)
      && (!from || timestamp >= from.getTime())
      && (!to || timestamp <= to.getTime());
  });
}

export type AuditTableEntry<T = unknown> = { id: number; values: AuditTableRow; record?: T };

export function serializeAuditMetadata(record: Record<string, unknown> | null | undefined) {
  if (!record) return "{}";
  try {
    return JSON.stringify(record, null, 2) || "{}";
  } catch {
    return "{\n  \"error\": \"Metadata could not be serialized\"\n}";
  }
}

export function sortAuditEntries<T>(entries: AuditTableEntry<T>[], sort: AuditSort) {
  return [...entries].sort((left, right) => {
    const leftValue = left.values[sort.index] || "";
    const rightValue = right.values[sort.index] || "";
    const comparison = leftValue.localeCompare(rightValue, undefined, { numeric: true, sensitivity: "base" });
    return sort.direction === "asc" ? comparison : -comparison;
  });
}

export function sortAuditRows(rows: AuditTableRow[], sort: AuditSort) {
  return [...rows].sort((left, right) => {
    const leftValue = left[sort.index] || "";
    const rightValue = right[sort.index] || "";
    const comparison = leftValue.localeCompare(rightValue, undefined, { numeric: true, sensitivity: "base" });
    return sort.direction === "asc" ? comparison : -comparison;
  });
}

export function paginateAuditRows<T>(rows: T[], requestedPage: number, pageSize = AUDIT_PAGE_SIZE) {
  const safePageSize = Math.max(1, pageSize);
  const pageCount = Math.max(1, Math.ceil(rows.length / safePageSize));
  const page = Math.min(Math.max(1, requestedPage), pageCount);
  const startIndex = (page - 1) * safePageSize;
  const visibleRows = rows.slice(startIndex, startIndex + safePageSize);
  return {
    page,
    pageCount,
    rows: visibleRows,
    start: visibleRows.length ? startIndex + 1 : 0,
    end: startIndex + visibleRows.length,
    total: rows.length,
  };
}
