import { describe, expect, it } from "vitest";
import { aggregateApprovalTimes, aggregateTransitions, buildAnalyticsPayload, filterAnalyticsRecords } from "./analytics";

describe("analytics aggregations", () => {
  it("groups request state transitions and orders by volume", () => {
    const result = aggregateTransitions([
      { fromStatus: "PENDING_OPERATOR", toStatus: "ACCEPTED", createdAt: new Date("2026-08-24T08:00:00Z") },
      { fromStatus: "PENDING_OPERATOR", toStatus: "REJECTED", createdAt: new Date("2026-08-24T08:01:00Z") },
      { fromStatus: "PENDING_OPERATOR", toStatus: "ACCEPTED", createdAt: new Date("2026-08-24T08:02:00Z") },
      { fromStatus: null, toStatus: "PENDING_OPERATOR", createdAt: new Date("2026-08-24T08:03:00Z") },
    ]);
    expect(result[0]).toMatchObject({ label: "PENDING_OPERATOR → ACCEPTED", count: 2 });
    expect(result).toHaveLength(3);
    expect(result).toContainEqual({ label: "NEW → PENDING_OPERATOR", fromStatus: "NEW", toStatus: "PENDING_OPERATOR", count: 1 });
  });

  it("filters records by inclusive date range and department", () => {
    const result = filterAnalyticsRecords([
      { createdAt: new Date("2026-08-24T00:00:00Z"), department: "OPERATIONS", id: 1 },
      { createdAt: new Date("2026-08-24T12:00:00Z"), department: "MAINTENANCE", id: 2 },
      { createdAt: new Date("2026-08-25T00:00:00Z"), department: "OPERATIONS", id: 3 },
    ], { from: new Date("2026-08-24T00:00:00Z"), to: new Date("2026-08-24T23:59:59Z"), department: "OPERATIONS" });
    expect(result.map(record => record.id)).toEqual([1]);
    expect(filterAnalyticsRecords(result, { department: "ALL" })).toHaveLength(1);
  });

  it("returns filtered chart payloads and empty series for unmatched filters", () => {
    const transitions = [
      { fromStatus: "PENDING_OPERATOR", toStatus: "ACCEPTED", createdAt: new Date("2026-08-24T08:00:00Z"), department: "OPERATIONS" },
      { fromStatus: "PENDING_OPERATOR", toStatus: "REJECTED", createdAt: new Date("2026-08-25T08:00:00Z"), department: "MAINTENANCE" },
    ];
    const approvals = [
      { createdAt: new Date("2026-08-24T08:00:00Z"), decidedAt: new Date("2026-08-24T08:04:00Z"), decision: "APPROVED", department: "OPERATIONS" },
      { createdAt: new Date("2026-08-25T08:00:00Z"), decidedAt: new Date("2026-08-25T08:10:00Z"), decision: "REJECTED", department: "MAINTENANCE" },
    ];
    const filtered = buildAnalyticsPayload(transitions, approvals, { from: new Date("2026-08-24T00:00:00Z"), to: new Date("2026-08-24T23:59:59Z"), department: "OPERATIONS" });
    expect(filtered.transitions).toEqual([{ label: "PENDING_OPERATOR → ACCEPTED", fromStatus: "PENDING_OPERATOR", toStatus: "ACCEPTED", count: 1 }]);
    expect(filtered.approvalTimes).toEqual([{ bucket: "2026-08-24", averageMinutes: 4, samples: 1 }]);
    const empty = buildAnalyticsPayload(transitions, approvals, { department: "ELECTRICAL" });
    expect(empty).toMatchObject({ transitions: [], approvalTimes: [], statusDistribution: [], useCaseDistribution: [], priorityDistribution: [], silDistribution: [], throughput: [], approvalDecisions: [], validationFailures: [], validationTimes: [], equipmentDistribution: [], variableDistribution: [], statusTrend: [], acceptanceRate: 0, rejectionRate: 0, sil1Count: 0, averageValidationMinutes: 0 });
    expect(empty.transitions).toHaveLength(0);
    expect(empty.approvalTimes).toHaveLength(0);
  });

  it("aggregates canonical dimensions and validation failures", () => {
    const payload = buildAnalyticsPayload(
      [],
      [{ createdAt: new Date("2026-08-24T08:00:00Z"), decidedAt: new Date("2026-08-24T08:04:00Z"), decision: "APPROVED", department: "OPERATIONS" }],
      undefined,
      [
        { createdAt: new Date("2026-08-24T08:00:00Z"), department: "OPERATIONS", status: "ACCEPTED", sourceUc: "UC1", priority: "HIGH", silClass: "SIL-1", equipmentTag: "R-1001", variableTag: "TIC-1001" },
        { createdAt: new Date("2026-08-24T09:00:00Z"), department: "OPERATIONS", status: "REJECTED", sourceUc: "UC1", priority: "NORMAL", silClass: null, equipmentTag: "R-1001", variableTag: "TIC-1001" },
      ],
      [
        { createdAt: new Date("2026-08-24T08:00:00Z"), requestCreatedAt: new Date("2026-08-24T07:58:00Z"), department: "OPERATIONS", checkType: "ROC_WITHIN_LIMIT", result: "FAIL" },
        { createdAt: new Date("2026-08-24T08:01:00Z"), requestCreatedAt: new Date("2026-08-24T07:58:00Z"), department: "OPERATIONS", checkType: "ROC_WITHIN_LIMIT", result: "FAIL" },
        { createdAt: new Date("2026-08-24T08:02:00Z"), requestCreatedAt: new Date("2026-08-24T07:58:00Z"), department: "OPERATIONS", checkType: "SIGNATURE_VALID", result: "PASS" },
      ],
    );
    expect(payload.statusDistribution).toEqual([{ label: "ACCEPTED", count: 1 }, { label: "REJECTED", count: 1 }]);
    expect(payload.useCaseDistribution).toEqual([{ label: "UC1", count: 2 }]);
    expect(payload.silDistribution).toEqual([{ label: "SIL-1", count: 1 }, { label: "UNCLASSIFIED", count: 1 }]);
    expect(payload.validationFailures).toEqual([{ checkType: "ROC_WITHIN_LIMIT", count: 2 }]);
    expect(payload.approvalDecisions).toEqual([{ label: "APPROVED", count: 1 }]);
    expect(payload.throughput).toEqual([{ bucket: "2026-08-24", count: 2 }]);
    expect(payload.equipmentDistribution).toEqual([{ label: "R-1001", count: 2 }]);
    expect(payload.variableDistribution).toEqual([{ label: "TIC-1001", count: 2 }]);
    expect(payload.acceptanceRate).toBe(50);
    expect(payload.rejectionRate).toBe(50);
    expect(payload.sil1Count).toBe(1);
    expect(payload.averageValidationMinutes).toBe(3);
    expect(payload.validationTimes).toEqual([{ bucket: "2026-08-24", averageMinutes: 3, samples: 3 }]);
    expect(payload.statusTrend).toEqual([{ bucket: "2026-08-24", accepted: 1, rejected: 1, pending: 0 }]);
  });

  it("averages decided approvals by creation day and excludes pending rows", () => {
    const result = aggregateApprovalTimes([
      { createdAt: new Date("2026-08-24T08:00:00Z"), decidedAt: new Date("2026-08-24T08:04:00Z"), decision: "APPROVED" },
      { createdAt: new Date("2026-08-24T09:00:00Z"), decidedAt: new Date("2026-08-24T09:06:00Z"), decision: "REJECTED" },
      { createdAt: new Date("2026-08-24T10:00:00Z"), decidedAt: null, decision: "PENDING" },
    ]);
    expect(result).toEqual([{ bucket: "2026-08-24", averageMinutes: 5, samples: 2 }]);
  });
});
