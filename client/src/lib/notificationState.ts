export type NotificationStateRow = { readAt: Date | null };

export function getUnreadNotifications<T extends NotificationStateRow>(rows: T[]) {
  return rows.filter(row => row.readAt === null);
}
