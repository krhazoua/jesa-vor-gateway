import { jsPDF } from "jspdf";

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
    `# Brand asset: JESA wordmark / ${JESA_LOGO_URL}`,
    "# Data remains unchanged; report-control rows are separated from machine-readable section data.",
    "",
    "# JESA REPORT CONTROL",
    ["CONTROL FIELD", "CONTROL VALUE", "JESA BRAND ASSET", "DATA BOUNDARY"].map(escapeCsvCell).join(","),
    ["ORGANIZATION", "JESA S.A.", "JESA wordmark", "Canonical report data"].map(escapeCsvCell).join(","),
    ["FUNCTION", "Digital Engineering / VoR Gateway", JESA_LOGO_URL, "Read-only / no plant write"].map(escapeCsvCell).join(","),
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

export async function createCsvLogoPackage(report: ReportDefinition, logoBytes: ArrayBuffer) {
  const { default: JSZip } = await import("jszip");
  const zip = new JSZip();
  const baseName = report.filename.replace(/\.(csv|json|pdf|xlsx)$/i, "");
  zip.file(`${baseName}.csv`, buildCsvReport(report));
  zip.file("JESA-wordmark.png", logoBytes);
  zip.file("README.txt", [
    "JESA S.A. — DIGITAL ENGINEERING",
    "VoR GATEWAY / PAP ATTACK REACTOR",
    "",
    "Package contents:",
    `- ${baseName}.csv: organized, machine-readable report with JESA report-control metadata`,
    "- JESA-wordmark.png: the JESA logo asset supplied with this report package",
    "",
    "The CSV itself remains a text format and therefore cannot render a bitmap image inline. The logo is supplied here as the original image file and is referenced from the CSV report-control block.",
  ].join("\n"));
  return zip.generateAsync({ type: "blob", compression: "DEFLATE" });
}

export async function downloadCsvLogoPackage(report: ReportDefinition) {
  const response = await fetch(JESA_LOGO_URL);
  if (!response.ok) throw new Error("The managed JESA wordmark could not be loaded.");
  const logoBytes = await response.arrayBuffer();
  const packageBlob = await createCsvLogoPackage(report, logoBytes);
  const filename = report.filename.replace(/\.(csv|json|pdf|xlsx)$/i, "") + "-jesa-export.zip";
  downloadBlob(packageBlob, filename, "application/zip");
}

