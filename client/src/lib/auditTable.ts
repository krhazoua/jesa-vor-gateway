export type AuditTableRow = string[];
export type AuditSort = { index: number; direction: "asc" | "desc" };

export const AUDIT_PAGE_SIZE = 10;

export function sortAuditRows(rows: AuditTableRow[], sort: AuditSort) {
  return [...rows].sort((left, right) => {
    const leftValue = left[sort.index] || "";
    const rightValue = right[sort.index] || "";
    const comparison = leftValue.localeCompare(rightValue, undefined, { numeric: true, sensitivity: "base" });
    return sort.direction === "asc" ? comparison : -comparison;
  });
}

export function paginateAuditRows(rows: AuditTableRow[], requestedPage: number, pageSize = AUDIT_PAGE_SIZE) {
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
