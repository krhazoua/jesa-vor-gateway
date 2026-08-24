/* Control Room Ledger: authentication is a secured entry boundary, not a decorative login card. */
import { FormEvent, useState } from "react";
import { Activity, Check, LockKeyhole, ShieldCheck, Terminal, X } from "lucide-react";
import { toast } from "sonner";

const demoUsername = import.meta.env.VITE_DEMO_USERNAME || "operator.demo";
const demoPassword = import.meta.env.VITE_DEMO_PASSWORD || "operator-demo";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [certificate, setCertificate] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = (event: FormEvent) => {
    event.preventDefault(); setError(""); setBusy(true);
    window.setTimeout(() => {
      if (username === demoUsername && password === demoPassword && certificate) {
        sessionStorage.setItem("vor-session", JSON.stringify({ username, role: "OPERATOR", issuedAt: new Date().toISOString(), tokenType: "JWT-PROTOTYPE" }));
        window.location.href = "/operations";
      } else {
        setError("Authentication failed. Check credentials and certificate posture.");
        toast.error("Access denied — failed authentication event recorded in simulator audit.");
        setBusy(false);
      }
    }, 420);
  };

  return <main className="login-shell"><div className="login-aside"><div className="login-brand"><span className="gate-mark"><span /><span /><i /></span><div><strong>JESA</strong><small>DIGITAL ENGINEERING</small></div></div><div className="login-aside-copy"><div className="eyebrow cobalt">SECURED OT / IT BOUNDARY</div><h1>Verification of Request</h1><p>Controlled access to the PAP Attack Reactor gateway. Every session is bound to a role, certificate posture, and auditable decision trail.</p><div className="login-line"><span className="live-dot" /> MODULE 3 / psM+O <Check size={13} /></div><div className="login-line"><span className="live-dot" /> MODULE 2 / DMZ <Check size={13} /></div><div className="login-line"><span className="live-dot" /> MODULE 1 / CPC <Check size={13} /></div></div><div className="login-foot">© 2026 JESA S.A. · CONFIDENTIAL — PROPRIETARY INFORMATION</div></div><section className="login-panel"><div className="login-panel-head"><div><div className="eyebrow cobalt">PAP ATTACK REACTOR CONTROL SYSTEM</div><h2>Sign in to VoR Gateway</h2><p>Authenticate before accessing operations or request governance.</p></div><div className="login-status"><span className="live-dot" /> SESSION GATE <small>READY</small></div></div><form onSubmit={submit}><label>USERNAME<input autoComplete="username" value={username} onChange={e => setUsername(e.target.value)} placeholder="operator.demo" /></label><label>PASSWORD<input autoComplete="current-password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter configured password" /></label><div className="certificate-check"><div className="cert-icon"><ShieldCheck size={17} /></div><div><strong>X.509 certificate</strong><small>CN=APC-OPERATOR-01 · Issuer verified · Valid</small></div><span className={certificate ? "cert-valid" : "cert-invalid"} onClick={() => setCertificate(!certificate)}>{certificate ? <Check size={14} /> : <X size={14} />}</span></div>{error && <div className="login-error"><Activity size={14} />{error}</div>}<button className="secure-login" disabled={busy}>{busy ? "VALIDATING SESSION…" : "SECURE LOGIN"}<LockKeyhole size={15} /></button></form><div className="login-config"><Terminal size={13} /><span>Prototype credentials are configuration-backed via <code>VITE_DEMO_USERNAME</code> and <code>VITE_DEMO_PASSWORD</code>. No production credentials are embedded.</span></div><div className="login-boundary"><span>SECURITY ZONE</span><strong>DMZ / AUTHENTICATION GATEWAY</strong><span>SESSION TTL 15 MIN</span></div></section></main>;
}
