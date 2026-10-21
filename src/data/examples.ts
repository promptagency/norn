// The example datasets in public/data/, described by examples.json (built by scripts/build_datasets.py).
import type { Frequency } from "./detect.ts";
import type { Units } from "./describe.ts";
import { parseText, type Table } from "./parse.ts";

export interface Example {
  id: string;
  title: string;
  frequency: Frequency;
  file: string;
  /** Column name to the one sentence it teaches. */
  targets: Record<string, string>;
  default_target: string;
  /** Nicer names for columns, used in place of the file's. */
  labels?: Record<string, string>;
  source_short: string;
  /** The axis title, per step ("MWh per timme"). */
  unit: string;
  /** The word after an amount in a sentence ("MWh", "sidvisningar"); none for an index. */
  amount_unit?: string;
  /** The example card's sentence when the default target's own would not cover the example. */
  card?: string;
  since: string;
}

export async function loadExamples(): Promise<Example[]> {
  const res = await fetch("/data/examples.json");
  if (!res.ok) throw new Error(`examples.json: ${res.status}`);
  return ((await res.json()) as { examples: Example[] }).examples;
}

/** The example's table with its labels applied, and the column to start with. */
export async function loadExample(ex: Example): Promise<{ table: Table; target: string; units: Units }> {
  const res = await fetch(`/data/${ex.file}`);
  if (!res.ok) throw new Error(`${ex.file}: ${res.status}`);
  const table = parseText(await res.text());
  const label = (name: string) => ex.labels?.[name] ?? name;
  const units = { axis: ex.unit, amount: ex.amount_unit };
  return { table: { ...table, headers: table.headers.map(label) }, target: label(ex.default_target), units };
}
