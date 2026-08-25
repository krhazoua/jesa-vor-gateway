import { describe, expect, it } from "vitest";
import { advanceSimulation, getSimulationControlLabel } from "@/lib/operationsSimulation";

const baseRequests = [
  { id: "VOR-1", time: "08:42:19" },
  { id: "VOR-2", time: "23:59:59" },
] as const;

describe("simulated update stream controls", () => {
  it("offers pause while the stream is running", () => {
    expect(getSimulationControlLabel(false)).toBe("PAUSE STREAM");
  });

  it("offers resume while the stream is paused", () => {
    expect(getSimulationControlLabel(true)).toBe("RESUME STREAM");
  });
});

describe("bounded simulated gateway state", () => {
  it("advances telemetry, request recency, and synchronization time deterministically", () => {
    const initial = advanceSimulation(baseRequests, 0);
    const next = advanceSimulation(baseRequests, 1);

    expect(next.syncLabel).toBe("08:42:25");
    expect(next.requests[0].time).toBe("08:42:22");
    expect(next.requests[1].time).toBe("00:00:02");
    expect(next.telemetry.temperature).not.toBe(initial.telemetry.temperature);
    expect(next.requests.map(request => request.id)).toEqual(["VOR-1", "VOR-2"]);
  });

  it("wraps the simulation clock after a bounded 120-tick window", () => {
    const first = advanceSimulation(baseRequests, 0);
    const wrapped = advanceSimulation(baseRequests, 120);

    expect(wrapped.syncLabel).toBe(first.syncLabel);
    expect(wrapped.requests[0].time).toBe(first.requests[0].time);
  });
});
