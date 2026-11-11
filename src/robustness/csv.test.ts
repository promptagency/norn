// Robustness contract A: messy real-world files. Every file gives a correct series or a Swedish message from
// docs/COPY.md, never a silent wrong guess. Locked while the fix loop runs (.claude/hooks/guard-exam.mjs).
import { describe as group, expect, it } from "vitest";
import { describe } from "../data/describe.ts";
import { buildSeries, detectColumns, type DataSeries } from "../data/detect.ts";
import { horizons } from "../data/horizon.ts";
import { decode, parseNumber, parseText } from "../data/parse.ts";
import { COPY } from "../ui/copy.ts";
import { rng } from "./rng.ts";

const HOUR = 3_600_000, DAY = 24 * HOUR;
const day = (iso: string) => Date.parse(`${iso}T00:00Z`);
const isoDay = (t: number) => new Date(t).toISOString().slice(0, 10);
const days = (n: number, from = "2024-01-01") => Array.from({ length: n }, (_, i) => isoDay(day(from) + i * DAY));

type Outcome = { ok: true; value: DataSeries } | { ok: false; error: { key: string; values?: Record<string, string> } };

function read(text: string): Outcome {
  const table = parseText(text);
  const cols = detectColumns(table);
  if (!cols.ok) return cols;
  return buildSeries(table, cols.value, cols.value.numeric[0]);
}

function series(text: string): DataSeries {
  const r = read(text);
  if (!r.ok) throw new Error(`expected a series, got ${r.error.key}`);
  return r.value;
}

const errorKey = (text: string) => {
  const r = read(text);
  return r.ok ? "ok" : r.error.key;
};

/** The ISO year and week of the Monday at `t`. */
function isoWeek(t: number): [number, number] {
  const thursday = new Date(t + 3 * DAY);
  const year = thursday.getUTCFullYear();
  return [year, Math.floor((thursday.getTime() - Date.UTC(year, 0, 1)) / (7 * DAY)) + 1];
}

group("numbers", () => {
  it.each([
    ["1 234,5", 1234.5], ["1 234,5", 1234.5], ["1 234,5", 1234.5], ["1234.5", 1234.5],
    ["12 kr", 12], ["SEK 1 234,50", 1234.5], ["45 %", 45], ["12:-", 12], ["−3,5", -3.5],
    ["1.234.567", 1234567], ["1.234.567,5", 1234567.5],
  ])("%s", (cell, expected) => expect(parseNumber(cell)).toBe(expected));

  it.each(["1,5,6", "1.2.3,4,5", "12,34,5", "--3", "1 2,3,4"])("rejects %s", (cell) => expect(parseNumber(cell)).toBeNaN());

  const column = (cells: string[]) => series(`datum;v\n${days(cells.length).map((d, i) => `${d};"${cells[i]}"`).join("\n")}`);
  const repeat = (cells: string[], n = 70) => Array.from({ length: n }, (_, i) => cells[i % cells.length]);

  it("reads a column of 1,234-style cells as Swedish decimals when nothing says otherwise", () => {
    expect(column(repeat(["1,234", "2,500", "3,125"])).values.slice(0, 3)).toEqual([1.234, 2.5, 3.125]);
  });

  it("reads commas as thousands for the whole column when some cells are 1,234.5", () => {
    expect(column(repeat(["1,234", "1,234.5", "980"])).values.slice(0, 3)).toEqual([1234, 1234.5, 980]);
  });

  it("reads commas as thousands for the whole column when some cells are 1,234,567", () => {
    expect(column(repeat(["1,234", "1,234,567", "2,500"])).values.slice(0, 3)).toEqual([1234, 1234567, 2500]);
  });

  it("reads dots as thousands for the whole column when some cells are 1.234.567", () => {
    expect(column(repeat(["1.234", "1.234.567", "2.500"])).values.slice(0, 3)).toEqual([1234, 1234567, 2500]);
  });

  it("says so when one column mixes decimal commas with US thousands", () => {
    expect(read(`datum;v\n${days(70).map((d, i) => `${d};"${i % 2 ? "1,5" : "1,234.5"}"`).join("\n")}`)).toMatchObject({
      ok: false,
      error: { key: "error.column", values: { namn: "v" } },
    });
  });

  it("reads amounts with kr, %, spaces and NBSP in one column", () => {
    const cells = ["1 234 kr", "1 000,50 kr", "2 000 kr", "kr 15", "5 %"];
    expect(column(repeat(cells)).values.slice(0, 5)).toEqual([1234, 1000.5, 2000, 15, 5]);
  });
});

