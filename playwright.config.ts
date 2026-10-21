import { defineConfig, devices } from "@playwright/test";

// Runs against the production build, so the CSP, the headers that matter and the service worker are real.
// NORN_URL=https://nornor.app npm run e2e runs the same tests against a live site instead.
const live = process.env.NORN_URL;

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 180_000,
  retries: 0,
  use: { baseURL: live ?? "http://localhost:4175" },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
  ],
  webServer: live ? undefined : {
    command: "npm run build && npx vite preview --port 4175 --strictPort",
    url: "http://localhost:4175",
    timeout: 180_000,
    reuseExistingServer: false,
  },
});
