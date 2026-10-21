// One number for the whole horizon: the total (sales, visits) or the average (price, temperature).
import type { Forecast } from "./Forecaster.ts";

export type Summing = "summa" | "snitt";

export interface Summary {
  median: number;
  /** The nine-in-ten range. */
  low: number;
  high: number;
  /** Enough in nine of ten and nineteen of twenty cases. */
  plan90: number;
  plan95: number;
}

const at = (f: Forecast, level: number) => f.levels.indexOf(level);

/**
 * Adds up (or averages) each step's levels. The model gives a range per step, not for the total, so the
 * summed range assumes every step misses the same way at once: wider than needed, never narrower. In the
 * backtests the total fell inside the summed nine-in-ten range 99 times in 100, hence "minst" in the words
 * (owner's decision 2026-10-21).
 */
export function summarize(f: Forecast, how: Summing): Summary {
  const n = f.quantiles.length;
  const total = (level: number) => {
    const k = at(f, level);
    const s = f.quantiles.reduce((a, q) => a + q[k], 0);
    return how === "summa" ? s : s / n;
  };
  return { median: total(0.5), low: total(0.05), high: total(0.95), plan90: total(0.9), plan95: total(0.95) };
}
