import ExcelJS from "exceljs";
import JSZip from "jszip";
import { describe, expect, it } from "vitest";
import { buildCsvReport, buildJsonReport, buildPdfReport, createCsvLogoPackage, createExcelWorkbook, escapeCsvCell, JESA_LOGO_URL } from "./reportExport";

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
    expect(csv).toContain("# Brand asset: JESA wordmark / /manus-storage/jesa-wordmark_e357ca66.png");
    expect(csv).toContain("# JESA VoR Gateway — Audit trail");
    expect(csv).toContain("# JESA REPORT CONTROL");
    expect(csv).toContain("CONTROL FIELD,CONTROL VALUE,JESA BRAND ASSET,DATA BOUNDARY");
    expect(csv).toContain(`FUNCTION,Digital Engineering / VoR Gateway,${JESA_LOGO_URL},Read-only / no plant write`);
    expect(csv).toContain("# REPORT METADATA");
    expect(csv).toContain("Source,Canonical DB / read-only");
    expect(csv).toContain("# DATA SECTIONS");
    expect(csv).toContain("SECTION,Audit events,2,2");
    expect(csv).toContain("# Audit events");
    expect(csv).toContain("VOR-002,\"Operator, reviewed\"");
  });

  it("packages the organized CSV with the actual JESA wordmark and a manifest", async () => {
    const logoBytes = new Uint8Array([137, 80, 78, 71]).buffer;
    const packageBlob = await createCsvLogoPackage({ ...report, filename: "audit-report.csv" }, logoBytes);
    const zip = await JSZip.loadAsync(await packageBlob.arrayBuffer());
    expect(zip.file("audit-report.csv")).toBeDefined();
    expect(zip.file("JESA-wordmark.png")).toBeDefined();
    expect(zip.file("README.txt")).toBeDefined();
    expect(await zip.file("JESA-wordmark.png")?.async("uint8array")).toEqual(new Uint8Array([137, 80, 78, 71]));
    expect(await zip.file("README.txt")?.async("string")).toContain("CSV itself remains a text format");
  });

  it("creates a branded Excel workbook with embedded logo media and usable table controls", async () => {
    const workbook = await createExcelWorkbook(report, "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=");
    expect(workbook.creator).toBe("JESA Digital Engineering");
    expect(workbook.company).toBe("JESA S.A.");
    expect(workbook.worksheets[0].name).toBe("Report control");
    expect(workbook.worksheets[0].getCell("A2").value).toBe(report.title);
    expect(workbook.worksheets[0].getCell("A4").value).toBe("DOCUMENT CONTROL");
    expect(workbook.worksheets[1].name).toBe("JESA Report");
    expect(workbook.worksheets[1].getCell("A8").value).toBe("Audit events");
    expect(workbook.worksheets[1].views[0].state).toBe("frozen");
    expect(workbook.worksheets[1].autoFilter).toBeDefined();
    expect(workbook.model.media.length).toBe(2);
    const buffer = await workbook.xlsx.writeBuffer();
    const reloaded = new ExcelJS.Workbook();
    await reloaded.xlsx.load(buffer);
    expect(reloaded.getWorksheet("JESA Report")?.getCell("A10").value).toBe("VOR-001");
  });

  it("serializes metadata and sections as structured JSON", () => {
    const json = JSON.parse(buildJsonReport({ ...report, filename: "audit" }));
    expect(json.metadata.Source).toBe("Canonical DB / read-only");
    expect(json.sections[0].rows[1][0]).toBe("VOR-002");
  });

  it("generates a non-empty PDF report from the same definition", () => {
    const pdf = buildPdfReport(report, "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=");
    expect(pdf.output("arraybuffer").byteLength).toBeGreaterThan(500);
    expect(pdf.output()).toContain("JESA DIGITAL ENGINEERING");
    expect(pdf.output()).toContain("CONFIDENTIAL");
  });
});
