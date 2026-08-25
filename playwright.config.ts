import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  timeout: 30_000,
  expect: { timeout: 8_000 },
  fullyParallel: false,
  reporter: [["list"], ["html", { outputFolder: "playwright-report", open: "never" }]],
  use: {
    baseURL: process.env.E2E_BASE_URL ?? "http://127.0.0.1:3000",
    browserName: "chromium",
    executablePath: process.env.E2E_CHROMIUM_PATH ?? "/usr/bin/chromium",
    headless: false,
    args: ["--headless=new"],
    storageState: process.env.E2E_STORAGE_STATE,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    ...devices["Desktop Chrome"],
  },
});
