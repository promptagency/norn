// The test on the held-out period (Verdandi), shared with Skuld, which reminds the user of it.
import type { DataSeries } from "../data/detect.ts";
import { backtestSteps, grade, score, SEASON, type Backtest, type Forecaster, type Grade, type Score } from "../engine/index.ts";

const runs = new WeakMap<DataSeries, Promise<Backtest>>();

/** One test per series: Verdandi runs it and Skuld reuses it, or runs it itself when a link opened Skuld first. */
export function backtestOf(forecaster: Forecaster, series: DataSeries): Promise<Backtest> {
  let run = runs.get(series);
  if (!run) {
    runs.set(series, (run = forecaster.backtest(series.values, backtestSteps(series.frequency, series.values.length))));
    run.catch(() => runs.delete(series));
  }
  return run;
}

/** The score and grade of a test, or null when there is nothing to score (no history before the held-out period). */
export function graded(series: DataSeries, bt: Backtest): { s: Score; niva: Grade } | null {
  const cut = series.values.length - bt.actual.length;
  const s = score(series.values.slice(0, cut), bt, SEASON[series.frequency]);
  return s && { s, niva: grade(s) };
}
