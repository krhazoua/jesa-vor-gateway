import { describe, expect, it } from "vitest";
import {
  resolveHmrClientPort,
  shouldDisableManagedHmr,
  stripManagedHmrClient,
} from "./_core/vite";

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

  it("disables unstable managed-preview HMR while preserving local HMR", () => {
    expect(shouldDisableManagedHmr({ MANUS_WEBDEV_PROJECT_ID: "project-1" })).toBe(true);
    expect(shouldDisableManagedHmr({ MANUS_WEBDEV_PROJECT_ID: undefined })).toBe(false);
  });

  it("strips only the managed Vite bootstrap scripts", () => {
    const html = '<script type="module" src="/@vite/client"></script><main>VoR</main>';
    expect(stripManagedHmrClient(html, true)).toBe("<main>VoR</main>");
    expect(stripManagedHmrClient(html, false)).toBe(html);
  });
});
