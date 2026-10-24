# PLAN.md

Phased plan for Norn. Each phase ends in something runnable. Do not start a phase before the previous one's definition of done is met.

## What's left

Norn is live at `nornor.app` (2026-10-21) with all five phases built. Version 0.1.4 since 2026-10-24. What remains, as of 2026-10-24:

Needs the owner:

1. **Five messy real-world CSVs**, the last part of Phase 2's done criterion. At least one should be a till or webshop export with one row per sale, to check the rule that a day without rows counts as 0 when summing (`src/data/detect.ts`, marked as a shortcut).
2. **A real person through Phase 4's done criterion**: from file to forecast, changing horizon and certainty, in under a minute without reading anything twice.
3. **Review the Swedish strings added in Phases 2 to 5** in `docs/COPY.md`. Only the phone page's strings (`mobil.*`) have been approved as a set; the rest (`urd.*`, `verdandi.*` including `good.plain`, `fair.plain` and the rewritten `rule`, `skuld.*`, `period.*`, `jamfort.*`, `narmast.*`, `event.*`, `enhet.*`, `graf.*`, `error.file`, `error.notime`, `error.model`, `model.once`, `link.newtab`, `footer.version`) and the example texts in `public/data/examples.json` (the Elförbrukning card, the Wikipedia card's `card`, Påsk's sentence) were written to COPY.md's rules but not reviewed. Also decide whether the downloaded CSV may say "kvantil" in its column headers; it is a file, not the screen.
4. **Design for the user's own events**: a date-range field and a comparison-line style in `design/DESIGN.md`, then the last Phase 4 item can be built.

Engineering, not done yet:

5. **The first scheduled data rebuild** runs on 2 November 2026. Check that it committed to `dev` and that the Tests run it starts on its commit passed (new in 0.1.1, not yet run for real), or read its issue. It ran once by hand on 2026-10-21 and passed. The new data goes live only with a release (0.1.5), so release after checking it on `https://dev.norn-3ke.pages.dev`.

To watch:

6. **The live run right after a release, in Firefox.** After the 0.1.1 and 0.1.2 deploys, "Detaljhandel: from Start to Skuld" failed against `nornor.app` with Verdandi still on "Norn räknar" after two minutes. Most likely a slow model download from the cold edge, not a hang: the service worker passed a model chunk on only once all 25 MB were saved, so no progress showed (reproduced with a throttled local server, 2026-10-24). Fixed in 0.1.3, whose first live run passed (33 tests, 1.2 minutes), but the model files were unchanged, so the edge may have been warm. Closed when a slow first run after a deploy shows "laddar ner … MB" or passes; a failure on "räknar" means the cause is elsewhere.

Done since launch (2026-10-21 to 24):

