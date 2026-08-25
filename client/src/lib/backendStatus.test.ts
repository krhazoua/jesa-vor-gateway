import { describe, expect, it } from "vitest";
import { backendUnavailableCopy, isBackendUnavailable } from "./backendStatus";

describe("backend status", () => {
  it("recognizes transport failures but not authorization errors", () => {
    expect(isBackendUnavailable(new Error("Gateway connection could not be established. Please retry the request."))).toBe(true);
    expect(isBackendUnavailable(new Error("Gateway returned an incomplete tRPC response. Please retry the request."))).toBe(true);
    expect(isBackendUnavailable(new Error("Please login (10001)"))).toBe(false);
    expect(isBackendUnavailable(undefined)).toBe(false);
  });

  it("keeps the fallback language explicitly read-only", () => {
    expect(backendUnavailableCopy(true).body).toContain("safe read-only fallback");
    expect(backendUnavailableCopy(false).body).toContain("write actions are paused");
  });
});
