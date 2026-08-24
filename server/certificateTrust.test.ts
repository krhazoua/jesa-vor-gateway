import { describe, expect, it } from "vitest";
import { hasDualIndependentApproval, validateCertificateChain, validateTrustAnchor } from "./certificateTrust";

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
});
