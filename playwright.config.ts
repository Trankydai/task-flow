import { defineConfig, devices } from "@playwright/test";

const host = "127.0.0.1";
const port = 3100;
const baseURL = `http://${host}:${port}`;
const localChromiumExecutable =
  process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH?.trim();
const disableLocalVideo = process.env.PLAYWRIGHT_DISABLE_VIDEO === "1";
const reuseLocalServer =
  process.env.PLAYWRIGHT_REUSE_EXISTING_SERVER === "1";

export default defineConfig({
  testDir: "./tests/e2e",
  globalSetup: "./tests/e2e/global-setup.ts",
  outputDir: "./test-results",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  timeout: 45_000,
  expect: {
    timeout: 10_000
  },
  reporter: [
    ["list"],
    ["html", { open: "never", outputFolder: "playwright-report" }]
  ],
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: disableLocalVideo ? "off" : "retain-on-failure"
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        launchOptions: localChromiumExecutable
          ? { executablePath: localChromiumExecutable }
          : undefined
      }
    }
  ],
  webServer: {
    command:
      "node node_modules/next/dist/bin/next dev --webpack --hostname 127.0.0.1 --port 3100",
    url: `${baseURL}/api/health`,
    reuseExistingServer: reuseLocalServer,
    timeout: 120_000,
    env: {
      TASKFLOW_DATA_DIR: ".playwright-data",
      SESSION_SECRET: "taskflow-playwright-session-secret-2026"
    }
  }
});
