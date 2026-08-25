import { describe, expect, it } from "vitest";
import { getEdgeAdapterCardModel, formatAdapterAge, isSimulationMode, type AdapterState } from "./EdgeAdapterHealthCard";

const adapter = (overrides: Partial<AdapterState> = {}): AdapterState => ({
  mode: "DISCONNECTED_READ_ONLY",
  status: "DISCONNECTED",
  readOnly: true,
  endpointConfigured: false,
  securityPolicy: "DISABLED",
  maxSnapshotAgeMs: 30_000,
  tagAllowlistCount: 0,
  writeEnabled: false,
  lastSnapshotAt: null,
  failure: "DISCONNECTED",
  ...overrides,
});

describe("EdgeAdapterHealthCard presentation contract", () => {
  it("formats snapshot age in operational units", () => {
    expect(formatAdapterAge(30_000)).toBe("30s");
    expect(formatAdapterAge(120_000)).toBe("2m");
  });

  it("identifies simulator modes without treating them as production data", () => {
    expect(isSimulationMode("DCS_SIMULATOR_READ_ONLY")).toBe(true);
    expect(isSimulationMode("DISCONNECTED_READ_ONLY")).toBe(false);
  });

  it("renders an explicit loading state", () => {
    expect(getEdgeAdapterCardModel({ isLoading: true, isError: false })).toMatchObject({ kind: "loading", label: "READING ADAPTER STATE…" });
  });

  it("renders a protected health error state", () => {
    expect(getEdgeAdapterCardModel({ isLoading: false, isError: true })).toMatchObject({ kind: "error", label: "Health unavailable", description: expect.stringContaining("No plant action") });
  });

  it("renders the disconnected configuration and keeps the write path disabled", () => {
    const model = getEdgeAdapterCardModel({ isLoading: false, isError: false, adapter: adapter() });
    expect(model).toMatchObject({ kind: "ready", stateLabel: "DISCONNECTED", stateTone: "adapter-warn", writeLabel: "DISABLED" });
    expect(model.adapter).toMatchObject({ mode: "DISCONNECTED_READ_ONLY", securityPolicy: "DISABLED", tagAllowlistCount: 0 });
  });

  it("renders healthy and stale state semantics from the same configuration contract", () => {
    expect(getEdgeAdapterCardModel({ isLoading: false, isError: false, adapter: adapter({ status: "HEALTHY", endpointConfigured: true, securityPolicy: "MUTUAL_TLS", tagAllowlistCount: 12 }) })).toMatchObject({ stateLabel: "HEALTHY", stateTone: "adapter-good" });
    expect(getEdgeAdapterCardModel({ isLoading: false, isError: false, adapter: adapter({ status: "STALE" }) })).toMatchObject({ stateLabel: "STALE DATA", stateTone: "adapter-warn" });
  });

  it("never presents a write-enabled adapter as safe", () => {
    expect(getEdgeAdapterCardModel({ isLoading: false, isError: false, adapter: adapter({ writeEnabled: true, readOnly: false }) })).toMatchObject({ writeLabel: "BLOCKED BY POLICY" });
  });
});
