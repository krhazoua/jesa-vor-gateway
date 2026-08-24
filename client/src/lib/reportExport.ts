import { jsPDF } from "jspdf";

export type ReportSection = {
  title: string;
  columns: string[];
  rows: Array<Array<string | number | null | undefined>>;
};

export type ReportDefinition = {
  filename: string;
  title: string;
  metadata: Record<string, string>;
  sections: ReportSection[];
};

export function escapeCsvCell(value: string | number | null | undefined) {
  const text = value == null ? "" : String(value);
  return /[",\n\r]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function buildCsvReport(report: Omit<ReportDefinition, "filename" | "title"> & { title: string }) {
  const lines = [`# ${report.title}`];
  Object.entries(report.metadata).forEach(([key, value]) => lines.push(`${escapeCsvCell(key)},${escapeCsvCell(value)}`));
  report.sections.forEach(section => {
    lines.push("");
    lines.push(`# ${section.title}`);
    lines.push(section.columns.map(escapeCsvCell).join(","));
    section.rows.forEach(row => lines.push(row.map(escapeCsvCell).join(",")));
  });
  return `${lines.join("\n")}\n`;
}

function downloadBlob(content: BlobPart, filename: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

export function downloadCsvReport(report: ReportDefinition) {
  downloadBlob(buildCsvReport(report), report.filename.endsWith(".csv") ? report.filename : `${report.filename}.csv`, "text/csv;charset=utf-8");
}

export function buildPdfReport(report: Omit<ReportDefinition, "filename">) {
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 34;
  let y = 40;
  const addPageIfNeeded = (height = 18) => {
    if (y + height > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  };

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(0, 51, 102);
  doc.text(report.title, margin, y);
  y += 20;
  doc.setFont("courier", "normal");
  doc.setFontSize(8);
  doc.setTextColor(90, 105, 122);
  Object.entries(report.metadata).forEach(([key, value]) => {
    addPageIfNeeded();
    doc.text(`${key}: ${value}`, margin, y);
    y += 12;
  });

  report.sections.forEach(section => {
    addPageIfNeeded(28);
    y += 10;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(0, 51, 102);
    doc.text(section.title, margin, y);
    y += 16;
    const width = pageWidth - margin * 2;
    const colWidth = width / section.columns.length;
    const drawRow = (values: Array<string | number | null | undefined>, header = false) => {
      const rowHeight = header ? 20 : 18;
      addPageIfNeeded(rowHeight);
      if (header) {
        doc.setFillColor(231, 245, 251);
        doc.rect(margin, y - 12, width, rowHeight, "F");
      }
      doc.setFont("courier", header ? "bold" : "normal");
      doc.setFontSize(header ? 7 : 7);
      doc.setTextColor(header ? 0 : 23, header ? 51 : 32, header ? 102 : 51);
      values.forEach((value, index) => {
        const text = String(value ?? "—").replaceAll("\n", " ");
        const clipped = text.length > 34 ? `${text.slice(0, 31)}…` : text;
        doc.text(clipped, margin + colWidth * index + 4, y, { maxWidth: colWidth - 8 });
      });
      doc.setDrawColor(221, 227, 234);
      doc.line(margin, y + 6, margin + width, y + 6);
      y += rowHeight;
    };
    drawRow(section.columns, true);
    section.rows.forEach(row => drawRow(row));
  });

  return doc;
}

export type PdfProgressCallback = (progress: number, step: string) => void;

const waitForPdfStage = (milliseconds: number) => new Promise<void>(resolve => {
  globalThis.setTimeout(resolve, milliseconds);
});

export async function downloadPdfReportWithProgress(report: ReportDefinition, onProgress: PdfProgressCallback) {
  onProgress(12, "Preparing report data");
  await waitForPdfStage(45);
  onProgress(42, "Building PDF layout");
  await waitForPdfStage(45);
  const document = buildPdfReport(report);
  onProgress(82, "Finalizing file");
  await waitForPdfStage(45);
  const filename = report.filename.endsWith(".pdf") ? report.filename : `${report.filename}.pdf`;
  document.save(filename);
  onProgress(100, "Download complete");
}

export function downloadPdfReport(report: ReportDefinition) {
  const filename = report.filename.endsWith(".pdf") ? report.filename : `${report.filename}.pdf`;
  buildPdfReport(report).save(filename);
}
