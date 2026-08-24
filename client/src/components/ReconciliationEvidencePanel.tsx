import { useEffect, useMemo, useState } from "react";
import { ClipboardCheck, Download, FileCheck2, LockKeyhole } from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import { downloadCsvReport, downloadPdfReport, type ReportDefinition } from "@/lib/reportExport";

type FileEvidence = { name: string; data: string };
type ReconciliationSummary = {
  id: number;
  recordType: "EQUIPMENT" | "VARIABLE";
  authoritySourceRef: string;
  filename: string;
  rowCount: number;
  matchedCount: number;
  addedCount: number;
  changedCount: number;
  removedCount: number;
  status: "MATCHED" | "MISMATCH" | "BLOCKED";
  fatSatGate: "BLOCKED" | "PENDING_EXTERNAL_SIGNOFF";
  createdAt: Date;
};

function readEvidence(file: File): Promise<FileEvidence> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Evidence file could not be read."));
    reader.onload = () => resolve({ name: file.name, data: String(reader.result) });
    reader.readAsDataURL(file);
  });
}

export default function ReconciliationEvidencePanel() {
  const [selectedRunId, setSelectedRunId] = useState<number | null>(null);
  const [diffPage, setDiffPage] = useState(1);
  const [certificateSubject, setCertificateSubject] = useState("");
  const [certificateFingerprint, setCertificateFingerprint] = useState("");
  const [referenceId, setReferenceId] = useState("");
  const [certificate, setCertificate] = useState<FileEvidence | null>(null);
  const [reference, setReference] = useState<FileEvidence | null>(null);
  const [comment, setComment] = useState("");
  const [anchorSubject, setAnchorSubject] = useState("");
  const [anchorFingerprint, setAnchorFingerprint] = useState("");
  const [anchorCertificate, setAnchorCertificate] = useState<FileEvidence | null>(null);
  const [fatSatReference, setFatSatReference] = useState("");
  const [activationChecklist, setActivationChecklist] = useState({ certificateQuorum: false, fatSatAccepted: false, rollbackPrepared: false, changeWindowApproved: false });

  const runsQuery = trpc.catalog.reconciliationHistory.useQuery(undefined, { retry: false });
  const gateQuery = trpc.catalog.masterGate.useQuery(undefined, { retry: false });
  const trustAnchorsQuery = trpc.catalog.trustAnchors.useQuery(undefined, { retry: false });
  const activationHistoryQuery = trpc.catalog.activationHistory.useQuery(undefined, { retry: false });
  const activeId = selectedRunId ?? runsQuery.data?.[0]?.id ?? 0;
  const run = (runsQuery.data as ReconciliationSummary[] | undefined)?.find(item => item.id === activeId) ?? null;
  const diffsQuery = trpc.catalog.diffs.useQuery({ id: activeId, page: diffPage, pageSize: 25 }, { enabled: activeId > 0, retry: false });
  const signoffsQuery = trpc.catalog.signoffs.useQuery({ id: activeId }, { enabled: activeId > 0, retry: false });
  const reportQuery = trpc.catalog.report.useQuery({ id: activeId }, { enabled: activeId > 0, retry: false });

  const signoffMutation = trpc.catalog.signoff.useMutation({
    onSuccess: value => { toast.success(`External ${value.decision.toLowerCase()} sign-off persisted.`); setCertificate(null); setReference(null); setComment(""); void signoffsQuery.refetch(); void gateQuery.refetch(); },
    onError: error => toast.error(error.message),
  });
  const registerAnchorMutation = trpc.catalog.registerTrustAnchor.useMutation({
    onSuccess: value => { toast.success(`Trust anchor ${value.fingerprint} registered.`); setAnchorCertificate(null); setAnchorSubject(""); setAnchorFingerprint(""); void trustAnchorsQuery.refetch(); },
    onError: error => toast.error(error.message),
  });
  const armMutation = trpc.catalog.armMaster.useMutation({
    onSuccess: value => { toast.success(`Authoritative master gate ${value.status}.`); void gateQuery.refetch(); },
    onError: error => toast.error(error.message),
  });
  const activationMutation = trpc.catalog.prepareActivation.useMutation({
    onSuccess: value => { toast.success(`Activation readiness ${value.status}; no plant connection opened.`); setActivationChecklist({ certificateQuorum: false, fatSatAccepted: false, rollbackPrepared: false, changeWindowApproved: false }); void activationHistoryQuery.refetch(); },
    onError: error => toast.error(error.message),
  });

  useEffect(() => { setDiffPage(1); }, [activeId]);

  const report = useMemo<ReportDefinition | null>(() => {
    if (!reportQuery.data) return null;
    return { filename: `jesa-reconciliation-${reportQuery.data.run.id}`, title: "JESA VoR Gateway — Reconciliation report", metadata: { "Reconciliation run": String(reportQuery.data.run.id), "Authority source": reportQuery.data.run.authoritySourceRef, "Record type": reportQuery.data.run.recordType, Status: reportQuery.data.run.status, "FAT/SAT gate": reportQuery.data.run.fatSatGate, Generated: new Date().toISOString(), Boundary: "Evidence only · no plant write path" }, sections: [{ title: "Differences", columns: ["Sequence", "Tag", "Kind", "Details"], rows: reportQuery.data.diffs.map(diff => [diff.sequence, diff.tag, diff.kind, diff.details]) }] };
  }, [reportQuery.data]);

  const approvedSignoffs = signoffsQuery.data?.filter(signoff => signoff.decision === "APPROVED" && signoff.chainStatus === "VALID") ?? [];
  const independentApproverCount = new Set(approvedSignoffs.map(signoff => signoff.actorId)).size;
  const quorumReady = independentApproverCount >= 2;
  const allActivationChecksComplete = Object.values(activationChecklist).every(Boolean);
  const submitSignoff = () => { if (!activeId || !certificate || !reference) return; signoffMutation.mutate({ reconciliationRunId: activeId, certificateSubject, certificateFingerprint, certificateFile: certificate.data, referenceId, referenceFile: reference.data, decision: "APPROVED", comment: comment || undefined }); };
  const registerAnchor = () => { if (!anchorCertificate) return; registerAnchorMutation.mutate({ subject: anchorSubject, fingerprint: anchorFingerprint, certificateFile: anchorCertificate.data }); };

  return <section className="module-panel reconciliation-evidence-panel">
    <div className="catalog-import-head"><div><div className="eyebrow cobalt">RECONCILIATION EVIDENCE / CONTROLLED GATE</div><h2>Review, sign, and report authority evidence</h2><p className="module-note">Two independent reviewers, valid certificate chains, and completed FAT/SAT controls are required before the master gate can be armed. Plant writes remain disabled.</p></div><span className="import-boundary">{gateQuery.data?.status || "DISABLED"}</span></div>
    <div className="trust-store-panel"><div className="eyebrow">APPROVED CERTIFICATE TRUST STORE</div><p className="module-note">Uploaded reviewer certificates are accepted only when their chain terminates at an active approved trust anchor. Register root or intermediate anchors here before sign-off capture.</p>{trustAnchorsQuery.data?.length ? <div className="trust-anchor-list">{trustAnchorsQuery.data.map(anchor => <div className="trust-anchor-row" key={anchor.id}><strong>{anchor.subject}</strong><span>{anchor.fingerprint}</span><small>{anchor.status}</small></div>)}</div> : <div className="module-note">No active trust anchors are configured. Certificate-chain validation will remain blocked.</div>}<div className="trust-anchor-form"><label>ANCHOR SUBJECT<input value={anchorSubject} onChange={event => setAnchorSubject(event.target.value)} placeholder="CN=Approved Engineering CA" /></label><label>ANCHOR FINGERPRINT<input value={anchorFingerprint} onChange={event => setAnchorFingerprint(event.target.value)} placeholder="SHA-256 fingerprint" /></label><label className="catalog-file-input">ANCHOR CERTIFICATE<input type="file" accept=".pem,.cer,.crt" onChange={event => { const file = event.target.files?.[0]; if (file) void readEvidence(file).then(setAnchorCertificate).catch(error => toast.error(error.message)); }} /><span>{anchorCertificate?.name || "Select trust-anchor certificate"}</span></label><button type="button" className="primary-btn" onClick={registerAnchor} disabled={registerAnchorMutation.isPending || !anchorSubject.trim() || !anchorFingerprint.trim() || !anchorCertificate}>{registerAnchorMutation.isPending ? "VALIDATING ANCHOR…" : "REGISTER TRUST ANCHOR"}</button></div></div>
    {runsQuery.isLoading ? <p className="module-note">Loading reconciliation history…</p> : !runsQuery.data?.length ? <div className="empty-state"><div className="eyebrow">NO RECONCILIATION RUNS</div><h3>Run a dry-run comparison above before capturing sign-off evidence.</h3></div> : <>
      <div className="reconciliation-run-select"><label>RECONCILIATION RUN<select value={activeId} onChange={event => setSelectedRunId(Number(event.target.value))}>{runsQuery.data.map(item => <option key={item.id} value={item.id}>#{item.id} · {item.recordType} · {item.authoritySourceRef} · {item.status}</option>)}</select></label>{run && <div className="reconciliation-run-summary"><strong>{run.status}</strong><span>{run.matchedCount} matched · {run.addedCount} added · {run.changedCount} changed · {run.removedCount} removed</span><small>FAT/SAT: {run.fatSatGate}</small></div>}</div>
      {diffsQuery.data && <div className="reconciliation-diff-table"><div className="eyebrow">DIFF EVIDENCE / {diffsQuery.data.total} TOTAL</div>{diffsQuery.data.rows.length ? diffsQuery.data.rows.map(row => <div className="reconciliation-diff-row" key={row.id}><span className="mono">{row.sequence}</span><strong>{row.tag}</strong><span>{row.kind}</span><p>{row.details}</p></div>) : <p className="module-note">No differences recorded for this run.</p>}<div className="audit-pagination"><span>Showing {diffsQuery.data.total ? (diffPage - 1) * 25 + 1 : 0}–{Math.min(diffPage * 25, diffsQuery.data.total)} of {diffsQuery.data.total}</span><div className="audit-page-controls"><button type="button" onClick={() => setDiffPage(page => Math.max(1, page - 1))} disabled={diffPage === 1}>Previous</button><span>Page {diffPage} / {Math.max(1, Math.ceil(diffsQuery.data.total / 25))}</span><button type="button" onClick={() => setDiffPage(page => page + 1)} disabled={diffPage >= Math.max(1, Math.ceil(diffsQuery.data.total / 25))}>Next</button></div></div></div>}
      {report && <div className="reconciliation-report-actions"><button type="button" onClick={() => downloadCsvReport(report)}><Download size={13} /> DOWNLOAD CSV REPORT</button><button type="button" onClick={() => downloadPdfReport(report)}><Download size={13} /> DOWNLOAD PDF REPORT</button></div>}
      {run?.status === "MATCHED" && <div className="reconciliation-signoff"><div className="eyebrow amber-label">EXTERNAL SIGN-OFF / CERTIFICATE CHAIN</div><p className="module-note">Quorum: <strong>{independentApproverCount} / 2 independent approved reviewers</strong>. Each reviewer must use a certificate chain that validates against the trust store.</p><div className="reconciliation-signoff-grid"><label>CERTIFICATE SUBJECT<input value={certificateSubject} onChange={event => setCertificateSubject(event.target.value)} placeholder="CN=External Reviewer" /></label><label>CERTIFICATE FINGERPRINT<input value={certificateFingerprint} onChange={event => setCertificateFingerprint(event.target.value)} placeholder="SHA-256 fingerprint" /></label><label>REFERENCE ID<input value={referenceId} onChange={event => setReferenceId(event.target.value)} placeholder="FAT-SAT-REF-001" /></label><label className="catalog-file-input">CERTIFICATE FILE<input type="file" accept=".pem,.cer,.crt,.pdf,.txt" onChange={event => { const file = event.target.files?.[0]; if (file) void readEvidence(file).then(setCertificate).catch(error => toast.error(error.message)); }} /><span>{certificate?.name || "Select certificate evidence"}</span></label><label className="catalog-file-input">REFERENCE FILE<input type="file" accept=".pdf,.txt,.csv,.xlsx" onChange={event => { const file = event.target.files?.[0]; if (file) void readEvidence(file).then(setReference).catch(error => toast.error(error.message)); }} /><span>{reference?.name || "Select FAT/SAT reference"}</span></label><label className="reconciliation-signoff-wide">SIGN-OFF COMMENT<textarea value={comment} onChange={event => setComment(event.target.value)} placeholder="Independent review scope and limitations" /></label></div><button type="button" className="primary-btn" onClick={submitSignoff} disabled={signoffMutation.isPending || !certificateSubject.trim() || !certificateFingerprint.trim() || !referenceId.trim() || !certificate || !reference}>{signoffMutation.isPending ? "VALIDATING AND PERSISTING…" : "CAPTURE APPROVED SIGN-OFF"}</button></div>}
      {signoffsQuery.data?.length ? <div className="catalog-import-history"><div className="eyebrow">EXTERNAL SIGN-OFF HISTORY</div>{signoffsQuery.data.map(signoff => <div className="catalog-import-history-row" key={signoff.id}><span>{signoff.decision} · {signoff.referenceId} · CHAIN {signoff.chainStatus}</span><strong>{signoff.certificateFingerprint}</strong><small>{signoff.certificateSubject} · <a href={signoff.certificateStorageUrl} target="_blank" rel="noreferrer">CERTIFICATE</a> · <a href={signoff.referenceStorageUrl} target="_blank" rel="noreferrer">REFERENCE</a></small></div>)}</div> : null}
      {run?.status === "MATCHED" && <div className="master-gate-action"><LockKeyhole size={15} /><span>{quorumReady ? "Two independent valid certificate sign-offs are present." : "Two independent valid certificate sign-offs are required before FAT/SAT arm authorization."}</span><button type="button" className="primary-btn" onClick={() => armMutation.mutate({ reconciliationRunId: activeId })} disabled={armMutation.isPending || !quorumReady || gateQuery.data?.status === "ARMED_FOR_FAT_SAT"}>{gateQuery.data?.status === "ARMED_FOR_FAT_SAT" ? "MASTER ARMED FOR FAT/SAT" : quorumReady ? "ARM MASTER FOR FAT/SAT" : "NEEDS 2 INDEPENDENT SIGN-OFFS"}</button></div>}
      {gateQuery.data?.status === "ARMED_FOR_FAT_SAT" && <div className="adapter-activation-panel"><div className="eyebrow cobalt">POST-FAT/SAT CONTROLLED ADAPTER PROCEDURE</div><h3>Prepare read-only adapter activation</h3><p className="module-note">This procedure records readiness only. It does not connect to OPC UA/DCS, enable propagation, or change plant state.</p><div className="activation-checklist"><label><input type="checkbox" checked={activationChecklist.certificateQuorum} onChange={event => setActivationChecklist(current => ({ ...current, certificateQuorum: event.target.checked }))} /> Certificate quorum independently reviewed</label><label><input type="checkbox" checked={activationChecklist.fatSatAccepted} onChange={event => setActivationChecklist(current => ({ ...current, fatSatAccepted: event.target.checked }))} /> FAT/SAT acceptance reference approved</label><label><input type="checkbox" checked={activationChecklist.rollbackPrepared} onChange={event => setActivationChecklist(current => ({ ...current, rollbackPrepared: event.target.checked }))} /> Rollback and isolation plan prepared</label><label><input type="checkbox" checked={activationChecklist.changeWindowApproved} onChange={event => setActivationChecklist(current => ({ ...current, changeWindowApproved: event.target.checked }))} /> Controlled change window approved</label></div><label className="activation-reference">FAT/SAT REFERENCE<input value={fatSatReference} onChange={event => setFatSatReference(event.target.value)} placeholder="FAT-SAT-REF-001" /></label><button type="button" className="primary-btn" onClick={() => { if (gateQuery.data) activationMutation.mutate({ gateId: gateQuery.data.id, fatSatReference, checklist: activationChecklist }); }} disabled={activationMutation.isPending || !fatSatReference.trim() || !allActivationChecksComplete}><ClipboardCheck size={14} /> {activationMutation.isPending ? "RECORDING READINESS…" : "RECORD READ-ONLY ACTIVATION READINESS"}</button>{activationHistoryQuery.data?.length ? <div className="activation-history"><div className="eyebrow">ACTIVATION READINESS HISTORY</div>{activationHistoryQuery.data.map(item => <div className="catalog-import-history-row" key={item.id}><span>{item.status} · {item.fatSatReference}</span><strong>{item.plantWriteEnabled ? "WRITE ENABLED" : "NO PLANT WRITE"}</strong><small>{new Date(item.createdAt).toLocaleString()}</small></div>)}</div> : null}</div>}
    </>}
  </section>;
}
