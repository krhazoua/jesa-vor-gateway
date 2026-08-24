import { describe, expect, it } from "vitest";
import { getPdfExportPresentation } from "./ReportExportActions";

describe("ReportExportActions PDF progress presentation", () => {
  it("starts ready without blocking CSV export", () => {
    expect(getPdfExportPresentation({ status: "idle", progress: 0, step: "Ready to generate" })).toEqual({
      label: "PDF",
      step: "Ready to generate",
      busy: false,
    });
  });

  it("shows progress and disables only the PDF action while generating", () => {
    expect(getPdfExportPresentation({ status: "generating", progress: 42, step: "Building PDF layout" })).toEqual({
      label: "PDF 42%",
      step: "Building PDF layout",
      busy: true,
    });
  });

  it("exposes completion and retry states", () => {
    expect(getPdfExportPresentation({ status: "complete", progress: 100, step: "Download complete" }).label).toBe("PDF READY");
    expect(getPdfExportPresentation({ status: "error", progress: 0, step: "Generation failed" }).label).toBe("RETRY PDF");
  });
});
