import { describe, expect, it } from "vitest";
import {
  backendUnavailableCopy,
  CONNECTION_CHECK_BUSY_LABEL,
  CONNECTION_CHECK_LABEL,
  isBackendUnavailable,
} from "./backendStatus";

describe("backend status", () => {
  it("recognizes transport failures but not authorization errors", () => {
    expect(isBackendUnavailable(new Error("Gateway connection could not be established. Please retry the request."))).toBe(true);
    expect(isBackendUnavailable(new Error("Gateway returned an incomplete tRPC response. Please retry the request."))).toBe(true);
    expect(isBackendUnavailable(new Error("Please login (10001)"))).toBe(false);
    expect(isBackendUnavailable(undefined)).toBe(false);
  });

  it("exposes stable accessible manual-check labels", () => {
    expect(CONNECTION_CHECK_LABEL).toBe("CHECK CONNECTION");
    expect(CONNECTION_CHECK_BUSY_LABEL).toBe("CHECKING…");
  });

  it("keeps the fallback language explicitly read-only", () => {
    expect(backendUnavailableCopy(true).body).toContain("safe read-only fallback");
    expect(backendUnavailableCopy(false).body).toContain("write actions are paused");
  });
});