export async function createExcelWorkbook(report: ReportDefinition, logoDataUrl?: string | null) {
  const { default: ExcelJS } = await import("exceljs");
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "JESA Digital Engineering";
  workbook.company = "JESA S.A.";
  workbook.created = new Date();
  workbook.modified = new Date();

  const controlSheet = workbook.addWorksheet("Report control", { properties: { defaultRowHeight: 20 }, views: [{ showGridLines: false }] });
  controlSheet.mergeCells("A1:F1");
  controlSheet.mergeCells("A2:F2");
  controlSheet.getCell("A1").value = "JESA DIGITAL ENGINEERING | VoR GATEWAY";
  controlSheet.getCell("A2").value = report.title;
  controlSheet.getCell("A1").font = { name: "Arial", size: 12, bold: true, color: { argb: "FFFFFFFF" } };
  controlSheet.getCell("A2").font = { name: "Arial", size: 18, bold: true, color: { argb: "FF003366" } };
  controlSheet.getCell("A1").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF003366" } };
  controlSheet.getCell("A1").alignment = { horizontal: "right", vertical: "middle" };
  controlSheet.getCell("A2").alignment = { vertical: "middle" };
  controlSheet.getRow(1).height = 28;
  controlSheet.getRow(2).height = 34;
  if (logoDataUrl) {
    const base64 = logoDataUrl.split(",")[1];
    if (base64) {
      const imageId = workbook.addImage({ base64, extension: "png" });
      controlSheet.addImage(imageId, { tl: { col: 0.15, row: 0.2 }, ext: { width: 116, height: 32 } });
    }
  }
  controlSheet.getCell("A4").value = "DOCUMENT CONTROL";
  controlSheet.getCell("A4").font = { name: "Arial", size: 10, bold: true, color: { argb: "FF003366" } };
  let controlRow = 5;
  for (const [key, value] of Object.entries(report.metadata)) {
    controlSheet.getRow(controlRow).values = [key, value];
    controlSheet.getCell(`A${controlRow}`).font = { name: "Arial", size: 9, bold: true, color: { argb: "FF5E6B7A" } };
    controlSheet.getCell(`B${controlRow}`).font = { name: "Arial", size: 9, color: { argb: "FF1A1A2E" } };
    controlSheet.getCell(`A${controlRow}`).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF1F5F9" } };
    controlSheet.getCell(`B${controlRow}`).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF8FAFC" } };
    controlRow += 1;
  }
  controlRow += 1;
  controlSheet.getCell(`A${controlRow}`).value = "DATA SHEET";
  controlSheet.getCell(`B${controlRow}`).value = { text: "JESA Report", hyperlink: "#'JESA Report'!A1" };
  controlSheet.getCell(`A${controlRow}`).font = { name: "Arial", size: 9, bold: true, color: { argb: "FF5E6B7A" } };
  controlSheet.getCell(`B${controlRow}`).font = { name: "Arial", size: 9, bold: true, color: { argb: "FF003366" } };
  controlSheet.getColumn(1).width = 27;
  controlSheet.getColumn(2).width = 62;
  for (let column = 3; column <= 6; column += 1) controlSheet.getColumn(column).width = 15;
  controlSheet.headerFooter.oddFooter = "&LJESA S.A. · CONFIDENTIAL&CPage &P of &N&RVoR Gateway";

  const worksheet = workbook.addWorksheet("JESA Report", { properties: { defaultRowHeight: 18 }, views: [{ showGridLines: false }] });
  const columnCount = Math.max(1, ...report.sections.map(section => section.columns.length));
  const lastColumn = String.fromCharCode(65 + Math.min(columnCount - 1, 25));
  worksheet.mergeCells(`A1:${lastColumn}1`);
  worksheet.mergeCells(`A2:${lastColumn}2`);
  worksheet.getCell("A1").value = "JESA DIGITAL ENGINEERING | VoR GATEWAY";
  worksheet.getCell("A2").value = report.title;
  worksheet.getCell("A1").font = { name: "Arial", size: 11, bold: true, color: { argb: "FFFFFFFF" } };
  worksheet.getCell("A2").font = { name: "Arial", size: 16, bold: true, color: { argb: "FF003366" } };
  worksheet.getCell("A1").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF003366" } };
  worksheet.getCell("A1").alignment = { vertical: "middle" };
  worksheet.getCell("A2").alignment = { vertical: "middle" };
  worksheet.getRow(1).height = 24;
  worksheet.getRow(2).height = 28;

  if (logoDataUrl) {
    const base64 = logoDataUrl.split(",")[1];
    if (base64) {
      const imageId = workbook.addImage({ base64, extension: "png" });
      worksheet.addImage(imageId, { tl: { col: 0.1, row: 0.18 }, ext: { width: 108, height: 30 } });
      worksheet.getCell("A1").alignment = { horizontal: "right", vertical: "middle" };
    }
  }

  let rowNumber = 4;
  worksheet.getCell(`A${rowNumber}`).value = "REPORT CONTROL";
  worksheet.getCell(`A${rowNumber}`).font = { name: "Arial", size: 9, bold: true, color: { argb: "FF003366" } };
  rowNumber += 1;
  for (const [key, value] of Object.entries(report.metadata)) {
    const row = worksheet.getRow(rowNumber);
    row.values = [key, value];
    row.getCell(1).font = { name: "Arial", size: 9, bold: true, color: { argb: "FF5E6B7A" } };
    row.getCell(2).font = { name: "Arial", size: 9, color: { argb: "FF1A1A2E" } };
    row.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF1F5F9" } };
    row.getCell(2).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF8FAFC" } };
    rowNumber += 1;
  }
  rowNumber += 1;

  report.sections.forEach(section => {
    const titleRow = worksheet.getRow(rowNumber);
    titleRow.values = [section.title];
    worksheet.mergeCells(rowNumber, 1, rowNumber, Math.max(section.columns.length, 1));
    titleRow.height = 22;
    titleRow.getCell(1).font = { name: "Arial", size: 10, bold: true, color: { argb: "FFFFFFFF" } };
    titleRow.getCell(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF003366" } };
    titleRow.getCell(1).alignment = { vertical: "middle" };
    rowNumber += 1;

    const headerRow = worksheet.getRow(rowNumber);
    headerRow.values = section.columns;
    headerRow.height = 21;
    headerRow.eachCell(cell => {
      cell.font = { name: "Arial", size: 9, bold: true, color: { argb: "FF003366" } };
      cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFE1F0F7" } };
      cell.alignment = { vertical: "middle", wrapText: true };
      cell.border = { bottom: { style: "thin", color: { argb: "FF9FB3C4" } } };
    });
    rowNumber += 1;

    const firstDataRow = rowNumber;
    section.rows.forEach((values, index) => {
      const dataRow = worksheet.getRow(rowNumber);
      dataRow.values = values.map(value => value == null ? "" : String(value));
      dataRow.eachCell(cell => {
        cell.font = { name: "Arial", size: 9, color: { argb: "FF1A1A2E" } };
        cell.alignment = { vertical: "top", wrapText: true };
        if (index % 2 === 0) cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF8FAFC" } };
        cell.border = { bottom: { style: "hair", color: { argb: "FFE2E8F0" } } };
      });
      rowNumber += 1;
    });
    if (section.rows.length > 0 && section.columns.length > 0) {
      worksheet.autoFilter = { from: { row: firstDataRow - 1, column: 1 }, to: { row: rowNumber - 1, column: section.columns.length } };
    }
    rowNumber += 1;
  });

  for (let column = 1; column <= columnCount; column += 1) {
    const letter = String.fromCharCode(64 + Math.min(column, 26));
    const measuredWidth = Math.max(...worksheet.getColumn(column).values.slice(1).map(value => String(value ?? "").length), 14) + 2;
    worksheet.getColumn(column).width = Math.min(34, Math.max(14, measuredWidth));
    if (letter === "A") worksheet.getColumn(column).width = Math.max(18, worksheet.getColumn(column).width ?? 18);
  }
  worksheet.views = [{ state: "frozen", ySplit: 1, showGridLines: false }];
  worksheet.headerFooter.oddFooter = "&LJESA S.A. · CONFIDENTIAL&CPage &P of &N&RVoR Gateway";

  return workbook;
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

export function buildPdfReport(report: Omit<ReportDefinition, "filename">, logoDataUrl?: string | null) {
  const doc = new jsPDF({ orientation: "landscape", unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 38;
  const contentWidth = pageWidth - margin * 2;
  let y = 40;

  const addFooter = () => {
    const pageCount = doc.getNumberOfPages();
    for (let page = 1; page <= pageCount; page += 1) {
      doc.setPage(page);
      doc.setDrawColor(213, 222, 231);
      doc.line(margin, pageHeight - 27, pageWidth - margin, pageHeight - 27);
      doc.setFont("courier", "normal");
      doc.setFontSize(7);
      doc.setTextColor(91, 106, 123);
      doc.text("JESA S.A. · DIGITAL ENGINEERING · CONFIDENTIAL", margin, pageHeight - 14);
      doc.text(`PAGE ${page} / ${pageCount}`, pageWidth - margin, pageHeight - 14, { align: "right" });
    }
  };

  const addPageIfNeeded = (height = 18) => {
    if (y + height > pageHeight - 46) {
      doc.addPage();
      y = 46;
    }
  };

  doc.setFillColor(10, 45, 86);
  doc.rect(0, 0, pageWidth, 8, "F");
  if (logoDataUrl) {
    try {
      doc.addImage(logoDataUrl, "PNG", margin, 20, 78, 28, undefined, "FAST");
    } catch {
      // The report remains usable if a browser cannot decode the optional logo.
    }
  }
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8);
  doc.setTextColor(30, 74, 120);
  doc.text("JESA DIGITAL ENGINEERING / VoR GATEWAY", pageWidth - margin, 28, { align: "right" });
  doc.setFontSize(7);
  doc.setTextColor(91, 106, 123);
  doc.text("PAP ATTACK REACTOR · CONTROLLED REPORT", pageWidth - margin, 40, { align: "right" });
  y = 76;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(10, 45, 86);
  doc.text(report.title, margin, y);
  y += 14;
  doc.setDrawColor(28, 169, 199);
  doc.setLineWidth(2);
  doc.line(margin, y, margin + 88, y);
  y += 18;

  const metadataEntries = Object.entries(report.metadata);
  const metadataHeight = Math.max(34, Math.ceil(metadataEntries.length / 3) * 24 + 12);
  doc.setFillColor(246, 249, 252);
  doc.setDrawColor(222, 229, 237);
  doc.roundedRect(margin, y - 9, contentWidth, metadataHeight, 3, 3, "FD");
  metadataEntries.forEach(([key, value], index) => {
    const col = index % 3;
    const row = Math.floor(index / 3);
    const x = margin + 12 + col * (contentWidth / 3);
    const top = y + 5 + row * 24;
    doc.setFont("courier", "bold");
    doc.setFontSize(6.5);
    doc.setTextColor(91, 106, 123);
    doc.text(key.toUpperCase(), x, top);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(28, 43, 61);
    doc.text(String(value), x, top + 10, { maxWidth: contentWidth / 3 - 24 });
  });
  y += metadataHeight + 12;

  report.sections.forEach(section => {
    addPageIfNeeded(44);
    doc.setFillColor(10, 45, 86);
    doc.rect(margin, y, contentWidth, 24, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(255, 255, 255);
    doc.text(section.title, margin + 10, y + 16);
    y += 30;

    const colWidth = contentWidth / Math.max(section.columns.length, 1);
    const drawRow = (values: Array<string | number | null | undefined>, header = false, rowIndex = 0) => {
      const rowHeight = header ? 22 : 20;
      addPageIfNeeded(rowHeight);
      if (!header && rowIndex % 2 === 0) {
        doc.setFillColor(249, 251, 253);
        doc.rect(margin, y - 13, contentWidth, rowHeight, "F");
      }
      if (header) {
        doc.setFillColor(225, 240, 247);
        doc.rect(margin, y - 13, contentWidth, rowHeight, "F");
      }
      doc.setFont("courier", header ? "bold" : "normal");
      doc.setFontSize(header ? 7 : 7.2);
      doc.setTextColor(header ? 10 : 37, header ? 45 : 56, header ? 86 : 75);
      values.forEach((value, index) => {
        const text = String(value ?? "—").replaceAll("\n", " ");
        const clipped = text.length > 42 ? `${text.slice(0, 39)}…` : text;
        doc.text(clipped, margin + colWidth * index + 6, y, { maxWidth: colWidth - 12 });
      });
      doc.setDrawColor(222, 229, 237);
      doc.setLineWidth(0.5);
      doc.line(margin, y + 7, margin + contentWidth, y + 7);
      y += rowHeight;
    };
    drawRow(section.columns, true);
    section.rows.forEach((row, index) => drawRow(row, false, index));
    y += 10;
  });

  addFooter();
  return doc;
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
  const document = buildPdfReport(report, logoDataUrl);
  await waitForPdfStage(45);
  onProgress(82, "Finalizing file");
  const filename = report.filename.endsWith(".pdf") ? report.filename : `${report.filename}.pdf`;
  document.save(filename);
  onProgress(100, "Download complete");
}

export async function downloadPdfReport(report: ReportDefinition) {
  const document = buildPdfReport(report, await loadLogoDataUrl());
  const filename = report.filename.endsWith(".pdf") ? report.filename : `${report.filename}.pdf`;
  document.save(filename);
}
