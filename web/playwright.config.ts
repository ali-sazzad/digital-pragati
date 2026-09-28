import { defineConfig } from "@playwright/test";

const port = 3200;

// Runs against a production build (`npm run build` first) because the
// service worker and real performance numbers only exist there.
export default defineConfig({
  testDir: "./tests",
  timeout: 45_000,
  fullyParallel: true,
  reporter: [["list"]],
  use: {
    baseURL: `http://localhost:${port}`,
    // Uses the installed Edge so no separate browser download is needed.
    channel: "msedge",
    viewport: { width: 1440, height: 900 },
  },
  projects: [
    // The CPU-throttled load test runs last and alone (as a teardown, which runs
    // even if other tests fail), so parallel tests don't skew its timing.
    { name: "main", grepInvert: /PERF-01/, teardown: "perf" },
    { name: "perf", grep: /PERF-01/ },
  ],
  webServer: {
    command: `npx next start -p ${port}`,
    url: `http://localhost:${port}`,
    reuseExistingServer: false,
    // Print enquiries instead of emailing them, so tests never send real mail.
    env: {
      ENQUIRY_DELIVERY: "log",
      PGLITE_DIR: ".data/test-pglite",
      ADMIN_PASSWORD: "test-admin",
      ENQUIRY_ALLOWED_ORIGINS: "http://static.test",
      ENQUIRY_RATE_LIMIT: "1000",
    },
    timeout: 60_000,
  },
});
