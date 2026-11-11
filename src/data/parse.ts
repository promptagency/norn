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
export type TimeKind = "tid" | "datum" | "vecka" | "månad" | "kvartal" | "år";

const DAY = 86_400_000;
/** Column names that say the column is a time, so bare numbers in it (20240131, Excel's 45292) are read as times. */
const TIME_HEADER = /^(datum|date|dag|day|tid|time|tidpunkt|timestamp|datetime)$/i;
const YEAR_HEADER = /^(år|ar|year)$/i;

const MONTHS = ["jan", "feb", "mar", "apr", "maj", "jun", "jul", "aug", "sep", "okt", "nov", "dec"];

/** One cell read as a number. `alt` is the other reading of a cell like "1,234" or "1.234", where `ambiguous` is the separator. */
interface NumberRead {
  n: number | null;
  ambiguous?: "," | ".";
  alt?: number;
  /** The separators this cell shows as thousands and as decimal. */
  thousands?: "," | ".";
  decimal?: "," | ".";
}

function readNumber(cell: string): NumberRead {
  let s = cell.trim().replace(/\s/g, "").replace(/−/g, "-");
  if (s === "") return { n: null };
  s = s.replace(/^(kr|sek|€|\$)/i, "").replace(/(kr|sek|:-|%|€|\$)$/i, "");
  const sign = /^[-+]/.test(s) ? s[0] : "";
  const body = s.slice(sign.length);
  const num = (digits: string) => {
    const n = Number(sign + digits);
    return Number.isFinite(n) ? n : NaN;
  };
  // Plain digits, or one separator as the decimal: "12", "12,5", "1.5", ",5", "1e3".
  let m = body.match(/^(\d*)([.,]?)(\d*)(e[-+]?\d+)?$/i);
  if (m && (m[1] || m[3])) {
    const n = num(`${m[1] || "0"}.${m[3] || "0"}${m[4] ?? ""}`);
    if (!m[2]) return { n };
    const sep = m[2] as "," | ".";
    // "1,234" is 1.234 to a Swede and 1234 to an American; the rest of the column decides.
    if (/^\d{1,3}$/.test(m[1]) && /^\d{3}$/.test(m[3]) && !m[4]) return { n, ambiguous: sep, alt: num(m[1] + m[3]) };
    return { n, decimal: sep };
  }
  // Groups of three after a thousands separator, then maybe a decimal part: "1,234,567", "1.234,5".
  m = body.match(/^(\d{1,3}(?:([.,])\d{3})(?:\2\d{3})*)(?:([.,])(\d*))?$/);
  if (m && m[3] !== m[2]) {
    const thousands = m[2] as "," | ".";
    return { n: num(`${m[1].split(thousands).join("")}.${m[4] ?? ""}`), thousands, decimal: m[3] as "," | "." | undefined };
  }
  return { n: NaN };
}

/** "1 234,5", "1234.5", "1,234.5", "1.234.567", "−3", "12 kr" and "45 %" are numbers. Empty is null, anything else NaN. */
export const parseNumber = (cell: string): number | null => readNumber(cell).n;

/**
 * Reads a whole column the same way: "1,234" is a thousand and more only where other cells show the comma as a
 * thousands separator ("1,234.5", "1,234,567"), and likewise for the dot. Null when the column uses a separator both
 * ways, so no reading of it would be safe.
 */
