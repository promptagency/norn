# ARCHITECTURE.md

Planned structure. Everything exists; the rest comes in later phases (`PLAN.md`). Keep this file in step with the code.

## Modules

```
src/
  config.ts              product name, URL, models pinned by revision, size and sha256, chunk URLs
  engine/
    Forecaster.ts        interface + types (Series, Forecast, Backtest, Covariate)
    index.ts             createForecaster(): the only import for the UI
    worker.ts            Web Worker: fetches the model chunks once, loads onnxruntime-web, runs requests in order
    run.ts               what the worker does with one request (forecast, backtest); the Node tests run it too
    protocol.ts          worker message types
    parity.test.ts       run.ts against the Python package, fixtures in fixtures/parity.json
    backtest.ts          backtest period by frequency, errors, naive baseline, band coverage, and the grade
    holidays.ts          Swedish public holidays and fixed events as known-future covariates
    summary.ts           a total or an average over the horizon, with the cautious summed range
    vendor/
      timestral.js       upstream, unchanged (amine-athmani/timestral-in-browser, Apache 2.0)
      timestral.d.ts     our types for it
      LICENSE            Apache 2.0
      SOURCE.md          upstream commit hash and what was taken
  data/
    parse.ts             CSV and pasted text: separator, decimal comma, dates, sorting
    detect.ts            time column, value columns, frequency, gaps
    describe.ts          the one-sentence description shown in Urd, unit and period words, total or average
    horizon.ts           Skuld's horizon buttons in calendar steps
    examples.ts          reads public/data/examples.json
  ui/
    App.tsx              the screens and step navigation; holds the user's data in React state only
    Start.tsx, Urd.tsx, Verdandi.tsx, Skuld.tsx   one file per screen
    Telefon.tsx          the page phones get instead of the app, and isPhone()
    csv.ts               the forecast as a CSV for Swedish Excel
    historik.ts          history for the chart: means per day or week for long series, time labels
    app.css              page layout, tokens only
    copy.ts              every Swedish string, from docs/COPY.md
    components/          the component library (README.md, types.ts, chart.ts, components.css, one .tsx each)
                         Prognosgraf is the chart, own SVG, following design/DESIGN.md's chart rules
  dev/
    Galleri.tsx          every component with real SE3 data, light and dark (npm run dev, then /?galleri; dev server only)
public/
  data/                  example datasets and examples.json (built by scripts/build_datasets.py)
  model/                 model chunks, written by scripts/fetch-model.mjs before dev, build and test (gitignored)
design/                  tokens, fonts, logo, icons (see design/DESIGN.md)
scripts/                 Python: export spike, verification, dataset and token builders
```

## The engine

- The ONNX graph from amine40 holds one decoding pass of Timestral including its normalisation and rescaling. Inputs `x`, `obs` (rows × T, T a multiple of 32), `group_ids`, `role_ids` (0 target, 1 past-only covariate, 2 known-future covariate), `known_future`, `known_future_mask` (rows × H, H a multiple of 32 up to 1024). Outputs `quantiles` (rows × H × 21, levels 0.01 to 0.99) and `last_scale`.
- Outside the graph, in the vendored `timestral.js`: forward-filling and left-padding rows, decoding beyond 1,024 steps by feeding back the median, averaging with the mirrored series, clipping at zero for non-negative series. Do not reimplement any of this; wrap it.
- History is capped at 4,096 steps in the browser (attention cost grows with the square of its length). Open question in `PLAN.md`.
- Models: Timestral-28M (59 MB, default) and 5M (13 MB, fallback on slow hardware). fp16 weights, fp32 compute. int8 is rejected: it moves the quantiles too much.
- Norn shows three of the 21 quantiles as bands: 0.05 to 0.95 (nine of ten) and 0.25 to 0.75 (half), plus the median. The download carries all 21.

## Verification

- `scripts/verify_onnx.py` compares any ONNX export against the official PyTorch forecaster. Re-run it when the model files change.
- `scripts/make_fixtures.py` (official package → `src/engine/fixtures/parity.json`) and `src/engine/parity.test.ts`, which runs `run.ts` with onnxruntime-web WASM in Node on the same fp16 file the browser gets. Tolerance: 1 percent of the mean width of the 90 band (decision in `PLAN.md`). Re-run the script when the model or the vendored code changes.

## Privacy constraints

- No backend. The build is static files.
- Every request goes to our own origin, including the model chunks in `public/model/` and the Plausible page view through a Pages Function (decisions in `PLAN.md`). A Playwright test lists every request and fails on any other origin.
- User data stays in memory. The service worker caches app files, the model and the runtime, never user data.
- Strict CSP, injected into `index.html` at build by `vite.config.ts`: no inline scripts, `connect-src 'self'`.

## Performance

- Measured in the spike (Node, onnxruntime-web WASM, slow two-core container): 28M about 0.5 to 1.1 s for 2,000 steps of context and 96 ahead, 5M about 0.1 to 0.3 s. A laptop should be two to four times faster. In Chrome on a Mac, single-threaded (Phase 1 check): 28M about 2.7 s for the first forecast, 2 s after. Threads need cross-origin isolation (COOP/COEP headers), not set yet.
- Model loading shows byte-level progress. The model loads once and stays in the worker.
- Backtest and forecast run in the same worker, one after the other, so Verdandi and Skuld feel instant once Urd is confirmed.
