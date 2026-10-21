// The horizon buttons in Skuld, in the user's unit (never "steg"), and how many steps each one is.
import type { Frequency } from "./detect.ts";
import type { Time } from "./parse.ts";

export type HorizonUnit = "dygn" | "vecka" | "månad" | "kvartal" | "år";

export interface Horizon {
  n: number;
  unit: HorizonUnit;
  steps: number;
}

const OPTIONS: Record<Frequency, [number, HorizonUnit][]> = {
  timme: [[1, "dygn"], [3, "dygn"], [1, "vecka"], [2, "vecka"]],
  dag: [[2, "vecka"], [1, "månad"], [3, "månad"], [6, "månad"]],
  vecka: [[1, "månad"], [3, "månad"], [6, "månad"], [1, "år"]],
  månad: [[3, "månad"], [6, "månad"], [1, "år"], [2, "år"]],
  kvartal: [[1, "år"], [2, "år"], [3, "år"]],
  år: [[1, "år"], [3, "år"], [5, "år"]],
};

/** The button chosen when Skuld opens: the second one, a middling look ahead. */
export const DEFAULT_HORIZON = 1;

const DAY = 86_400_000;

/** Calendar months from `last`, so "1 månad" from 31 January is the days to the end of February. */
function daysAhead(last: Time, months: number): number {
  const d = new Date(last), y = d.getUTCFullYear(), m = d.getUTCMonth() + months;
  const lastDay = new Date(Date.UTC(y, m + 1, 0)).getUTCDate();
  return Math.round((Date.UTC(y, m, Math.min(d.getUTCDate(), lastDay)) - last) / DAY);
}

export function horizons(freq: Frequency, last: Time): Horizon[] {
  return OPTIONS[freq].map(([n, unit]) => {
    const months = unit === "år" ? 12 * n : unit === "kvartal" ? 3 * n : unit === "månad" ? n : 0;
    const days = unit === "dygn" ? n : unit === "vecka" ? 7 * n : daysAhead(last, months);
    const steps = { timme: days * 24, dag: days, vecka: Math.round(days / 7), månad: months, kvartal: months / 3, år: months / 12 }[freq];
    return { n, unit, steps };
  });
}