- CI in `.github/workflows/test.yml`, adapted from Skrubba's, and the end-to-end suite in Chromium, Firefox and WebKit, locally, against `nornor.app` and on CI.
- Verdandi's grade on accuracy as well as on beating the naive guess (rule B with 35 percent, decision above), and the band limit lowered to 75 percent so Elförbrukning opens on Pålitlig (2026-10-22).
- SE3 consumption from eSett (CC0) replaced the spot price as the electricity example, and Påsk joined the Wikipedia articles to show the events feature (`docs/DATA.md`).
- The charts: up to four axis values with faint lines, the unit above the vertical axis, and the values under the pointer (guide line, dots, card; pointer, touch and arrow keys). The examples' sentences carry their unit.
- "Prompt Agency" links to promptagency.se in the header tag and footer.
- Monthly rebuild of the example data in `.github/workflows/data.yml`: committed to `dev` when every test passes, otherwise kept on a branch with an issue.
- Hand checks in installed Chrome (touch hover fixed, Skuld prints on one page), no 5M fallback, and the history cap raised to 8,192 (2026-10-22, decisions above).
- `dev` and `main` as in Skrubba (2026-10-23): all work on `dev` with a preview at `dev.norn-3ke.pages.dev`, releases tagged with `CHANGELOG.md` and a GitHub release page, the version in the footer. 0.1.0 released, and the design system bundle uploaded with the footer's version line. The repo is public, and a ruleset protects `main` (`docs/DEPLOY.md`).
- The unused `model.ready` string removed, and `wrangler login` refreshed.
- 0.1.1 (2026-10-23), from the audit: files of more than about 65,000 rows are read, last rows without a value are left out (they removed the chart's bands), Skuld never shows the old horizon's number with the new period, a link with an odd horizon opens, and the data rebuild starts the tests on its commit so it can be released.
- 0.1.2 (2026-10-23), from the audit: a privacy test with the user's own CSV and Excel file through to Skuld (no request to another origin, the column name in no request, nothing stored), and the unused 5M model removed from the build; Skuld keeps the last chart while a new horizon is computed, so the page does not jump.
- 0.1.3 (2026-10-24): the model download shows its progress from the first byte (item 6).
- Real Safari 26.4 on a Mac against `nornor.app` 0.1.4 (2026-10-24), driven through safaridriver: all three examples from Start to Skuld (Pålitlig each, horizon and certainty changed, chart drawn, no page request to another origin) and an own CSV to Skuld with nothing stored. The other hand checks ran in installed Chrome on 2026-10-22: an Excel upload, Verdandi in the dark theme, Skuld printed on one A4 page, the hover card by touch, and a tablet in portrait at 820 px.
- 0.1.4 (2026-10-24), from the audit: Skuld keeps the forecast without events per horizon, so an event switched on asks the model once, not twice; Urd builds the series only when the file or a choice changes.

## Decisions so far

Taken by the owner, 2026-10-20. Do not revisit without asking.

- Norn is an open source labs project under Prompt Agency, at `nornor.app`, MIT. Experiment, no support promise. Marketing for Prompt Agency as much as open source.
- One tool, not several. Presets and examples cover different kinds of data; the core is the same.
- Engine: amine40's Timestral ONNX exports and the `timestral.js` port from `amine-athmani/timestral-in-browser`. We do not publish our own exports to Hugging Face. Our own export from the spike stays in `scripts/` as a verification tool.
- Norn is a less technical version of amine40's app for ordinary users. Clear example data from different sources is kept from amine40's idea. No links out of the app in the user flow. The one exception: "Prompt Agency" in the header tag and the footer links to promptagency.se, in a new tab (owner, 2026-10-21).
- Hand-built (Vite + React + TS), not Lovable, to keep GDPR simple: a static site with no backend.
- Example data from Swedish open sources (SCB, eSett, Wikimedia), not synthetic. See `docs/DATA.md`. On 2026-10-21 the SE3 spot price (elprisetjustnu.se, with SMHI temperature) was replaced by SE3 consumption from eSett, which shows the model far better, and Påsk was added to the Wikipedia articles to show the events feature (owner's decision).
- Visual identity: typographic logo "norn" in Bricolage Grotesque 700, no symbol. Colours lin and indigo, dark theme in night indigo. Favicon is a plain "n". See `design/DESIGN.md`.
- Model hosting (2026-10-21): own origin, same as Skrubba. The model files are split into chunks under 25 MiB in `public/model/` and joined in the worker. CSP `connect-src 'self'`. No Hugging Face request at runtime.
- Analytics (2026-10-21): the same setup as Skrubba. Self-hosted Plausible, anonymous page views only, proxied through a Cloudflare Pages Function on our own origin so `connect-src` stays `'self'`. No events carrying anything from the user's data.
- Licence holder (2026-10-21): Prompt Agency AB, as `LICENSE` says.
- Parity bar (2026-10-21): the engine must match the official Python package within 1 percent of the mean width of the 90 band, on every case. amine40's fp16 weights land at 0.1 to 0.7 percent; the earlier bar of 1e-3 of the series' standard deviation fails on long horizons, where the fed-back median compounds the fp16 rounding (an fp32 export passes, so the port is right). fp16 stays.
- Verdandi's grade (2026-10-21, revised the same day, band limit lowered from 80 to 75 percent on 2026-10-22): Pålitlig when at least 75 percent of outcomes fall inside the 90 band and Norn either missed by at most 10 percent of the value, or missed at least 20 percent less than repeating the last season and by at most 35 percent; Osäker when Norn neither beat repeating the last season nor missed by at most 10 percent; Ungefärlig otherwise. The percent limits apply only where every value is above zero. The first rule (only "20 percent better than repeating") marked down accurate series where repeating is also good (SE3 consumption, about 3 percent off, was often Ungefärlig or Osäker) and passed inaccurate ones where repeating is worse (the SE3 price, about 58 percent off over twelve weeks, mostly Pålitlig). Pålitlig on accuracy alone gets its own sentence (`verdandi.good.plain`), since it cannot claim to beat the naive guess. No upper limit on coverage: with 12 monthly points a perfectly honest band covers all of them about a quarter of the time. The baseline is the same hour or day last week for hourly and daily data, the same period last year otherwise. Daily data holds out a year, not three months, so yearly peaks are part of the test. Constants in `src/engine/backtest.ts`.
- Skuld (2026-10-21): the answer is a total or an average over the horizon, made by adding up each step's levels. That range is cautious (the real total fell inside the summed nine-in-ten range 99 times in 100 across the examples), so the words say "i minst nio fall av tio". Total when the user chose Summera in Urd or every value is a whole number of zero or more; average otherwise. "Kopiera länk" only for examples.
- Phones (2026-10-21): no app on phones. A phone gets one page that explains the idea and the technology simply, then asks the visitor, kindly but firmly, to open Norn on a computer. No way through to the app. Reasons: a 59 MB model on mobile data, memory on older phones, the user's files live on the computer, and the charts need the width. Detection by screen width and a touch-only pointer, not the browser's name, so tablets in landscape and small laptop windows still get the app; the model is never downloaded on the phone page. Every phone visitor gets the same page, with a button that copies the address they opened, to send to themselves for the computer. (Kopiera länk in Skuld only exists for the built-in examples and carries settings, never data, so the page says nothing about shared forecasts.)
- Chart (2026-10-21): up to four values on the vertical axis (was three), each with a faint line in `kant` behind the bands (DESIGN.md had "no grid" before). Owner's design feedback: it was hard to see where the values are.
- History cap 8,192 (2026-10-22): the model sees at most the last 8,192 points (about 11 months of hours), up from the vendored 4,096 (`MAX_HISTORY` in `src/engine/run.ts`). On twelve held-out weeks of hourly consumption, 8,192 beat repeating last week by 27 percent against 20 percent, with the 90 band holding 93 percent of hours against 88; 16,384 and 32,768 added nothing. One forecast takes about 0.57 s with threads instead of 0.27 s (1.7 s instead of 0.86 s on one thread). Daily and monthly data are not affected. Seeing last year's Christmas did not help Christmas week. Elförbrukning's latest week is still Pålitlig, now with the accuracy-only sentence (18 percent better than last week).
- No 5M fallback (2026-10-22): Norn always uses Timestral-28M. Measured in installed Chrome on an M1 Pro with production's headers, one forecast or backtest takes 0.21 to 0.24 s with threads, 0.72 to 0.82 s on one thread, and 3.1 to 3.4 s on one thread with Chrome's CPU slowed 4x (5M: 0.06 to 0.08, 0.16 to 0.19 and 0.68 to 0.78 s). Time barely depends on the request, since history is capped at 4,096 points and every horizon fits one block. With threads, the proposed rule (switch when the first forecast takes over 3 s) would almost never trigger on the computers that get the app, and building it properly would first need a backtest of 5M on the examples. Revisit if people report slowness. The 5M model was removed from the build on 2026-10-23 (`MODELS` in `src/config.ts`); its pinned revision was `83c332168e8a`.
- Branches and releases (2026-10-23), as in Skrubba and VemSaVad: all work on `dev`, which gets the full browser suite on every push and a preview at `dev.norn-3ke.pages.dev`. `main` is live and only moves by being fast-forwarded to a released, tagged `dev` (semver, `CHANGELOG.md`, a GitHub release page once the tag's tests pass, the version in the footer). The monthly data rebuild commits to `dev` and goes live with the next release. See `docs/DEPLOY.md`.
- Public repo (2026-10-23): `promptagency/norn` made public so `main` can be protected (GitHub rulesets need Pro on private repos). Ruleset "main is production": no deletion, no force-push, `checks` and `browser` must have passed.
- Domains (changed 2026-10-21): the canonical address is `nornor.app` (Cloudflare zone exists), with `www.nornor.app` 301-redirecting to it. `norn.promptagency.se` is not used; the owner has a separate marketing plan. The address lives in `src/config.ts` only.

## Phase 0 – Spike (done)

Goal: prove Timestral runs in onnxruntime-web and matches PyTorch.

- [x] Export Timestral-5M and 28M to ONNX (`scripts/export_onnx.py`), fp16 and int8 variants (`scripts/quantize_onnx.py`).
- [x] Compare against the official PyTorch forecaster on random walk, seasonal, non-negative trend, odd length and gaps, horizons 24 to 1500 (`scripts/verify_onnx.py`).
- [x] Measure latency in onnxruntime-web WASM (`webtest/`).
- [x] Check community exports. amine40's 28M export matches PyTorch within about 1e-3 of the series' standard deviation and includes covariate support. Decision: build on it.

Results in `docs/fas0-resultat.md` (Swedish). Short version: fp16 weights are the right default (half the size, no visible change); int8 moves the quantiles too much. 28M runs in 0.5 to 1.1 s in WASM on a slow two-core container for 2,000 steps of context and 96 ahead.

## Phase 0b – Example data (done)

- [x] `scripts/build_datasets.py` fetches SCB retail turnover (four trades, monthly since 1991), SE3 electricity consumption per hour since November 2022 from eSett (the spot price until 2026-10-21), and writes `public/data/` plus `examples.json`.
- [x] Backtest with Timestral-28M on the real data. Recorded in `docs/DATA.md`.
- [x] Wikipedia page views (`python scripts/build_datasets.py wiki`), built on the owner's machine 2026-10-21. Backtest and peak check in `docs/DATA.md`. Default series melodifestivalen (owner's decision).

## Phase 0c – Design programme (done)

- [x] Three directions explored, "Tråden" chosen, refined to a typographic logo.
- [x] Logo outlined, icons, colour tokens with contrast checks, chart tokens, type, tone. In `design/`.
- [x] Screen sketches for Start, Urd, Verdandi and Skuld on the design canvas "Norn skärmskisser", with real Timestral-28M output on the SE3 price. Approved by the owner 2026-10-20.
- [x] Components as React code in `src/ui/components/`, built into the design system with `npm run build:ds` (owner's decision 2026-10-20: one source for app and design system). Gallery in `src/dev/`.
- [x] Phone explainer page instead of a phone layout (decision above). Copy and layout approved 2026-10-21 (`docs/COPY.md`, `design/DESIGN.md`), built in `src/ui/Telefon.tsx`. Phones register no service worker and never load the model or the worker (Playwright, `tests/e2e/telefon.spec.ts`).

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

- [x] Service worker from Skrubba: small files on install, the model, runtime and example CSVs when first fetched, never user data. Works offline after the first forecast (Playwright). "Det sker bara första gången." (`model.once`) is shown only while the service worker controls the page. `model.ready` was removed from COPY.md (2026-10-21): there is no moment on screen where it would be read. Kill switch with `SW_KILL=1`. Cross-origin isolation in `public/_headers` lets the model run on several threads.
- [x] Playwright: full flow on each example, a test that fails on any request to another origin, offline after the first forecast, and nothing stored in the browser (`npm run e2e`).
- [x] Footer: experiment, no support, data never leaves the computer, credits to Mistral, amine40 and the data sources (`footer.experiment`, `footer.credits`).
- [x] Plausible page views through a Pages Function, copied from Skrubba (`functions/api/event.ts`). Plausible site `nornor.app`, receiving page views since 2026-10-21. The Playwright request test sees no other origin.
- [x] Deployed 2026-10-21: Cloudflare Pages project `norn` (`norn-3ke.pages.dev`), Git-connected to `promptagency/norn` like Skrubba, custom domain `nornor.app`. The end-to-end suite passes against both addresses (`NORN_URL=https://nornor.app npm run e2e`, three runs each). Plausible site `nornor.app` added and receiving page views (2026-10-21).
- [x] `www.nornor.app`: AAAA `100::` proxied, Always Use HTTPS, one Single Redirect rule (301, keep path and query) to `https://nornor.app`. Checked with curl.
- [x] README in Prompt Agency's voice (English, like Skrubba's), with what worked and what did not.

## Open questions

- **The covariate example.** Answered 2026-10-21 by the events: a midsommarafton marker moves Norn's guess for the peak day on the Midsommar page from 3,944 to 7,845 (actual 10,464) and lowers the year's error by 28 percent; lucia does the same for the Lucia page. Göteborg temperature (2 percent better for SE3) is not offered in the UI, since its future is not known without a weather forecast.
- **Build depends on amine40's Hugging Face repos.** `scripts/fetch-model.mjs` downloads the model at a pinned revision and sha256 on every clean build (Cloudflare included); the chunks are not in git. If amine40 deletes or renames the files, new deploys fail loudly (no silent swap), while the live site and local builds (`.cache/model/`) keep working. Accepted for now (owner, 2026-10-21), same as Skrubba. Options if it bites: a backup copy we control (for example R2) as a fallback in the fetch script, or committing the chunks (about 72 MB, check the licence terms for redistribution first).
