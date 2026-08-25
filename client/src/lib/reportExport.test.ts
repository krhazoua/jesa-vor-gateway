import { describe, expect, it } from "vitest";
import { buildCsvReport, buildJsonReport, buildPdfReport, escapeCsvCell } from "./reportExport";

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
    expect(csv).toContain("Source,Canonical DB / read-only");
    expect(csv).toContain("# Audit events");
    expect(csv).toContain("VOR-002,\"Operator, reviewed\"");
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
