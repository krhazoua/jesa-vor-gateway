import { describe, expect, it } from "vitest";
import { buildOperationsGovernanceSummary, type SummaryApproval, type SummaryNotification } from "./dashboardSummary";

const notification = (id: number, type: string): SummaryNotification => ({ id, type, severity: "WARNING", title: `Alert ${id}`, message: "Certificate window requires review.", readAt: null, createdAt: new Date(2026, 7, 25, 8, 0, id) });
const approval = (id: number): SummaryApproval => ({ id, requestId: `VOR-${id}`, equipmentName: "Attack Reactor", variableName: "Reactor temperature", requestedSp: "76.4", unit: "°C", priority: "HIGH", createdAt: new Date(2026, 7, 25, 8, 0, id) });

describe("Operations governance summary contract", () => {
  it("keeps only certificate-expiry notifications and bounds each surface to five rows", () => {
    const result = buildOperationsGovernanceSummary([...Array.from({ length: 7 }, (_, index) => notification(index + 1, "CERTIFICATE_EXPIRY")), notification(99, "STATE_CHANGED")], Array.from({ length: 7 }, (_, index) => approval(index + 1)), true);
    expect(result.expiryAlertCount).toBe(5);
    expect(result.expiryAlerts).toHaveLength(5);
    expect(result.pendingApprovalCount).toBe(5);
    expect(result.pendingApprovals).toHaveLength(5);
  });

  it("does not expose approval rows or counts to unauthorized roles", () => {
    const result = buildOperationsGovernanceSummary([notification(1, "CERTIFICATE_EXPIRY")], [approval(1)], false);
    expect(result.approvalVisibility).toBe("ROLE_RESTRICTED");
    expect(result.pendingApprovalCount).toBeNull();
    expect(result.pendingApprovals).toEqual([]);
    expect(result.expiryAlertCount).toBe(1);
  });
});
