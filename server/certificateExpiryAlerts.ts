import type { NotificationEvent } from "./notifications";

export type ExpiringAnchor = {
  id: number;
  subject: string;
  fingerprint: string;
  expiresAt: Date | string | null;
  expiry: { state: "VALID" | "EXPIRING_SOON" | "CRITICAL" | "EXPIRED" | "UNKNOWN"; daysRemaining: number | null };
};

export function buildCertificateExpiryAlert(anchor: ExpiringAnchor): Omit<NotificationEvent, "recipientId"> | null {
  if (anchor.expiry.state !== "EXPIRING_SOON" && anchor.expiry.state !== "CRITICAL") return null;
  const critical = anchor.expiry.state === "CRITICAL";
  const expires = anchor.expiresAt ? new Date(anchor.expiresAt).toISOString() : "unknown";
  const days = anchor.expiry.daysRemaining;
  return {
    type: "CERTIFICATE_EXPIRY",
    severity: critical ? "CRITICAL" : "WARNING",
    title: critical ? "Trust-anchor expiry is critical" : "Trust-anchor expiry warning",
    message: `${anchor.subject} (${anchor.fingerprint}) expires in ${days ?? "an unknown number of"} day${days === 1 ? "" : "s"}. ${critical ? "Rotate and verify the replacement before chain validation is blocked." : "Plan a verified trust-anchor rotation."}`,
    dedupeKey: `certificate-expiry:${anchor.id}:${anchor.expiry.state}:${expires}`,
  };
}
