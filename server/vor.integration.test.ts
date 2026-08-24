import { describe, expect, it, vi, beforeEach } from "vitest";
import { getDb, getRequestByRequestId, recordAudit } from "./db";

vi.mock("./db", () => ({
  getDb: vi.fn(),
  getRequestByRequestId: vi.fn(),
  recordAudit: vi.fn(),
  getAnalyticsSeries: vi.fn(),
  listAuditEvents: vi.fn(),
  listPendingApprovals: vi.fn(),
  listRequests: vi.fn(),
  transitionRequest: vi.fn(),
}));
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";
import { assertPropagationAllowed, createDcsAcknowledgment, assertTransition, CHECKS, validateRequest, VOR_STATUSES, type Role, type ValidationResult } from "./vor";

function contextFor(role: Role = "operator", active = 1): TrpcContext {
  return {
    user: { id: role === "admin" ? 1 : 2, openId: `${role}-integration`, name: null, email: `${role}@integration.test`, loginMethod: "manus", role, active, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() },
    req: { protocol: "https", headers: {} } as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

const passingValidation = CHECKS.map((checkType, index) => ({ checkType, result: "PASS" as const, ruleId: `VOR.RULE.${String(index + 1).padStart(2, "0")}`, actualValue: "VALID", expectedValue: "VALID", explanation: "Integration fixture passed." })) as ValidationResult;
const dbWithChecks = (checks: ValidationResult) => ({ select: () => ({ from: () => ({ where: async () => checks }) }) });

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getDb).mockResolvedValue(dbWithChecks(passingValidation) as never);
  vi.mocked(recordAudit).mockResolvedValue(undefined);
});

describe("VoR gateway integration contract", () => {
  it("returns the authenticated server session through auth.me", async () => {
    const caller = appRouter.createCaller(contextFor("operator"));
    await expect(caller.auth.me()).resolves.toMatchObject({ openId: "operator-integration", role: "operator", active: 1 });
  });

  it("enforces RBAC at the server procedure boundary", async () => {
    const operator = appRouter.createCaller(contextFor("operator"));
    const admin = appRouter.createCaller(contextFor("admin"));
    await expect(operator.configuration.policy()).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(admin.configuration.policy()).resolves.toMatchObject({ roles: ["operator", "supervisor", "engineer", "admin"] });
  });

  it("recognizes all five lifecycle statuses and keeps terminal states closed", () => {
    expect(VOR_STATUSES).toEqual(["ACCEPTED", "REJECTED", "PENDING_OPERATOR", "DUPLICATED", "EXPIRED"]);
    expect(VOR_STATUSES).toHaveLength(5);
    for (const status of ["ACCEPTED", "REJECTED", "DUPLICATED", "EXPIRED"] as const) {
      expect(() => assertTransition(status, "PENDING_OPERATOR")).toThrow(/Illegal VoR transition/);
    }
    for (const outcome of ["ACCEPTED", "REJECTED", "DUPLICATED", "EXPIRED"] as const) {
      expect(() => assertTransition("PENDING_OPERATOR", outcome)).not.toThrow();
    }
  });

  it("short-circuits validation at the first failed check", () => {
    const result = validateRequest({ equipmentExists: true, signatureValid: true, unitValid: true, duplicate: false, expiresAt: 200, now: 100, requestedValue: 99, hardLow: 0, hardHigh: 80, silClass: "SIL-0", requiresApproval: false, rocWithinLimit: true, interlockActive: false });
    expect(result).toHaveLength(6);
    expect(result.at(-1)).toMatchObject({ checkType: "RANGE_CHECK", result: "FAIL" });
  });

  it("blocks propagation for non-accepted status and failed evidence", () => {
    expect(() => assertPropagationAllowed("PENDING_OPERATOR", passingValidation)).toThrow(/Propagation blocked/);
    expect(() => assertPropagationAllowed("ACCEPTED", [{ ...passingValidation[0], result: "FAIL" } as ValidationResult[number]])).toThrow(/validation evidence/);
  });

  it("creates a DCS acknowledgment only after accepted, passing validation", () => {
    const acknowledgedAt = new Date("2026-08-24T09:00:00.000Z");
    expect(createDcsAcknowledgment("VOR-INTEGRATION-001", "ACCEPTED", passingValidation, acknowledgedAt)).toEqual({ requestId: "VOR-INTEGRATION-001", adapter: "DCS_SIMULATOR", status: "ACKNOWLEDGED", acknowledgedAt });
    expect(() => createDcsAcknowledgment("VOR-INTEGRATION-002", "REJECTED", passingValidation, acknowledgedAt)).toThrow(/Propagation blocked/);
  });

  it("executes the protected DCS acknowledgment procedure for accepted passing requests", async () => {
    vi.mocked(getRequestByRequestId).mockResolvedValue({ id: 77, requestId: "VOR-INTEGRATION-001", status: "ACCEPTED" } as never);
    const caller = appRouter.createCaller(contextFor("supervisor"));
    await expect(caller.dcs.acknowledge({ requestId: "VOR-INTEGRATION-001" })).resolves.toMatchObject({ requestId: "VOR-INTEGRATION-001", adapter: "DCS_SIMULATOR", status: "ACKNOWLEDGED" });
    expect(recordAudit).toHaveBeenCalledOnce();
  });

  it("blocks the protected DCS procedure for non-accepted and failed-evidence requests", async () => {
    const caller = appRouter.createCaller(contextFor("supervisor"));
    vi.mocked(getRequestByRequestId).mockResolvedValue({ id: 78, requestId: "VOR-INTEGRATION-002", status: "REJECTED" } as never);
    await expect(caller.dcs.acknowledge({ requestId: "VOR-INTEGRATION-002" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    vi.mocked(getRequestByRequestId).mockResolvedValue({ id: 79, requestId: "VOR-INTEGRATION-003", status: "ACCEPTED" } as never);
    vi.mocked(getDb).mockResolvedValue(dbWithChecks([{ ...passingValidation[0], result: "FAIL" } as ValidationResult[number]]) as never);
    await expect(caller.dcs.acknowledge({ requestId: "VOR-INTEGRATION-003" })).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(recordAudit).not.toHaveBeenCalled();
  });

  it("rejects inactive authenticated users before protected data access", async () => {
    const inactive = appRouter.createCaller(contextFor("operator", 0));
    await expect(inactive.systemHealth.summary()).rejects.toMatchObject({ code: "UNAUTHORIZED" });
    await expect(inactive.dcs.acknowledge({ requestId: "VOR-INTEGRATION-001" })).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });
});
