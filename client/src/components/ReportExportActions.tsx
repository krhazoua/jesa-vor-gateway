import { Download, FileText } from "lucide-react";
import { toast } from "sonner";
import { downloadCsvReport, downloadPdfReport, ReportDefinition } from "@/lib/reportExport";

type Props = {
  report: ReportDefinition;
  label?: string;
};

export default function ReportExportActions({ report, label = "EXPORT REPORT" }: Props) {
  const exportCsv = () => {
    downloadCsvReport(report);
    toast.success(`${label} CSV downloaded.`);
  };
  const exportPdf = () => {
    downloadPdfReport(report);
    toast.success(`${label} PDF generated.`);
  };
  return <div className="report-export-actions" aria-label={`${label} controls`}>
    <span>{label}</span>
    <button type="button" onClick={exportCsv}><Download size={13} /> CSV</button>
    <button type="button" onClick={exportPdf}><FileText size={13} /> PDF</button>
  </div>;
}