group("times", () => {
  const formats: [string, (y: number, w: number) => string][] = [
    ["2024V01", (y, w) => `${y}V${String(w).padStart(2, "0")}`],
    ["2024-W01", (y, w) => `${y}-W${String(w).padStart(2, "0")}`],
    ["2024W1", (y, w) => `${y}W${w}`],
    ["v 1 2024", (y, w) => `v ${w} ${y}`],
    ["vecka 1 2024", (y, w) => `vecka ${w} ${y}`],
  ];
  const weeks = (from: string, n: number, f: (y: number, w: number) => string) =>
    Array.from({ length: n }, (_, i) => f(...isoWeek(day(from) + i * 7 * DAY)));

  it.each(formats)("reads ISO weeks written as %s", (example, f) => {
    const cells = weeks("2024-01-01", 70, f);
    expect(cells[0]).toBe(example);
    const s = series(`vecka;v\n${cells.map((c, i) => `${c};${i}`).join("\n")}`);
    expect(s).toMatchObject({ frequency: "vecka", missing: 0 });
    expect(s.times[0]).toBe(day("2024-01-01"));
    expect(s.times[69]).toBe(day("2024-01-01") + 69 * 7 * DAY);
  });

  it("lays ISO weeks across a 53-week year on a grid without gaps, from the right Monday", () => {
    const cells = weeks("2020-09-28", 70, formats[0][1]);
    expect(cells.slice(0, 2)).toEqual(["2020V40", "2020V41"]);
    expect(cells).toContain("2020V53");
    const s = series(`vecka;v\n${cells.map((c, i) => `${c};${i}`).join("\n")}`);
    expect(s).toMatchObject({ frequency: "vecka", missing: 0 });
    expect(s.values).toHaveLength(70);
    expect(s.times[0]).toBe(day("2020-09-28"));
    expect(s.times[cells.indexOf("2021V01")]).toBe(day("2021-01-04"));
  });

  it("does not read a week that the year does not have", () => {
    expect(errorKey(`vecka;v\n${Array.from({ length: 70 }, (_, i) => `2021V${53 + i};${i}`).join("\n")}`)).toBe("error.notime");
  });

  it("reads Excel serial dates under a date header", () => {
    const s = series(`Datum;Försäljning\n${Array.from({ length: 70 }, (_, i) => `${45292 + i};${i * 10}`).join("\n")}`);
    expect(s).toMatchObject({ frequency: "dag", name: "Försäljning", missing: 0 });
    expect(s.times[0]).toBe(day("2024-01-01"));
    expect(s.values.slice(0, 2)).toEqual([0, 10]);
  });

  it("reads Excel serial date-times under a time header", () => {
    const s = series(`tid;kWh\n${Array.from({ length: 70 }, (_, i) => `${45292 + i / 24};${i}`).join("\n")}`);
    expect(s).toMatchObject({ frequency: "timme", missing: 0 });
    expect(s.times[1]).toBe(day("2024-01-01") + HOUR);
  });

  it("keeps serial-looking numbers as values when the header does not name a time", () => {
    const s = series(`datum;antal\n${days(70).map((d, i) => `${d};${45292 + i}`).join("\n")}`);
    expect(s).toMatchObject({ name: "antal", frequency: "dag" });
    expect(s.values[0]).toBe(45292);
  });

  it("reads 2024/01/31", () => {
    const s = series(`datum;v\n${days(70).map((d, i) => `${d.replace(/-/g, "/")};${i}`).join("\n")}`);
    expect(s).toMatchObject({ frequency: "dag", missing: 0 });
    expect(s.times[0]).toBe(day("2024-01-01"));
  });

  it("reads 20240131 under a date header, and as a number otherwise", () => {
    const compact = days(70).map((d) => d.replace(/-/g, ""));
    expect(series(`datum;v\n${compact.map((d, i) => `${d};${i}`).join("\n")}`).times[0]).toBe(day("2024-01-01"));
    expect(series(`datum;kod\n${days(70).map((d, i) => `${d};${compact[i]}`).join("\n")}`).name).toBe("kod");
  });

  it("still reads day-first dates, Swedish month names, times, months and quarters", () => {
    const check = (header: string, cells: string[], freq: string) =>
      expect(series(`${header};v\n${cells.map((c, i) => `${c};${i}`).join("\n")}`).frequency).toBe(freq);
    check("datum", days(70).map((d) => d.split("-").reverse().map(Number).join(".")), "dag");
    const sv = new Intl.DateTimeFormat("sv-SE", { timeZone: "UTC", day: "numeric", month: "long", year: "numeric" });
    check("datum", days(70).map((d) => sv.format(day(d))), "dag");
    check("tid", Array.from({ length: 70 }, (_, i) => new Date(day("2024-01-31") + i * HOUR).toISOString().slice(0, 16).replace("T", " ")), "timme");
    check("månad", Array.from({ length: 70 }, (_, i) => `${2000 + Math.floor(i / 12)}-${String((i % 12) + 1).padStart(2, "0")}`), "månad");
    const names = ["jan", "feb", "mar", "apr", "maj", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];
    check("månad", Array.from({ length: 70 }, (_, i) => `${names[i % 12]} ${2000 + Math.floor(i / 12)}`), "månad");
    check("kvartal", Array.from({ length: 70 }, (_, i) => `${1990 + Math.floor(i / 4)}K${(i % 4) + 1}`), "kvartal");
  });

  it("never reads US month-first dates as a series", () => {
    const monthly = Array.from({ length: 70 }, (_, i) => `${String((i % 12) + 1).padStart(2, "0")}/01/${2000 + Math.floor(i / 12)}`);
    expect(read(`date;v\n${monthly.map((m, i) => `${m};${i}`).join("\n")}`).ok).toBe(false);
    const daily = days(70).map((d) => {
      const [y, m, dd] = d.split("-");
      return `${m}/${dd}/${y}`;
    });
    expect(read(`date;v\n${daily.map((m, i) => `${m};${i}`).join("\n")}`).ok).toBe(false);
  });
});

