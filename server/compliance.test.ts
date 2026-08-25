import { describe, expect, it } from "vitest";
import { appRouter, complianceEvidence } from "./routers";
import type { TrpcContext } from "./_core/context";

const adminContext: TrpcContext = {
  user: {
    id: 1,
    openId: "compliance-test-admin",
    name: null,
    email: "admin@compliance.test",
    loginMethod: "test",
    role: "admin",
    active: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastSignedIn: new Date(),
  },
  req: { protocol: "https", headers: {} } as TrpcContext["req"],
  res: {} as TrpcContext["res"],
};

describe("configuration-backed NE178 compliance evidence", () => {
  it("returns all six stages with protected sources and explicit gates", () => {
    const evidence = complianceEvidence();
    expect(evidence).toHaveLength(6);
    expect(evidence.every(row => row.source.length > 0 && row.evidence.length > 0)).toBe(true);
    expect(evidence.filter(row => row.gated).map(row => row.step)).toEqual([4, 6]);
    expect(evidence.find(row => row.step === 4)?.status).toBe("GATED");
    expect(evidence.find(row => row.step === 5)?.source).toContain("approvals");
  });

  it("returns a defined result through the protected configuration query", async () => {
    const result = await appRouter.createCaller(adminContext).configuration.compliance();
    expect(result.generatedAt).toBeInstanceOf(Date);
    expect(result.evidence).toHaveLength(6);
  });
});
