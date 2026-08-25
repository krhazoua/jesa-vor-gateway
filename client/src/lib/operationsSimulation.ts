export const getSimulationControlLabel = (paused: boolean) => paused ? "RESUME STREAM" : "PAUSE STREAM";

const formatSimulationClock = (totalSeconds: number) => {
  const normalized = ((totalSeconds % 86400) + 86400) % 86400;
  const hours = String(Math.floor(normalized / 3600)).padStart(2, "0");
  const minutes = String(Math.floor((normalized % 3600) / 60)).padStart(2, "0");
  const seconds = String(Math.floor(normalized % 60)).padStart(2, "0");
  return `${hours}:${minutes}:${seconds}`;
};

const clockToSeconds = (clock: string) => {
  const [hours, minutes, seconds] = clock.split(":").map(Number);
  return (hours * 3600) + (minutes * 60) + seconds;
};

/** Test-only compatibility helper for the explicitly labelled preview stream. The live Operations page does not consume this data. */
export const advanceSimulation = <T extends { time: string }>(baseRequests: readonly T[], tick: number) => {
  const boundedTick = ((tick % 120) + 120) % 120;
  const offsetSeconds = boundedTick * 3;
  const telemetry = {
    temperature: (75.8 + Math.sin(boundedTick / 2) * 0.2).toFixed(1),
    sulfate: (27.1 + Math.cos(boundedTick / 3) * 0.15).toFixed(1),
    p205: (28.2 + Math.sin(boundedTick / 4) * 0.1).toFixed(1),
    solids: (31.2 + Math.cos(boundedTick / 5) * 0.12).toFixed(1),
  };
  return {
    syncLabel: formatSimulationClock(clockToSeconds("08:42:22") + offsetSeconds),
    telemetry,
    requests: baseRequests.map(request => ({ ...request, time: formatSimulationClock(clockToSeconds(request.time) + offsetSeconds) })),
  };
};
