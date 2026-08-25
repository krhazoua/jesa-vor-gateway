import { test, expect } from "@playwright/test";

const hasStorageState = Boolean(process.env.E2E_STORAGE_STATE);

test.describe("authenticated VoR Gateway workflows", () => {
  test.skip(!hasStorageState, "Set E2E_STORAGE_STATE to a pre-authenticated Playwright storage state.");

  test.beforeEach(async ({ page }) => {
    await page.goto("/approvals");
  });

  test("opens the approval queue and completes an available approval decision", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Approval queue" })).toBeVisible();
    const approveButtons = page.getByRole("button", { name: "APPROVE", exact: true });
    const count = await approveButtons.count();
    if (count === 0) {
      await expect(page.getByText("No canonical approval rows are available for this authenticated session.")).toBeVisible();
      test.skip(Boolean(process.env.E2E_REQUIRE_PENDING_APPROVAL), "The secure fixture did not contain a pending approval.");
      return;
    }

    await approveButtons.first().click();
    const dialog = page.getByRole("dialog", { name: "Approve request" });
    await expect(dialog).toBeVisible();
    await dialog.getByRole("button", { name: "APPROVE", exact: true }).click();
    await expect(page.getByText("Approval committed by the server.")).toBeVisible();
  });

  test("logs out through the authenticated UI and returns to secure sign-in", async ({ page }) => {
    await page.goto("/operations");
    await expect(page.getByRole("heading", { name: /Verification of Request/ })).toBeVisible();
    await page.getByRole("button", { name: "Log out" }).click();
    await expect(page).toHaveURL(/\/login$/);
    await expect(page.getByRole("heading", { name: "Sign in to VoR Gateway" })).toBeVisible();
  });
});