export function numberReader(cells: string[]): ((cell: string) => number | null) | null {
  const thousands = new Set<string>(), decimal = new Set<string>();
  for (const c of cells) {
    const r = readNumber(c);
    if (r.thousands) thousands.add(r.thousands);
    if (r.decimal) decimal.add(r.decimal);
  }
  if ([...thousands].some((sep) => decimal.has(sep))) return null;
  return (cell) => {
    const r = readNumber(cell);
    return r.ambiguous && thousands.has(r.ambiguous) ? r.alt! : r.n;
  };
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

/** The Monday of ISO week `w`, or null when the year has no such week. */
function isoWeek(y: number, w: number): Time | null {
  const jan4 = Date.UTC(y, 0, 4);
  const monday = jan4 - ((new Date(jan4).getUTCDay() + 6) % 7) * DAY + (w - 1) * 7 * DAY;
  return w >= 1 && new Date(monday + 3 * DAY).getUTCFullYear() === y ? monday : null;
}

/**
 * ISO dates and times (also 2024/01/31), day-first dates (31/1/2024, 31.1.2024), Swedish month names (1 januari
 * 2024, jan 2024), ISO weeks (2024V01, 2024-W01, vecka 1 2024), months (2024-01, 2024M01) and quarters (2024K1,
 * 2024-Q1). The column's `header` allows more: plain years under "År", and 20240131 or Excel's serial dates under
 * "Datum" or "Tid", which elsewhere would be ordinary numbers.
 */
export function parseTime(cell: string, header = ""): { time: Time; kind: TimeKind } | null {
  const s = cell.trim().replace(/(Z|[+-]\d{2}:?\d{2})$/, "");
  let m: RegExpMatchArray | null;
  const at = (t: Time | null, kind: TimeKind) => (t === null ? null : { time: t, kind });
  const clock = (h?: string, mi?: string, sec?: string): [number, number, number] => [Number(h ?? 0), Number(mi ?? 0), Number(sec ?? 0)];
  if ((m = s.match(/^(\d{4})[-/](\d{1,2})[-/](\d{1,2})(?:[ T](\d{1,2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?)?$/)))
    return at(utc(+m[1], +m[2], +m[3], ...clock(m[4], m[5], m[6])), m[4] ? "tid" : "datum");
  if ((m = s.match(/^(\d{1,2})[/.](\d{1,2})[/.](\d{4})(?:,? (\d{1,2}):(\d{2})(?::(\d{2}))?)?$/)))
    return at(utc(+m[3], +m[2], +m[1], ...clock(m[4], m[5], m[6])), m[4] ? "tid" : "datum");
  if ((m = s.match(/^(\d{1,2})\s+([a-zåäö]+)\.?\s+(\d{4})$/i)) && month(m[2]))
    return at(utc(+m[3], month(m[2]), +m[1]), "datum");
  if ((m = s.match(/^([a-zåäö]+)\.?\s+(\d{4})$/i)) && month(m[1])) return at(utc(+m[2], month(m[1])), "månad");
  if ((m = s.match(/^(\d{4})(?:-|M)(\d{1,2})$/))) return at(utc(+m[1], +m[2]), "månad");
  if ((m = s.match(/^(\d{4})\s*-?\s*[KQ]([1-4])$/i))) return at(utc(+m[1], 3 * +m[2] - 2), "kvartal");
  if ((m = s.match(/^(\d{4})\s*-?\s*[VW]\s*(\d{1,2})$/i))) return at(isoWeek(+m[1], +m[2]), "vecka");
  if ((m = s.match(/^(?:v|v\.|vecka)\s*(\d{1,2})\s+(\d{4})$/i))) return at(isoWeek(+m[2], +m[1]), "vecka");
  if (YEAR_HEADER.test(header.trim()) && (m = s.match(/^(\d{4})$/)) && +m[1] >= 1800 && +m[1] <= 2200) return at(utc(+m[1], 1), "år");
  if (TIME_HEADER.test(header.trim())) {
    if ((m = s.match(/^(\d{4})(\d{2})(\d{2})$/))) return at(utc(+m[1], +m[2], +m[3]), "datum");
    // Excel counts days from 30 December 1899; 20000 to 80000 is 1954 to 2119.
    if ((m = s.match(/^\d{5}(\.\d+)?$/)) && +s >= 20000 && +s < 80000) {
      const t = Math.round(((+s - 25569) * DAY) / 1000) * 1000;
      return { time: t, kind: t % DAY ? "tid" : "datum" };
    }
  }
  return null;
}

const looksLikeTime = (cell: string) => parseTime(cell) !== null;

/**
 * A file's bytes as text: UTF-16 by its byte order mark, else UTF-8, else Windows-1252, which is what Excel on a
 * Swedish Windows saves as "CSV". Any byte order mark is dropped.
 */
export function decode(bytes: ArrayBuffer): string {
  const b = new Uint8Array(bytes);
  if (b[0] === 0xff && b[1] === 0xfe) return new TextDecoder("utf-16le").decode(b);
  if (b[0] === 0xfe && b[1] === 0xff) return new TextDecoder("utf-16be").decode(b);
  try {
    return new TextDecoder("utf-8", { fatal: true }).decode(b);
  } catch {
    return new TextDecoder("windows-1252").decode(b);
  }
}

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
