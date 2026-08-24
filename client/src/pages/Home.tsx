/* Control Room Ledger: compact industrial density, semantic signal colors, visible traceability. */
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Activity, AlertTriangle, ArrowDownRight, ArrowUpRight, Bell, Check, ChevronRight, Circle,
  ClipboardCheck, Clock3, Database, FileText, Gauge, LockKeyhole, Menu, Network, Radar, Settings2,
  RefreshCw, Search, ShieldCheck, SlidersHorizontal, UserRound, X, Zap
} from "lucide-react";
import { toast } from "sonner";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { NOTIFICATION_POLL_INTERVAL_MS, refreshUnreadNotifications } from "@/lib/notificationTransport";
import EdgeAdapterHealthCard from "@/components/EdgeAdapterHealthCard";
import { identityCopy } from "@/lib/identityCopy";

const requests = [
  { id: "VOR-2026-0824-017", time: "08:42:19", source: "APC-ATTACK-01", variable: "Reactor temperature", tag: "TIC-5210", current: "75.8", requested: "76.4", unit: "°C", uc: "UC1", status: "ACCEPTED", sil: "SIL-0", delta: "+0.6" },
  { id: "VOR-2026-0824-016", time: "08:39:47", source: "APC-ATTACK-01", variable: "Free sulfate", tag: "AIC-5214", current: "27.1", requested: "28.0", unit: "g/L", uc: "UC1", status: "PENDING_OPERATOR", sil: "SIL-1", delta: "+0.9" },
  { id: "VOR-2026-0824-015", time: "08:31:05", source: "APC-ATTACK-01", variable: "Slurry solids", tag: "AIC-5218", current: "31.2", requested: "32.8", unit: "%", uc: "UC1", status: "REJECTED", sil: "SIL-0", delta: "+1.6" },
  { id: "VOR-2026-0824-014", time: "08:26:33", source: "APC-ATTACK-01", variable: "Reactor temperature", tag: "TIC-5210", current: "75.4", requested: "75.4", unit: "°C", uc: "UC1", status: "DUPLICATED", sil: "SIL-0", delta: "0.0" },
  { id: "VOR-2026-0824-013", time: "08:18:21", source: "APC-ATTACK-01", variable: "Flash cooler circulation", tag: "FIC-5230", current: "18,040", requested: "18,120", unit: "m³/h", uc: "UC1", status: "EXPIRED", sil: "SIL-0", delta: "+80" },
];

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

const checks = ["EQUIPMENT_CHECK", "SIGNATURE_CHECK", "UNIT_CHECK", "DUPLICATE_CHECK", "TTL_CHECK", "RANGE_CHECK", "SIL_CHECK", "ROC_CHECK", "INTERLOCK_CHECK"];
const nav = [
  { label: "Operations", icon: Activity, active: true, href: "/operations" }, { label: "Requests", icon: FileText, href: "/requests" },
  { label: "Approvals", icon: ClipboardCheck, href: "/approvals" }, { label: "Validation", icon: ShieldCheck, href: "/validation" },
  { label: "Audit trail", icon: Database, href: "/audit" }, { label: "System health", icon: Radar, href: "/system-health" }, { label: "Analytics", icon: Gauge, href: "/analytics" }, { label: "NE178 compliance", icon: ShieldCheck, href: "/compliance" }, { label: "Configuration", icon: Settings2, href: "/configuration" },
];

function Status({ value }: { value: string }) {
  const config: Record<string, { cls: string; label: string }> = {
    ACCEPTED: { cls: "status-green", label: "ACCEPTED" }, REJECTED: { cls: "status-red", label: "REJECTED" },
    PENDING_OPERATOR: { cls: "status-amber", label: "PENDING OPERATOR" }, DUPLICATED: { cls: "status-slate", label: "DUPLICATED" }, EXPIRED: { cls: "status-slate", label: "EXPIRED" },
  };
  const item = config[value] || config.ACCEPTED;
  return <span className={`status ${item.cls}`}><span className="status-dot" />{item.label}</span>;
}

