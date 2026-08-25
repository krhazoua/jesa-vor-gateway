import { AlertTriangle, CheckCircle2, LockKeyhole, Network, RefreshCw, ShieldCheck, WifiOff } from "lucide-react";
import { trpc } from "@/lib/trpc";

type Props = { compact?: boolean };

export type AdapterState = {
  mode: string;
  status: string;
  readOnly: boolean;
  endpointConfigured: boolean;
  securityPolicy: string;
  maxSnapshotAgeMs: number;
  tagAllowlistCount: number;
  writeEnabled: boolean;
  lastSnapshotAt: Date | string | null;
  failure: string;
};

export const stateCopy: Record<string, { label: string; tone: string; description: string }> = {
  HEALTHY: { label: "HEALTHY", tone: "adapter-good", description: "Fresh read-only snapshot available." },
  STALE: { label: "STALE DATA", tone: "adapter-warn", description: "Latest snapshot exceeds the configured age limit." },
  DISCONNECTED: { label: "DISCONNECTED", tone: "adapter-warn", description: "No plant endpoint is configured." },
  TIMEOUT: { label: "TIMEOUT", tone: "adapter-warn", description: "Edge endpoint did not respond within the contract window." },
  CONFIGURATION_ERROR: { label: "CONFIGURATION ERROR", tone: "adapter-bad", description: "Adapter configuration requires engineering review." },
  AUTHENTICATION_ERROR: { label: "AUTHENTICATION ERROR", tone: "adapter-bad", description: "Edge identity could not be authenticated." },
  UNAVAILABLE: { label: "UNAVAILABLE", tone: "adapter-bad", description: "Edge endpoint is not available." },
};

export function formatAdapterAge(ms: number) {
  if (ms < 60_000) return `${Math.round(ms / 1_000)}s`;
  return `${Math.round(ms / 60_000)}m`;
}

export function isSimulationMode(mode: string) {
  return mode.toUpperCase().includes("SIMUL");
}

export type EdgeAdapterCardModel = { kind: "loading" | "error" | "ready"; label: string; description: string; tone?: string; adapter?: AdapterState; stateLabel?: string; stateTone?: string; writeLabel?: string };

export function getEdgeAdapterCardModel(input: { isLoading: boolean; isError: boolean; adapter?: AdapterState | null }): EdgeAdapterCardModel {
  if (input.isLoading) return { kind: "loading", label: "READING ADAPTER STATE…", description: "" };
  if (input.isError || !input.adapter) return { kind: "error", label: "Health unavailable", description: "Protected system-health data could not be read. No plant action is available.", tone: "adapter-bad" };
  const presentation = stateCopy[input.adapter.status] || stateCopy.UNAVAILABLE;
  return { kind: "ready", label: "Read-only plant boundary", description: presentation.description, adapter: input.adapter, stateLabel: presentation.label, stateTone: presentation.tone, writeLabel: input.adapter.writeEnabled || !input.adapter.readOnly ? "BLOCKED BY POLICY" : "DISABLED" };
}

export default function EdgeAdapterHealthCard({ compact = false }: Props) {
  const healthQuery = trpc.systemHealth.summary.useQuery(undefined, { retry: false, refetchInterval: 15_000 });
  const model = getEdgeAdapterCardModel({ isLoading: healthQuery.isLoading, isError: healthQuery.isError, adapter: healthQuery.data?.dcs as AdapterState | undefined });
  if (model.kind === "loading") return <section className={`edge-adapter-card ${compact ? "compact" : ""}`} aria-label="Edge adapter health"><div className="edge-adapter-loading"><RefreshCw size={15} /> {model.label}</div></section>;
  if (model.kind === "error") return <section className={`edge-adapter-card ${compact ? "compact" : ""}`} aria-label="Edge adapter health"><div className="edge-adapter-card-head"><div><span className="eyebrow">DCS / EDGE ADAPTER</span><h2>{model.label}</h2></div><AlertTriangle size={17} className="adapter-icon-bad" /></div><p className="edge-adapter-description">{model.description}</p></section>;

  const adapter = model.adapter!;
  const state = stateCopy[adapter.status] || stateCopy.UNAVAILABLE;
  const Icon = adapter.status === "HEALTHY" ? CheckCircle2 : adapter.status === "DISCONNECTED" ? WifiOff : AlertTriangle;
  return <section className={`edge-adapter-card ${compact ? "compact" : ""}`} aria-label="Edge adapter health and configuration">
    <div className="edge-adapter-card-head"><div><span className="eyebrow">DCS / EDGE ADAPTER</span><h2>Read-only plant boundary</h2></div><div className={`adapter-state ${state.tone}`}><Icon size={14} /> {state.label}</div></div>
    <p className="edge-adapter-description">{state.description}</p>
    {isSimulationMode(adapter.mode) && <div className="edge-adapter-simulation" role="status">SIMULATION MODE · READ-ONLY PREVIEW</div>}
    <div className="edge-adapter-config"><div><span>MODE</span><strong>{adapter.mode.replaceAll("_", " ")}</strong></div><div><span>SECURITY</span><strong>{adapter.securityPolicy.replaceAll("_", " ")}</strong></div><div><span>SNAPSHOT AGE</span><strong>{formatAdapterAge(adapter.maxSnapshotAgeMs)}</strong></div><div><span>ALLOWLIST</span><strong>{adapter.tagAllowlistCount} TAGS</strong></div></div>
    <div className="edge-adapter-guard"><span><ShieldCheck size={13} /> WRITE PATH</span><strong><LockKeyhole size={12} /> {model.writeLabel}</strong></div>
    {!compact && <div className="edge-adapter-foot"><span><Network size={12} /> ENDPOINT {adapter.endpointConfigured ? "CONFIGURED" : "NOT CONFIGURED"}</span><span>{adapter.lastSnapshotAt ? `LAST SNAPSHOT ${new Date(adapter.lastSnapshotAt).toLocaleTimeString()}` : "NO SNAPSHOT RECEIVED"}</span></div>}
  </section>;
}
