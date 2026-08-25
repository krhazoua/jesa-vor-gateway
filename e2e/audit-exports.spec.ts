import { readFile } from "node:fs/promises";
import { test, expect, type Download, type TestInfo } from "@playwright/test";
import ExcelJS from "exceljs";

const hasStorageState = Boolean(process.env.E2E_STORAGE_STATE);

async function readDownload(download: Download, testInfo: TestInfo) {
  const path = await download.path();
  expect(
    path,
    "Playwright should provide a downloaded file path"
  ).not.toBeNull();
  const artifactPath = testInfo.outputPath(download.suggestedFilename());
  await download.saveAs(artifactPath);
  return readFile(artifactPath);
}

test.describe("authenticated Audit report downloads", () => {
  test.skip(
    !hasStorageState,
    "Set E2E_STORAGE_STATE to a pre-authenticated Playwright storage state."
  );

  test.beforeEach(async ({ page }) => {
    await page.goto("/audit");
    await expect(
      page.getByRole("heading", { name: "Audit trail" })
    ).toBeVisible();
    await expect(
      page.locator('[aria-label="AUDIT EXPORT controls"]')
    ).toBeVisible();
  });

  test("downloads CSV DATA with the report control block and audit data contract", async ({
    page,
  }, testInfo) => {
    const downloadPromise = page.waitForEvent("download");
    await page
      .getByRole("button", {
        name: "Download AUDIT EXPORT as CSV data",
        exact: true,
      })
      .click();
    const download = await downloadPromise;
    const csv = (await readDownload(download, testInfo)).toString("utf8");

    expect(download.suggestedFilename()).toMatch(
      /jesa-vor-audit-\d{4}-\d{2}-\d{2}\.csv$/
    );
    expect(csv.charCodeAt(0)).toBe(0xfeff);
    expect(csv).toContain("# JESA REPORT CONTROL");
    expect(csv).toContain("JESA S.A.");
    expect(csv).toContain("# Audit events");
    expect(csv).toContain(
      "Event ID,Timestamp (UTC),Request,Actor ID,Actor role,Action,Module,Previous state,New state,Result,Reason,Certificate subject,Source IP"
    );
    expect(csv).toMatch(/ExportedRows,\d+/);

    const summary = await page.locator(".audit-page-summary").textContent();
    const total = Number(summary?.match(/of (\d+) events/)?.[1] ?? 0);
    const exportedRows = Number(csv.match(/ExportedRows,(\d+)/)?.[1] ?? -1);
    expect(exportedRows).toBe(total);
  });

  test("downloads XLSX with populated JESA Report cells and native values", async ({
    page,
  }, testInfo) => {
    const downloadPromise = page.waitForEvent("download");
    await page
      .getByRole("button", {
        name: "Download AUDIT EXPORT as Excel workbook",
        exact: true,
      })
      .click();
    const download = await downloadPromise;
    const buffer = await readDownload(download, testInfo);
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer);

    expect(download.suggestedFilename()).toMatch(
      /jesa-vor-audit-\d{4}-\d{2}-\d{2}\.xlsx$/
    );
    expect(workbook.worksheets.map(sheet => sheet.name)).toEqual([
      "JESA Report",
      "Report control",
    ]);

    const reportSheet = workbook.getWorksheet("JESA Report");
    const controlSheet = workbook.getWorksheet("Report control");
    expect(reportSheet).toBeDefined();
    expect(controlSheet).toBeDefined();
    expect(reportSheet?.getCell("A1").value).toBe(
      "JESA DIGITAL ENGINEERING | VoR GATEWAY"
    );
    expect(controlSheet?.getCell("A1").value).toBe(
      "JESA DIGITAL ENGINEERING | VoR GATEWAY"
    );
    expect(reportSheet?.getCell("A10").value).toBe("Audit events");
    expect(reportSheet?.getCell("A11").value).toBe("Event ID");
    expect(reportSheet?.getCell("B11").value).toBe("Timestamp (UTC)");

    const summary = await page.locator(".audit-page-summary").textContent();
    const total = Number(summary?.match(/of (\d+) events/)?.[1] ?? 0);
    const firstDataRow = reportSheet?.getCell("A12").value;
    if (total > 0) {
      expect(firstDataRow).toEqual(expect.any(Number));
      expect(reportSheet?.getCell("B12").value).toEqual(expect.any(String));
      expect(reportSheet?.getCell("F12").value).toEqual(expect.any(String));
    } else {
      expect(firstDataRow).toBeNull();
    }
  });
});
