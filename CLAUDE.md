# CLAUDE.md

Product name: **Norn**. Free, open source (MIT), a labs project from Prompt Agency, to launch at `nornor.app`. It is a technology experiment with no support promise, and a marketing project for Prompt Agency as much as an open source one. Name and URL live in `src/config.ts` only.

## What this is

A static web app that forecasts the user's own time series in the browser. The user drops a CSV or picks an example, Norn shows what has been, how well the model reads this particular series, and what is likely to come, with honest uncertainty. Nothing leaves the user's device.

Engine: Mistral's Timestral time-series foundation model (Modified MIT weights), run with onnxruntime-web in a Web Worker. We use amine40's ONNX exports (`amine40/Timestral-28M-ONNX`, `amine40/Timestral-5M-ONNX`, fp16 weights) and the JavaScript port of the forecast function from `amine-athmani/timestral-in-browser` (Apache 2.0), both wrapped behind our own interface so they can be swapped. We do not publish our own model exports.

## Audience

Ordinary people with numbers over time and no background in statistics: a shop owner with sales per day, someone with the house's electricity bill, a small webshop, a municipal officer with visitor counts. They have never heard the word covariate and should never need to. amine40's app already serves analysts; Norn is the version for everyone else. See `docs/COPY.md` for tone.

## Read before coding

1. `PLAN.md` – phases, decisions and open questions
2. `docs/UX.md` – the four screens (Start, Urd, Verdandi, Skuld) and what is out of scope
3. `docs/ARCHITECTURE.md` – module boundaries, worker, model hosting, privacy constraints
4. `docs/COPY.md` – Swedish copy rules and the fixed strings
5. `docs/DATA.md` – the example datasets, their sources and licences
6. `design/DESIGN.md` – the visual identity
7. The upstream code: `amine-athmani/timestral-in-browser` (`web/src/lib/timestral.js`, `web/src/lib/worker.js`) and the model card on Hugging Face. Fetch them; do not guess the API.

## Hard rules (privacy)

- **The user's data never leaves the device.** No backend, no accounts, no cookies, no analytics unless `PLAN.md` says otherwise. No CDN fonts, no error reporting. Enforce with a strict CSP and verify with a Playwright test that lists every request.
- User data (the file, the parsed series, forecasts) lives **in memory only** in v1. Never `localStorage`, `sessionStorage`, IndexedDB, cookies or URL params. The only persistence is an explicit user-triggered download. A per-viewer convenience (theme) may use `localStorage`; nothing derived from the data may.
- "Kopiera länk" encodes settings only (example id, horizon, certainty level), never values from the user's file.
- All inference runs in a **Web Worker**. The main thread never blocks.
- Model and ONNX runtime files are served from our own origin (split into chunks under 25 MiB, joined in the worker) and cached by the service worker so the app works offline after the first visit. URLs live in `src/config.ts` only.
- The only analytics is anonymous page views to self-hosted Plausible through a Pages Function on our own origin, as in Skrubba. No custom events, nothing from the user's data.
- Never claim anything in the UI about where data is processed or stored that is not true of the code as it stands.

## Stack

- Vite + React + TypeScript, no UI framework, plain CSS with custom properties from `design/tokens.css`. Minimal, audited dependencies. Hand-built, not Lovable.
- `onnxruntime-web` (WASM by default, WebGPU only if it is proven equal), pinned to an exact version.
- Charts are our own SVG component, `Prognosgraf` in `src/ui/components/`. PapaParse for CSV. Nothing else without asking.
- PWA (service worker) for offline use after the first visit.
- Deploy: static build to Cloudflare Pages at `nornor.app`.
- Tests: Vitest for logic (CSV parsing, frequency detection, the forecast wrapper against fixtures), Playwright for the full flow and the "no external requests" check.
- Python in `scripts/` only (export spike, dataset builder, token builder). The app never depends on it at runtime.

## Conventions

- Code, commits and docs under `docs/` except `COPY.md`: English. UI: Swedish, per `docs/COPY.md`.
- Forecasting behind `src/engine/` with a single interface (`Forecaster`). Nothing outside imports onnxruntime-web or the upstream `timestral.js` directly. The upstream file is vendored unchanged under `src/engine/vendor/` with its licence and a note of the commit it came from.
- Build every screen from `src/ui/components/`. Read `src/ui/components/README.md` first. Never write a one-off variant of a component; change the component instead.
- The design system in Claude is built from the same components (`npm run build:ds`). After changing a component, rebuild the bundle and tell the owner it needs uploading, or upload it if you have access.
- Every number shown to the user has passed through `src/engine/`. The UI never computes a forecast statistic itself.
- Time is always shown in the user's unit (dagar, veckor, månader, timmar). The word "steg" never appears in the UI.
- Uncertainty is shown as two bands (50 and 90 percent) and described in words ("i nio fall av tio"). The words kvantil, konfidensintervall, MASE and kovariat never appear in the UI outside "Visa detaljer".
- No links out of the app in the user flow. Credits to Mistral, amine40 and data sources live in the footer and in `README.md`. The one exception: "Prompt Agency" in the header tag and the footer links to promptagency.se, in a new tab (owner, 2026-10-21).
- Commit small, one feature per commit, with the test that proves it.

## Out of scope for v1

Model choice in the UI, several series at once, anomalies, cycles and state-space views, a draggable backtest start, accounts, saved projects, Fortnox or Home Assistant import. All of these exist in amine40's app; Norn deliberately leaves them out. Do not build toward them unless `PLAN.md` says so.

## When unsure

Add a note under "Open questions" in `PLAN.md` rather than guessing on anything that touches privacy, copy, the grading thresholds in Verdandi or how uncertainty is presented.

## Design

- The visual identity is defined in `design/DESIGN.md`. Read it before any change to the interface.
- Colours, fonts, spacing and radii come from `design/tokens.css`. Never write a hex value, an `rgb()` value or a font name in component CSS. Use the variables. Chart code reads values from the CSS variables at runtime, so both themes work.
- Both themes must work. Check every interface change in light and in dark.
- The forecast chart is `Prognosgraf`. It follows the chart rules in `design/DESIGN.md` exactly: history solid, median dotted in the same colour, band-90 under band-50, the now-line in krapp, bands explained in words.
- The logo files in `design/logo/` and the icons in `design/icon/` are used as they are. Never retype, recolour or redraw the logo.
- Fonts are served from the repo. Never add a font CDN or any other third-party request for styling.
- If a design decision is not covered by `DESIGN.md`, ask instead of inventing one.