group("order, gaps and repeats", () => {
  const rows = days(100).map((d, i) => `${d};${i}`);

  it("gives the same series for shuffled rows as for sorted ones", () => {
    const r = rng(7);
    const shuffled = [...rows].sort(() => r() - 0.5);
    expect(series(`datum;v\n${shuffled.join("\n")}`)).toEqual(series(`datum;v\n${rows.join("\n")}`));
  });

  it("keeps gaps as missing values in their place", () => {
    const s = series(`datum;v\n${rows.filter((_, i) => i < 30 || i > 34).join("\n")}`);
    expect(s).toMatchObject({ missing: 5 });
    expect(s.values.slice(29, 36)).toEqual([29, null, null, null, null, null, 35]);
  });

  // A log with one row per visitor ("2024-03-01;1") repeats rows too, so collapsing would undercount; Urd asks,
  // and "snitt" mends an export run twice (owner, 2026-11-11).
  it("asks about rows repeated exactly, rather than collapsing them", () => {
    expect(errorKey(`datum;v\n${[...rows, ...rows.slice(0, 40)].join("\n")}`)).toBe("urd.many");
    expect(errorKey(`datum;besök\n${[...days(80), "2024-01-05"].map((d) => `${d};1`).join("\n")}`)).toBe("urd.many");
  });

  it("asks when many days have rows with different values", () => {
    expect(errorKey(`datum;v\n${[...rows, ...days(40).map((d) => `${d};999`)].join("\n")}`)).toBe("urd.many");
  });

  it("asks rather than averages when one day has two different values", () => {
    expect(errorKey(`datum;v\n${[...days(200).map((d, i) => `${d};${i}`), "2024-03-01;999"].join("\n")}`)).toBe("urd.many");
  });
});

group("columns", () => {
  it("ignores text columns and offers every number column", () => {
    const table = parseText(
      `Datum;Butik;Kommentar;Försäljning;Antal kunder\n${days(70).map((d, i) => `${d};Väst;${i % 5 ? "" : "rea"};${i * 100} kr;${i}`).join("\n")}`,
    );
    const c = detectColumns(table);
    expect(c.ok && c.value).toMatchObject({ time: 0, numeric: [3, 4] });
    expect(series(`Datum;Butik;Försäljning\n${days(70).map((d, i) => `${d};Väst;${i}`).join("\n")}`).name).toBe("Försäljning");
  });
});

group("size", () => {
  it.each([["an empty file", ""], ["only spaces", "  \n \n"], ["a header row only", "Datum;Försäljning"], ["names and an empty row", "Datum;Försäljning\n;\n"]])(
    "says the file cannot be read for %s",
    (_, text) => expect(errorKey(text)).toBe("error.file"),
  );

  it("says the series is too short for three rows", () => {
    expect(errorKey("datum;v\n2024-01-01;1\n2024-01-02;2\n2024-01-03;3")).toBe("error.short");
  });

  it("reads a million hourly rows in reasonable time", { timeout: 60_000 }, () => {
    const start = Date.UTC(2000, 0, 1);
    const text = `tid;kWh\n${Array.from({ length: 1_000_000 }, (_, i) => `${new Date(start + i * HOUR).toISOString().slice(0, 16).replace("T", " ")};${i % 97},5`).join("\n")}`;
    const t0 = performance.now();
    const s = series(text);
    expect(performance.now() - t0).toBeLessThan(15_000);
    expect(s).toMatchObject({ frequency: "timme", missing: 0 });
    expect(s.values).toHaveLength(1_000_000);
    expect(s.values[1]).toBe(1.5);
  });
});

