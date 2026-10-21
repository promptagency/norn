// The sentence Norn writes about the data in Urd, and the Swedish words for its units and dates.
import { t, type CopyKey } from "../ui/copy.ts";
import type { DataSeries, Frequency } from "./detect.ts";
import type { Time } from "./parse.ts";

const number = new Intl.NumberFormat("sv-SE");
const day = new Intl.DateTimeFormat("sv-SE", { timeZone: "UTC", day: "numeric", month: "long", year: "numeric" });
const month = new Intl.DateTimeFormat("sv-SE", { timeZone: "UTC", month: "long", year: "numeric" });

/** "dag" or "dagar". */
export const unit = (freq: Frequency, count = 1) => t(`enhet.${freq}${count === 1 ? "" : ".flera"}` as CopyKey);

/** A point in time in words, as precise as the frequency: "1 november 2022", "januari 1991", "kvartal 1 1991", "1991". */
export function formatTime(freq: Frequency, time: Time): string {
  const d = new Date(time);
  if (freq === "år") return String(d.getUTCFullYear());
  if (freq === "kvartal") return t("datum.kvartal", { kvartal: Math.floor(d.getUTCMonth() / 3) + 1, ar: d.getUTCFullYear() });
  if (freq === "månad") return month.format(d);
  return day.format(d);
}

/** Column names as people write them: "total_sales" becomes "Total sales". */
export const columnName = (name: string) => {
  const s = name.replace(/_/g, " ").trim();
  return s.charAt(0).toUpperCase() + s.slice(1);
};

/** "Försäljning per dag, från 1 januari 2023 till 30 september 2026. 1 004 dagar, 3 saknas." */
export function describe(s: DataSeries): string {
  const n = s.values.length;
  const first = t("urd.describe", {
    namn: columnName(s.name),
    enhet: unit(s.frequency),
    start: formatTime(s.frequency, s.times[0]),
    slut: formatTime(s.frequency, s.times[n - 1]),
  });
  const count = { antal: number.format(n), enheter: unit(s.frequency, n), saknas: number.format(s.missing) };
  return `${first} ${t(s.missing ? "urd.count.missing" : "urd.count", count)}`;
}

/** The held-out period in words: "det senaste året", "de senaste 7 dagarna". */
export function periodWords(freq: Frequency, steps: number): string {
  if (freq === "timme" && steps % 24 === 0) return periodWords("dag", steps / 24);
  if ((freq === "dag" && steps === 365) || (freq === "månad" && steps === 12) || (freq === "kvartal" && steps === 4)) return t("period.ar");
  return t("period.n", { antal: steps, enheter: t(`enhet.${freq}.bestamd` as CopyKey) });
}

/** What Norn is compared with, matching SEASON in src/engine/backtest.ts: "samma dag förra veckan". */
export function comparedWith(freq: Frequency): string {
  if (freq === "år") return t("jamfort.forra");
  return t(freq === "timme" || freq === "dag" ? "jamfort.vecka" : "jamfort.ar", { enhet: unit(freq) });
}

/** A total for amounts (sales, visits), an average for levels (price, temperature): PLAN.md, 2026-10-21. */
export function summing(s: DataSeries): "summa" | "snitt" {
  if (s.combined) return s.combined;
  return s.values.every((v) => v === null || (v >= 0 && Number.isInteger(v))) ? "summa" : "snitt";
}

/** What the numbers are: the axis title, and the word after an amount ("MWh", "sidvisningar"), when known. */
export interface Units {
  axis: string;
  amount?: string;
}

/** The vertical axis title: the example's unit, else the column's own name ("Försäljning (kr)"). */
export const axisUnit = (s: DataSeries, units?: Units) => units?.axis ?? columnName(s.name);

/** The words after a total or an average in a sentence: "sidvisningar", "MWh per timme". Empty when unknown. */
export function textUnit(s: DataSeries, how: "summa" | "snitt", units?: Units): string {
  if (!units?.amount) return "";
  return how === "summa" ? units.amount : `${units.amount} per ${unit(s.frequency)}`;
}

const clock = new Intl.DateTimeFormat("sv-SE", { timeZone: "UTC", hour: "2-digit", minute: "2-digit" });

/** One point's time for the hover card: "21 oktober 2026 kl. 14:00", "veckan från 3 mars 2025", "januari 1991". */
export function formatPoint(freq: Frequency, time: Time): string {
  if (freq === "timme") return t("graf.klockslag", { datum: formatTime("dag", time), tid: clock.format(new Date(time)) });
  if (freq === "vecka") return t("graf.vecka", { datum: formatTime("dag", time) });
  return formatTime(freq, time);
}
