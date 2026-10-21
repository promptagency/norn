import { readFileSync } from "node:fs";
import { expect, it } from "vitest";
import { COPY } from "./copy.ts";

it("uses exactly the texts in docs/COPY.md", () => {
  const table = Object.fromEntries(
    readFileSync("docs/COPY.md", "utf8").split("\n")
      .filter((l) => /^\| [a-zåäö]/.test(l))
      .map((l) => l.split("|").map((c) => c.trim()))
      .map(([, key, text]) => [key, text]),
  );
  for (const [key, text] of Object.entries(COPY)) expect(table[key], key).toBe(text);
});
