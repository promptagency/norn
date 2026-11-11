// What the worker does with one request. Kept apart from worker.ts so the Node tests run the same code.
import type * as Ort from "onnxruntime-web";
import { MAX_HISTORY, type Backtest, type Forecast, type ForecastOptions, type Series } from "./Forecaster.ts";
import { forecast as timestral, LEVELS } from "./vendor/timestral.js";

const at = (level: number) => LEVELS.indexOf(level);
/** Measured: 1e12 forecasts cleanly, 1e300 gives NaN. */
const BIG = 1e15;


export async function runForecast(
  ort: typeof Ort,
  session: Ort.InferenceSession,
  series: Series,
  horizon: number,
  options: ForecastOptions = {},
): Promise<Forecast> {
  // The model squares values on the way, so a series near 1e300 overflows to NaN. Above BIG, it gets the series
  // divided by a power of ten and the answer is scaled back; below, it gets the values untouched.
  const largest = series.reduce((m: number, v) => (v === null ? m : Math.max(m, Math.abs(v))), 0);
  const scale = largest > BIG ? 10 ** Math.floor(Math.log10(largest)) : 1;
  const { quantiles, levels } = await timestral(ort, session, {
    target: [scale === 1 ? series : series.map((v) => (v === null ? null : v / scale))],
    horizon,
    knownCovariates: options.known?.length ? options.known : null,
    maxContext: MAX_HISTORY,
  });
  const q = scale === 1 ? quantiles[0] : quantiles[0].map((qs) => qs.map((v) => v * scale));
  const col = (level: number) => q.map((qs) => qs[at(level)]);
  return {
    median: col(0.5),
    band50: { low: col(0.25), high: col(0.75) },
    band90: { low: col(0.05), high: col(0.95) },
    quantiles: q,
    levels,
  };
}

export async function runBacktest(
  ort: typeof Ort,
  session: Ort.InferenceSession,
  series: Series,
  horizon: number,
  options: ForecastOptions = {},
): Promise<Backtest> {
  if (horizon < 1 || horizon >= series.length) throw new Error(`Backtest horizon ${horizon} does not fit ${series.length} values.`);
  const cut = series.length - horizon;
  // Known series already cover the held-out period, which is exactly the history plus the horizon here.
  const forecast = await runForecast(ort, session, series.slice(0, cut), horizon, options);
  return { forecast, actual: series.slice(cut) };
}
