import { describe, expect, it } from "vitest";
import { aggregateApprovalTimes, aggregateTransitions } from "./analytics";

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

  it("averages decided approvals by creation day and excludes pending rows", () => {
    const result = aggregateApprovalTimes([
      { createdAt: new Date("2026-08-24T08:00:00Z"), decidedAt: new Date("2026-08-24T08:04:00Z"), decision: "APPROVED" },
      { createdAt: new Date("2026-08-24T09:00:00Z"), decidedAt: new Date("2026-08-24T09:06:00Z"), decision: "REJECTED" },
      { createdAt: new Date("2026-08-24T10:00:00Z"), decidedAt: null, decision: "PENDING" },
    ]);
    expect(result).toEqual([{ bucket: "2026-08-24", averageMinutes: 5, samples: 2 }]);
  });
});
