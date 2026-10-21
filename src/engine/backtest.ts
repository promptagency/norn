// How well a backtest went: Norn's error, the error of repeating the last season, and how often
// what happened fell inside each band. Pure, so Verdandi and the tests read the same numbers.
import type { Frequency } from "../data/detect.ts";
import type { Backtest, Series } from "./Forecaster.ts";

/** How much to hold out, by frequency (docs/UX.md; a year for daily data, owner's decision 2026-10-21). */
export const BACKTEST_STEPS: Record<Frequency, number> = { timme: 168, dag: 365, vecka: 26, månad: 12, kvartal: 4, år: 4 };

/** What Norn is compared with: the same hour or day last week, the same period last year (PLAN.md). */
export const SEASON: Record<Frequency, number> = { timme: 168, dag: 7, vecka: 52, månad: 12, kvartal: 4, år: 1 };

/** The backtest length for a series of `n` values. A short series keeps three quarters of itself as history. */
export const backtestSteps = (freq: Frequency, n: number) => Math.min(BACKTEST_STEPS[freq], Math.floor(n / 4));

export type Grade = "palitlig" | "ungefarlig" | "osaker";

/** Pålitlig needs both; Osäker is not beating the naive guess at all (owner's decision 2026-10-21). */
export const THRESHOLDS = { betterThanNaive: 0.2, inside90: 0.8 };

/** How much smaller Norn's error was than the naive guess's, 0.25 for a quarter smaller. */
export const improvement = (s: Score) => (s.naiveError > 0 ? 1 - s.error / s.naiveError : -Infinity);

export function grade(s: Score): Grade {
  const better = improvement(s);
  if (!(better > 0)) return "osaker";
  return better >= THRESHOLDS.betterThanNaive && s.inside90 >= THRESHOLDS.inside90 ? "palitlig" : "ungefarlig";
}

export interface Score {
  /** Mean absolute error of Norn's most likely value. */
  error: number;
  /** The same for repeating the last season. */
  naiveError: number;
  /** Norn's error as a share of the mean absolute value of what happened. */
  relative: number;
  /** Share of what happened inside the half band and the nine-in-ten band. */
  inside50: number;
  inside90: number;
  /** Values that could be checked. */
  count: number;
  /** Whether every checked value was above zero, so `relative` reads as a percent of something real. */
  positive: boolean;
}

/** Say the error as a percent only when the values stay above zero and the percent stays sane (near zero it explodes). */
export const percentFits = (s: Score) => s.positive && s.relative <= 1;

const lastObserved = (s: Series) => s.findLast((v) => v !== null) ?? null;

/** Repeats the last `season` values of the history over `horizon` steps; the last value if the history is shorter. */
export function seasonalNaive(history: Series, horizon: number, season: number): (number | null)[] {
  const n = history.length, last = lastObserved(history);
  return Array.from({ length: horizon }, (_, i) => (season > 1 && n >= season ? history[n - season + (i % season)] ?? last : last));
}

export function score(history: Series, bt: Backtest, season: number): Score | null {
  const naive = seasonalNaive(history, bt.actual.length, season);
  const f = bt.forecast;
  let error = 0, naiveError = 0, size = 0, in50 = 0, in90 = 0, count = 0, positive = true;
  bt.actual.forEach((y, i) => {
    if (y === null || naive[i] === null) return;
    count++;
    error += Math.abs(f.median[i] - y);
    naiveError += Math.abs(naive[i]! - y);
    size += Math.abs(y);
    positive &&= y > 0;
    in50 += +(y >= f.band50.low[i] && y <= f.band50.high[i]);
    in90 += +(y >= f.band90.low[i] && y <= f.band90.high[i]);
  });
  if (!count) return null;
  return {
    error: error / count,
    naiveError: naiveError / count,
    relative: size ? error / size : Infinity,
    inside50: in50 / count,
    inside90: in90 / count,
    count,
    positive,
  };
}
