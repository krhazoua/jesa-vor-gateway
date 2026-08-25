import { jsPDF } from "jspdf";
import type { ReportDefinition } from "./reportExport";

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

