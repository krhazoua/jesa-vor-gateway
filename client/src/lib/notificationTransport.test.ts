import { describe, expect, it, vi } from "vitest";
import { notificationRefreshMode, NOTIFICATION_POLL_INTERVAL_MS, refreshUnreadNotifications } from "./notificationTransport";

describe("notification transport fallback", () => {
  it("uses SSE when EventSource is available", () => {
    expect(notificationRefreshMode(true)).toBe("SSE");
  });

  it("refetches unread alerts when realtime transport is unavailable", async () => {
    const refetch = vi.fn().mockResolvedValue({ data: [{ id: 7 }] });
    const mode = await refreshUnreadNotifications(false, refetch);
    expect(mode).toBe("POLL");
    expect(refetch).toHaveBeenCalledOnce();
    expect(NOTIFICATION_POLL_INTERVAL_MS).toBe(15_000);
  });
});
