// Finds the time column, the number columns and the frequency, and lays the values out on a regular grid
// with gaps as null. Errors carry a copy key so the UI can say what happened and what to do.
import type { CopyKey } from "../ui/copy.ts";
import { parseNumber, parseTime, type Table, type Time, type TimeKind } from "./parse.ts";

export type Frequency = "timme" | "dag" | "vecka" | "månad" | "kvartal" | "år";

export interface Columns {
  time: number;
  /** Columns where nearly every cell is a number, in file order. */
  numeric: number[];
}

export interface DataSeries {
  name: string;
  frequency: Frequency;
  /** One per step on the grid, oldest first. */
  times: Time[];
  values: (number | null)[];
  /** Steps on the grid without a value. */
  missing: number;
  /** The other number columns on the same grid, kept for Skuld. */
  others: Record<string, (number | null)[]>;
}

export interface DataError {
  key: CopyKey;
  values?: Record<string, string>;
}

export type Result<T> = { ok: true; value: T } | { ok: false; error: DataError };

export const MIN_VALUES = 64;
const NUMERIC_SHARE = 0.9; // of non-empty cells, for a column to count as numbers
const TOLERATED = 0.01; // share of rows that may sit off the grid or repeat a time (daylight saving)

const HOUR = 3_600_000, DAY = 24 * HOUR;
const FIXED: Partial<Record<Frequency, number>> = { timme: HOUR, dag: DAY, vecka: 7 * DAY };
const MONTHS: Partial<Record<Frequency, number>> = { månad: 1, kvartal: 3, år: 12 };

const share = <T,>(xs: T[], ok: (x: T) => boolean) => (xs.length ? xs.filter(ok).length / xs.length : 0);
const filled = (col: string[]) => col.filter((c) => c !== "");

/** Guesses the time column (the first where nearly every cell is a time) and the number columns. */
export function detectColumns(table: Table): Result<Columns> {
  const cols = table.headers.map((_, i) => table.rows.map((r) => r[i]));
  const isYears = (i: number) => /^(år|ar|year)$/i.test(table.headers[i]);
  const time = cols.findIndex((c, i) => share(filled(c), (s) => parseTime(s, isYears(i)) !== null) >= NUMERIC_SHARE);
  if (time < 0) return { ok: false, error: { key: "error.notime" } };
  const numeric = cols.flatMap((c, i) =>
    i !== time && share(filled(c), (s) => !Number.isNaN(parseNumber(s))) >= NUMERIC_SHARE && filled(c).length ? [i] : [],
  );
  if (!numeric.length) {
    const other = table.headers.find((_, i) => i !== time);
    return { ok: false, error: other ? { key: "error.column", values: { namn: other } } : { key: "error.short" } };
  }
  return { ok: true, value: { time, numeric } };
}

function frequencyOf(kind: TimeKind, times: Time[]): Frequency | null {
  const diffs = times.slice(1).map((t, i) => t - times[i]).filter((d) => d > 0).sort((a, b) => a - b);
  if (!diffs.length) return null;
  const d = diffs[Math.floor(diffs.length / 2)];
  if (kind === "år") return "år";
  if (d === HOUR) return "timme";
  if (d === DAY) return "dag";
  if (d === 7 * DAY) return "vecka";
  if (d >= 28 * DAY && d <= 31 * DAY) return "månad";
  if (d >= 89 * DAY && d <= 92 * DAY) return "kvartal";
  if (d >= 365 * DAY && d <= 366 * DAY) return "år";
  return null;
}

/** Steps from `from` to `t` on the grid, or null when `t` sits between steps. */
function step(freq: Frequency, from: Time, t: Time): number | null {
  const fixed = FIXED[freq];
  if (fixed) return (t - from) % fixed === 0 ? (t - from) / fixed : null;
  const a = new Date(from), b = new Date(t);
  const months = (b.getUTCFullYear() - a.getUTCFullYear()) * 12 + b.getUTCMonth() - a.getUTCMonth();
  return months % MONTHS[freq]! === 0 ? months / MONTHS[freq]! : null;
}

function timeAt(freq: Frequency, from: Time, k: number): Time {
  const fixed = FIXED[freq];
  if (fixed) return from + k * fixed;
  const a = new Date(from);
  return Date.UTC(a.getUTCFullYear(), a.getUTCMonth() + k * MONTHS[freq]!, 1);
}

/** Sorts by time, places the values on a regular grid and checks that there is enough to forecast. */
export function buildSeries(table: Table, columns: Columns, value: number): Result<DataSeries> {
  const name = table.headers[value];
  const isYears = /^(år|ar|year)$/i.test(table.headers[columns.time]);
  const parsed = table.rows
    .map((r) => ({ t: parseTime(r[columns.time], isYears), r }))
    .filter((p): p is { t: NonNullable<typeof p.t>; r: string[] } => p.t !== null)
    .sort((a, b) => a.t.time - b.t.time);
  const irregular: Result<DataSeries> = { ok: false, error: { key: "error.irregular" } };
  if (parsed.length < 2) return { ok: false, error: { key: "error.short" } };

  const times = parsed.map((p) => p.t.time);
  const freq = frequencyOf(parsed[0].t.kind, times);
  if (!freq) return irregular;

  const from = times[0];
  const slots = parsed.map((p) => step(freq, from, p.t.time));
  const length = Math.max(...slots.map((s) => s ?? 0)) + 1;
  const offGrid = slots.filter((s) => s === null).length;
  const repeats = parsed.length - new Set(slots).size;
  if (offGrid + repeats > Math.max(1, TOLERATED * parsed.length) || length > 2 * parsed.length) return irregular;

  const cols = [value, ...columns.numeric.filter((c) => c !== value)];
  const grids = cols.map(() => Array.from({ length }, () => [] as number[]));
  parsed.forEach((p, k) => {
    if (slots[k] === null) return;
    cols.forEach((c, j) => {
      const v = parseNumber(p.r[c]);
      if (v !== null && Number.isFinite(v)) grids[j][slots[k]!].push(v);
    });
  });
  // A time that appears twice (the autumn hour of daylight saving) gets the mean of its values.
  const mean = (vs: number[]) => (vs.length ? vs.reduce((a, b) => a + b, 0) / vs.length : null);
  const [values, ...rest] = grids.map((g) => g.map(mean));

  if (filled(table.rows.map((r) => r[value])).length && values.every((v) => v === null))
    return { ok: false, error: { key: "error.column", values: { namn: name } } };
  const observed = values.filter((v) => v !== null).length;
  if (observed < MIN_VALUES) return { ok: false, error: { key: "error.short" } };

  return {
    ok: true,
    value: {
      name,
      frequency: freq,
      times: Array.from({ length }, (_, k) => timeAt(freq, from, k)),
      values,
      missing: length - observed,
      others: Object.fromEntries(cols.slice(1).map((c, j) => [table.headers[c], rest[j]])),
    },
  };
}
