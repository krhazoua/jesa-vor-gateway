import { describe, expect, it } from "vitest";
import superjson from "superjson";

describe("Configuration mutation response contracts", () => {
  it("round-trips normalized policy and governance responses", () => {
    const payloads = [
      { id: 1, warningDays: 30, criticalDays: 7, updatedBy: 1, updatedAt: new Date() },
      { trustAnchorId: 4, subject: "CN=Engineering CA", fingerprint: "AA:BB", status: "ACTIVE", rotationEvidenceRecorded: true },
      { retirementId: 5, anchorId: 4, replacementAnchorId: 6, action: "RETIRED", referenceId: "ROT-2026-001", chainValidation: "OLD_ANCHOR_BLOCKED" },
      { activationId: 7, status: "READY_READ_ONLY", plantWriteEnabled: false, connectionOpened: false, fatSatReference: "FAT-SAT-001" },
      { gateId: 8, status: "ARMED_FOR_FAT_SAT", reconciliationRunId: 9, authoritySourceRef: "MASTER-001", plantWriteEnabled: false },
    ];

    for (const payload of payloads) {
      const roundTrip = superjson.deserialize(superjson.serialize(payload));
      expect(roundTrip).toEqual(payload);
      expect(JSON.stringify(roundTrip)).not.toContain("BigInt");
    }
  });
});
