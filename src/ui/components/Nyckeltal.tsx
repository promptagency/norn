import type { NyckeltalProps } from "./types.ts";

export function Nyckeltal({ poster }: NyckeltalProps) {
  return (
    <dl className="n-nyckeltal">
      {poster.map((p) => (
        <div key={p.etikett}>
          <dt className="n-nyckeltal__etikett">{p.etikett}</dt>
          <dd className={["n-nyckeltal__varde", p.text && "n-nyckeltal__varde--text"].filter(Boolean).join(" ")}>{p.varde}</dd>
        </div>
      ))}
    </dl>
  );
}
