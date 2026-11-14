import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: "html",
  use: {
    baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "Desktop Chrome - English (LTR)",
      use: { ...devices["Desktop Chrome"], locale: "en-US" },
    },
    {
      name: "Desktop Chrome - Arabic (RTL)",
      use: { ...devices["Desktop Chrome"], locale: "ar-AE" },
    },
    {
      name: "Mobile Safari - iPhone 14 (LTR)",
      use: { ...devices["iPhone 14"], locale: "en-US" },
    },
    {
      name: "Mobile Safari - iPhone 14 (RTL)",
      use: { ...devices["iPhone 14"], locale: "ar-AE" },
    },
  ],
  webServer: {
    command: "npm run start",
    url: "http://localhost:3000",
    reuseExistingServer: !process.env.CI,
    timeout: 120 * 1000,
  },
});
