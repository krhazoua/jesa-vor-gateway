import ExcelJS from "exceljs";
import type { ReportDefinition } from "./reportExport";

function toExcelCellValue(value: string | number | null | undefined): string | number {
  return value == null ? "" : value;
}

export async function createExcelWorkbook(report: ReportDefinition, logoDataUrl?: string | null) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "JESA Digital Engineering";
  workbook.company = "JESA S.A.";
  workbook.created = new Date();
  workbook.modified = new Date();

  const worksheet = workbook.addWorksheet("JESA Report", { properties: { defaultRowHeight: 18 }, views: [{ showGridLines: false }] });
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
      dataRow.values = values.map(toExcelCellValue);
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

