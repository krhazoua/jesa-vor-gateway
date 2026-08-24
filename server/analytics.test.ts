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
    expect(empty).toEqual({ transitions: [], approvalTimes: [] });
    expect(empty.transitions).toHaveLength(0);
    expect(empty.approvalTimes).toHaveLength(0);
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
