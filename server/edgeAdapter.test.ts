import { describe, expect, it } from "vitest";
import {
  assertReadOnlyEdgeAdapter,
  createDisconnectedReadOnlyEdgeAdapter,
  disconnectedEdgeAdapterConfig,
  evaluateSnapshotHealth,
  getEdgeAdapterHealth,
  mapEdgeFailure,
  validateEdgeAdapterConfig,
} from "./edgeAdapter";

describe("read-only edge adapter contract", () => {
  it("boots disconnected with no endpoint and no write capability", async () => {
    const adapter = createDisconnectedReadOnlyEdgeAdapter();
    expect(adapter.config).toEqual(disconnectedEdgeAdapterConfig);
    expect(adapter.getHealth()).toBe("DISCONNECTED");
    expect(assertReadOnlyEdgeAdapter(adapter.config)).toBe(true);
    await expect(adapter.readSnapshot()).resolves.toMatchObject({
      ok: false,
      health: "DISCONNECTED",
      source: "EDGE_READ_ONLY",
      retryable: false,
    });
  });

  it("rejects live configuration unless an endpoint and mutual TLS are present", () => {
    expect(() => validateEdgeAdapterConfig({ ...disconnectedEdgeAdapterConfig, mode: "LIVE_READ_ONLY", endpoint: null, securityPolicy: "DISABLED" })).toThrow(/requires an edge endpoint/);
    expect(() => validateEdgeAdapterConfig({ ...disconnectedEdgeAdapterConfig, mode: "LIVE_READ_ONLY", endpoint: "https://edge.example.test", securityPolicy: "DISABLED" })).toThrow(/requires mutual TLS/);
    expect(validateEdgeAdapterConfig({ ...disconnectedEdgeAdapterConfig, mode: "LIVE_READ_ONLY", endpoint: "https://edge.example.test", securityPolicy: "MUTUAL_TLS" })).toMatchObject({ mode: "LIVE_READ_ONLY", writeEnabled: false });
  });

  it("rejects an endpoint in disconnected mode and any write capability", () => {
    expect(() => validateEdgeAdapterConfig({ ...disconnectedEdgeAdapterConfig, endpoint: "https://edge.example.test" })).toThrow(/cannot include an edge endpoint/);
    expect(() => validateEdgeAdapterConfig({ ...disconnectedEdgeAdapterConfig, writeEnabled: true })).toThrow();
    expect(() => assertReadOnlyEdgeAdapter({ ...disconnectedEdgeAdapterConfig, writeEnabled: true })).toThrow(/write capability is prohibited/);
  });

  it("classifies snapshots as healthy or stale using the configured age limit", () => {
    const now = new Date("2026-08-24T12:00:00.000Z");
    expect(evaluateSnapshotHealth(new Date("2026-08-24T11:59:45.000Z"), now, 30_000)).toBe("HEALTHY");
    expect(evaluateSnapshotHealth(new Date("2026-08-24T11:59:29.000Z"), now, 30_000)).toBe("STALE");
  });

  it("maps adapter failures into explicit health and retry behavior", () => {
    expect(mapEdgeFailure("TIMEOUT")).toEqual({ health: "TIMEOUT", retryable: true });
    expect(mapEdgeFailure("AUTHENTICATION_ERROR")).toEqual({ health: "AUTHENTICATION_ERROR", retryable: false });
    expect(mapEdgeFailure("unexpected")).toEqual({ health: "UNAVAILABLE", retryable: true });
  });

  it("exposes a truthful protected-health payload for the disconnected boundary", () => {
    expect(getEdgeAdapterHealth()).toEqual({
      mode: "DISCONNECTED_READ_ONLY",
      status: "DISCONNECTED",
      readOnly: true,
      endpointConfigured: false,
      lastSnapshotAt: null,
      failure: "DISCONNECTED",
    });
  });
});
