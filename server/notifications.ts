export type NotificationEvent = {
  recipientId: number;
  type: "STATE_CHANGED" | "APPROVAL_REQUIRED";
  severity: "INFO" | "WARNING" | "CRITICAL";
  title: string;
  message: string;
  requestId?: number;
};

type Listener = (event: NotificationEvent) => void;
const listeners = new Map<number, Set<Listener>>();

export function subscribeToNotifications(recipientId: number, listener: Listener) {
  const current = listeners.get(recipientId) ?? new Set<Listener>();
  current.add(listener);
  listeners.set(recipientId, current);
  return () => {
    current.delete(listener);
    if (!current.size) listeners.delete(recipientId);
  };
}

export function publishNotification(event: NotificationEvent) {
  listeners.get(event.recipientId)?.forEach(listener => listener(event));
}

export function publishNotifications(events: NotificationEvent[]) {
  events.forEach(publishNotification);
}

export function buildNotificationRows(recipients: Array<{ id: number }>, event: Omit<NotificationEvent, "recipientId">) {
  return recipients.map(recipient => ({ ...event, recipientId: recipient.id }));
}

export function isNotificationOwner(recipientId: number, notificationRecipientId: number) {
  return recipientId === notificationRecipientId;
}

export function notificationReadResult(recipientId: number, notificationRecipientId: number, affectedRows: number) {
  return { updated: affectedRows === 1 && isNotificationOwner(recipientId, notificationRecipientId) };
}

export async function persistNotificationRows(insert: (rows: ReturnType<typeof buildNotificationRows>) => Promise<unknown>, recipients: Array<{ id: number }>, event: Omit<NotificationEvent, "recipientId">) {
  const rows = buildNotificationRows(recipients, event);
  if (rows.length) await insert(rows);
  return rows;
}

export async function registerNotificationStream(app: { get: (path: string, handler: (req: any, res: any) => void) => void }, authenticate: (req: any) => Promise<{ id: number; role: string; active: number } | null>) {
  app.get("/api/notifications/stream", async (req, res) => {
    const user = await authenticate(req).catch(() => null);
    if (!user || user.active !== 1 || !["operator", "supervisor"].includes(user.role)) {
      res.status(401).end();
      return;
    }
    res.status(200).set({ "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" });
    res.write(`event: ready\\ndata: {"recipientId":${user.id}}\\n\\n`);
    const unsubscribe = subscribeToNotifications(user.id, event => res.write(`event: notification\\ndata: ${JSON.stringify(event)}\\n\\n`));
    const heartbeat = setInterval(() => res.write(": heartbeat\\n\\n"), 20_000);
    req.on("close", () => { clearInterval(heartbeat); unsubscribe(); });
  });
}
