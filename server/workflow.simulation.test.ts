import { beforeEach, describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import { getDb } from "./db";
import type { TrpcContext } from "./_core/context";

vi.mock("./db", () => ({
  createAndPublishNotifications: vi.fn(),
  getAnalyticsSeries: vi.fn(),
  getDb: vi.fn(),
  getRequestByRequestId: vi.fn(),
  listAuditEvents: vi.fn(),
  listNotifications: vi.fn(),
  listPendingApprovals: vi.fn(),
  listRequests: vi.fn(),
  markAllNotificationsRead: vi.fn(),
  markNotificationRead: vi.fn(),
  recordAudit: vi.fn(),
  transitionRequest: vi.fn(),
}));

function contextFor(role: "admin" | "operator" = "admin"): TrpcContext {
  return { user: { id: 41, openId: "workflow-simulation-admin", name: null, email: "workflow-simulation@test", loginMethod: "manus", role, active: 1, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() }, req: { protocol: "https", headers: {}, ip: "127.0.0.1" } as TrpcContext["req"], res: {} as TrpcContext["res"] };
}

function buildSimulationDb() {
  let selectCount = 0;
  const inserted: Array<{ table: unknown; values: unknown }> = [];
  const updates: Array<{ table: unknown; values: unknown }> = [];
  const operator = { id: 77, openId: "e2e-simulation-operator", role: "operator", active: 1 };
  const equipment = { id: 88, tag: "E2E-ATTACK-REACTOR" };
  const variable = { id: 99, tag: "E2E-TIC-5210", unit: "°C", hardLow: "71", hardHigh: "80", silClass: "SIL-1" };
  const request = { id: 111, requestId: "E2E-20260824-TEST", status: "PENDING_OPERATOR" };
  const tx = {
    select: () => {
      selectCount += 1;
      const current = selectCount;
      const builder = {
        from: () => builder,
        where: () => builder,
        limit: async () => current === 1 ? [] : current === 2 ? [operator] : current === 3 ? [] : current === 4 ? [equipment] : current === 5 ? [] : current === 6 ? [variable] : current === 7 ? [request] : [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }],
        then: (resolve: (value: unknown[]) => unknown) => Promise.resolve(current === 8 ? [{ id: operator.id }] : [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }]).then(resolve),
      };
      return builder;
    },
    insert: (table: unknown) => ({ values: async (values: unknown) => { inserted.push({ table, values }); } }),
    update: (table: unknown) => ({ set: (values: unknown) => ({ where: async () => { updates.push({ table, values }); } }) }),
  };
  return { transaction: async <T>(callback: (transaction: typeof tx) => Promise<T>) => callback(tx), inserted, updates };
}

describe("seeded workflow simulation", () => {
  beforeEach(() => vi.clearAllMocks());

  it("runs Submit, nine-step Validate, four-eyes Approve, and Audit as one controlled simulation", async () => {
    const simulationDb = buildSimulationDb();
    vi.mocked(getDb).mockResolvedValue(simulationDb as never);
    const result = await appRouter.createCaller(contextFor("admin")).workflow.simulate();

    expect(result.finalStatus).toBe("ACCEPTED");
    expect(result.validationCheckCount).toBe(9);
    expect(result.fourEyes).toBe(true);
    expect(result.stages.map(stage => stage.stage)).toEqual(["SUBMIT", "VALIDATE", "APPROVE", "AUDIT"]);
    expect(result.sourceIdentity).toBe("E2E_SIMULATION");
    expect(result.boundary).toContain("NO_PLANT_WRITE");
    expect(simulationDb.inserted.some(item => JSON.stringify(item.values).includes("E2E_SIMULATION"))).toBe(true);
    expect(simulationDb.updates.some(item => JSON.stringify(item.values).includes("ACCEPTED"))).toBe(true);
  });

  it("does not expose the seed action to operators", async () => {
    const simulationDb = buildSimulationDb();
    vi.mocked(getDb).mockResolvedValue(simulationDb as never);
    await expect(appRouter.createCaller(contextFor("operator")).workflow.simulate()).rejects.toMatchObject({ code: "FORBIDDEN" });
    expect(simulationDb.inserted).toHaveLength(0);
  });
});
