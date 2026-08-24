import { describe, expect, it } from "vitest";
import { diffCatalogRows, type EquipmentImportRow, type VariableImportRow } from "./catalogImport";
import { appRouter } from "./routers";

describe("diffCatalogRows", () => {
  it("marks an identical authoritative equipment file as matched but still pending external sign-off", () => {
    const row: EquipmentImportRow = { tag: "ATTACK-01", name: "Attack Reactor", processArea: "ATTACK_REACTOR", sourceRef: "PAP-MASTER-REV-A" };
    expect(diffCatalogRows("EQUIPMENT", [row], [{ ...row, id: 7 } as EquipmentImportRow], "PAP-MASTER-REV-A")).toMatchObject({ status: "MATCHED", fatSatGate: "PENDING_EXTERNAL_SIGNOFF", matchedCount: 1, addedCount: 0, changedCount: 0, removedCount: 0 });
  });

  it("reports added, changed, and removed variables without mutation semantics", () => {
    const existing: VariableImportRow = { tag: "TIC-5210", name: "Old Name", variableType: "PV", unit: "°C", hardLow: "70", hardHigh: "80", warningLow: null, warningHigh: null, criticalLow: null, criticalHigh: null, silClass: "SIL-0", dcsMapping: "DCS.OLD", sourceRef: "PAP-MASTER-REV-A" };
    const changed: VariableImportRow = { ...existing, name: "Reactor Temperature", dcsMapping: "DCS.NEW" };
    const added: VariableImportRow = { ...existing, tag: "TIC-5211" };
    const diff = diffCatalogRows("VARIABLE", [changed, added], [existing, { ...existing, tag: "TIC-5209" }], "PAP-MASTER-REV-A");
    expect(diff.status).toBe("MISMATCH");
    expect(diff.fatSatGate).toBe("BLOCKED");
    expect(diff.changedCount).toBe(1);
    expect(diff.addedCount).toBe(1);
    expect(diff.removedCount).toBe(1);
  });

  it("blocks a file whose rows do not carry the selected authority reference", () => {
    const row: EquipmentImportRow = { tag: "ATTACK-01", name: "Attack Reactor", processArea: "ATTACK_REACTOR", sourceRef: "UNVERIFIED" };
    const diff = diffCatalogRows("EQUIPMENT", [row], [], "PAP-MASTER-REV-A");
    expect(diff.status).toBe("BLOCKED");
    expect(diff.fatSatGate).toBe("BLOCKED");
    expect(diff.differences.some(item => item.kind === "SOURCE_MISMATCH")).toBe(true);
  });

  it("does not allow an operator role to initiate authoritative reconciliation", async () => {
    const caller = appRouter.createCaller({ user: { id: 10, role: "operator", active: 1 } as any, req: { ip: "127.0.0.1", headers: {} } as any, res: {} as any });
    await expect(caller.catalog.reconcile({ recordType: "EQUIPMENT", authoritySourceRef: "PAP-MASTER-REV-A", filename: "authority.csv", source: "tag,name,processArea,sourceRef\nATTACK-01,Attack Reactor,ATTACK_REACTOR,PAP-MASTER-REV-A" })).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
