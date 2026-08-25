import { describe, expect, it } from "vitest";
import { buildCertificateExpiryAlert } from "./certificateExpiryAlerts";

describe("certificate expiry notifications", () => {
  const anchor = { id: 12, subject: "CN=Engineering CA", fingerprint: "AA:BB", expiresAt: "2026-09-01T00:00:00.000Z" };

  it("creates a warning with a stable deduplication key", () => {
    const alert = buildCertificateExpiryAlert({ ...anchor, expiry: { state: "EXPIRING_SOON", daysRemaining: 7 } });
    expect(alert?.severity).toBe("WARNING");
    expect(alert?.type).toBe("CERTIFICATE_EXPIRY");
    expect(alert?.dedupeKey).toContain("certificate-expiry:12:EXPIRING_SOON");
  });

  it("creates a critical alert with remediation guidance", () => {
    const alert = buildCertificateExpiryAlert({ ...anchor, expiry: { state: "CRITICAL", daysRemaining: 2 } });
    expect(alert?.severity).toBe("CRITICAL");
    expect(alert?.message).toContain("Rotate and verify");
  });

  it("suppresses valid and expired states", () => {
    expect(buildCertificateExpiryAlert({ ...anchor, expiry: { state: "VALID", daysRemaining: 80 } })).toBeNull();
    expect(buildCertificateExpiryAlert({ ...anchor, expiry: { state: "EXPIRED", daysRemaining: -1 } })).toBeNull();
  });
});
