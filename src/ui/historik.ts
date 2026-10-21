// Prepares a history for Prognosgraf: long series are drawn as means per day or week, with a few time labels.
import { formatTime, unit } from "../data/describe.ts";
import type { DataSeries, Frequency } from "../data/detect.ts";
import { bucketMeans } from "./components/chart.ts";
import type { Axeletikett } from "./components/types.ts";

const MAX_POINTS = 600;

export interface Historik {
  values: number[];
  labels: Axeletikett[];
  /** Set when the chart shows means: what each point stands for ("vecka"). */
  grupp?: string;
}

function bucket(freq: Frequency, n: number): { size: number; grupp?: Frequency } {
  if (n <= MAX_POINTS) return { size: 1 };
  if (freq === "timme") return n / 24 <= MAX_POINTS ? { size: 24, grupp: "dag" } : { size: 168, grupp: "vecka" };
  if (freq === "dag") return { size: 7, grupp: "vecka" };
  return { size: 1 };
}

export function historik(s: DataSeries): Historik {
  const { size, grupp } = bucket(s.frequency, s.values.length);
  const values = bucketMeans(s.values.map((v) => v ?? NaN), size);
  // Label the first point of each new year, else month, else day: the coarsest that gives at least two labels.
  const d = s.times.map((t) => new Date(t));
  const periods: [Frequency, (x: Date) => number][] = [
    ["år", (x) => x.getUTCFullYear()],
    ["månad", (x) => x.getUTCFullYear() * 12 + x.getUTCMonth()],
    ["dag", (x) => Math.floor(x.getTime() / 86_400_000)],
  ];
  let labels: Axeletikett[] = [];
  for (const [freq, period] of periods) {
    const at = d.flatMap((x, i) => (i > 0 && period(x) !== period(d[i - 1]) ? [i] : []));
    if (at.length < 2) continue;
    const every = Math.ceil(at.length / 6);
    labels = at.filter((_, k) => k % every === 0).map((i) => ({ index: Math.floor(i / size), text: formatTime(freq, s.times[i]) }));
    break;
  }
  return { values, labels, grupp: grupp && unit(grupp) };
}
