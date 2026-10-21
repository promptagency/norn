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
- Verdandi's grade (2026-10-21): Pålitlig when Norn's error is at least 20 percent below repeating the last season and at least 80 percent of outcomes fall inside the 90 band; Osäker when Norn does not beat repeating the last season; Ungefärlig otherwise. No upper limit on coverage: with 12 monthly points a perfectly honest band covers all of them about a quarter of the time. The baseline is the same hour or day last week for hourly and daily data, the same period last year otherwise. Daily data holds out a year, not three months, so yearly peaks are part of the test. Constants in `src/engine/backtest.ts`.
- Skuld (2026-10-21): the answer is a total or an average over the horizon, made by adding up each step's levels. That range is cautious (the real total fell inside the summed nine-in-ten range 99 times in 100 across the examples), so the words say "i minst nio fall av tio". Total when the user chose Summera in Urd or every value is a whole number of zero or more; average otherwise. "Kopiera länk" only for examples.
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

- [x] Start: one sentence, file drop zone, example cards from `examples.json` (which gains `source_short`, `since` and `labels`).
- [x] CSV, pasted text and Excel (SheetJS 0.20.3, owner's decision 2026-10-21, loaded only for Excel files): separator, decimal comma, Swedish and ISO dates, sorting, gaps. The repeated hour when clocks go back is averaged.
- [x] Guess time column, value column and frequency. Write the one-sentence description of the data.
- [x] Several rows per day (a till export, readings every 15 minutes): Urd asks "Hur ska raderna läggas ihop?" with Summera or Ta snittet (owner's decision 2026-10-21). When summing, a day without rows counts as 0.
- [x] "Stämmer det?" with Ja and "Nej, ändra kolumner". The link shows only when there is more than one possible time column; the value columns are always shown when there is a choice. Ja leads to an empty Verdandi until Phase 3.
- [x] Clear errors with a suggestion: too few points, irregular time, unreadable column, no time column, unreadable file. Errors that another column choice could fix stay in Urd; the rest go to the drop zone on Start.

Done when: every example and five messy real-world CSVs (owner supplies) reach Urd with the right description. The examples do (Vitest, and checked in Chrome on a production build); the five CSVs are still to come from the owner.

## Phase 3 – Verdandi

- [x] Automatic backtest on the last period (length by frequency, see `docs/UX.md`; a short series holds out a quarter of itself). The model starts downloading when Urd opens, with progress in megabytes in Verdandi.
- [x] Chart of the period with forecast bands over what happened, with as much history before it.
- [x] Grade in three levels with one sentence, per the decision above. The error is said as a percent only when every value in the period is above zero and the percent is at most 100; otherwise in the data's own numbers per hour or day.
- [x] "Visa detaljer" with the numbers behind the grade and the rule in words.

Done when: the grade on each example matches what the backtest table in `docs/DATA.md` would lead a person to expect. Met 2026-10-21: Leksaksaffärer Ungefärlig (3 percent better than last year), Elpris, Melodifestivalen and the other trades Pålitlig, Göteborg temperature Osäker. Checked in Chrome on a production build.

## Phase 4 – Skuld

- [x] Forecast chart per `design/DESIGN.md`, the answer in one sentence above it, all its numbers rounded to the same step.
- [x] Horizon buttons in the user's unit, counted in calendar steps (`src/data/horizon.ts`).
- [x] "Hur säker vill du vara?" (most likely, nine of ten, nineteen of twenty), with a sentence on what to plan for.
- [x] "Vet du något om framtiden?" with Swedish events as known-future covariates for daily and hourly data: röda dagar, midsommarafton, lucia, julhandeln, industrisemestern (`src/engine/holidays.ts`). Only events the history has seen and the horizon contains are offered. The difference is said in words; less than 1 percent says the event changes nothing.
- [ ] The user's own events ("Kampanj 3 till 9 november") and the difference as a second line in the chart. Both need design first: a date-range field and a comparison line style are not in `design/DESIGN.md` (owner's decision 2026-10-21 to wait).
- [x] Download CSV with all quantiles (semicolons and decimal commas for Swedish Excel), print, copy link (settings only, examples only). A link opens straight in Skuld.

Done when: a user can go from file to forecast and change horizon and certainty in under a minute without reading anything twice.

## Phase 5 – Ship

- [x] Service worker from Skrubba: small files on install, the model, runtime and example CSVs when first fetched, never user data. Works offline after the first forecast (Playwright). "Det sker bara första gången." (`model.once`) is shown only while the service worker controls the page. `model.ready` is not used: there is no moment on screen where it would be read. Kill switch with `SW_KILL=1`. Cross-origin isolation in `public/_headers` lets the model run on several threads.
- [x] Playwright: full flow on each example, a test that fails on any request to another origin, offline after the first forecast, and nothing stored in the browser (`npm run e2e`).
- [x] Footer: experiment, no support, data never leaves the computer, credits to Mistral, amine40 and the data sources (`footer.experiment`, `footer.credits`).
- [x] Plausible page views through a Pages Function, copied from Skrubba (`functions/api/event.ts`). The site must be added in Plausible as `norn.promptagency.se` before launch. The Playwright request test sees no other origin.
- [ ] Deploy to Cloudflare Pages at `norn.promptagency.se`.
- [ ] `nornor.app` and `www.nornor.app`: AAAA `100::` proxied, Always Use HTTPS, one Single Redirect rule (301, keep path and query) to `https://norn.promptagency.se`.
- [x] README in Prompt Agency's voice (English, like Skrubba's), with what worked and what did not.

## Open questions

- **The covariate example.** Answered 2026-10-21 by the events: a midsommarafton marker moves Norn's guess for the peak day on the Midsommar page from 3,944 to 7,845 (actual 10,464) and lowers the year's error by 28 percent; lucia does the same for the Lucia page. Göteborg temperature (2 percent better for SE3) is not offered in the UI, since its future is not known without a weather forecast.
- **Weak hardware.** When does Norn fall back to the 5M model without asking? Proposal: if the first 28M forecast takes over 3 s. Note: on a Mac in Chrome, single-threaded (no cross-origin isolation yet), the first 28M forecast already takes about 2.7 s. COOP/COEP headers in Phase 5 would allow threads; measure again before setting the threshold.
- **Build depends on amine40's Hugging Face repos.** `scripts/fetch-model.mjs` downloads the model at a pinned revision and sha256 on every clean build (Cloudflare included); the chunks are not in git. If amine40 deletes or renames the files, new deploys fail loudly (no silent swap), while the live site and local builds (`.cache/model/`) keep working. Accepted for now (owner, 2026-10-21), same as Skrubba. Options if it bites: a backup copy we control (for example R2) as a fallback in the fetch script, or committing the chunks (about 72 MB, check the licence terms for redistribution first).
- **History cap.** amine40 caps history at 4,096 steps in the browser. Keep that, or offer more for hourly data?
