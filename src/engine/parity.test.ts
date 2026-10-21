// The engine against the official Python package (fixtures from scripts/make_fixtures.py), run with the same
// onnxruntime-web WASM build and the same model file the browser gets.
import { readFileSync } from "node:fs";
import * as ort from "onnxruntime-web";
import { beforeAll, describe, expect, it } from "vitest";
import { DEFAULT_MODEL, MODELS } from "../config.ts";
import type { Forecast } from "./Forecaster.ts";
import fixtures from "./fixtures/parity.json";
import { runBacktest, runForecast } from "./run.ts";

// Of the mean width of the 90 band, which is what a user sees. amine40's fp16 weights land at 0.1 to 0.7 percent,
// most on long horizons where the fed-back median compounds the rounding; an fp32 export is under 0.05 percent.
// Decided 2026-10-21 (PLAN.md).
const TOLERANCE = 0.01;

let session: ort.InferenceSession;
beforeAll(async () => {
  ort.env.wasm.numThreads = 1;
  // Written by scripts/fetch-model.mjs, which npm test runs first.
  session = await ort.InferenceSession.create(readFileSync(`.cache/model/${MODELS[DEFAULT_MODEL].file}`));
});

describe("parity with the Python package", () => {
  it.each(fixtures.map((f) => [f.name, f] as const))("%s", { timeout: 120_000 }, async (_, fx) => {
    const options = fx.known ? { known: fx.known } : {};
    let forecast: Forecast;
    if (fx.kind === "backtest") {
      const bt = await runBacktest(ort, session, fx.series, fx.horizon, options);
      expect(bt.actual).toEqual(fx.series.slice(-fx.horizon));
      forecast = bt.forecast;
    } else {
      forecast = await runForecast(ort, session, fx.series, fx.horizon, options);
    }
    expect(forecast.quantiles).toHaveLength(fx.horizon);
    let maxErr = 0;
    fx.expected.forEach((qs, h) => qs.forEach((e, k) => (maxErr = Math.max(maxErr, Math.abs(forecast.quantiles[h][k] - e)))));
    const width = fx.expected.reduce((a, q) => a + q[19] - q[1], 0) / fx.horizon;
    expect(maxErr / width).toBeLessThan(TOLERANCE);
    // The bands are the right columns of the 21 levels.
    expect(forecast.median).toEqual(forecast.quantiles.map((q) => q[10]));
    expect(forecast.band90.low).toEqual(forecast.quantiles.map((q) => q[1]));
    expect(forecast.band50.high).toEqual(forecast.quantiles.map((q) => q[15]));
  });
});
