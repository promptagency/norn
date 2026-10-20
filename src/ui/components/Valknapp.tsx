import type { ValgruppProps, ValknappProps } from "./types.ts";

export function Valknapp({ vald, children, className, ...rest }: ValknappProps) {
  return (
    <button type="button" aria-pressed={vald} className={["n-valknapp", className].filter(Boolean).join(" ")} {...rest}>
      {children}
    </button>
  );
}

export function Valgrupp({ etikett, children }: ValgruppProps) {
  return (
    <div role="group" aria-label={etikett} className="n-valgrupp">
      {children}
    </div>
  );
}
