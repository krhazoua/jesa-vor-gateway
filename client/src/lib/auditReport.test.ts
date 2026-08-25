import { describe, expect, it } from "vitest";
import { buildCsvReport } from "./reportExport";
import { buildAuditReport } from "./auditReport";
import { createExcelWorkbook } from "./excelReport";

const generatedAt = new Date("2026-08-25T16:15:00.000Z");
const auditRows = [{
  id: 42,
  createdAt: new Date("2026-08-25T16:14:00.000Z"),
  requestId: 1001,
  actorId: 7,
  actorRole: "admin",
  action: "APPROVAL_APPROVED",
  module: "CPC",
  previousState: "PENDING_OPERATOR",
  newState: "ACCEPTED",
  result: "COMMITTED",
  reason: "Independent four-eyes approval completed.",
  certificateSubject: "CN=APC-GATEWAY",
  sourceIp: "10.0.0.7",
}];

describe("Audit report mapping", () => {
  it("preserves every persisted audit row in the CSV report section", () => {
    const report = buildAuditReport(auditRows, generatedAt);
    const csv = buildCsvReport(report);

    expect(report.metadata.ExportedRows).toBe("1");
    expect(report.sections[0].rows).toHaveLength(1);
    expect(csv).toContain("42,2026-08-25T16:14:00.000Z,1001,7,admin,APPROVAL_APPROVED,CPC,PENDING_OPERATOR,ACCEPTED,COMMITTED");
    expect(csv).toContain("Independent four-eyes approval completed.");
    expect(csv).toContain("CN=APC-GATEWAY");
    expect(csv).toContain("10.0.0.7");
  });

  it("round-trips the actual audit row values into the XLSX data sheet", async () => {
    const report = buildAuditReport(auditRows, generatedAt);
    const workbook = await createExcelWorkbook(report);
    const buffer = await workbook.xlsx.writeBuffer();
    const ExcelJS = await import("exceljs");
    const loaded = new ExcelJS.Workbook();
    await loaded.xlsx.load(buffer as Parameters<typeof loaded.xlsx.load>[0]);
    const dataSheet = loaded.getWorksheet("JESA Report");

    expect(dataSheet).toBeDefined();
    expect(dataSheet?.getCell("A12").value).toBe(42);
    expect(dataSheet?.getCell("B12").value).toBe("2026-08-25T16:14:00.000Z");
    expect(dataSheet?.getCell("F12").value).toBe("APPROVAL_APPROVED");
    expect(dataSheet?.getCell("K12").value).toBe("Independent four-eyes approval completed.");
  });

  it("produces a non-empty report section for multiple audit rows without pagination loss", () => {
    const report = buildAuditReport([...auditRows, { ...auditRows[0], id: 43, requestId: null, action: "REQUEST_CREATED" }], generatedAt);
    expect(report.sections[0].columns).toContain("Reason");
    expect(report.sections[0].columns).toContain("Certificate subject");
    expect(report.sections[0].rows).toHaveLength(2);
    expect(report.sections[0].rows[1][2]).toBe("SYSTEM");
    expect(report.sections[0].rows[1][5]).toBe("REQUEST_CREATED");
  });
});