group("encodings", () => {
  const text = `Datum;Försäljning\n${days(70).map((d, i) => `${d};${i},5`).join("\n")}`;
  const expected = series(text);
  const utf16 = (s: string, bigEndian: boolean) => {
    const bytes = new Uint8Array(2 + 2 * s.length);
    bytes.set(bigEndian ? [0xfe, 0xff] : [0xff, 0xfe]);
    for (let i = 0; i < s.length; i++) {
      const c = s.charCodeAt(i);
      bytes.set(bigEndian ? [c >> 8, c & 255] : [c & 255, c >> 8], 2 + 2 * i);
    }
    return bytes;
  };
  // Windows-1252 matches Latin-1 for every character used here.
  const cp1252 = (s: string) => Uint8Array.from(s, (c) => c.charCodeAt(0));

  it.each([
    ["UTF-8", new TextEncoder().encode(text)],
    ["UTF-8 with BOM", new Uint8Array([0xef, 0xbb, 0xbf, ...new TextEncoder().encode(text)])],
    ["UTF-16 LE", utf16(text, false)],
    ["UTF-16 BE", utf16(text, true)],
    ["Windows-1252 (Excel's CSV on Windows)", cp1252(text)],
  ])("reads %s", (_, bytes) => {
    const decoded = decode(bytes.buffer as ArrayBuffer);
    expect(decoded.charCodeAt(0)).not.toBe(0xfeff);
    expect(series(decoded)).toEqual(expected);
  });
});

group("horizons", () => {
  const lasts = ["2024-01-31", "2024-02-29", "2023-02-28", "2024-12-31", "2024-06-15"].map(day);
  it.each(["timme", "dag", "vecka", "månad", "kvartal", "år"] as const)("gives whole, growing steps for %s", (freq) => {
    for (const last of lasts) {
      const steps = horizons(freq, last).map((h) => h.steps);
      for (const s of steps) expect(Number.isInteger(s) && s >= 1, `${freq} ${isoDay(last)} ${steps}`).toBe(true);
      expect([...steps].sort((a, b) => a - b)).toEqual(steps);
    }
  });
});

group("any file", () => {
  // Damages a good file the ways people and programs do, and checks the contract on each.
  const base = `Datum;Försäljning;Kunder\n${days(90).map((d, i) => `${d};${1000 + i * 10},50 kr;${i}`).join("\n")}`;
  const junk = [";", ",", ".", " ", " ", "\n", '"', "kr", "%", "−", "e", "0", "9", "-", "/", "V", "\u0000", "\r\n", "\t", "ä", "NaN", "Infinity", "1e400"];
  const r = rng(20261111);
  const pick = <T,>(xs: T[]) => xs[Math.floor(r() * xs.length)];
  const mutate = (s: string) => {
    let out = s;
    for (let k = 1 + Math.floor(r() * 8); k > 0; k--) {
      const at = Math.floor(r() * out.length);
      const op = r();
      if (op < 0.4) out = out.slice(0, at) + pick(junk) + out.slice(at);
      else if (op < 0.7) out = out.slice(0, at) + out.slice(at + 1 + Math.floor(r() * 20));
      else if (op < 0.8) out = out.slice(0, at);
      else {
        const lines = out.split("\n");
        const i = Math.floor(r() * lines.length), j = Math.floor(r() * lines.length);
        [lines[i], lines[j]] = [lines[j], lines[i]];
        out = lines.join("\n");
      }
    }
    return out;
  };
  const files = Array.from({ length: 500 }, () => mutate(base));

  it("gives a clean series or a message from COPY for 500 damaged files", () => {
    for (const file of files) {
      const where = JSON.stringify(file.slice(0, 200));
      let res: Outcome;
      try {
        res = read(file);
      } catch (e) {
        throw new Error(`threw ${(e as Error).message} on ${where}`);
      }
      if (!res.ok) {
        expect(Object.keys(COPY), where).toContain(res.error.key);
        continue;
      }
      const s = res.value;
      expect(s.values.length, where).toBe(s.times.length);
      expect(s.values.every((v) => v === null || Number.isFinite(v)), where).toBe(true);
      for (const o of Object.values(s.others)) expect(o.every((v) => v === null || Number.isFinite(v)), where).toBe(true);
      expect(s.times.every((t, i) => i === 0 || t > s.times[i - 1]), where).toBe(true);
      expect(() => describe(s), where).not.toThrow();
    }
  });
});
