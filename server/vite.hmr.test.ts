import { describe, expect, it } from "vitest";
import { resolveHmrClientPort } from "./_core/vite";

describe("resolveHmrClientPort", () => {
  it("preserves a valid managed application port", () => {
    expect(resolveHmrClientPort(3000)).toBe(3000);
    expect(resolveHmrClientPort(4567)).toBe(4567);
  });

  it("falls back safely for invalid port values", () => {
    expect(resolveHmrClientPort(0)).toBe(3000);
    expect(resolveHmrClientPort(-1)).toBe(3000);
    expect(resolveHmrClientPort(65_536)).toBe(3000);
    expect(resolveHmrClientPort(Number.NaN)).toBe(3000);
  });
});
