import ExcelJS from "exceljs";
import { describe, expect, it } from "vitest";
import { buildCsvReport, buildJsonReport, buildPdfReport, createExcelWorkbook, escapeCsvCell } from "./reportExport";

describe("report exports", () => {
  const report = {
    title: "JESA VoR Gateway — Audit trail",
    metadata: { Source: "Canonical DB / read-only", Boundary: "No plant write path" },
    sections: [{ title: "Audit events", columns: ["Request", "Transition"], rows: [["VOR-001", "VERIFIED → ACCEPTED"], ["VOR-002", "Operator, reviewed"]] }],
  };

  it("escapes commas, quotes, and line breaks as CSV cells", () => {
    expect(escapeCsvCell('Operator, "reviewed"')).toBe('"Operator, ""reviewed"""');
    expect(escapeCsvCell("line 1\nline 2")).toBe('"line 1\nline 2"');
  });

  it("includes metadata and section data in the CSV report", () => {
    const csv = buildCsvReport(report);
    expect(csv.charCodeAt(0)).toBe(0xfeff);
    expect(csv).toContain("# JESA S.A.");
    expect(csv).not.toContain("Brand asset:");
    expect(csv).not.toContain("JESA-wordmark.png");
    expect(csv).toContain("# JESA VoR Gateway — Audit trail");
    expect(csv).toContain("# JESA REPORT CONTROL");
    expect(csv).toContain("CONTROL FIELD,CONTROL VALUE,DATA BOUNDARY");
    expect(csv).toContain("FUNCTION,Digital Engineering / VoR Gateway,Read-only / no plant write");
    expect(csv).toContain("# REPORT METADATA");
    expect(csv).toContain("Source,Canonical DB / read-only");
    expect(csv).toContain("# DATA SECTIONS");
    expect(csv).toContain("SECTION,Audit events,2,2");
    expect(csv).toContain("# Audit events");
    expect(csv).toContain("VOR-002,\"Operator, reviewed\"");
  });

  it("creates a branded Excel workbook with embedded logo media and usable table controls", async () => {
    const workbook = await createExcelWorkbook(report, "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=");
    expect(workbook.creator).toBe("JESA Digital Engineering");
    expect(workbook.company).toBe("JESA S.A.");
    expect(workbook.worksheets[0].name).toBe("JESA Report");
    expect(workbook.worksheets[0].getCell("A2").value).toBe(report.title);
    expect(workbook.worksheets[0].getCell("A8").value).toBe("Audit events");
    expect(workbook.worksheets[0].views[0].state).toBe("frozen");
    expect(workbook.worksheets[0].autoFilter).toBeDefined();
    expect(workbook.worksheets[1].name).toBe("Report control");
    expect(workbook.worksheets[1].getCell("A4").value).toBe("DOCUMENT CONTROL");
    expect(workbook.model.media.length).toBe(2);
    const buffer = await workbook.xlsx.writeBuffer();
    const reloaded = new ExcelJS.Workbook();
    await reloaded.xlsx.load(buffer);
    expect(reloaded.getWorksheet("JESA Report")?.getCell("A10").value).toBe("VOR-001");
  });

  it("preserves numeric and nullable values as Excel cells", async () => {
    const workbook = await createExcelWorkbook({
      ...report,
      sections: [{ title: "Process values", columns: ["Tag", "Value", "Comment"], rows: [["TIC-5210", 75.8, null], ["AIC-5214", 0, "Stable"]] }],
    }, null);
    const worksheet = workbook.getWorksheet("JESA Report");
    expect(worksheet?.getCell("A10").value).toBe("TIC-5210");
    expect(worksheet?.getCell("B10").value).toBe(75.8);
    expect(worksheet?.getCell("C10").value).toBe("");
    expect(worksheet?.getCell("B11").value).toBe(0);
  });

  it("serializes metadata and sections as structured JSON", () => {
    const json = JSON.parse(buildJsonReport({ ...report, filename: "audit" }));
    expect(json.metadata.Source).toBe("Canonical DB / read-only");
    expect(json.sections[0].rows[1][0]).toBe("VOR-002");
  });

  it("generates a non-empty PDF report from the same definition", async () => {
    const pdf = await buildPdfReport(report, "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=");
    expect(pdf.output("arraybuffer").byteLength).toBeGreaterThan(500);
    expect(pdf.output()).toContain("JESA DIGITAL ENGINEERING");
    expect(pdf.output()).toContain("CONFIDENTIAL");
  });
});
