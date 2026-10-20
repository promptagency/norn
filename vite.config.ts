/// <reference types="vitest/config" />
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Phase 1 scaffold. CSP, service worker and model hosting come later (see PLAN.md).
// The example data still lives in app/public/ until it moves to public/ in Phase 1.
export default defineConfig({
  plugins: [react()],
  publicDir: "app/public",
  test: { include: ["src/**/*.test.ts", "src/**/*.test.tsx"] },
});
