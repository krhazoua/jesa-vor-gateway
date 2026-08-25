import { describe, expect, it } from "vitest";
import { canRetireTrustAnchor, evaluateCertificateExpiry, hasDualIndependentApproval, validateCertificateChain, validateExpiryPolicy, validateTrustAnchor } from "./certificateTrust";

describe("certificate trust governance", () => {
  it("rejects malformed trust-anchor evidence", () => {
    const result = validateTrustAnchor(Buffer.from("not a certificate"), "AA:BB:CC:DD:EE:FF:00:11");
    expect(result.valid).toBe(false);
    expect(result.reason).toContain("parseable X.509");
  });

  it("blocks a certificate chain when no active trust anchor matches", () => {
    const result = validateCertificateChain(Buffer.from("not a certificate"), "AA:BB:CC:DD:EE:FF:00:11", []);
    expect(result.status).toBe("INVALID");
  });

  it("requires two distinct actors with valid approved chains", () => {
    const one = [{ actorId: 1, decision: "APPROVED" as const, chainStatus: "VALID" as const }];
    const twoSameActor = [...one, { actorId: 1, decision: "APPROVED" as const, chainStatus: "VALID" as const }];
    const twoIndependent = [...one, { actorId: 2, decision: "APPROVED" as const, chainStatus: "VALID" as const }];
    expect(hasDualIndependentApproval(one)).toBe(false);
    expect(hasDualIndependentApproval(twoSameActor)).toBe(false);
    expect(hasDualIndependentApproval(twoIndependent)).toBe(true);
  });

  it("ignores rejected or invalid sign-offs when checking quorum", () => {
    expect(hasDualIndependentApproval([
      { actorId: 1, decision: "APPROVED", chainStatus: "INVALID" },
      { actorId: 2, decision: "REJECTED", chainStatus: "VALID" },
      { actorId: 3, decision: "APPROVED", chainStatus: "VALID" },
    ])).toBe(false);
  });

  it("classifies certificate expiry against operator-configured windows", () => {
    const now = new Date("2026-08-25T00:00:00.000Z");
    expect(evaluateCertificateExpiry("2026-09-30T00:00:00.000Z", 30, 7, now).state).toBe("VALID");
    expect(evaluateCertificateExpiry("2026-09-10T00:00:00.000Z", 30, 7, now).state).toBe("EXPIRING_SOON");
    expect(evaluateCertificateExpiry("2026-08-30T00:00:00.000Z", 30, 7, now).state).toBe("CRITICAL");
    expect(evaluateCertificateExpiry("2026-08-24T00:00:00.000Z", 30, 7, now).state).toBe("EXPIRED");
  });

  it("rejects invalid expiry policy ordering and bounds", () => {
    expect(validateExpiryPolicy(30, 7)).toBe(true);
    expect(validateExpiryPolicy(7, 30)).toBe(false);
    expect(validateExpiryPolicy(3651, 7)).toBe(false);
    expect(validateExpiryPolicy(30.5, 7)).toBe(false);
  });

  it("allows retirement only with an active, distinct, unexpired replacement and verified rotation", () => {
    const now = new Date("2026-08-25T00:00:00.000Z").getTime();
    expect(canRetireTrustAnchor({ anchorStatus: "ACTIVE", replacementStatus: "ACTIVE", hasVerifiedRotation: true, replacementExpiresAt: "2026-09-25T00:00:00.000Z", now })).toBe(true);
    expect(canRetireTrustAnchor({ anchorStatus: "RETIRED", replacementStatus: "ACTIVE", hasVerifiedRotation: true, now })).toBe(false);
    expect(canRetireTrustAnchor({ anchorStatus: "ACTIVE", replacementStatus: "ACTIVE", hasVerifiedRotation: false, now })).toBe(false);
    expect(canRetireTrustAnchor({ anchorStatus: "ACTIVE", replacementStatus: "ACTIVE", hasVerifiedRotation: true, replacementExpiresAt: "2026-08-24T00:00:00.000Z", now })).toBe(false);
  });
});
