import { expect, test } from "@playwright/test";

test("direct protected route redirects unauthenticated users to sign-in", async ({
  page,
}) => {
  await page.goto("/operations");
  await expect(page).toHaveURL(/\/login$/);
  await expect(
    page.getByRole("heading", { name: "Sign in to VoR Gateway" })
  ).toBeVisible();
  await expect(
    page.getByText(
      "Authenticate before accessing operations or request governance."
    )
  ).toBeVisible();
});
