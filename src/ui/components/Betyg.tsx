import { COPY } from "../copy.ts";
import type { BetygProps } from "./types.ts";

const NAMN = { palitlig: COPY["verdandi.grade.good"], ungefarlig: COPY["verdandi.grade.fair"], osaker: COPY["verdandi.grade.poor"] };
const FYLLDA = { palitlig: 3, ungefarlig: 2, osaker: 1 };

/** Three dots, like the steps: filled for what Norn is sure of, open for what it is not. */
export function Betyg({ niva }: BetygProps) {
  const fyllda = FYLLDA[niva];
  return (
    <span className="n-betyg">
      <svg width="22" height="10" viewBox="0 0 22 10" aria-hidden="true">
        {[4, 11, 18].map((cx, i) =>
          i < fyllda ? <circle key={cx} cx={cx} cy="5" r="4" className="n-betyg__fylld" /> : <circle key={cx} cx={cx} cy="5" r="3.2" className="n-betyg__tom" />,
        )}
      </svg>
      {NAMN[niva]}
    </span>
  );
}
