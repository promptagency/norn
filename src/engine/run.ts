// What the worker does with one request. Kept apart from worker.ts so the Node tests run the same code.
import type * as Ort from "onnxruntime-web";
import type { Backtest, Forecast, ForecastOptions, Series } from "./Forecaster.ts";
import { forecast as timestral, LEVELS } from "./vendor/timestral.js";

const at = (level: number) => LEVELS.indexOf(level);

/**
 * The longest history the model sees (the model takes up to 32,768; the vendored default is 4,096). 8,192 is
 * about 11 months of hours: in backtests on hourly consumption it beat 4,096 and longer caps added nothing, while
 * time grows about in step with the history (owner's decision 2026-10-22, numbers in docs/ARCHITECTURE.md).
 */
export const MAX_HISTORY = 8192;

export async function runForecast(
  ort: typeof Ort,
  session: Ort.InferenceSession,
  series: Series,
  horizon: number,
  options: ForecastOptions = {},
): Promise<Forecast> {
  const { quantiles, levels } = await timestral(ort, session, {
    target: [series],
    horizon,
    knownCovariates: options.known?.length ? options.known : null,
    maxContext: MAX_HISTORY,
  });
  const q = quantiles[0];
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
