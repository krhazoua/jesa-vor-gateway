import { describe, expect, it, vi, beforeEach } from "vitest";
import { createAndPublishNotifications, getDb, getRequestByRequestId, recordAudit } from "./db";
import { auditEvents, equipment, validationChecks, variables, vorRequests } from "../drizzle/schema";

vi.mock("./db", () => ({
  getDb: vi.fn(),
  getRequestByRequestId: vi.fn(),
  recordAudit: vi.fn(),
  createAndPublishNotifications: vi.fn(),
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
const dbWithChecks = (checks: ValidationResult[]) => ({ select: () => ({ from: () => ({ where: async () => checks }) }) });
const catalogEquipment = { id: 10, tag: "P-521", name: "Attack Reactor", processArea: "PAP", sourceRef: "CATALOG" };
const catalogVariable = { id: 20, tag: "AIC-5214", name: "Free sulfate", variableType: "SP", unit: "g/L", hardLow: "25", hardHigh: "30", warningLow: null, warningHigh: null, criticalLow: null, criticalHigh: null, silClass: "SIL-1" as const, dcsMapping: "DCS.AIC-5214.SP", sourceRef: "CATALOG" };
function dbForCreate(captured: { validation?: unknown[]; audit?: unknown[] }, failRange = false) {
  const request = { id: 91, requestId: "VOR-20260824-TEST1234", sourceUc: "UC1", sourceIdentity: "APC_GATEWAY", department: "OPERATIONS", equipmentId: 10, variableId: 20, requesterId: 2, currentPv: "27", requestedSp: failRange ? "35" : "28", priority: "NORMAL" as const, ttlSeconds: 900, certificateSubject: "CN=APC-GATEWAY", status: failRange ? "REJECTED" as const : "PENDING_OPERATOR" as const, createdAt: new Date(), updatedAt: new Date() };
  const select = () => ({ from: (table: unknown) => ({ where: () => ({ limit: async () => table === equipment ? [catalogEquipment] : table === variables ? [catalogVariable] : table === vorRequests ? [request] : [] }), then: (resolve: (value: unknown) => unknown) => Promise.resolve(table === equipment ? [catalogEquipment] : table === variables ? [catalogVariable] : []).then(resolve) }) });
  const tx = { select, insert: (table: unknown) => ({ values: async (values: unknown) => { if (table === validationChecks) captured.validation = values as unknown[]; if (table === auditEvents) captured.audit = values as unknown[]; } }) };
  return { select, insert: tx.insert, transaction: async (callback: (transaction: typeof tx) => Promise<unknown>) => callback(tx) };
}

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getDb).mockResolvedValue(dbWithChecks(passingValidation) as never);
  vi.mocked(recordAudit).mockResolvedValue(undefined);
  vi.mocked(createAndPublishNotifications).mockResolvedValue([] as never);
});

describe("VoR gateway integration contract", () => {
  it("creates a pending request with validation and audit evidence", async () => {
    const captured: { validation?: unknown[]; audit?: unknown[] } = {};
    vi.mocked(getDb).mockResolvedValue(dbForCreate(captured) as never);
    const caller = appRouter.createCaller(contextFor("operator"));
    const result = await caller.requests.create({ sourceUc: "UC1", department: "OPERATIONS", equipmentId: 10, variableId: 20, currentPv: 27, requestedSp: 28, priority: "NORMAL", ttlSeconds: 900, certificateSubject: "CN=APC-GATEWAY", sourceIdentity: "APC_GATEWAY" });
    expect(result.request.status).toBe("PENDING_OPERATOR");
    expect(result.validation).toHaveLength(9);
    expect(captured.validation).toHaveLength(9);
    expect(captured.audit).toMatchObject({ action: "REQUEST_CREATED", newState: "PENDING_OPERATOR", module: "APC" });
  });

  it("persists a rejected request when server validation fails", async () => {
    const captured: { validation?: unknown[]; audit?: unknown[] } = {};
    vi.mocked(getDb).mockResolvedValue(dbForCreate(captured, true) as never);
    const caller = appRouter.createCaller(contextFor("operator"));
    const result = await caller.requests.create({ sourceUc: "UC1", department: "OPERATIONS", equipmentId: 10, variableId: 20, currentPv: 27, requestedSp: 35, priority: "HIGH", ttlSeconds: 900, certificateSubject: "CN=APC-GATEWAY", sourceIdentity: "APC_GATEWAY" });
    expect(result.request.status).toBe("REJECTED");
    expect(result.validation.at(-1)).toMatchObject({ checkType: "RANGE_CHECK", result: "FAIL" });
    expect(captured.audit).toMatchObject({ result: "REJECTED" });
  });

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
