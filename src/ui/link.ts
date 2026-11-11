// What an example link (?exempel=…) may carry: settings from a fixed list, never values from a file.
import type { Result } from "../data/detect.ts";
import type { Example } from "../data/examples.ts";
import { DEFAULT_HORIZON } from "../data/horizon.ts";
import { EVENTS, type EventId } from "../engine/index.ts";
import type { Sakerhetsniva } from "./components/types.ts";

export interface Link {
  id: string;
  /** One of the example's own columns, by its shown name; null for the example's default. */
  kolumn: string | null;
  horisont: number;
  sakerhet: Sakerhetsniva;
  handelser: EventId[];
}

/** Null when the page was opened without an example; an error when the example does not exist. */
export function readLink(search: string, examples: Example[]): Result<Link> | null {
  const q = new URLSearchParams(search);
  const id = q.get("exempel");
  if (!id) return null;
  const ex = examples.find((e) => e.id === id);
  if (!ex) return { ok: false, error: { key: "error.link" } };
  const columns = Object.keys(ex.targets).map((name) => ex.labels?.[name] ?? name);
  const kolumn = q.get("kolumn");
  const horisont = Number(q.get("horisont") || NaN);
  const sakerhet = q.get("sakerhet");
  return {
    ok: true,
    value: {
      id,
      kolumn: kolumn !== null && columns.includes(kolumn) ? kolumn : null,
      // Skuld has at most four horizon buttons.
      horisont: Number.isInteger(horisont) && horisont >= 0 && horisont <= 3 ? horisont : DEFAULT_HORIZON,
      sakerhet: sakerhet === "90" || sakerhet === "95" ? sakerhet : "median",
      handelser: [...new Set(q.get("handelser")?.split(",") ?? [])].filter((e): e is EventId => (EVENTS as string[]).includes(e)),
    },
  };
}
