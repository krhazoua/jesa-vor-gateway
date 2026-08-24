export const NOTIFICATION_POLL_INTERVAL_MS = 15_000;

export type NotificationRefreshMode = "SSE" | "POLL";

export function notificationRefreshMode(eventSourceAvailable: boolean): NotificationRefreshMode {
  return eventSourceAvailable ? "SSE" : "POLL";
}

export async function refreshUnreadNotifications(
  eventSourceAvailable: boolean,
  refetch: () => Promise<unknown>,
) {
  if (!eventSourceAvailable) await refetch();
  return notificationRefreshMode(eventSourceAvailable);
}
