// Pure geometry for Prognosgraf. No React, no DOM, so it can be unit tested.

export interface Band {
  lo: number[];
  hi: number[];
}

export interface ForecastSeries {
  /** Most likely value per step ahead (quantile 0.5). */
  median: number[];
  /** Half of the time (quantiles 0.25 to 0.75). */
  band50: Band;
  /** Nine times out of ten (quantiles 0.05 to 0.95). */
  band90: Band;
}

export interface ChartLayout {
  width: number;
  height: number;
  padLeft: number;
  padRight: number;
  padTop: number;
  padBottom: number;
}

export const DEFAULT_LAYOUT: ChartLayout = { width: 1000, height: 320, padLeft: 44, padRight: 8, padTop: 30, padBottom: 30 };

export interface ChartGeometry {
  history: string;
  median?: string;
  band50?: string;
  band90?: string;
  outcome?: string;
  /** x of the last history point, where the now-line is drawn. */
  nowX?: number;
  yTicks: { value: number; y: number }[];
  baseY: number;
  x: (index: number) => number;
  y: (value: number) => number;
}

/** Up to four round values covering [min, max], always including 0 when it is in range (design/DESIGN.md). */
export function niceTicks(min: number, max: number, count = 4): number[] {
  if (!Number.isFinite(min) || !Number.isFinite(max) || min === max) return [min];
  const span = max - min;
  const raw = span / count;
  const mag = 10 ** Math.floor(Math.log10(raw));
  // The smallest round step whose values in range fit the count, so the top value is never cut off.
  const fits = (s: number) => Math.floor(max / s + 1e-9) - Math.ceil(min / s - 1e-9) + 1 <= count;
  const step = [1, 2, 2.5, 5, 10, 20].map((m) => m * mag).find(fits) ?? 20 * mag;
  const start = Math.ceil(min / step) * step;
  const ticks: number[] = [];
  for (let v = start; v <= max + step * 1e-9 && ticks.length < count; v += step) ticks.push(Number((Math.round(v / step) * step).toPrecision(12)) + 0); // 0.3, not 0.30000000000000004
  return ticks;
}

/** Mean of each bucket of `size` values. Use it before drawing very long histories. */
export function bucketMeans(values: number[], size: number): number[] {
  if (size <= 1) return values.slice();
  const out: number[] = [];
  for (let i = 0; i < values.length; i += size) {
    const part = values.slice(i, i + size).filter(Number.isFinite);
    out.push(part.length ? part.reduce((a, b) => a + b, 0) / part.length : NaN);
  }
  return out;
}

function line(xs: number[], ys: number[], x: (i: number) => number, y: (v: number) => number): string {
  let d = "";
  let pen = false;
  for (let k = 0; k < xs.length; k++) {
    const v = ys[k];
    if (!Number.isFinite(v)) {
      pen = false;
      continue;
    }
    d += `${pen ? "L" : "M"}${x(xs[k]).toFixed(1)} ${y(v).toFixed(1)}`;
    pen = true;
  }
  return d;
}

function area(xs: number[], lo: number[], hi: number[], x: (i: number) => number, y: (v: number) => number): string {
  const top = xs.map((i, k) => `${x(i).toFixed(1)} ${y(hi[k]).toFixed(1)}`);
  const bottom = xs.map((i, k) => `${x(i).toFixed(1)} ${y(lo[k]).toFixed(1)}`).reverse();
  return `M${top.join("L")}L${bottom.join("L")}Z`;
}

/**
 * Lay out history, an optional forecast and an optional backtest outcome on one time axis.
 * The forecast and outcome start at the last history point, so the thread frays from there.
 */
export function layoutChart(
  history: number[],
  forecast?: ForecastSeries,
  outcome?: number[],
  layout: ChartLayout = DEFAULT_LAYOUT,
  yRange?: [number, number],
): ChartGeometry {
  const n = history.length;
  const h = forecast ? forecast.median.length : 0;
  const total = Math.max(n + h, 2);
  const values = [
    ...history,
    ...(forecast ? [...forecast.band90.lo, ...forecast.band90.hi, ...forecast.median] : []),
    ...(outcome ?? []),
  ].filter(Number.isFinite);
  let [lo, hi] = yRange ?? [Math.min(0, ...values), Math.max(...values)];
  if (lo === hi) hi = lo + 1;
  const pad = (hi - lo) * 0.04;
  if (!yRange) hi += pad;

  const { width, height, padLeft, padRight, padTop, padBottom } = layout;
  const x = (i: number) => padLeft + ((width - padLeft - padRight) * i) / (total - 1);
  const y = (v: number) => padTop + (height - padTop - padBottom) * (1 - (v - lo) / (hi - lo));

  const geo: ChartGeometry = {
    history: line(history.map((_, i) => i), history, x, y),
    yTicks: niceTicks(lo, hi).map((value) => ({ value, y: y(value) })),
    baseY: y(lo < 0 && hi > 0 ? 0 : lo),
    x,
    y,
  };

  if (forecast && n > 0) {
    const last = history[n - 1];
    const xs = [n - 1, ...forecast.median.map((_, k) => n + k)];
    const withStart = (a: number[]) => [last, ...a];
    geo.median = line(xs, withStart(forecast.median), x, y);
    geo.band50 = area(xs, withStart(forecast.band50.lo), withStart(forecast.band50.hi), x, y);
    geo.band90 = area(xs, withStart(forecast.band90.lo), withStart(forecast.band90.hi), x, y);
    geo.nowX = x(n - 1);
    if (outcome) geo.outcome = line(xs, withStart(outcome), x, y);
  }
  return geo;
}
