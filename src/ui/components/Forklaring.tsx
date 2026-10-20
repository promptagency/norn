import type { ReactNode } from "react";
import { COPY } from "../copy.ts";
import type { ForklaringProps, Forklaringspost } from "./types.ts";

function Linje({ klass }: { klass: string }) {
  return (
    <svg className="n-forklaring__linje" width="28" height="10" viewBox="0 0 28 10" aria-hidden="true">
      <line x1="2" y1="5" x2="26" y2="5" className={klass} />
    </svg>
  );
}

const POSTER: Record<Forklaringspost, { text: string; ritning: ReactNode }> = {
  historik: { text: COPY["legend.history"], ritning: <Linje klass="n-graf__historik" /> },
  utfall: { text: COPY["legend.outcome"], ritning: <Linje klass="n-graf__utfall" /> },
  median: { text: COPY["legend.median"], ritning: <Linje klass="n-graf__median" /> },
  "median-backtest": { text: COPY["legend.median.backtest"], ritning: <Linje klass="n-graf__median" /> },
  band50: { text: COPY["legend.band50"], ritning: <span className="n-forklaring__band n-forklaring__band--50" /> },
  band90: { text: COPY["legend.band90"], ritning: <span className="n-forklaring__band n-forklaring__band--90" /> },
};

export function Forklaring({ poster }: ForklaringProps) {
  return (
    <ul className="n-forklaring">
      {poster.map((p) => (
        <li key={p} className="n-forklaring__post">
          {POSTER[p].ritning}
          {POSTER[p].text}
        </li>
      ))}
    </ul>
  );
}
