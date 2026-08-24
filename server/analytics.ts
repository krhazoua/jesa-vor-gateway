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

export type TransitionMetric = {
  label: string;
  fromStatus: string;
  toStatus: string;
  count: number;
};

export type ApprovalTimeMetric = {
  bucket: string;
  averageMinutes: number;
  samples: number;
};

export function aggregateTransitions(records: TransitionRecord[]): TransitionMetric[] {
  const counts = new Map<string, TransitionMetric>();
  for (const record of records) {
    const fromStatus = record.fromStatus || "NEW";
    const key = `${fromStatus}->${record.toStatus}`;
    const current = counts.get(key);
    if (current) {
      current.count += 1;
    } else {
      counts.set(key, { label: `${fromStatus} → ${record.toStatus}`, fromStatus, toStatus: record.toStatus, count: 1 });
    }
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
