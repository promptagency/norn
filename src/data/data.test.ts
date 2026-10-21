import { readFileSync } from "node:fs";
import { describe as group, expect, it } from "vitest";
import { describe } from "./describe.ts";
import { buildSeries, detectColumns } from "./detect.ts";
import type { Example } from "./examples.ts";
import * as XLSX from "xlsx";
import { parseExcel, parseNumber, parseText, parseTime } from "./parse.ts";

const day = (s: string) => Date.parse(`${s}Z`);

group("parseNumber", () => {
  it.each([
    ["1 234,5", 1234.5], ["1234.5", 1234.5], ["1,234.5", 1234.5], ["1.234,5", 1234.5], ["1,234,567", 1234567],
    ["−3", -3], ["-0,25", -0.25], ["12 kr", 12], ["45 %", 45], ["1 000", 1000], ["", null],
  ])("%s", (cell, expected) => expect(parseNumber(cell)).toBe(expected));
  it("rejects text", () => expect(parseNumber("okänd")).toBeNaN());
});

group("parseTime", () => {
  it.each([
    ["2024-01-31", "2024-01-31T00:00", "datum"],
    ["2024-01-31 13:00", "2024-01-31T13:00", "tid"],
    ["2024-01-31T13:00:00+01:00", "2024-01-31T13:00", "tid"],
    ["31/1/2024", "2024-01-31T00:00", "datum"],
    ["31.1.2024 07:30", "2024-01-31T07:30", "tid"],
    ["1 januari 2024", "2024-01-01T00:00", "datum"],
    ["jan 2024", "2024-01-01T00:00", "månad"],
    ["2024-03", "2024-03-01T00:00", "månad"],
    ["1991M01", "1991-01-01T00:00", "månad"],
    ["2024K2", "2024-04-01T00:00", "kvartal"],
    ["2024-Q4", "2024-10-01T00:00", "kvartal"],
  ])("%s", (cell, iso, kind) => expect(parseTime(cell)).toEqual({ time: day(iso), kind }));
  it("rejects days that do not exist", () => expect(parseTime("2024-02-30")).toBeNull());
  it("reads plain years only when asked", () => {
    expect(parseTime("2024")).toBeNull();
    expect(parseTime("2024", true)).toEqual({ time: day("2024-01-01T00:00"), kind: "år" });
  });
});

const days = (n: number, from = "2024-01-01") =>
  Array.from({ length: n }, (_, i) => new Date(day(`${from}T00:00`) + i * 86_400_000).toISOString().slice(0, 10));

function series(text: string) {
  const table = parseText(text);
  const cols = detectColumns(table);
  if (!cols.ok) return cols;
  return buildSeries(table, cols.value, cols.value.numeric[0]);
}

group("detect and build", () => {
  it("reads a Swedish CSV with semicolons and decimal commas, in any order, with gaps", () => {
    const rows = days(100).map((d, i) => `${d};${i},5`).filter((_, i) => i !== 40 && i !== 41).reverse();
    const r = series(`Datum;Försäljning\n${rows.join("\n")}`);
    if (!r.ok) throw new Error(r.error.key);
    expect(r.value).toMatchObject({ name: "Försäljning", frequency: "dag", missing: 2 });
    expect(r.value.values.slice(38, 43)).toEqual([38.5, 39.5, null, null, 42.5]);
    expect(describe(r.value)).toBe("Försäljning per dag, från 1 januari 2024 till 9 april 2024. 100 dagar, 2 saknas.");
  });

  it("reads cells pasted from a spreadsheet, without a row of names", () => {
    const r = series(days(70).map((d, i) => `${d}\t${i}`).join("\n"));
    expect(r.ok && r.value).toMatchObject({ name: "Kolumn 2", frequency: "dag", missing: 0 });
  });

  it("averages the repeated hour when the clocks go back, and counts the skipped one as missing", () => {
    const hours = Array.from({ length: 80 }, (_, i) => new Date(day("2024-10-26T00:00") + i * 3_600_000).toISOString().slice(0, 16).replace("T", " "));
    const rows = hours.map((h, i) => `${h},${i}`);
    rows.splice(27, 0, `${hours[26]},100`); // 27 October 02:00 twice
    rows.splice(10, 1);
    const r = series(`tid,pris\n${rows.join("\n")}`);
    if (!r.ok) throw new Error(r.error.key);
    expect(r.value).toMatchObject({ frequency: "timme", missing: 1 });
    expect(r.value.values[26]).toBe(63);
  });

  it("says so when the series is too short", () => {
    expect(series(days(20).map((d) => `${d},1`).join("\n"))).toEqual({ ok: false, error: { key: "error.short" } });
  });

  it("says so when the times are irregular", () => {
    // Every 36 hours: one row per day at most, but no regular step.
    const rows = Array.from({ length: 100 }, (_, i) => `${new Date(day("2024-01-01T00:00") + i * 36 * 3_600_000).toISOString().slice(0, 16)},1`);
    expect(series(rows.join("\n"))).toEqual({ ok: false, error: { key: "error.irregular" } });
  });

  it("asks how to put several rows per day together, then sums or averages them", () => {
    // A till export: one row per sale, two or three sales a day, nothing on 15 January.
    const rows = days(80).flatMap((d, i) => (i === 14 ? [] : [`${d} 10:12,100`, `${d} 13:40,50`, ...(i % 2 ? [`${d} 16:05,30`] : [])]));
    const table = parseText(`tid,belopp\n${rows.join("\n")}`);
    const cols = detectColumns(table);
    if (!cols.ok) throw new Error(cols.error.key);
    expect(buildSeries(table, cols.value, 1)).toEqual({ ok: false, error: { key: "urd.many", values: { enhet: "dag" } } });
    const summa = buildSeries(table, cols.value, 1, "summa");
    if (!summa.ok) throw new Error(summa.error.key);
    expect(summa.value).toMatchObject({ frequency: "dag", missing: 0 });
    expect(summa.value.values.slice(12, 16)).toEqual([150, 180, 0, 180]);
    const snitt = buildSeries(table, cols.value, 1, "snitt");
    expect(snitt.ok && snitt.value.values.slice(12, 16)).toEqual([75, 60, null, 60]);
  });

  it("leaves regular hourly data alone", () => {
    const hours = Array.from({ length: 100 }, (_, i) => new Date(day("2024-01-01T00:00") + i * 3_600_000).toISOString().slice(0, 16));
    const r = series(`tid,pris\n${hours.map((h, i) => `${h},${i}`).join("\n")}`);
    expect(r.ok && r.value.frequency).toBe("timme");
  });

  it("says so when there is no time column", () => {
    expect(series("a,b\n1,2\n3,4")).toEqual({ ok: false, error: { key: "error.notime" } });
  });

  it("names the column it cannot read", () => {
    expect(series(`datum,belopp\n${days(70).map((d) => `${d},okänt`).join("\n")}`)).toEqual({
      ok: false,
      error: { key: "error.column", values: { namn: "belopp" } },
    });
  });
});

