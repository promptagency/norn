import { expect, it } from "vitest";
import type { DataSeries } from "../data/detect.ts";
import { historik } from "./historik.ts";

const hourly = (n: number): DataSeries => ({
  name: "pris",
  frequency: "timme",
  times: Array.from({ length: n }, (_, i) => Date.UTC(2022, 10, 1) + i * 3_600_000),
  values: Array.from({ length: n }, (_, i) => (i === 5 ? null : i % 24)),
  missing: 1,
  others: {},
});

it("draws four years of hours as weekly means, labelled by year", () => {
  const h = historik(hourly(34_800));
  expect(h.grupp).toBe("vecka");
  expect(h.values).toHaveLength(Math.ceil(34_800 / 168));
  expect(h.labels.map((l) => l.text)).toEqual(["2023", "2024", "2025", "2026"]);
  expect(h.labels[0].index).toBe(Math.floor((Date.UTC(2023, 0, 1) - Date.UTC(2022, 10, 1)) / 3_600_000 / 168));
});

it("draws a short series as it is, labelled by day, with gaps left open", () => {
  const h = historik(hourly(72));
  expect(h.grupp).toBeUndefined();
  expect(h.values[5]).toBeNaN();
  expect(h.labels.map((l) => l.text)).toEqual(["2 november 2022", "3 november 2022"]);
});

it("labels weekly data at the first week of each month, evenly", () => {
  const weeks = Array.from({ length: 30 }, (_, i) => Date.UTC(2023, 0, 2) + i * 7 * 86_400_000);
  const h = historik({ name: "x", frequency: "vecka", times: weeks, values: weeks.map(() => 1), missing: 0, others: {} });
  expect(h.labels.map((l) => l.text)).toEqual(["februari 2023", "mars 2023", "april 2023", "maj 2023", "juni 2023", "juli 2023"]);
});
