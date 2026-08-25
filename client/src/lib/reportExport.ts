
export const JESA_LOGO_URL = "/manus-storage/jesa-wordmark_e357ca66.png";

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
  const generatedAt = report.metadata["Generated at (UTC)"] || new Date().toISOString();
  const lines = [
    "# JESA S.A.",
    "# JESA DIGITAL ENGINEERING | VoR GATEWAY | PAP ATTACK REACTOR",
    `# Report: ${report.title}`,
    `# ${report.title}`,
    `# Generated at (UTC): ${generatedAt}`,
    "# Data remains unchanged; report-control rows are separated from machine-readable section data.",
    "",
    "# JESA REPORT CONTROL",
    ["CONTROL FIELD", "CONTROL VALUE", "DATA BOUNDARY"].map(escapeCsvCell).join(","),
    ["ORGANIZATION", "JESA S.A.", "Canonical report data"].map(escapeCsvCell).join(","),
    ["FUNCTION", "Digital Engineering / VoR Gateway", "Read-only / no plant write"].map(escapeCsvCell).join(","),
    ["REPORT", report.title, "", "Values preserved from protected report contract"].map(escapeCsvCell).join(","),
    ["GENERATED AT (UTC)", generatedAt, "", "Export timestamp"].map(escapeCsvCell).join(","),
    "",
    "# REPORT METADATA",
    ["METADATA FIELD", "METADATA VALUE"].map(escapeCsvCell).join(","),
  ];
  Object.entries(report.metadata).forEach(([key, value]) => lines.push([key, value].map(escapeCsvCell).join(",")));
  lines.push("", "# DATA SECTIONS", ["SECTION TYPE", "SECTION TITLE", "COLUMN COUNT", "ROW COUNT"].map(escapeCsvCell).join(","));
  report.sections.forEach(section => {
    lines.push(["SECTION", section.title, section.columns.length, section.rows.length].map(escapeCsvCell).join(","));
    lines.push(`# ${section.title}`);
    lines.push(section.columns.map(escapeCsvCell).join(","));
    section.rows.forEach(row => lines.push(row.map(escapeCsvCell).join(",")));
    lines.push("");
  });
  return `\uFEFF${lines.join("\n")}\n`;
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

export async function createExcelWorkbook(report: ReportDefinition, logoDataUrl?: string | null) {
  const { createExcelWorkbook: createDeferredWorkbook } = await import("./excelReport");
  return createDeferredWorkbook(report, logoDataUrl);
}

export async function downloadExcelReport(report: ReportDefinition) {
  const workbook = await createExcelWorkbook(report, await loadLogoDataUrl());
  const buffer = await workbook.xlsx.writeBuffer();
  const filename = report.filename.replace(/\.(csv|json|pdf|xlsx)$/i, "") + ".xlsx";
  downloadBlob(buffer, filename, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
}

export function buildJsonReport(report: ReportDefinition) {
  return `${JSON.stringify({ title: report.title, metadata: report.metadata, sections: report.sections }, null, 2)}\n`;
}

export function downloadJsonReport(report: ReportDefinition) {
  downloadBlob(buildJsonReport(report), report.filename.endsWith(".json") ? report.filename : `${report.filename}.json`, "application/json;charset=utf-8");
}

export async function buildPdfReport(report: Omit<ReportDefinition, "filename">, logoDataUrl?: string | null) {
  const { buildPdfReport: buildDeferredPdfReport } = await import("./pdfReport");
  return buildDeferredPdfReport(report, logoDataUrl);
}

export type PdfProgressCallback = (progress: number, step: string) => void;

const waitForPdfStage = (milliseconds: number) => new Promise<void>(resolve => {
  globalThis.setTimeout(resolve, milliseconds);
});

async function loadLogoDataUrl() {
  try {
    const response = await fetch(JESA_LOGO_URL);
    if (!response.ok) return null;
    const blob = await response.blob();
    return await new Promise<string | null>(resolve => {
      const reader = new FileReader();
      reader.onload = () => resolve(typeof reader.result === "string" ? reader.result : null);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

export async function downloadPdfReportWithProgress(report: ReportDefinition, onProgress: PdfProgressCallback) {
  onProgress(10, "Preparing report data");
  await waitForPdfStage(45);
  onProgress(28, "Loading JESA brand asset");
  const logoDataUrl = await loadLogoDataUrl();
  await waitForPdfStage(45);
  onProgress(52, "Building branded PDF layout");
  const document = await buildPdfReport(report, logoDataUrl);
  await waitForPdfStage(45);
  onProgress(82, "Finalizing file");
  const filename = report.filename.endsWith(".pdf") ? report.filename : `${report.filename}.pdf`;
  document.save(filename);
  onProgress(100, "Download complete");
}

export async function downloadPdfReport(report: ReportDefinition) {
  const document = await buildPdfReport(report, await loadLogoDataUrl());
  const filename = report.filename.endsWith(".pdf") ? report.filename : `${report.filename}.pdf`;
  document.save(filename);
}
