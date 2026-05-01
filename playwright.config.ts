import { defineConfig } from "@playwright/test";

const baseURL = process.env.PVB_BASE_URL ?? "http://127.0.0.1:3100";
const useExternalServer = Boolean(process.env.PVB_BASE_URL);

export default defineConfig({
  testDir: "./tests/e2e",
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },
  fullyParallel: false,
  retries: process.env.CI ? 2 : 0,
  reporter: [["list"]],
  use: {
    baseURL,
    viewport: { width: 1366, height: 768 },
    trace: "on-first-retry",
    screenshot: "only-on-failure",
  },
  webServer: useExternalServer
    ? undefined
    : {
        command: "npm run dev -- --hostname 127.0.0.1 --port 3100",
        url: baseURL,
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
      },
});
