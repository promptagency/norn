// Swedish events Norn knows in advance, as series of 0 and 1 the model reads as known-future covariates.
import type { Time } from "../data/parse.ts";

export type EventId = "roda" | "midsommar" | "lucia" | "julhandel" | "industrisemester";
export const EVENTS: EventId[] = ["roda", "midsommar", "lucia", "julhandel", "industrisemester"];

const DAY = 86_400_000;
const day = (y: number, m: number, d: number) => Date.UTC(y, m - 1, d);

/** Easter Sunday (the anonymous Gregorian algorithm). */
export function easter(y: number): Time {
  const a = y % 19, b = Math.floor(y / 100), c = y % 100, d = Math.floor(b / 4), e = b % 4;
  const f = Math.floor((b + 8) / 25), g = Math.floor((b - f + 1) / 3), h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4), k = c % 4, l = (32 + 2 * e + 2 * i - h - k) % 7, m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31), date = ((h + l - 7 * m + 114) % 31) + 1;
  return day(y, month, date);
}

/** The first day from `from` (inclusive) that falls on `weekday` (0 Sunday). */
const firstWeekday = (from: Time, weekday: number) => from + ((weekday - new Date(from).getUTCDay() + 7) % 7) * DAY;

/** Sweden's public holidays (röda dagar) in a year, Sundays left out since every week has one. */
function publicHolidays(y: number): Time[] {
  const e = easter(y);
  return [
    day(y, 1, 1), day(y, 1, 6), e - 2 * DAY, e, e + DAY, day(y, 5, 1), e + 39 * DAY, e + 49 * DAY, day(y, 6, 6),
    firstWeekday(day(y, 6, 20), 6), firstWeekday(day(y, 10, 31), 6), day(y, 12, 25), day(y, 12, 26),
  ];
}

/** ISO 8601 week number. */
function isoWeek(t: Time): number {
  const d = new Date(Math.floor(t / DAY) * DAY);
  const thursday = d.getTime() + (3 - ((d.getUTCDay() + 6) % 7)) * DAY;
  const jan1 = Date.UTC(new Date(thursday).getUTCFullYear(), 0, 1);
  return 1 + Math.floor((thursday - jan1) / (7 * DAY));
}

const cache = new Map<number, Set<Time>>();
const holidaysIn = (y: number) => cache.get(y) ?? cache.set(y, new Set(publicHolidays(y))).get(y)!;

/** Whether the day of `t` belongs to the event. */
export function eventOn(id: EventId, t: Time): boolean {
  const d = new Date(t), y = d.getUTCFullYear(), m = d.getUTCMonth() + 1, date = d.getUTCDate();
  const midnight = Math.floor(t / DAY) * DAY;
  switch (id) {
    case "roda": return holidaysIn(y).has(midnight);
    case "midsommar": return midnight === firstWeekday(day(y, 6, 19), 5);
    case "lucia": return m === 12 && date === 13;
    case "julhandel": return m === 12 && date <= 24;
    case "industrisemester": return isoWeek(t) >= 28 && isoWeek(t) <= 31;
  }
}

export const eventSeries = (id: EventId, times: Time[]) => times.map((t) => (eventOn(id, t) ? 1 : 0));
