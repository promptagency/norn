import { describe, expect, it } from "vitest";
import { bucketMeans, layoutChart, niceTicks } from "./chart.ts";

describe("niceTicks", () => {
  it("gives at most four round values, the top one included", () => {
    expect(niceTicks(0, 3.1)).toEqual([0, 1, 2, 3]);
    expect(niceTicks(-0.2, 4.2)).toEqual([0, 2, 4]);
    expect(niceTicks(0, 100)).toEqual([0, 50, 100]);
    expect(niceTicks(0, 2.9)).toEqual([0, 1, 2]);
    expect(niceTicks(-0.25, 0.95)).toEqual([0, 0.5]); // a step of 0.25 would need five values
    for (const [lo, hi] of [[0, 7], [3, 9.9], [-5, 120], [0.07, 0.3], [0, 36_000]]) {
      const ticks = niceTicks(lo, hi);
      expect(ticks.length, `${lo}..${hi}`).toBeLessThanOrEqual(4);
      expect(ticks.length, `${lo}..${hi}`).toBeGreaterThanOrEqual(2);
      expect(ticks.every((t) => t >= lo && t <= hi), `${lo}..${hi}`).toBe(true);
    }
  });
});

describe("bucketMeans", () => {
  it("averages buckets and skips missing values", () => {
    expect(bucketMeans([1, 3, NaN, 5, 7], 2)).toEqual([2, 5, 7]);
  });
});

describe("layoutChart", () => {
  const forecast = { median: [2, 3], band50: { lo: [1.5, 2], hi: [2.5, 4] }, band90: { lo: [1, 1], hi: [3, 5] } };

  it("starts the forecast at the last history point", () => {
    const g = layoutChart([0, 1, 2], forecast);
    expect(g.nowX).toBeCloseTo(g.x(2));
    expect(g.median?.startsWith(`M${g.x(2).toFixed(1)} ${g.y(2).toFixed(1)}`)).toBe(true);
  });

  it("breaks the history line at missing values", () => {
    const g = layoutChart([1, NaN, 3]);
    expect(g.history.match(/M/g)?.length).toBe(2);
  });

  it("includes the whole 90 band in the value range", () => {
    const g = layoutChart([0, 1, 2], forecast);
    expect(g.y(5)).toBeGreaterThanOrEqual(0);
  });
});
