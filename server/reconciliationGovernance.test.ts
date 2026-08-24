import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";

const contextFor = (role: "operator" | "engineer" | "admin") => ({ user: { id: 11, role, active: 1 } as any, req: { ip: "127.0.0.1", headers: {} } as any, res: {} as any });

const signoffInput = { reconciliationRunId: 1, certificateSubject: "CN=External Reviewer", certificateFingerprint: "AA:BB:CC:DD:EE:FF:00:11", certificateFile: `data:text/plain;base64,${"Y".repeat(64)}`, referenceId: "FAT-SAT-REF-001", referenceFile: `data:text/plain;base64,${"Y".repeat(64)}`, decision: "APPROVED" as const };

describe("reconciliation governance boundaries", () => {
  it("rejects malformed certificate fingerprints before persistence or storage", async () => {
    const caller = appRouter.createCaller(contextFor("engineer"));
    await expect(caller.catalog.signoff({ ...signoffInput, certificateFingerprint: "not-a-fingerprint" })).rejects.toMatchObject({ code: "BAD_REQUEST" });
  });

  it("does not allow operators to capture external sign-off", async () => {
    const caller = appRouter.createCaller(contextFor("operator"));
    await expect(caller.catalog.signoff(signoffInput)).rejects.toMatchObject({ code: "FORBIDDEN" });
  });

  it("does not allow engineers to arm the authoritative master gate", async () => {
    const caller = appRouter.createCaller(contextFor("engineer"));
    await expect(caller.catalog.armMaster({ reconciliationRunId: 1 })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
