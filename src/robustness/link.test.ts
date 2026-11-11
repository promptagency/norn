// Robustness contract C: example links (?exempel=…). Garbage never crashes, and a link only ever carries
// settings from a fixed list, never values. Locked while the fix loop runs (.claude/hooks/guard-exam.mjs).
import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import { EVENTS } from "../engine/holidays.ts";
import type { Example } from "../data/examples.ts";
import { DEFAULT_HORIZON } from "../data/horizon.ts";
import { COPY } from "../ui/copy.ts";
import { readLink } from "../ui/link.ts";
import { rng } from "./rng.ts";

const examples = (JSON.parse(readFileSync("public/data/examples.json", "utf8")) as { examples: Example[] }).examples;
const columns = (ex: Example) => Object.keys(ex.targets).map((name) => ex.labels?.[name] ?? name);
const [first] = examples;
const KEYS = ["id", "kolumn", "horisont", "sakerhet", "handelser"];

/** Everything a read link may hold, and nothing else. */
function expectWhitelisted(search: string) {
  const r = readLink(search, examples);
  if (r === null) return;
  if (!r.ok) return expect(r.error).toEqual({ key: "error.link" });
  const v = r.value;
  expect(Object.keys(v).sort(), search).toEqual([...KEYS].sort());
  const ex = examples.find((e) => e.id === v.id);
  expect(ex, search).toBeDefined();
  expect(v.kolumn === null || columns(ex!).includes(v.kolumn), search).toBe(true);
  expect(Number.isInteger(v.horisont) && v.horisont >= 0 && v.horisont <= 3, search).toBe(true);
  expect(["median", "90", "95"], search).toContain(v.sakerhet);
  expect(v.handelser.every((e) => (EVENTS as string[]).includes(e)), search).toBe(true);
  expect(new Set(v.handelser).size, search).toBe(v.handelser.length);
}

it("has a message for a link to an example that does not exist", () => {
  expect(Object.keys(COPY)).toContain("error.link");
});

it("ignores a page without an example in the link", () => {
  for (const search of ["", "?", "?utm_source=x", "?exempel=", "?kolumn=x&horisont=2"]) expect(readLink(search, examples)).toBeNull();
});

it("says so for an example that does not exist", () => {
  for (const id of ["skräp", "__proto__", "constructor", "DETALJHANDEL", "%00", `${first.id} `])
    expect(readLink(`?exempel=${encodeURIComponent(id)}`, examples)).toEqual({ ok: false, error: { key: "error.link" } });
});

it("reads a full link", () => {
  const kolumn = columns(first).at(-1)!;
  const search = `?exempel=${first.id}&kolumn=${encodeURIComponent(kolumn)}&horisont=2&sakerhet=95&handelser=roda,midsommar,roda,skräp`;
  expect(readLink(search, examples)).toEqual({
    ok: true,
    value: { id: first.id, kolumn, horisont: 2, sakerhet: "95", handelser: ["roda", "midsommar"] },
  });
});

it("falls back to the defaults for settings it cannot use", () => {
  for (const [horisont, sakerhet] of [["9", "50"], ["-1", ""], ["1.5", "90%"], ["NaN", "Infinity"], ["1e9", "median "], ["", "<script>"]]) {
    const r = readLink(`?exempel=${first.id}&horisont=${horisont}&sakerhet=${encodeURIComponent(sakerhet)}&kolumn=1234%3B5678`, examples);
    expect(r).toEqual({ ok: true, value: { id: first.id, kolumn: null, horisont: DEFAULT_HORIZON, sakerhet: "median", handelser: [] } });
  }
});

it("keeps the first of repeated keys and drops every unknown one", () => {
  const r = readLink(`?exempel=${first.id}&exempel=skräp&horisont=0&horisont=3&värden=1,2,3&data=12;13`, examples);
  expect(r).toEqual({ ok: true, value: { id: first.id, kolumn: null, horisont: 0, sakerhet: "median", handelser: [] } });
});

it("never throws and never lets anything off the list through, for 2,000 garbage links", () => {
  const r = rng(424242);
  const keys = ["exempel", "kolumn", "horisont", "sakerhet", "handelser", "värden", "__proto__", "", "x"];
  const values = [
    ...examples.map((e) => e.id), ...examples.flatMap(columns), ...EVENTS, "0", "3", "4", "-0", "90", "95", "%", "%ZZ", "%E0%A4%A",
    "\u0000", "😀", "a=b", "&&", "==", "__proto__", "constructor", "1e400", " ", "+", "roda,,midsommar", "x".repeat(5000),
  ];
  const pick = <T,>(xs: readonly T[]) => xs[Math.floor(r() * xs.length)];
  for (let n = 0; n < 2000; n++) {
    const parts = Array.from({ length: Math.floor(r() * 7) }, () => (r() < 0.1 ? pick(values) : `${pick(keys)}=${pick(values)}`));
    const search = (r() < 0.8 ? "?" : "") + parts.join(r() < 0.9 ? "&" : ";");
    expect(() => readLink(search, examples), search).not.toThrow();
    expectWhitelisted(search);
  }
});
