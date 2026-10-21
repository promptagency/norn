import type { KortProps } from "./types.ts";

export function Kort({ children, figur, framhavd }: KortProps) {
  const cls = framhavd ? "n-kort n-kort--framhavd" : "n-kort";
  return figur ? <figure className={cls}>{children}</figure> : <div className={cls}>{children}</div>;
}
