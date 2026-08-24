import { describe, expect, it } from "vitest";
import { assertAppendOnlyAuditAction, assertFourEyes, assertRole, assertTransition, validateRequest } from "./vor";

describe("VoR state machine", () => {
  it("allows only terminal decisions from pending operator", () => {
    expect(() => assertTransition("PENDING_OPERATOR", "ACCEPTED")).not.toThrow();
    expect(() => assertTransition("PENDING_OPERATOR", "REJECTED")).not.toThrow();
    expect(() => assertTransition("ACCEPTED", "PENDING_OPERATOR")).toThrow(/Illegal VoR transition/);
  });

  it("enforces independent requester and approver", () => {
    expect(() => assertFourEyes(10, 11)).not.toThrow();
    expect(() => assertFourEyes(10, 10)).toThrow(/Four-eyes/);
  });

  it("rejects roles outside the server allowlist", () => {
    expect(() => assertRole("supervisor", ["supervisor", "admin"])).not.toThrow();
    expect(() => assertRole("operator", ["supervisor", "admin"])).toThrow(/not authorized/);
  });

  it("short-circuits after a failed range check", () => {
    const result = validateRequest({ equipmentExists: true, signatureValid: true, unitValid: true, duplicate: false, expiresAt: 200, now: 100, requestedValue: 99, hardLow: 0, hardHigh: 80, silClass: "SIL-0", requiresApproval: false, rocWithinLimit: true, interlockActive: false });
    expect(result.at(-1)?.checkType).toBe("RANGE_CHECK");
    expect(result).toHaveLength(6);
    expect(result.at(-1)?.result).toBe("FAIL");
  });

  it("rejects mutation-style audit actions", () => {
    expect(() => assertAppendOnlyAuditAction("REQUEST_STATE_TRANSITION")).not.toThrow();
    expect(() => assertAppendOnlyAuditAction("DELETE_AUDIT_EVENT")).toThrow(/append-only/);
  });

  it("marks SIL-1 requests for independent approval", () => {
    const result = validateRequest({ equipmentExists: true, signatureValid: true, unitValid: true, duplicate: false, expiresAt: 200, now: 100, requestedValue: 10, hardLow: 0, hardHigh: 80, silClass: "SIL-1", requiresApproval: true, rocWithinLimit: true, interlockActive: false });
    expect(result.at(-1)?.result).toBe("REQUIRES_APPROVAL");
  });
});


describe("protected tRPC procedures", () => {
  it("reject inactive authenticated users before request access", async () => {
    const caller = (await import("./routers")).appRouter.createCaller({
      user: { id: 99, openId: "inactive", name: null, email: null, loginMethod: null, role: "operator", active: 0, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
      req: { protocol: "https", headers: {} } as never,
      res: {} as never,
    });
    await expect(caller.requests.list()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(caller.requests.create({ sourceUc: "UC1", department: "OPERATIONS", equipmentId: 1, variableId: 1, currentPv: 1, requestedSp: 1, priority: "NORMAL", ttlSeconds: 900, certificateSubject: "CN=APC-GATEWAY", sourceIdentity: "APC_GATEWAY" })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(caller.approvals.decide({ approvalId: 1, decision: "APPROVED", comment: "Independent review" })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});
