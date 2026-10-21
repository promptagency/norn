import { expect, it } from "vitest";
import { easter, eventOn } from "./holidays.ts";
import { summarize } from "./summary.ts";
import type { Forecast } from "./Forecaster.ts";
import { LEVELS } from "./vendor/timestral.js";

const day = (s: string) => Date.parse(`${s}T00:00Z`);

it("knows Easter and the Swedish public holidays", () => {
  expect(new Date(easter(2026)).toISOString().slice(0, 10)).toBe("2026-04-05");
  expect(new Date(easter(2027)).toISOString().slice(0, 10)).toBe("2027-03-28");
  for (const d of ["2026-04-03", "2026-04-06", "2026-05-14", "2026-05-24", "2026-06-20", "2026-10-31", "2026-12-26"])
    expect(eventOn("roda", day(d)), d).toBe(true);
  expect(eventOn("roda", day("2026-06-19"))).toBe(false); // midsommarafton is not a public holiday
});

it("finds midsommarafton, lucia, the Christmas shopping and the industrial holiday", () => {
  expect(eventOn("midsommar", day("2026-06-19"))).toBe(true);
  expect(eventOn("midsommar", day("2025-06-20"))).toBe(true);
  expect(eventOn("midsommar", day("2025-06-19"))).toBe(false);
  expect(eventOn("lucia", day("2026-12-13") + 15 * 3_600_000)).toBe(true);
  expect(eventOn("julhandel", day("2026-12-24"))).toBe(true);
  expect(eventOn("julhandel", day("2026-12-25"))).toBe(false);
  expect(eventOn("industrisemester", day("2026-07-06"))).toBe(true); // week 28
  expect(eventOn("industrisemester", day("2026-08-03"))).toBe(false); // week 32
});

it("adds up or averages each level over the horizon", () => {
  const steps = [1, 2, 3];
  const f: Forecast = { median: [], band50: { low: [], high: [] }, band90: { low: [], high: [] }, levels: LEVELS, quantiles: steps.map((s) => LEVELS.map((l) => s * 10 * l)) };
  expect(summarize(f, "summa")).toEqual({ median: 30, low: 3, high: 57, plan90: 54, plan95: 57 });
  expect(summarize(f, "snitt").median).toBe(10);
});
