import { expect, it } from "vitest";
import { LEVELS } from "../engine/vendor/timestral.js";
import { forecastCsv } from "./csv.ts";

it("writes one row per step with every level, readable by Swedish Excel", () => {
  const q = LEVELS.map((l) => 10 + l);
  const f = { median: [10.5], band50: { low: [10.25], high: [10.75] }, band90: { low: [10.05], high: [10.95] }, quantiles: [q], levels: LEVELS };
  const [head, row] = forecastCsv(f, [Date.UTC(2026, 9, 21, 13)], true).split("\r\n");
  expect(head.startsWith("﻿tid;troligast;lägst i nio fall av tio;högst i nio fall av tio;kvantil 1 %;kvantil 5 %")).toBe(true);
  expect(row.split(";").slice(0, 5)).toEqual(["2026-10-21 13:00", "10,5", "10,05", "10,95", "10,01"]);
  expect(row.split(";")).toHaveLength(4 + 21);
});
