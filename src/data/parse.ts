// Reads a file or pasted text into a table of strings, and parses single cells as numbers and times.
// Everything happens in memory; nothing here touches storage or the network.
import Papa from "papaparse";
import { t } from "../ui/copy.ts";

export interface Table {
  headers: string[];
  rows: string[][];
}

/** A point in time as milliseconds since 1970 in UTC, read from the wall-clock time in the file (no time zones). */
export type Time = number;
export type TimeKind = "tid" | "datum" | "månad" | "kvartal" | "år";

const MONTHS = ["jan", "feb", "mar", "apr", "maj", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];

/** "1 234,5", "1234.5", "1,234.5", "−3", "12 kr" and "45 %" are numbers. Empty is null, anything else NaN. */
export function parseNumber(cell: string): number | null {
  let s = cell.trim().replace(/[\s  ]/g, "").replace(/−/g, "-");
  if (s === "") return null;
  s = s.replace(/^(kr|sek|€|\$)/i, "").replace(/(kr|sek|:-|%|€|\$)$/i, "");
  const comma = s.lastIndexOf(","), dot = s.lastIndexOf(".");
  if (comma >= 0 && dot >= 0) {
    // The last separator is the decimal one.
    s = comma > dot ? s.replace(/\./g, "").replace(",", ".") : s.replace(/,/g, "");
  } else if (comma >= 0) {
    // Several commas are thousands separators ("1,234,567"); one is a decimal comma.
    s = (s.match(/,/g)!.length > 1 ? s.replace(/,/g, "") : s.replace(",", "."));
  }
  return /^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i.test(s) ? Number(s) : NaN;
}

function utc(y: number, mo: number, d = 1, h = 0, mi = 0, s = 0): Time | null {
  const t = Date.UTC(y, mo - 1, d, h, mi, s);
  const date = new Date(t);
  // Rejects 31 February and hour 25 instead of rolling them over.
  if (date.getUTCFullYear() !== y || date.getUTCMonth() !== mo - 1 || date.getUTCDate() !== d || h > 23 || mi > 59 || s > 59) return null;
  return t;
}

function month(name: string): number {
  return MONTHS.indexOf(name.toLowerCase().slice(0, 3)) + 1;
}

/**
 * ISO dates and times, day-first dates (31/1/2024, 31.1.2024), Swedish month names (1 januari 2024, jan 2024),
 * months (2024-01, 2024M01), quarters (2024K1, 2024-Q1) and, when `years` is set, plain years.
 */
export function parseTime(cell: string, years = false): { time: Time; kind: TimeKind } | null {
  const s = cell.trim().replace(/(Z|[+-]\d{2}:?\d{2})$/, "");
  let m: RegExpMatchArray | null;
  const at = (t: Time | null, kind: TimeKind) => (t === null ? null : { time: t, kind });
  const clock = (h?: string, mi?: string, sec?: string): [number, number, number] => [Number(h ?? 0), Number(mi ?? 0), Number(sec ?? 0)];
  if ((m = s.match(/^(\d{4})-(\d{1,2})-(\d{1,2})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?)?$/)))
    return at(utc(+m[1], +m[2], +m[3], ...clock(m[4], m[5], m[6])), m[4] ? "tid" : "datum");
  if ((m = s.match(/^(\d{1,2})[/.](\d{1,2})[/.](\d{4})(?:,? (\d{1,2}):(\d{2})(?::(\d{2}))?)?$/)))
    return at(utc(+m[3], +m[2], +m[1], ...clock(m[4], m[5], m[6])), m[4] ? "tid" : "datum");
  if ((m = s.match(/^(\d{1,2})\s+([a-zåäö]+)\.?\s+(\d{4})$/i)) && month(m[2]))
    return at(utc(+m[3], month(m[2]), +m[1]), "datum");
  if ((m = s.match(/^([a-zåäö]+)\.?\s+(\d{4})$/i)) && month(m[1])) return at(utc(+m[2], month(m[1])), "månad");
  if ((m = s.match(/^(\d{4})(?:-|M)(\d{1,2})$/))) return at(utc(+m[1], +m[2]), "månad");
  if ((m = s.match(/^(\d{4})\s*-?\s*[KQ]([1-4])$/i))) return at(utc(+m[1], 3 * +m[2] - 2), "kvartal");
  if (years && (m = s.match(/^(\d{4})$/)) && +m[1] >= 1800 && +m[1] <= 2200) return at(utc(+m[1], 1), "år");
  return null;
}

const looksLikeTime = (cell: string) => parseTime(cell) !== null;

/** CSV or text pasted from a spreadsheet. The separator is guessed; a first row of names is used when there is one. */
export function parseText(text: string): Table {
  const { data } = Papa.parse<string[]>(text.replace(/^﻿/, ""), { skipEmptyLines: "greedy" });
  return toTable(data);
}

/** The first sheet of an Excel file. The library is loaded only when someone opens one. */
export async function parseExcel(bytes: ArrayBuffer): Promise<Table> {
  const XLSX = await import("xlsx");
  const book = XLSX.read(bytes, { cellDates: true });
  const sheet = book.Sheets[book.SheetNames[0]];
  const pad = (n: number) => String(n).padStart(2, "0");
  // SheetJS gives dates in local time with the same wall-clock values as in Excel.
  const cell = (v: unknown) =>
    v instanceof Date
      ? `${v.getFullYear()}-${pad(v.getMonth() + 1)}-${pad(v.getDate())} ${pad(v.getHours())}:${pad(v.getMinutes())}:${pad(v.getSeconds())}`
      : v == null ? "" : String(v);
  const rows = XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, raw: true, blankrows: false });
  return toTable(rows.map((r) => Array.from(r, cell)));
}

function toTable(data: string[][]): Table {
  // A loop, not Math.max(...): spreading a till export's rows overflows the stack (Safari at 65,536).
  const width = data.reduce((w, r) => Math.max(w, r.length), 0);
  const rows = data.map((r) => Array.from({ length: width }, (_, i) => (r[i] ?? "").trim()));
  if (!rows.length) return { headers: [], rows: [] };
  // A first row with no time and no number in it is a row of names.
  const first = rows[0];
  const isHeader = first.every((c) => c === "" || (!looksLikeTime(c) && Number.isNaN(parseNumber(c) ?? NaN)));
  const headers = first.map((c, i) => (isHeader && c) || t("data.column", { n: i + 1 }));
  return { headers, rows: isHeader ? rows.slice(1) : rows };
}
