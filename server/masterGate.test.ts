import { describe, expect, it } from "vitest";
import { normalizeMasterGate } from "./db";

describe("masterGate query contract", () => {
  it("normalizes an absent gate to null instead of undefined", () => {
    expect(normalizeMasterGate(undefined)).toBeNull();
  });

  it("preserves an armed gate record", () => {
    const gate = { id: 7, status: "ARMED_FOR_FAT_SAT" as const, activatedAt: new Date("2026-08-25T07:00:00.000Z") };
    expect(normalizeMasterGate(gate)).toEqual(gate);
  });
});
