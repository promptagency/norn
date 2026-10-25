import { describe, expect, it } from "vitest";
import { bucketMeans, DEFAULT_LAYOUT, indexAt, layoutChart, MIN_VIEW, niceTicks, readingAt, zoomView } from "./chart.ts";

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

describe("the hover indicator", () => {
  it("finds the nearest point on the time axis, and stays inside it", () => {
    const { padLeft, width, padRight } = DEFAULT_LAYOUT;
    expect(indexAt(padLeft, 11)).toBe(0);
    expect(indexAt(width - padRight, 11)).toBe(10);
    expect(indexAt(padLeft + (width - padLeft - padRight) * 0.52, 11)).toBe(5);
    expect(indexAt(-50, 11)).toBe(0);
    expect(indexAt(5000, 11)).toBe(10);
  });

  it("reads the history up to the now-line and the forecast after it", () => {
    const f = { median: [5, 6], band50: { lo: [4, 5], hi: [6, 7] }, band90: { lo: [3, 4], hi: [7, 8] } };
    expect(readingAt(1, [1, 2, 3], f)).toEqual({ history: 2 });
    expect(readingAt(2, [1, 2, 3], f)).toEqual({ history: 3 });
    expect(readingAt(4, [1, 2, 3], f, [9, 10])).toEqual({ outcome: 10, median: 6, low90: 4, high90: 8 });
  });
});

describe("zooming in on time", () => {
  const forecast = { median: [2, 30], band50: { lo: [1.5, 20], hi: [2.5, 40] }, band90: { lo: [1, 10], hi: [3, 50] } };

  it("spreads the stretch shown over the whole width, and fits the values to it", () => {
    const g = layoutChart([0, 1, 2, 100, 2, 1], undefined, undefined, DEFAULT_LAYOUT, undefined, [0, 2]);
    expect(g.x(0)).toBeCloseTo(DEFAULT_LAYOUT.padLeft);
    expect(g.x(2)).toBeCloseTo(DEFAULT_LAYOUT.width - DEFAULT_LAYOUT.padRight);
    expect(Math.max(...g.yTicks.map((t) => t.value))).toBeLessThan(10); // the peak of 100 is outside
  });

  it("fits the bands to the forecast points shown, not the ones beyond", () => {
    const g = layoutChart([0, 1, 2], forecast, undefined, DEFAULT_LAYOUT, undefined, [0, 3]);
    expect(Math.max(...g.yTicks.map((t) => t.value))).toBeLessThan(10); // band90 reaches 50 only at point 4
  });

  it("reads the hover point within the stretch shown", () => {
    expect(indexAt(DEFAULT_LAYOUT.padLeft, 100, DEFAULT_LAYOUT, [40, 60])).toBe(40);
    expect(indexAt(DEFAULT_LAYOUT.width, 100, DEFAULT_LAYOUT, [40, 60])).toBe(60);
  });

  it("keeps a zoomed stretch on the axis and at least MIN_VIEW points long", () => {
    expect(zoomView(2, 10, 100)).toEqual([0, 10]);
    expect(zoomView(98, 10, 100)).toEqual([89, 99]);
    const [a, b] = zoomView(50, 1, 100);
    expect(b - a + 1).toBe(MIN_VIEW);
    expect(zoomView(50, 500, 100)).toEqual([0, 99]);
  });
});
