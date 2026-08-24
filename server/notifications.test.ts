import { beforeEach, describe, expect, it, vi } from "vitest";
import { buildNotificationRows, isNotificationOwner, notificationReadResult, persistNotificationRows, publishNotification, publishNotifications, registerNotificationStream, subscribeToNotifications, type NotificationEvent } from "./notifications";

const event: NotificationEvent = { recipientId: 11, type: "APPROVAL_REQUIRED", severity: "WARNING", title: "Approval required", message: "VOR-TEST requires review.", requestId: 42 };

describe("real-time notification bus", () => {
  beforeEach(() => vi.restoreAllMocks());

  it("delivers an event only to the subscribed recipient", () => {
    const operator = vi.fn();
    const supervisor = vi.fn();
    const unsubscribeOperator = subscribeToNotifications(11, operator);
    const unsubscribeSupervisor = subscribeToNotifications(12, supervisor);
    publishNotification(event);
    expect(operator).toHaveBeenCalledWith(event);
    expect(supervisor).not.toHaveBeenCalled();
    unsubscribeOperator();
    unsubscribeSupervisor();
  });

  it("builds persisted rows with exact recipients and event metadata", () => {
    expect(buildNotificationRows([{ id: 11 }, { id: 12 }], event)).toEqual([{ ...event, recipientId: 11 }, { ...event, recipientId: 12 }]);
    expect(buildNotificationRows([{ id: 11 }], { ...event, type: "STATE_CHANGED", severity: "INFO", requestId: 42 })).toMatchObject([{ recipientId: 11, type: "STATE_CHANGED", severity: "INFO", requestId: 42 }]);
  });

  it("captures persisted rows with recipient, event, severity, and request linkage", async () => {
    let inserted: unknown;
    const rows = await persistNotificationRows(async next => { inserted = next; }, [{ id: 11 }, { id: 12 }], event);
    expect(inserted).toEqual(rows);
    expect(rows).toEqual(expect.arrayContaining([expect.objectContaining({ recipientId: 11, type: "APPROVAL_REQUIRED", severity: "WARNING", requestId: 42 }), expect.objectContaining({ recipientId: 12, type: "APPROVAL_REQUIRED", severity: "WARNING", requestId: 42 })]));
  });

  it("enforces read ownership by recipient identity", () => {
    expect(isNotificationOwner(11, 11)).toBe(true);
    expect(isNotificationOwner(11, 12)).toBe(false);
  });

  it("returns true only for an owned notification with one affected row", () => {
    expect(notificationReadResult(11, 11, 1)).toEqual({ updated: true });
    expect(notificationReadResult(11, 12, 1)).toEqual({ updated: false });
    expect(notificationReadResult(11, 11, 0)).toEqual({ updated: false });
  });

  it("stops delivery after unsubscribe and fans out batches", () => {
    const listener = vi.fn();
    const unsubscribe = subscribeToNotifications(11, listener);
    unsubscribe();
    publishNotifications([event, { ...event, title: "State changed", type: "STATE_CHANGED" }]);
    expect(listener).not.toHaveBeenCalled();
  });

  it("serves an authenticated SSE handshake and delivers recipient events", async () => {
    let handler: ((req: any, res: any) => void) | undefined;
    const app = { get: (_path: string, next: (req: any, res: any) => void) => { handler = next; } };
    const writes: string[] = [];
    const closeHandlers: Array<() => void> = [];
    const response = { status: () => response, set: () => response, write: (value: string) => { writes.push(value); } };
    const request = { on: (_event: string, callback: () => void) => closeHandlers.push(callback) };
    await registerNotificationStream(app, async () => ({ id: 11, role: "operator", active: 1 }));
    await handler?.(request, response);
    expect(writes[0]).toContain("event: ready");
    publishNotification(event);
    expect(writes.some(write => write.includes("event: notification") && write.includes("VOR-TEST"))).toBe(true);
    closeHandlers.forEach(close => close());
  });

  it("rejects unauthenticated streams and leaves polling as the fallback contract", async () => {
    let handler: ((req: any, res: any) => void) | undefined;
    const app = { get: (_path: string, next: (req: any, res: any) => void) => { handler = next; } };
    const end = vi.fn();
    const response = { status: () => response, end };
    await registerNotificationStream(app, async () => null);
    await handler?.({}, response);
    expect(end).toHaveBeenCalledOnce();
    expect(end.mock.instances.length).toBeGreaterThan(0);
  });
});
