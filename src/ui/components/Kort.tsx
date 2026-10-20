import type { KortProps } from "./types.ts";

export function Kort({ children, figur }: KortProps) {
  return figur ? <figure className="n-kort">{children}</figure> : <div className="n-kort">{children}</div>;
}
