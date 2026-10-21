# ARCHITECTURE.md

Planned structure. `src/ui/components/`, `src/ui/copy.ts` and `src/dev/` exist; the rest is created in Phase 1 (`PLAN.md`). Keep this file in step with the code.

## Modules

```
src/
  config.ts              product name, URL, model URLs and sizes, pinned onnxruntime-web version
  engine/
    Forecaster.ts        interface + types (Series, Forecast, Backtest, Covariate)
    index.ts             createForecaster(): the only import for the UI
    worker.ts            Web Worker: loads onnxruntime-web and the model once, runs forecasts
    protocol.ts          worker message types
    backtest.ts          backtest period by frequency, errors, naive baseline, band coverage
    grade.ts             Pålitlig / Ungefärlig / Osäker from a Backtest (thresholds in PLAN.md)
    holidays.ts          Swedish public holidays and fixed events as known-future covariates
    vendor/
      timestral.js       upstream, unchanged (amine-athmani/timestral-in-browser, Apache 2.0)
      LICENSE            Apache 2.0
      SOURCE.md          upstream commit hash and what was taken
  data/
    parse.ts             CSV and pasted text: separator, decimal comma, dates, sorting
    detect.ts            time column, value columns, frequency, gaps
    describe.ts          the one-sentence description shown in Urd
    examples.ts          reads public/data/examples.json
  ui/
    App.tsx              the four screens and step navigation
    copy.ts              every Swedish string, from docs/COPY.md
    components/          the component library (README.md, types.ts, chart.ts, components.css, one .tsx each)
                         Prognosgraf is the chart, own SVG, following design/DESIGN.md's chart rules
  dev/
    Galleri.tsx          every component with real SE3 data, light and dark (npm run dev until App exists)
public/
  data/                  example datasets and examples.json (built by scripts/build_datasets.py)
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
- Phase 1 adds `scripts/make_fixtures.py` (official package → JSON fixtures) and a Vitest suite that runs the worker on them. Tolerance: 1e-3 of the series' standard deviation.

## Privacy constraints

- No backend. The build is static files.
- Every request goes to our own origin, including the model chunks in `public/model/` and the Plausible page view through a Pages Function (decisions in `PLAN.md`). A Playwright test lists every request and fails on any other origin.
- User data stays in memory. The service worker caches app files, the model and the runtime, never user data.
- Strict CSP in `index.html`: no inline scripts, `connect-src` limited to what `src/config.ts` names.

## Performance

- Measured in the spike (Node, onnxruntime-web WASM, slow two-core container): 28M about 0.5 to 1.1 s for 2,000 steps of context and 96 ahead, 5M about 0.1 to 0.3 s. A laptop should be two to four times faster.
- Model loading shows byte-level progress. The model loads once and stays in the worker.
- Backtest and forecast run in the same worker, one after the other, so Verdandi and Skuld feel instant once Urd is confirmed.
