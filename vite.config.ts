/// <reference types="vitest/config" />
import react from "@vitejs/plugin-react";
import { build, defineConfig, type Plugin } from "vite";
import { buildSwManifest } from "./scripts/swManifest.ts";

// Strict CSP, see docs/ARCHITECTURE.md. 'wasm-unsafe-eval' lets onnxruntime-web compile its WASM; blob: lets it
// start its thread workers. public/_headers sends the same policy plus frame-ancestors (scripts/headers.test.ts).
export const CSP = [
  "default-src 'self'",
  "script-src 'self' 'wasm-unsafe-eval'",
  "style-src 'self'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'none'",
].join("; ");

// Build only: the dev server's React refresh preamble is an inline script.
const csp = (): Plugin => ({
  name: "norn-csp",
  apply: "build",
  transformIndexHtml: () => [
    { tag: "meta", attrs: { "http-equiv": "Content-Security-Policy", content: CSP }, injectTo: "head-prepend" },
  ],
});

// SW_KILL=1 builds the kill switch (src/sw/kill.ts) and an app that registers no service worker. See README.
const SW_KILL = process.env.SW_KILL === "1";

// After the app is built, build the service worker into dist/sw.js with the content revision of every file baked in.
function serviceWorker(): Plugin {
  let outDir = "dist";
  return {
    name: "service-worker",
    apply: "build",
    configResolved(config) {
      outDir = config.build.outDir;
    },
    async closeBundle() {
      await build({
        configFile: false,
        logLevel: "warn",
        define: { __SW_MANIFEST__: JSON.stringify(buildSwManifest(outDir)) },
        build: {
          outDir,
          emptyOutDir: false,
          copyPublicDir: false,
          lib: { entry: SW_KILL ? "src/sw/kill.ts" : "src/sw/sw.ts", formats: ["iife"], name: "sw", fileName: () => "sw.js" },
        },
      });
    },
  };
}

// Cross-origin isolation lets onnxruntime run on several threads. Norn loads nothing from other origins, so
// require-corp blocks nothing. The same headers are set for production in public/_headers.
const ISOLATION_HEADERS = { "Cross-Origin-Opener-Policy": "same-origin", "Cross-Origin-Embedder-Policy": "require-corp" };

export default defineConfig({
  plugins: [react(), csp(), serviceWorker()],
  define: { __SW_KILL__: JSON.stringify(SW_KILL) },
  server: { headers: ISOLATION_HEADERS },
  preview: { headers: ISOLATION_HEADERS },
  test: { include: ["src/**/*.test.ts", "src/**/*.test.tsx", "scripts/**/*.test.ts", "functions/**/*.test.ts"] },
});