export default function Home() {
  const [, navigate] = useLocation();
  const auth = useAuth();
  const notificationsQuery = trpc.notifications.list.useQuery({ unreadOnly: true }, { enabled: Boolean(auth.user), refetchInterval: NOTIFICATION_POLL_INTERVAL_MS, retry: false });
  const requestQuery = trpc.requests.list.useQuery(undefined, { enabled: Boolean(auth.user), retry: false });
  const catalogQuery = trpc.requests.catalog.useQuery(undefined, { enabled: Boolean(auth.user), retry: false });
  useEffect(() => { if (!auth.user) return; if (typeof EventSource === "undefined") { void refreshUnreadNotifications(false, notificationsQuery.refetch); return; } const stream = new EventSource("/api/notifications/stream"); const handle = (event: MessageEvent<string>) => { notificationsQuery.refetch(); try { const next = JSON.parse(event.data) as { title?: string; message?: string }; if (next.title) toast(`${next.title}: ${next.message || "Review required."}`); } catch { /* polling remains authoritative */ } }; stream.addEventListener("notification", handle); return () => { stream.removeEventListener("notification", handle); stream.close(); }; }, [auth.user?.id, notificationsQuery.refetch]);
  const previewAlerts = [{ id: -1, severity: "WARNING", title: "Approval required / preview", message: "Simulator alert preview — persisted alerts appear here when canonical rows exist.", createdAt: new Date() }];
  const visibleNotifications = notificationsQuery.data?.length ? notificationsQuery.data : previewAlerts;
  const unreadCount = visibleNotifications.length;
  const [selected, setSelected] = useState(requests[1]);
  const [drawer, setDrawer] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const requestSearchRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [paused, setPaused] = useState(false);
  const [simulationTick, setSimulationTick] = useState(0);
  useEffect(() => {
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false;
    if (paused || reducedMotion) return;
    let frame = 0;
    let last = performance.now();
    const advance = (now: number) => {
      if (now - last >= 2500) {
        setSimulationTick(current => current >= 119 ? 0 : current + 1);
        last = now;
      }
      frame = requestAnimationFrame(advance);
    };
    frame = requestAnimationFrame(advance);
    return () => cancelAnimationFrame(frame);
  }, [paused]);
  const simulation = useMemo(() => advanceSimulation(requests, simulationTick), [simulationTick]);
  const equipmentById = useMemo(() => new Map((catalogQuery.data?.equipment || []).map(item => [item.id, item])), [catalogQuery.data]);
  const variableById = useMemo(() => new Map((catalogQuery.data?.variables || []).map(item => [item.id, item])), [catalogQuery.data]);
  const canonicalRequests = useMemo(() => (requestQuery.data || []).map(row => { const equipment = equipmentById.get(row.equipmentId); const variable = variableById.get(row.variableId); const deltaValue = Number(row.requestedSp) - Number(row.currentPv); return { id: row.requestId, time: new Date(row.createdAt).toISOString().slice(11, 19), source: row.sourceUc, variable: variable?.name || `Variable ${row.variableId}`, tag: variable?.tag || String(row.variableId), current: String(row.currentPv), requested: String(row.requestedSp), unit: variable?.unit || "—", uc: row.sourceUc, status: row.status, sil: variable?.silClass || "—", delta: Number.isFinite(deltaValue) ? `${deltaValue >= 0 ? "+" : ""}${deltaValue}` : "—", equipment: equipment?.tag || String(row.equipmentId) }; }), [equipmentById, variableById, requestQuery.data]);
  const operationalRequests = canonicalRequests.length ? canonicalRequests : simulation.requests;
  const operationalSource = canonicalRequests.length ? "CANONICAL DB / READ-ONLY" : "ISOLATED SIMULATOR BASELINE";
  const operationalStats = useMemo(() => {
    const total = operationalRequests.length;
    const count = (status: string) => operationalRequests.filter(row => row.status === status).length;
    const accepted = count("ACCEPTED");
    return { total, accepted, rejected: count("REJECTED"), pending: count("PENDING_OPERATOR"), duplicated: count("DUPLICATED"), expired: count("EXPIRED"), acceptanceRate: total ? ((accepted / total) * 100).toFixed(1) : "0.0" };
  }, [operationalRequests]);
  const filtered = useMemo(() => operationalRequests.filter(r => Object.values(r).join(" ").toLowerCase().includes(query.toLowerCase())), [query, operationalRequests]);
  const selectRequest = (r: typeof requests[number]) => { setSelected(r); setDrawer(true); };

  return (
    <div className="app-shell">
      <aside className={`sidebar ${mobileNavOpen ? "mobile-open" : ""}`}>
        <div className="brand-block"><div className="brand-lockup"><img src="/manus-storage/jesa-wordmark_e357ca66.png" className="jesa-logo" alt="JESA" /></div><div className="brand-rule" /><div><div className="eyebrow">DIGITAL ENGINEERING</div><div className="brand-sub">VoR GATEWAY / PAP</div></div></div>
        <div className="plant-selector"><div className="eyebrow">ACTIVE SYSTEM</div><div className="plant-name">Attack Reactor <ChevronRight size={14} /></div><div className="plant-meta"><span className="amber-dot" />EDGE ADAPTER DISCONNECTED · READ-ONLY</div></div>
        <nav className="nav-list">{nav.filter(item => item.href !== "/configuration" || auth.user?.role === "admin").map(item => <Link href={item.href} key={item.label} onClick={() => setMobileNavOpen(false)} className={`nav-item ${item.active ? "active" : ""}`}><item.icon size={16} /><span>{item.label}</span></Link>)}</nav>
        <div className="sidebar-foot"><div className="zone-card"><div className="eyebrow">SECURITY ZONES</div><div className="zone-row"><span className="zone-dot blue" />MODULE 3 · psM+O <Check size={13} /></div><div className="zone-row"><span className="zone-dot amber" />MODULE 2 · DMZ <Check size={13} /></div><div className="zone-row"><span className="zone-dot green" />MODULE 1 · CPC <Check size={13} /></div></div><div className="user-row"><div className="avatar">OP</div><div><strong>{identityCopy.operatorDisplay}</strong><small>{identityCopy.operatorLabel}</small></div><button className="user-logout" onClick={() => auth.logout().then(() => navigate("/login"))} aria-label="Log out"><LockKeyhole size={14} /></button></div></div>
      </aside>

      <main className={`main-content ${paused ? "simulation-paused" : ""}`}>
        <header className="topbar"><div className="breadcrumb"><span>JESA / DIGITAL ENGINEERING</span><ChevronRight size={13} /><strong>OPERATIONS</strong></div><div className="top-actions"><div className="system-pulse"><span className="live-dot" /> GATEWAY ONLINE · EDGE DISCONNECTED</div><button className="icon-btn notification-trigger" aria-label="Notifications" onClick={() => toast(unreadCount ? `${unreadCount} unread operating alert${unreadCount === 1 ? "" : "s"}.` : "No unread operating alerts.")}><Bell size={17} />{Boolean(unreadCount) && <b>{unreadCount}</b>}<i /></button><button className="icon-btn" onClick={() => toast(identityCopy.sessionToast)}><LockKeyhole size={16} /></button><button className="menu-btn" aria-label="Toggle navigation" aria-expanded={mobileNavOpen} onClick={() => setMobileNavOpen(open => !open)}><Menu size={18} /></button></div></header>
        <div className="notification-tray"><div className="notification-tray-head"><span><span className="live-dot" /> {unreadCount} UNREAD OPERATING ALERT{unreadCount === 1 ? "" : "S"}</span><small>{notificationsQuery.data?.length ? "REAL-TIME CHANNEL" : "SIMULATOR PREVIEW / NO PERSISTED ALERTS"}</small></div>{visibleNotifications.slice(0, 3).map(notification => <button key={notification.id} className={`notification-item notification-${notification.severity.toLowerCase()}`} onClick={() => toast(notification.id === -1 ? "Preview alert only. Persisted alerts can be acknowledged from the notification tray." : `${notification.title} marked for review.`)}><strong>{notification.title}</strong><span>{notification.message}</span><small>{new Date(notification.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })} · CLICK TO ACKNOWLEDGE</small></button>)}</div>
        <div className="content-wrap">
          <section className="page-heading"><div><div className="eyebrow cobalt">PAP ATTACK REACTOR / CONTROL SYSTEM</div><h1>Verification of Request <span className="muted">/</span> Operations</h1><p>Secure request governance between APC and the DCS adapter. Every write is verified, mapped, and traceable.</p><div className="lineage-strip"><span className="lineage-label">REQUEST LINEAGE</span><strong>APC</strong><ChevronRight size={12} /><strong className="lineage-active">MODULE 3 / psM+O</strong><ChevronRight size={12} /><strong className="lineage-active">MODULE 2 / DMZ</strong><ChevronRight size={12} /><strong>MODULE 1 / CPC</strong><ChevronRight size={12} /><strong>DCS ADAPTER</strong></div></div><div className="heading-meta"><div className="meta-label">LAST SYNCHRONIZED</div><div className="mono">{simulation.syncLabel} UTC <RefreshCw size={13} /></div><div className="sim-label"><span className="amber-dot" /> SIMULATION STREAM · PAUSABLE</div></div></section>

          <section className="kpi-strip">
            <div className="kpi"><div className="kpi-label">REQUESTS / CURRENT QUERY <span className="trend"><Database size={12} /> {operationalSource}</span></div><strong>{operationalStats.total}</strong><small>records available to this session</small></div>
            <div className="kpi"><div className="kpi-label">ACCEPTANCE RATE <span className="trend"><ArrowUpRight size={13} /> DERIVED</span></div><strong>{operationalStats.acceptanceRate}<span className="unit">%</span></strong><small>{operationalStats.accepted} accepted / {operationalStats.total} total</small></div>
            <div className="kpi"><div className="kpi-label">PENDING APPROVAL <span className="trend warn">ACTION REQUIRED</span></div><strong className="amber-text">{String(operationalStats.pending).padStart(2, "0")}</strong><small>four-eyes review required</small></div>
            <div className="kpi"><div className="kpi-label">STATE DISTRIBUTION <span className="trend"><Clock3 size={12} /> LIVE QUERY</span></div><strong>{operationalStats.rejected + operationalStats.duplicated + operationalStats.expired}</strong><small>{operationalStats.rejected} rejected · {operationalStats.duplicated} duplicated · {operationalStats.expired} expired</small></div>
          </section>

          <div className="section-label"><span className="live-line-marker" /><span>LIVE REQUEST MONITOR</span><span className="sim-stream-tag"><span className="live-dot" /> SIMULATED UPDATE STREAM</span><span className="section-line" /><button className={`pause-btn ${paused ? "paused" : ""}`} onClick={() => setPaused(!paused)}>{getSimulationControlLabel(paused)}</button></div>
          <section className="workbench">
            <div className="requests-panel panel"><div className="panel-head"><div><h2>Recent requests</h2><span className="panel-caption">APC → DMZ → CPC / newest first</span></div><div className="panel-tools"><div className="search"><Search size={14} /><input ref={requestSearchRef} placeholder="Filter requests" value={query} onChange={e => setQuery(e.target.value)} /></div><button className="filter-btn" onClick={() => requestSearchRef.current?.focus()}><SlidersHorizontal size={14} /> Filter</button></div></div><div className="request-table sim-request-stream"><div className="table-head"><span className="stream-scanline" /><span>REQUEST / TIME</span><span>SOURCE</span><span>VARIABLE / TAG</span><span>Δ REQUEST</span><span>DECISION</span></div>{filtered.map(r => <button className={`request-row ${selected.id === r.id ? "selected" : ""}`} key={r.id} onClick={() => selectRequest(r)}><div><strong className="mono">{r.id}</strong><small>{r.time} UTC</small></div><div className="mono source">{r.source}</div><div><strong>{r.variable}</strong><small className="mono">{r.tag} · {r.uc}</small></div><div className={`mono delta ${r.delta.startsWith("+") ? "positive" : ""}`}>{r.delta} {r.unit}</div><Status value={r.status} /></button>)}</div><div className="panel-foot"><span>Showing {filtered.length} of {operationalStats.total} records · {operationalSource}</span><button onClick={() => navigate("/requests")}>VIEW REQUEST ARCHIVE <ChevronRight size={13} /></button></div></div>

            <aside className="decision-panel panel decision-rail"><div className="panel-head"><span className="rail-label">DECISION RAIL</span><div><h2>Gateway posture</h2><span className="panel-caption">LOCAL BASELINE · READ-ONLY</span></div><span className="signal-badge"><span className="live-dot" /> ONLINE</span></div><div className="posture-visual"><div className="ring"><div><strong>09</strong><span>CHECKS</span></div></div><div><div className="posture-title">Verification engine</div><div className="posture-copy">All mandatory checks available. No active interlocks.</div></div></div><div className="metric-list telemetry-stream"><div><span>Reactor temperature</span><strong className="telemetry-value">{simulation.telemetry.temperature} <em>°C</em></strong></div><div><span>Free sulfate</span><strong className="telemetry-value">{simulation.telemetry.sulfate} <em>g/L</em></strong></div><div><span>P<sub>2</sub>O<sub>5</sub></span><strong className="telemetry-value">{simulation.telemetry.p205} <em>%</em></strong></div><div><span>Slurry solids</span><strong className="telemetry-value">{simulation.telemetry.solids} <em>%</em></strong></div></div><div className="posture-note"><AlertTriangle size={14} /><span>01 request requires operator approval before propagation.</span></div><EdgeAdapterHealthCard compact /><button className="primary-btn" onClick={() => navigate("/approvals")}>OPEN APPROVAL QUEUE <ChevronRight size={15} /></button></aside>
          </section>

          <div className="lower-grid"><section className="panel pipeline-panel"><div className="panel-head"><div><h2><span className="live-line-marker inline" />NE178-aligned processing pipeline</h2><span className="panel-caption">VOR-2026-0824-017 / LAST ACCEPTED REQUEST</span></div><span className="status status-green"><span className="status-dot" /> COMPLETE</span></div><div className="pipeline">{["AUTHENTICATE", "VERIFY", "MAP", "PROPAGATE", "ACCEPT", "VERIFY MAP"].map((s, i) => <div className="pipe-step" key={s}><div className="pipe-icon"><Check size={14} /></div><div><strong>0{i + 1}</strong><span>{s}</span></div>{i < 5 && <ChevronRight className="pipe-arrow" size={16} />}</div>)}</div></section><section className="panel audit-panel"><div className="panel-head"><div><h2>Audit activity</h2><span className="panel-caption">IMMUTABLE EVENT STREAM</span></div><button className="text-btn" onClick={() => navigate("/audit")}>OPEN LOG <ChevronRight size={13} /></button></div><div className="audit-list"><div><span className="audit-time">08:42:19</span><span className="audit-marker green" /><p><strong>Request accepted</strong><small>VOR-2026-0824-017 · {identityCopy.operatorDisplay}</small></p></div><div><span className="audit-time">08:39:48</span><span className="audit-marker amber" /><p><strong>Approval pending</strong><small>VOR-2026-0824-016 · SIL-1</small></p></div><div><span className="audit-time">08:31:06</span><span className="audit-marker red" /><p><strong>Range check failed</strong><small>VOR-2026-0824-015 · AIC-5218</small></p></div></div></section></div>
          <footer><span>© 2026 JESA S.A. · CONFIDENTIAL — PROPRIETARY INFORMATION</span><span><span className="amber-dot" /> READ-ONLY EDGE BOUNDARY · NO PLANT WRITE PATH</span></footer>
        </div>
      </main>

      {drawer && <div className="drawer-backdrop" onClick={() => setDrawer(false)}><aside className="detail-drawer" onClick={e => e.stopPropagation()}><div className="drawer-head"><div><div className="eyebrow cobalt">REQUEST DETAIL</div><h2>{selected.id}</h2><Status value={selected.status} /></div><button className="icon-btn" onClick={() => setDrawer(false)}><X size={18} /></button></div><div className="drawer-section"><div className="drawer-label">WHAT / WHERE</div><div className="detail-grid"><div><small>VARIABLE</small><strong>{selected.variable}</strong></div><div><small>TAG</small><strong className="mono">{selected.tag}</strong></div><div><small>EQUIPMENT</small><strong>Attack Reactor</strong></div><div><small>PROCESS AREA</small><strong>UC1 / Attack & Digestion</strong></div></div></div><div className="drawer-section"><div className="drawer-label">CURRENT → REQUESTED</div><div className="compare"><div><small>CURRENT PV</small><strong>{selected.current} <em>{selected.unit}</em></strong></div><ArrowRightIcon /><div><small>REQUESTED SP</small><strong className="cobalt-text">{selected.requested} <em>{selected.unit}</em></strong></div></div><div className="delta-box"><span>DELTA / RATE OF CHANGE</span><strong>{selected.delta} {selected.unit} <span className="positive">WITHIN ROC</span></strong></div></div><div className="drawer-section"><div className="drawer-label">NINE-STEP VALIDATION SEQUENCE</div><div className="check-list">{checks.map((c, i) => <div key={c} className={`check-row ${i > 5 && selected.status === "REJECTED" ? "not-run" : ""}`}><span className={`check-icon ${i > 5 && selected.status === "REJECTED" ? "muted-check" : ""}`}>{i > 5 && selected.status === "REJECTED" ? <Circle size={9} /> : <Check size={12} />}</span><span>{c}</span><strong>{i > 5 && selected.status === "REJECTED" ? "NOT EXECUTED" : "PASS"}</strong></div>)}</div></div><div className="drawer-section trace-section"><div className="drawer-label">TRACEABILITY</div><div className="trace-row"><LockKeyhole size={14} /><span>Certificate subject</span><strong className="mono">CN=APC-ATTACK-01</strong></div><div className="trace-row"><UserRound size={14} /><span>Requesting user</span><strong>{identityCopy.operatorDisplay}</strong></div><div className="trace-row"><Network size={14} /><span>DCS mapping</span><strong className="mono">DCS.PAP.ATTACK.TIC5210</strong></div></div>{selected.status === "PENDING_OPERATOR" && <button className="primary-btn drawer-action" onClick={() => navigate("/approvals")}>REVIEW & APPROVE <Zap size={15} /></button>}</aside></div>}
    </div>
  );
}
function ArrowRightIcon() { return <ChevronRight size={18} className="compare-arrow" />; }
