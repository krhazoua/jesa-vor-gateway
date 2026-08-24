import { describe, expect, it } from "vitest";
import { getUnreadNotifications } from "./notificationState";

describe("getUnreadNotifications", () => {
  it("keeps only persisted alerts without a read timestamp", () => {
    const unread = { id: 1, readAt: null };
    const acknowledged = { id: 2, readAt: new Date("2026-08-24T15:00:00.000Z") };

    expect(getUnreadNotifications([unread, acknowledged])).toEqual([unread]);
  });

  it("returns an empty list when all persisted alerts are acknowledged", () => {
    expect(getUnreadNotifications([{ id: 1, readAt: new Date() }])).toEqual([]);
  });
});
