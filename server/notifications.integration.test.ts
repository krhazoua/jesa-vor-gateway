import { beforeEach, describe, expect, it, vi } from "vitest";
import { appRouter } from "./routers";
import { createAndPublishNotifications, getDb, getRequestByRequestId, markNotificationRead, transitionRequest } from "./db";
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
  markNotificationRead: vi.fn(),
  recordAudit: vi.fn(),
  transitionRequest: vi.fn(),
}));

function contextFor(role: "operator" | "supervisor" = "supervisor"): TrpcContext {
  return { user: { id: 7, openId: "notification-integration", name: null, email: "notification@test", loginMethod: "manus", role, active: 1, createdAt: new Date(), updatedAt: new Date(), lastSignedIn: new Date() }, req: { protocol: "https", headers: {}, ip: "127.0.0.1" } as TrpcContext["req"], res: {} as TrpcContext["res"] };
}

const request = { id: 91, requestId: "VOR-NOTIFY-001", requesterId: 7, status: "PENDING_OPERATOR" };
const dbFixture = { select: () => ({ from: () => ({ where: () => ({ limit: async () => [] }) }) }), insert: () => ({ values: async () => undefined }) };

describe("notification event integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getDb).mockResolvedValue(dbFixture as never);
    vi.mocked(getRequestByRequestId).mockResolvedValue(request as never);
    vi.mocked(createAndPublishNotifications).mockResolvedValue([]);
    vi.mocked(transitionRequest).mockResolvedValue([{ ...request, status: "ACCEPTED" }] as never);
    vi.mocked(markNotificationRead).mockResolvedValue({ updated: true });
  });

  it("emits a state-change notification from the protected transition procedure", async () => {
    const caller = appRouter.createCaller(contextFor("supervisor"));
    await caller.requests.transition({ requestId: request.requestId, toStatus: "ACCEPTED", reason: "Validated by supervisor" });
    expect(transitionRequest).toHaveBeenCalledOnce();
    expect(createAndPublishNotifications).toHaveBeenCalledWith(expect.objectContaining({ requestId: request.id, type: "STATE_CHANGED", severity: "INFO" }));
  });

  it("emits an approval-required notification when the requester raises approval", async () => {
    const caller = appRouter.createCaller(contextFor("operator"));
    await caller.approvals.raise({ requestId: request.requestId });
    expect(createAndPublishNotifications).toHaveBeenCalledWith(expect.objectContaining({ requestId: request.id, type: "APPROVAL_REQUIRED", severity: "WARNING" }));
  });

  it("forwards read-state changes with the authenticated recipient id", async () => {
    const caller = appRouter.createCaller(contextFor("operator"));
    await caller.notifications.markRead({ notificationId: 301 });
    expect(markNotificationRead).toHaveBeenCalledWith(7, 301);
  });

  it("returns false when the authenticated recipient does not own the notification", async () => {
    vi.mocked(markNotificationRead).mockResolvedValue({ updated: false });
    const caller = appRouter.createCaller(contextFor("operator"));
    const result = await caller.notifications.markRead({ notificationId: 999 });
    expect(result).toEqual({ updated: false });
    expect(markNotificationRead).toHaveBeenCalledWith(7, 999);
  });
});
