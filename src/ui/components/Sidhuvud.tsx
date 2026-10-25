import { AGENCY_URL } from "../../config.ts";
import { version } from "../../../package.json";
import { COPY, t } from "../copy.ts";
import type { SidfotProps, SidhuvudProps } from "./types.ts";

const AGENCY = "Prompt Agency";

/** The text with "Prompt Agency" as a link. A new tab, since the user's data lives only in this one. */
function withAgencyLink(text: string) {
  const i = text.indexOf(AGENCY);
  if (i < 0) return text;
  return (
    <>
      {text.slice(0, i)}
      <a className="n-textlank" href={AGENCY_URL} target="_blank" rel="noopener">
        {AGENCY}
        <span className="n-dold"> ({COPY["link.newtab"]})</span>
      </a>
      {text.slice(i + AGENCY.length)}
    </>
  );
}

export function Sidhuvud({ logoSrc, hemHref = "/", children }: SidhuvudProps) {
  return (
    <header className="n-sidhuvud">
      <a className="n-sidhuvud__hem" href={hemHref}>
        <img className="n-sidhuvud__logo" src={logoSrc} alt={COPY["header.home"]} />
      </a>
      {children ?? <span className="n-sidhuvud__tagg">{withAgencyLink(COPY["header.tag"])}</span>}
    </header>
  );
}

export function Sidfot({ children, utanOm }: SidfotProps) {
  return (
    <footer className="n-sidfot">
      <div className="n-sidfot__inre">
        <p>{withAgencyLink(COPY["footer.experiment"])}</p>
        <p>{children ?? COPY["footer.credits"]}</p>
        {!utanOm && (
          <p>
            {/* A new tab, so a forecast in progress is not lost: the user's data lives only in this tab. */}
            <a className="n-textlank" href="/om" target="_blank" rel="noopener">
              {COPY["om.link"]}
              <span className="n-dold"> ({COPY["link.newtab"]})</span>
            </a>
          </p>
        )}
        <p>{t("footer.version", { version })}</p>
      </div>
    </footer>
  );
}
