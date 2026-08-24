import { describe, expect, it } from "vitest";
import { complianceEvidence } from "./routers";

describe("configuration-backed NE178 compliance evidence", () => {
  it("returns all six stages with protected sources and explicit gates", () => {
    const evidence = complianceEvidence();
    expect(evidence).toHaveLength(6);
    expect(evidence.every(row => row.source.length > 0 && row.evidence.length > 0)).toBe(true);
    expect(evidence.filter(row => row.gated).map(row => row.step)).toEqual([4, 6]);
    expect(evidence.find(row => row.step === 4)?.status).toBe("GATED");
    expect(evidence.find(row => row.step === 5)?.source).toContain("approvals");
  });
});
