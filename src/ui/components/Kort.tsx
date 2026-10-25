import type { KortProps } from "./types.ts";

export function Kort({ children, figur, framhavd, rubrik }: KortProps) {
  const cls = framhavd ? "n-kort n-kort--framhavd" : "n-kort";
  return figur ? (
    <figure className={cls}>
      {rubrik && <figcaption className="rubrik-s">{rubrik}</figcaption>}
      {children}
    </figure>
  ) : (
    <div className={cls}>{children}</div>
  );
}