group("parseExcel", () => {
  it("reads the first sheet with its dates as the wall-clock times in Excel", async () => {
    const rows = [["Datum", "Besökare"], ...Array.from({ length: 70 }, (_, i) => [new Date(2024, 0, 1 + i), 10 + i])];
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, XLSX.utils.aoa_to_sheet(rows, { cellDates: true }), "Blad1");
    const table = await parseExcel(XLSX.write(book, { type: "array", bookType: "xlsx" }));
    expect(table.headers).toEqual(["Datum", "Besökare"]);
    expect(table.rows[0]).toEqual(["2024-01-01 00:00:00", "10"]);
    const cols = detectColumns(table);
    const r = cols.ok && buildSeries(table, cols.value, 1);
    expect(r && r.ok && describe(r.value)).toBe("Besökare per dag, från 1 januari 2024 till 10 mars 2024. 70 dagar.");
  });
});

group("the examples reach Urd with the right description", () => {
  const { examples } = JSON.parse(readFileSync("public/data/examples.json", "utf8")) as { examples: Example[] };
  const expected: Record<string, string> = {
    detaljhandel: "Leksaksaffärer per månad, från januari 1991 till augusti 2026. 428 månader.",
    elpris: "Elpris per timme, från 1 november 2022 till 20 oktober 2026. 34 800 timmar, 4 saknas.",
    wikipedia: "Melodifestivalen per dag, från 1 januari 2016 till 20 oktober 2026. 3 946 dagar.",
  };
  it.each(examples.map((e) => [e.id, e] as const))("%s", (id, ex) => {
    const table = parseText(readFileSync(`public/data/${ex.file}`, "utf8"));
    table.headers = table.headers.map((h) => ex.labels?.[h] ?? h);
    const cols = detectColumns(table);
    if (!cols.ok) throw new Error(cols.error.key);
    const target = table.headers.indexOf(ex.labels?.[ex.default_target] ?? ex.default_target);
    const r = buildSeries(table, cols.value, target);
    if (!r.ok) throw new Error(r.error.key);
    expect(r.value.frequency).toBe(ex.frequency);
    expect(describe(r.value).replace(/ /g, " ")).toBe(expected[id]);
  });
});

group("Skuld's horizons and totals", () => {
  it("counts calendar steps for each button", async () => {
    const { horizons } = await import("./horizon.ts");
    const last = day("2026-01-31T00:00");
    expect(horizons("dag", last).map((h) => h.steps)).toEqual([14, 28, 89, 181]);
    expect(horizons("timme", last).map((h) => h.steps)).toEqual([24, 72, 168, 336]);
    expect(horizons("månad", last).map((h) => h.steps)).toEqual([3, 6, 12, 24]);
  });

  it("sums whole non-negative numbers and averages the rest, unless the user chose", async () => {
    const { summing } = await import("./describe.ts");
    const base = { name: "x", frequency: "dag" as const, times: [], missing: 0, others: {} };
    expect(summing({ ...base, values: [3, 0, null, 12] })).toBe("summa");
    expect(summing({ ...base, values: [0.35, 1.2] })).toBe("snitt");
    expect(summing({ ...base, values: [0.35, 1.2], combined: "summa" })).toBe("summa");
  });
});
