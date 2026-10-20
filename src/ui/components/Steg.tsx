import { COPY } from "../copy.ts";
import type { StegProps } from "./types.ts";

function Bock() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
      <path d="M2 7.5 L5.5 11 L12 3.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Steg({ steg, aktivt }: StegProps) {
  return (
    <nav aria-label={COPY["step.label"]} className="n-steg">
      <ol className="n-steg__lista">
        {steg.map((s, i) => {
          const text = (
            <span className="n-steg__text">
              <span className="n-steg__namn">{s.namn}</span>
              <span className="n-steg__tips">{s.tips}</span>
            </span>
          );
          if (i < aktivt && (s.href || s.onClick)) {
            return (
              <li key={s.namn}>
                <a
                  className="n-steg__lank"
                  href={s.href ?? "#"}
                  onClick={s.onClick ? (e) => { e.preventDefault(); s.onClick?.(); } : undefined}
                >
                  <span className="n-steg__markor"><Bock /></span>
                  {text}
                  <span className="n-dold">, {COPY["step.done"]}</span>
                </a>
              </li>
            );
          }
          return (
            <li key={s.namn} className="n-steg__punkt" aria-current={i === aktivt ? "step" : undefined}>
              <span className="n-steg__markor">{i < aktivt ? <Bock /> : i + 1}</span>
              {text}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** The three norns with their Swedish names and hints from COPY. */
export const NORNORNA = [
  { namn: COPY["step.urd"], tips: COPY["step.urd.hint"] },
  { namn: COPY["step.verdandi"], tips: COPY["step.verdandi.hint"] },
  { namn: COPY["step.skuld"], tips: COPY["step.skuld.hint"] },
];
