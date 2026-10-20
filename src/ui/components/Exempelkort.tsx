import type { ExempelkortProps } from "./types.ts";

export function Exempelkort({ overrad, titel, text, kalla, href, onClick }: ExempelkortProps) {
  const inner = (
    <>
      <span className="n-exempelkort__overrad">{overrad}</span>
      <span className="n-exempelkort__titel">{titel}</span>
      <span className="n-exempelkort__text">{text}</span>
      <span className="n-exempelkort__kalla">{kalla}</span>
    </>
  );
  if (href) return <a className="n-exempelkort" href={href} onClick={onClick}>{inner}</a>;
  return <button type="button" className="n-exempelkort" onClick={onClick}>{inner}</button>;
}
