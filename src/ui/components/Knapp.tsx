import type { KnappProps } from "./types.ts";

export function Knapp({ variant = "primar", href, children, className, ...rest }: KnappProps) {
  const cls = ["n-knapp", `n-knapp--${variant}`, className].filter(Boolean).join(" ");
  if (href) {
    return (
      <a className={cls} href={href}>
        {children}
      </a>
    );
  }
  return (
    <button type="button" className={cls} {...rest}>
      {children}
    </button>
  );
}
