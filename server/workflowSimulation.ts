import { randomUUID } from "node:crypto";

export const SIMULATION_SOURCE_IDENTITY = "E2E_SIMULATION" as const;
export const SIMULATION_OPERATOR_OPEN_ID = "e2e-simulation-operator" as const;
export const SIMULATION_EQUIPMENT_TAG = "E2E-ATTACK-REACTOR" as const;
export const SIMULATION_VARIABLE_TAG = "E2E-TIC-5210" as const;

export const simulationStages = ["SUBMIT", "VALIDATE", "APPROVE", "AUDIT"] as const;
export type SimulationStage = typeof simulationStages[number];

export function createSimulationRequestId(now = new Date()) {
  const day = now.toISOString().slice(0, 10).replaceAll("-", "");
  return `E2E-${day}-${randomUUID().slice(0, 8).toUpperCase()}`;
}

export function buildSimulationTrace(requestId: string, auditEventCount: number, notificationCount: number) {
  return {
    requestId,
    sourceIdentity: SIMULATION_SOURCE_IDENTITY,
    stages: simulationStages.map(stage => ({ stage, status: "COMPLETED" as const })),
    auditEventCount,
    notificationCount,
    boundary: "NO_PLANT_WRITE / DISCONNECTED DCS EDGE" as const,
  };
}
