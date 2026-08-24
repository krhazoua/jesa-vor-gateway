import { describe, expect, it } from "vitest";
import { buildCsvReport, buildPdfReport, escapeCsvCell } from "./reportExport";

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
    expect(csv).toContain("# JESA VoR Gateway — Audit trail");
    expect(csv).toContain("Source,Canonical DB / read-only");
    expect(csv).toContain("# Audit events");
    expect(csv).toContain("VOR-002,\"Operator, reviewed\"");
  });

  it("generates a non-empty PDF report from the same definition", () => {
    const pdf = buildPdfReport(report);
    expect(pdf.output("arraybuffer").byteLength).toBeGreaterThan(500);
  });
});
