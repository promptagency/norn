# PLAN.md

Phased plan for Norn. Each phase ends in something runnable. Do not start a phase before the previous one's definition of done is met.

## Decisions so far

Taken by the owner, 2026-10-20. Do not revisit without asking.

- Norn is an open source labs project under Prompt Agency, at `norn.promptagency.se`, MIT. Experiment, no support promise. Marketing for Prompt Agency as much as open source.
- One tool, not several. Presets and examples cover different kinds of data; the core is the same.
- Engine: amine40's Timestral ONNX exports and the `timestral.js` port from `amine-athmani/timestral-in-browser`. We do not publish our own exports to Hugging Face. Our own export from the spike stays in `scripts/` as a verification tool.
- Norn is a less technical version of amine40's app for ordinary users. Clear example data from different sources is kept from amine40's idea. No links out of the app in the user flow.
- Hand-built (Vite + React + TS), not Lovable, to keep GDPR simple: a static site with no backend.
- Example data from Swedish open sources (SCB, elprisetjustnu.se, SMHI, Wikimedia), not synthetic. See `docs/DATA.md`.
- Visual identity: typographic logo "norn" in Bricolage Grotesque 700, no symbol. Colours lin and indigo, dark theme in night indigo. Favicon is a plain "n". See `design/DESIGN.md`.
- Model hosting (2026-10-21): own origin, same as Skrubba. The model files are split into chunks under 25 MiB in `public/model/` and joined in the worker. CSP `connect-src 'self'`. No Hugging Face request at runtime.
- Analytics (2026-10-21): the same setup as Skrubba. Self-hosted Plausible, anonymous page views only, proxied through a Cloudflare Pages Function on our own origin so `connect-src` stays `'self'`. No events carrying anything from the user's data.
- Licence holder (2026-10-21): Prompt Agency AB, as `LICENSE` says.
- Parity bar (2026-10-21): the engine must match the official Python package within 1 percent of the mean width of the 90 band, on every case. amine40's fp16 weights land at 0.1 to 0.7 percent; the earlier bar of 1e-3 of the series' standard deviation fails on long horizons, where the fed-back median compounds the fp16 rounding (an fp32 export passes, so the port is right). fp16 stays.
- Domains (2026-10-21): the canonical address is `norn.promptagency.se`. `nornor.app` is a short address that 301-redirects there (Cloudflare zone exists, redirect to be set up at launch, same setup as `skrubba.app`). The app never refers to `nornor.app`.

## Phase 0 – Spike (done)

Goal: prove Timestral runs in onnxruntime-web and matches PyTorch.

- [x] Export Timestral-5M and 28M to ONNX (`scripts/export_onnx.py`), fp16 and int8 variants (`scripts/quantize_onnx.py`).
- [x] Compare against the official PyTorch forecaster on random walk, seasonal, non-negative trend, odd length and gaps, horizons 24 to 1500 (`scripts/verify_onnx.py`).
- [x] Measure latency in onnxruntime-web WASM (`webtest/`).
- [x] Check community exports. amine40's 28M export matches PyTorch within about 1e-3 of the series' standard deviation and includes covariate support. Decision: build on it.

Results in `docs/fas0-resultat.md` (Swedish). Short version: fp16 weights are the right default (half the size, no visible change); int8 moves the quantiles too much. 28M runs in 0.5 to 1.1 s in WASM on a slow two-core container for 2,000 steps of context and 96 ahead.

## Phase 0b – Example data (done)

- [x] `scripts/build_datasets.py` fetches SCB retail turnover (four trades, monthly since 1991), SE3 spot price per hour since November 2022 with Göteborg temperature from SMHI, and writes `public/data/` plus `examples.json`.
- [x] Backtest with Timestral-28M on the real data. Recorded in `docs/DATA.md`.
- [x] Wikipedia page views (`python scripts/build_datasets.py wiki`), built on the owner's machine 2026-10-21. Backtest and peak check in `docs/DATA.md`. Default series melodifestivalen (owner's decision).

## Phase 0c – Design programme (done)

