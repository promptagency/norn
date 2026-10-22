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

/**
 * The grade's limits (owner's decisions 2026-10-21, revised the same day): the wide band must hold at least
 * `inside90` of the outcomes; the error counts as close at most `closeError` and as far above `farError` of the
 * value; Norn must beat the naive guess by `betterThanNaive` to earn Pålitlig on that alone.
 */
export const THRESHOLDS = { betterThanNaive: 0.2, inside90: 0.75, closeError: 0.1, farError: 0.35 };

/** How much smaller Norn's error was than the naive guess's, 0.25 for a quarter smaller. */
export const improvement = (s: Score) => (s.naiveError > 0 ? 1 - s.error / s.naiveError : -Infinity);

/** The error is small enough to trust on its own, even where the naive guess is about as good. */
export const isClose = (s: Score) => percentFits(s) && s.relative <= THRESHOLDS.closeError;

/**
 * Pålitlig: the wide band held, and the error is close, or Norn clearly beat the naive guess without missing far.
 * Osäker: Norn did not beat the naive guess and was not close either. Ungefärlig: everything in between.
 * The error limits apply only where the error reads as a percent (every value above zero); otherwise only the
 * comparison with the naive guess counts.
 */
export function grade(s: Score): Grade {
  const better = improvement(s);
  const far = percentFits(s) && s.relative > THRESHOLDS.farError;
  if (!(better > 0) && !isClose(s)) return "osaker";
  const held = s.inside90 >= THRESHOLDS.inside90;
  return held && (isClose(s) || (better >= THRESHOLDS.betterThanNaive && !far)) ? "palitlig" : "ungefarlig";
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
