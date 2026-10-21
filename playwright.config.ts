import { defineConfig, devices } from "@playwright/test";

// Runs against the production build, so the CSP, the headers that matter and the service worker are real.
export default defineConfig({
  testDir: "tests/e2e",
  timeout: 180_000,
  retries: 0,
  use: { baseURL: "http://localhost:4175" },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run build && npx vite preview --port 4175 --strictPort",
    url: "http://localhost:4175",
    timeout: 180_000,
    reuseExistingServer: false,
  },
});
