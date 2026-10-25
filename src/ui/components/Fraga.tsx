import type { FragaProps } from "./types.ts";

export function Fraga({ rubrik, variant = "rubrik", oppen, grupp, children }: FragaProps) {
  return (
    <details className={["n-fraga", variant === "liten" && "n-fraga--liten"].filter(Boolean).join(" ")} open={oppen} name={grupp}>
      <summary className="n-fraga__rubrik">
        <svg className="n-fraga__pil" width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
          <path d="M5 2.5 L9.5 7 L5 11.5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        {rubrik}
      </summary>
      <div className="n-fraga__innehall">{children}</div>
    </details>
  );
}
