import { expect, it } from "vitest";
import { backtestSteps, grade, percentFits, score, seasonalNaive, type Score } from "./backtest.ts";
import type { Forecast } from "./Forecaster.ts";

const flat = (v: number, n: number, spread50: number, spread90: number): Forecast => ({
  median: Array(n).fill(v),
  band50: { low: Array(n).fill(v - spread50), high: Array(n).fill(v + spread50) },
  band90: { low: Array(n).fill(v - spread90), high: Array(n).fill(v + spread90) },
  quantiles: [],
  levels: [],
});

it("repeats the last season, or the last value when the history is shorter", () => {
  expect(seasonalNaive([1, 2, 3, 4, 5, 6], 4, 3)).toEqual([4, 5, 6, 4]);
  expect(seasonalNaive([1, 2, null], 2, 7)).toEqual([2, 2]);
});

it("scores the median against what happened and the naive guess, and counts values inside each band", () => {
  const history = [10, 20, 10, 20];
  const s = score(history, { forecast: flat(15, 4, 2, 6), actual: [10, 20, null, 16] }, 2);
  // Naive: 10, 20, 10, 20. Checked: 10, 20, 16. Median errors 5, 5, 1. Naive errors 0, 0, 4.
  expect(s).toEqual({ error: 11 / 3, naiveError: 4 / 3, relative: 11 / 46, inside50: 1 / 3, inside90: 1, count: 3, positive: true });
});

const scored = (error: number, naiveError: number, inside90: number): Score =>
  ({ error, naiveError, relative: 0.1, inside50: 0.5, inside90, count: 12, positive: true });

it("grades by how much Norn beats the naive guess and how often the wide band held", () => {
  expect(grade(scored(0.78, 1, 0.83))).toBe("palitlig");
  expect(grade(scored(0.78, 1, 0.75))).toBe("ungefarlig");
  expect(grade(scored(0.97, 1, 0.83))).toBe("ungefarlig");
  expect(grade(scored(1.04, 1, 0.97))).toBe("osaker");
  expect(grade(scored(0, 0, 1))).toBe("osaker"); // a constant series: nothing to beat, nothing learned
});

it("holds out a year of daily data, less when the series is short", () => {
  expect(backtestSteps("dag", 3946)).toBe(365);
  expect(backtestSteps("dag", 400)).toBe(100);
  expect(backtestSteps("timme", 34_800)).toBe(168);
});

it("says the error as a percent only for values above zero", () => {
  const s = score([1, 2], { forecast: flat(0, 2, 1, 2), actual: [0.5, -0.1] }, 1)!;
  expect(s.positive).toBe(false);
  expect(percentFits(s)).toBe(false);
  expect(percentFits({ ...s, positive: true, relative: 0.3 })).toBe(true);
  expect(percentFits({ ...s, positive: true, relative: 2.5 })).toBe(false);
});
