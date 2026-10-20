import { COPY } from "../copy.ts";
import type { SidfotProps, SidhuvudProps } from "./types.ts";

export function Sidhuvud({ logoSrc, hemHref = "/", children }: SidhuvudProps) {
  return (
    <header className="n-sidhuvud">
      <a className="n-sidhuvud__hem" href={hemHref}>
        <img className="n-sidhuvud__logo" src={logoSrc} alt={COPY["header.home"]} />
      </a>
      {children ?? <span className="n-sidhuvud__tagg">{COPY["header.tag"]}</span>}
    </header>
  );
}

export function Sidfot({ children }: SidfotProps) {
  return (
    <footer className="n-sidfot">
      <div className="n-sidfot__inre">
        <p>{COPY["footer.experiment"]}</p>
        <p>{children ?? COPY["footer.credits"]}</p>
      </div>
    </footer>
  );
}
