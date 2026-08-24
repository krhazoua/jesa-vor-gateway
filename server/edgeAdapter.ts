import { z } from "zod";

export const edgeAdapterConfigSchema = z.object({
  mode: z.enum(["DISCONNECTED_READ_ONLY", "LIVE_READ_ONLY"]),
  endpoint: z.string().url().nullable(),
  securityPolicy: z.enum(["DISABLED", "MUTUAL_TLS"]),
  maxSnapshotAgeMs: z.number().int().positive().max(86_400_000),
  tagAllowlist: z.array(z.string().min(1)).max(500),
  writeEnabled: z.literal(false),
});

export type EdgeAdapterConfig = z.infer<typeof edgeAdapterConfigSchema>;
export type EdgeAdapterHealth = "DISCONNECTED" | "HEALTHY" | "STALE" | "TIMEOUT" | "CONFIGURATION_ERROR" | "AUTHENTICATION_ERROR" | "UNAVAILABLE";
export type EdgeFailureCode = Exclude<EdgeAdapterHealth, "HEALTHY">;

export type ProcessSnapshot = {
  capturedAt: Date;
  values: Record<string, { value: number | string | boolean; unit?: string; quality: "GOOD" | "UNCERTAIN" | "BAD" }>;
  interlocks: { tag: string; active: boolean; quality: "GOOD" | "UNCERTAIN" | "BAD" }[];
};

export type EdgeSnapshotResult =
  | { ok: true; health: "HEALTHY"; snapshot: ProcessSnapshot; source: "EDGE_READ_ONLY" }
  | { ok: false; health: EdgeFailureCode; source: "EDGE_READ_ONLY"; reason: string; retryable: boolean };

export interface ReadOnlyEdgeAdapter {
  readonly config: EdgeAdapterConfig;
  getHealth(): EdgeAdapterHealth;
  readSnapshot(): Promise<EdgeSnapshotResult>;
}

export const disconnectedEdgeAdapterConfig: EdgeAdapterConfig = {
  mode: "DISCONNECTED_READ_ONLY",
  endpoint: null,
  securityPolicy: "DISABLED",
  maxSnapshotAgeMs: 30_000,
  tagAllowlist: [],
  writeEnabled: false,
};

export function validateEdgeAdapterConfig(input: unknown): EdgeAdapterConfig {
  const parsed = edgeAdapterConfigSchema.safeParse(input);
  if (!parsed.success) throw new Error(`Invalid edge adapter configuration: ${parsed.error.issues.map(issue => issue.path.join(".") + " " + issue.message).join("; ")}`);
  if (parsed.data.mode === "LIVE_READ_ONLY" && !parsed.data.endpoint) throw new Error("Live read-only mode requires an edge endpoint");
  if (parsed.data.mode === "LIVE_READ_ONLY" && parsed.data.securityPolicy !== "MUTUAL_TLS") throw new Error("Live read-only mode requires mutual TLS");
  if (parsed.data.mode === "DISCONNECTED_READ_ONLY" && parsed.data.endpoint) throw new Error("Disconnected mode cannot include an edge endpoint");
  return parsed.data;
}

export function evaluateSnapshotHealth(capturedAt: Date, now = new Date(), maxSnapshotAgeMs = disconnectedEdgeAdapterConfig.maxSnapshotAgeMs): "HEALTHY" | "STALE" {
  return now.getTime() - capturedAt.getTime() <= maxSnapshotAgeMs ? "HEALTHY" : "STALE";
}

export function mapEdgeFailure(code: string): { health: EdgeFailureCode; retryable: boolean } {
  switch (code) {
    case "TIMEOUT": return { health: "TIMEOUT", retryable: true };
    case "STALE": return { health: "STALE", retryable: true };
    case "AUTHENTICATION_ERROR": return { health: "AUTHENTICATION_ERROR", retryable: false };
    case "CONFIGURATION_ERROR": return { health: "CONFIGURATION_ERROR", retryable: false };
    case "UNAVAILABLE": return { health: "UNAVAILABLE", retryable: true };
    default: return { health: "UNAVAILABLE", retryable: true };
  }
}

export function createDisconnectedReadOnlyEdgeAdapter(config: EdgeAdapterConfig = disconnectedEdgeAdapterConfig): ReadOnlyEdgeAdapter {
  const validated = validateEdgeAdapterConfig(config);
  return {
    config: validated,
    getHealth: () => "DISCONNECTED",
    async readSnapshot() {
      return { ok: false, health: "DISCONNECTED", source: "EDGE_READ_ONLY", reason: "No plant endpoint is configured; live OT connectivity is intentionally disabled.", retryable: false };
    },
  };
}

export function getEdgeAdapterHealth() {
  const adapter = createDisconnectedReadOnlyEdgeAdapter();
  return {
    mode: adapter.config.mode,
    status: adapter.getHealth(),
    readOnly: !adapter.config.writeEnabled,
    endpointConfigured: Boolean(adapter.config.endpoint),
    lastSnapshotAt: null as Date | null,
    failure: "DISCONNECTED" as const,
  };
}

export function assertReadOnlyEdgeAdapter(config: EdgeAdapterConfig) {
  if (config.writeEnabled !== false) throw new Error("Edge adapter write capability is prohibited in the read-only integration phase");
  return true;
}
