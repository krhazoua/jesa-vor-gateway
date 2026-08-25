export type OperationRow = {
  id: string;
  time: string;
  createdAt: number;
  source: string;
  variable: string;
  tag: string;
  current: string;
  requested: string;
  unit: string;
  uc: string;
  status: string;
  priority: string;
  sil: string;
  delta: string;
  equipment: string;
};

export type OperationFilterState = {
  query: string;
  status: string;
  equipment: string;
  variable: string;
  priority: string;
  uc: string;
  fromDate: string;
  toDate: string;
};

export type OperationSortKey = "createdAt" | "id" | "equipment" | "variable" | "requested" | "priority" | "status";
export type OperationSortDirection = "asc" | "desc";

const priorityOrder: Record<string, number> = { CRITICAL: 4, HIGH: 3, NORMAL: 2, LOW: 1 };

export function filterAndSortOperations(rows: OperationRow[], filters: OperationFilterState, sortKey: OperationSortKey, sortDirection: OperationSortDirection) {
  const normalizedQuery = filters.query.trim().toLowerCase();
  const from = filters.fromDate ? new Date(`${filters.fromDate}T00:00:00Z`).getTime() : Number.NEGATIVE_INFINITY;
  const to = filters.toDate ? new Date(`${filters.toDate}T23:59:59.999Z`).getTime() : Number.POSITIVE_INFINITY;
  const filtered = rows.filter(row => {
    const matchesQuery = !normalizedQuery || Object.values(row).join(" ").toLowerCase().includes(normalizedQuery);
    return matchesQuery && row.createdAt >= from && row.createdAt <= to && (filters.status === "ALL" || row.status === filters.status) && (filters.equipment === "ALL" || row.equipment === filters.equipment) && (filters.variable === "ALL" || row.variable === filters.variable) && (filters.priority === "ALL" || row.priority === filters.priority) && (filters.uc === "ALL" || row.uc === filters.uc);
  });
  const direction = sortDirection === "asc" ? 1 : -1;
  return filtered.sort((left, right) => {
    const leftValue = sortKey === "createdAt" ? left.createdAt : sortKey === "requested" ? Number(left.requested) : sortKey === "priority" ? (priorityOrder[left.priority] ?? 0) : left[sortKey];
    const rightValue = sortKey === "createdAt" ? right.createdAt : sortKey === "requested" ? Number(right.requested) : sortKey === "priority" ? (priorityOrder[right.priority] ?? 0) : right[sortKey];
    const comparison = typeof leftValue === "number" && typeof rightValue === "number" ? leftValue - rightValue : String(leftValue).localeCompare(String(rightValue), undefined, { numeric: true, sensitivity: "base" });
    return (comparison === 0 ? left.id.localeCompare(right.id) : comparison) * direction;
  });
}
