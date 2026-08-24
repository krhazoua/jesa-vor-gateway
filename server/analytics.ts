export type TransitionRecord = {
  fromStatus: string | null;
  toStatus: string;
  createdAt: Date;
};

export type ApprovalRecord = {
  createdAt: Date;
  decidedAt: Date | null;
  decision: string;
};

export type TransitionMetric = { label: string; fromStatus: string; toStatus: string; count: number };
export type ApprovalTimeMetric = { bucket: string; averageMinutes: number; samples: number };
export type CountMetric = { label: string; count: number };
export type ThroughputMetric = { bucket: string; count: number };
export type ValidationFailureMetric = { checkType: string; count: number };

export type AnalyticsFilters = { from?: Date; to?: Date; department?: string };
export type FilterableAnalyticsRecord = { createdAt: Date; department?: string };
export type RequestAnalyticsRecord = FilterableAnalyticsRecord & { status: string; sourceUc: string; priority: string; silClass: string | null };
export type ValidationAnalyticsRecord = FilterableAnalyticsRecord & { checkType: string; result: string };

export function filterAnalyticsRecords<T extends FilterableAnalyticsRecord>(records: T[], filters?: AnalyticsFilters): T[] {
  return records.filter(record => {
    if (filters?.from && record.createdAt < filters.from) return false;
    if (filters?.to && record.createdAt > filters.to) return false;
    if (filters?.department && filters.department !== "ALL" && record.department !== filters.department) return false;
    return true;
  });
}

export function buildAnalyticsPayload(
  transitions: (TransitionRecord & FilterableAnalyticsRecord)[],
  approvals: (ApprovalRecord & FilterableAnalyticsRecord)[],
  filters?: AnalyticsFilters,
  requests: RequestAnalyticsRecord[] = [],
  validation: ValidationAnalyticsRecord[] = [],
) {
  const filteredTransitions = filterAnalyticsRecords(transitions, filters);
  const filteredApprovals = filterAnalyticsRecords(approvals, filters);
  const filteredRequests = filterAnalyticsRecords(requests, filters);
  const filteredValidation = filterAnalyticsRecords(validation, filters);
  return {
    transitions: aggregateTransitions(filteredTransitions),
    approvalTimes: aggregateApprovalTimes(filteredApprovals),
    statusDistribution: aggregateCounts(filteredRequests.map(row => row.status)),
    useCaseDistribution: aggregateCounts(filteredRequests.map(row => row.sourceUc)),
    priorityDistribution: aggregateCounts(filteredRequests.map(row => row.priority)),
    silDistribution: aggregateCounts(filteredRequests.map(row => row.silClass || "UNCLASSIFIED")),
    throughput: aggregateThroughput(filteredRequests),
    approvalDecisions: aggregateCounts(filteredApprovals.filter(row => row.decision !== "PENDING").map(row => row.decision)),
    validationFailures: aggregateValidationFailures(filteredValidation),
  };
}

export function aggregateCounts(values: string[]): CountMetric[] {
  const counts = new Map<string, number>();
  for (const value of values) counts.set(value, (counts.get(value) || 0) + 1);
  return Array.from(counts.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([label, count]) => ({ label, count }));
}

export function aggregateTransitions(records: TransitionRecord[]): TransitionMetric[] {
  const counts = new Map<string, TransitionMetric>();
  for (const record of records) {
    const fromStatus = record.fromStatus || "NEW";
    const key = `${fromStatus}->${record.toStatus}`;
    const current = counts.get(key);
    if (current) current.count += 1;
    else counts.set(key, { label: `${fromStatus} → ${record.toStatus}`, fromStatus, toStatus: record.toStatus, count: 1 });
  }
  return Array.from(counts.values()).sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
}

export function aggregateApprovalTimes(records: ApprovalRecord[]): ApprovalTimeMetric[] {
  const buckets = new Map<string, { totalMinutes: number; samples: number }>();
  for (const record of records) {
    if (!record.decidedAt || record.decision === "PENDING") continue;
    const elapsedMinutes = Math.max(0, record.decidedAt.getTime() - record.createdAt.getTime()) / 60000;
    const bucket = record.createdAt.toISOString().slice(0, 10);
    const current = buckets.get(bucket) || { totalMinutes: 0, samples: 0 };
    current.totalMinutes += elapsedMinutes;
    current.samples += 1;
    buckets.set(bucket, current);
  }
  return Array.from(buckets.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([bucket, value]) => ({ bucket, averageMinutes: Number((value.totalMinutes / value.samples).toFixed(2)), samples: value.samples }));
}

export function aggregateThroughput(records: FilterableAnalyticsRecord[]): ThroughputMetric[] {
  const counts = new Map<string, number>();
  for (const record of records) {
    const bucket = record.createdAt.toISOString().slice(0, 10);
    counts.set(bucket, (counts.get(bucket) || 0) + 1);
  }
  return Array.from(counts.entries()).sort(([a], [b]) => a.localeCompare(b)).map(([bucket, count]) => ({ bucket, count }));
}

export function aggregateValidationFailures(records: ValidationAnalyticsRecord[]): ValidationFailureMetric[] {
  return aggregateCounts(records.filter(record => record.result === "FAIL").map(record => record.checkType)).map(({ label, count }) => ({ checkType: label, count }));
}
