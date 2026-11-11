// Robustness contract B: the engine boundary. Whatever finite series the data layer can hand over, no NaN or
// Infinity leaves src/engine/. Model runs are few and short, since inference in Node is slow.
// Locked while the fix loop runs (.claude/hooks/guard-exam.mjs).
import { readFileSync } from "node:fs";
import * as ort from "onnxruntime-web";
import { beforeAll, describe as group, expect, it } from "vitest";
import { DEFAULT_MODEL, MODELS } from "../config.ts";
import { grade, improvement, score, seasonalNaive } from "../engine/backtest.ts";
import type { Forecast, Series } from "../engine/Forecaster.ts";
import { runBacktest, runForecast } from "../engine/run.ts";
import { summarize } from "../engine/summary.ts";
import { LEVELS } from "../engine/vendor/timestral.js";

const HORIZON = 12;
const wave = (n: number, scale = 1) => Array.from({ length: n }, (_, i) => scale * (1 + Math.sin(i / 3) + 0.1 * Math.cos(i * 1.7)));
const finiteOrNull = (v: unknown) => v === null || (typeof v === "number" && Number.isFinite(v));

function expectClean(f: Forecast, horizon = HORIZON) {
  expect(f.quantiles).toHaveLength(horizon);
  for (const qs of f.quantiles) {
    expect(qs).toHaveLength(LEVELS.length);
    expect(qs.every(Number.isFinite), String(qs)).toBe(true);
    // Never decreasing across levels, allowing for float rounding.
    qs.forEach((q, k) => k && expect(q).toBeGreaterThanOrEqual(qs[k - 1] - 1e-9 * Math.abs(qs[k - 1])));
  }
  for (const xs of [f.median, f.band50.low, f.band50.high, f.band90.low, f.band90.high]) expect(xs.every(Number.isFinite)).toBe(true);
  expect(Object.values(summarize(f, "summa")).every(Number.isFinite)).toBe(true);
  expect(Object.values(summarize(f, "snitt")).every(Number.isFinite)).toBe(true);
}

let session: ort.InferenceSession;
beforeAll(async () => {
  ort.env.wasm.numThreads = 1;
  session = await ort.InferenceSession.create(readFileSync(`.cache/model/${MODELS[DEFAULT_MODEL].file}`));
});
const forecast = (s: Series) => runForecast(ort, session, s, HORIZON);

group("forecasts stay finite", { timeout: 120_000 }, () => {
  it("forecasts a constant series as that constant", async () => {
    const f = await forecast(Array(64).fill(5));
    expectClean(f);
    for (const q of f.quantiles.flat()) expect(Math.abs(q - 5)).toBeLessThan(1e-6);
  });

  it("forecasts an all-zero series as zero", async () => {
    const f = await forecast(Array(64).fill(0));
    expectClean(f);
    for (const q of f.quantiles.flat()) expect(Math.abs(q)).toBeLessThan(1e-6);
  });

  it.each([
    ["shortest allowed", wave(64)],
    ["huge", wave(64, 1e12)],
    ["tiny", wave(64, 1e-9)],
    ["negative", wave(64, -1e6)],
    ["mostly missing", [...Array(60).fill(null), 1, 2, 3, 4]],
    ["one spike of 1e300", wave(64).map((v, i) => (i === 40 ? 1e300 : v))],
    ["long", wave(512, 1000)],
  ])("keeps a %s series finite", async (_, s) => expectClean(await forecast(s)));

  it("forecasts a series of 1e300 as the same series at scale 1, scaled up", async () => {
    const [big, small] = [await forecast(wave(64, 1e300)), await forecast(wave(64))];
    expectClean(big);
    big.median.forEach((m, i) => expect(m / 1e300 / small.median[i]).toBeCloseTo(1, 3));
  });

  it("backtests an all-zero series without NaN", async () => {
    const zeros = Array(96).fill(0);
    const bt = await runBacktest(ort, session, zeros, 24);
    expectClean(bt.forecast, 24);
  });
});

group("scores stay finite or say they are undefined", () => {
  const flat = (value: number, horizon: number): Forecast => {
    const q = Array.from({ length: horizon }, () => LEVELS.map(() => value));
    const col = q.map(() => value);
    return { median: col, band50: { low: col, high: col }, band90: { low: col, high: col }, quantiles: q, levels: LEVELS };
  };
  const check = (history: Series, actual: Series, f: Forecast) => {
    const s = score(history, { forecast: f, actual }, 7);
    expect(s).not.toBeNull();
    for (const [k, v] of Object.entries(s!)) expect(typeof v === "boolean" || finiteOrNull(v), `${k}=${v}`).toBe(true);
    expect(finiteOrNull(improvement(s!)), `improvement=${improvement(s!)}`).toBe(true);
    return s!;
  };

  it("scores a perfect forecast of an all-zero series, with the grade unchanged (open question in PLAN.md)", () => {
    const s = check(Array(64).fill(0), Array(12).fill(0), flat(0, 12));
    expect(grade(s)).toBe("osaker");
  });

  it("scores a perfect forecast of a constant series as Pålitlig", () => {
    const s = check(Array(64).fill(5), Array(12).fill(5), flat(5, 12));
    expect(grade(s)).toBe("palitlig");
  });

  it("scores a forecast that misses around zero", () => {
    check([...Array(63).fill(0), 1], [0, -1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0], flat(0.5, 12));
  });

  it("repeats nothing for an all-missing history", () => {
    expect(seasonalNaive(Array(20).fill(null), 5, 7)).toEqual(Array(5).fill(null));
  });
});
