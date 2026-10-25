// Made-up numbers for the pictures on the phone page and on "Så fungerar Norn": illustrations, not data and not a
// forecast, so the charts that draw them show no values.
import type { ForecastSeries } from "./components/index.ts";

export const HISTORY = [150, 170, 140, 200, 155, 175, 145, 210, 160, 185, 150, 220, 165, 190, 175];
export const MEDIAN = [185, 155, 205, 162, 188, 152, 215, 164, 190, 156, 210];

/** How far each band reaches from the median k steps ahead: widening, as a real forecast does. */
export const SPREAD = { band50: (k: number) => 4 + 3 * k, band90: (k: number) => 8 + 8 * k };

const around = (median: number[], spread: (k: number) => number, sign: number) => median.map((v, k) => v + sign * spread(k + 1));
export const forecast = (median: number[]): ForecastSeries => ({
  median,
  band50: { lo: around(median, SPREAD.band50, -1), hi: around(median, SPREAD.band50, 1) },
  band90: { lo: around(median, SPREAD.band90, -1), hi: around(median, SPREAD.band90, 1) },
});

export const ILLUSTRATION = forecast(MEDIAN);

/** The test: the history up to a cut, Norn's guess for the part after it, and what really happened there. */
export const TEST = {
  history: HISTORY.slice(0, 10),
  guess: forecast([170, 205, 158, 182, 150]),
  actual: [175, 220, 165, 190, 175],
};

/** The value range all the illustrations share, so they look like one series. */
export const RANGE: [number, number] = [0, 330];