- [x] Three directions explored, "Tråden" chosen, refined to a typographic logo.
- [x] Logo outlined, icons, colour tokens with contrast checks, chart tokens, type, tone. In `design/`.
- [x] Screen sketches for Start, Urd, Verdandi and Skuld on the design canvas "Norn skärmskisser", with real Timestral-28M output on the SE3 price. Approved by the owner 2026-10-20.
- [x] Components as React code in `src/ui/components/`, built into the design system with `npm run build:ds` (owner's decision 2026-10-20: one source for app and design system). Gallery in `src/dev/`.
- [ ] Phone layout of the four screens.

Decision 2026-10-20: the chart is our own SVG component (`Prognosgraf`) instead of uPlot, so it follows the chart rules exactly and renders the same in the design system.

## Phase 1 – Engine wrapper

- [x] Scaffold Vite 8 + React 19 + TS 7 in the repo root, same versions as Skrubba.
- [x] Move the example data to `public/data/`. Strict CSP, injected into `index.html` at build by `vite.config.ts` (the dev server needs an inline script).
- [x] Vendor `timestral.js` from `amine-athmani/timestral-in-browser` under `src/engine/vendor/`, unchanged, with the Apache 2.0 licence and the commit hash. Upstream's `worker.js` is not vendored: it downloads from Hugging Face, so Norn has its own `worker.ts` in the same shape.
- [x] `src/engine/Forecaster.ts`: `init(onProgress)`, `forecast(series, horizon, options)`, `backtest(series, horizon, options)`, types `Series`, `Forecast` (median, the 50 and 90 bands and all 21 levels per step), `Backtest`. `options.known` carries known-future series.
- [x] Worker runs onnxruntime-web 1.30.0 (WASM), loads the model once, reports byte-level progress. Checked in Chrome on a production build with the CSP: 59 MB loads with progress, a 96-step forecast on 2,000 points takes about 2.7 s single-threaded.
- [x] Parity test: fixtures from the official Python package (`scripts/make_fixtures.py`), the spike's cases at horizons 24 and 1,100 plus a backtest on each example's default series, compared in Vitest by `src/engine/run.ts`, the code the worker runs.
- [x] `scripts/fetch-model.mjs` (Node instead of the planned `split_model.py`, so the Cloudflare build needs no Python, as in Skrubba): downloads amine40's fp16 files at a pinned revision, checks sha256, splits them into 24 MiB chunks in `public/model/<revision>/` (gitignored). Runs before dev, build and test. The chunk count follows from the size in `src/config.ts`, so no manifest is needed.

Done when: a Vitest run forecasts every example dataset with the worker's code and matches the Python fixtures within the parity bar above. Met 2026-10-21 (18 tests).

## Phase 2 – Start and Urd

Follow `docs/UX.md`.

- [ ] Start: one sentence, file drop zone, example cards from `examples.json`.
- [ ] CSV and pasted text: separator, decimal comma, Swedish and ISO dates, sorting, gaps.
- [ ] Guess time column, value column and frequency. Write the one-sentence description of the data.
- [ ] "Stämmer det?" with Ja and "Nej, ändra kolumner".
- [ ] Clear errors with a suggestion: too few points, irregular time, unreadable column.

Done when: every example and five messy real-world CSVs (owner supplies) reach Urd with the right description.

## Phase 3 – Verdandi

- [ ] Automatic backtest on the last period (length by frequency, see `docs/UX.md`).
- [ ] Chart of the period with forecast bands over what happened.
- [ ] Grade in three levels with one sentence. Thresholds per open question below.
- [ ] "Visa detaljer" with the numbers behind the grade.

Done when: the grade on each example matches what the backtest table in `docs/DATA.md` would lead a person to expect.

## Phase 4 – Skuld

- [ ] Forecast chart per `design/DESIGN.md`, the answer in one sentence above it.
- [ ] Horizon buttons in the user's unit.
- [ ] "Hur säker vill du vara?" (most likely, nine of ten, nineteen of twenty).
- [ ] "Vet du något om framtiden?" with Swedish public holidays and the user's own events as known-future covariates. Show when an event does not change the forecast.
- [ ] Download CSV with all quantiles, print, copy link (settings only).

Done when: a user can go from file to forecast and change horizon and certainty in under a minute without reading anything twice.

## Phase 5 – Ship

- [ ] PWA with model and runtime cached. Works offline after the first visit.
- [ ] Playwright: full flow on each example, and a test that fails on any request to another origin after first load.
- [ ] Footer: experiment, no support, data never leaves the computer, credits to Mistral, amine40 and the data sources.
- [ ] Plausible page views through a Pages Function, copied from Skrubba. Verify in the Playwright request test that nothing else leaves the origin.
- [ ] Deploy to Cloudflare Pages at `norn.promptagency.se`.
- [ ] `nornor.app` and `www.nornor.app`: AAAA `100::` proxied, Always Use HTTPS, one Single Redirect rule (301, keep path and query) to `https://norn.promptagency.se`.
- [ ] README in Prompt Agency's voice, with what worked and what did not.

## Open questions

- **Grading thresholds in Verdandi.** An editorial choice that must be defensible in "Visa detaljer". Proposal to discuss: Pålitlig when the error is clearly below repeating last season and coverage of the 90 band is between 80 and 97 percent; Osäker when the model does not beat repeating last season; Ungefärlig otherwise.
- **The covariate example.** Göteborg temperature lowers the SE3 price error by only 2 percent. Find consumption data where a known-future series really helps, or show honestly that it sometimes does not.
- **Weak hardware.** When does Norn fall back to the 5M model without asking? Proposal: if the first 28M forecast takes over 3 s. Note: on a Mac in Chrome, single-threaded (no cross-origin isolation yet), the first 28M forecast already takes about 2.7 s. COOP/COEP headers in Phase 5 would allow threads; measure again before setting the threshold.
- **History cap.** amine40 caps history at 4,096 steps in the browser. Keep that, or offer more for hourly data?
