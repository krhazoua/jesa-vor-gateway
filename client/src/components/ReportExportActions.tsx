import { Download, FileText, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { downloadCsvReport, downloadJsonReport, downloadPdfReportWithProgress, ReportDefinition } from "@/lib/reportExport";

type Props = {
  report: ReportDefinition;
  label?: string;
};

type PdfState = {
  status: "idle" | "generating" | "complete" | "error";
  progress: number;
  step: string;
};

export function getPdfExportPresentation(state: PdfState) {
  if (state.status === "generating") return { label: `PDF ${state.progress}%`, step: state.step, busy: true };
  if (state.status === "complete") return { label: "PDF READY", step: "Download complete", busy: false };
  if (state.status === "error") return { label: "RETRY PDF", step: "Generation failed", busy: false };
  return { label: "PDF", step: "Ready to generate", busy: false };
}

export default function ReportExportActions({ report, label = "EXPORT REPORT" }: Props) {
  const [pdfState, setPdfState] = useState<PdfState>({ status: "idle", progress: 0, step: "Ready to generate" });
  const presentation = getPdfExportPresentation(pdfState);

  const exportCsv = () => {
    downloadCsvReport(report);
    toast.success(`${label} CSV downloaded.`);
  };

  const exportJson = () => {
    downloadJsonReport(report);
    toast.success(`${label} JSON downloaded.`);
  };

  const exportPdf = async () => {
    if (pdfState.status === "generating") return;
    setPdfState({ status: "generating", progress: 8, step: "Preparing report data" });
    try {
      await downloadPdfReportWithProgress(report, (progress, step) => {
        setPdfState({ status: "generating", progress, step });
      });
      setPdfState({ status: "complete", progress: 100, step: "Download complete" });
      toast.success(`${label} PDF generated.`);
    } catch (error) {
      setPdfState({ status: "error", progress: 0, step: "Generation failed — retry available" });
      toast.error(error instanceof Error ? error.message : `${label} PDF generation failed.`);
    }
  };

  return <div className="report-export-actions" aria-label={`${label} controls`}>
    <span>{label}</span>
    <button type="button" onClick={exportCsv} aria-label={`Download ${label} as CSV`}>
      <Download size={13} /> CSV
    </button>
    <button type="button" onClick={exportJson} aria-label={`Download ${label} as JSON`}>
      <FileText size={13} /> JSON
    </button>
    <button type="button" onClick={exportPdf} disabled={presentation.busy} aria-label={presentation.busy ? `Generating ${label} PDF` : `Download ${label} as PDF`}>
      {presentation.busy ? <Loader2 size={13} className="export-spinner" aria-hidden="true" /> : <FileText size={13} />}
      {presentation.label}
    </button>
    <span className={`export-progress-state export-${pdfState.status}`} aria-live="polite">
      {presentation.busy && <span className="export-progress-track" aria-hidden="true"><i style={{ width: `${pdfState.progress}%` }} /></span>}
      <span>{presentation.step}</span>
    </span>
  </div>;
}
