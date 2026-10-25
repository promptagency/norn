// "Vanliga frågor": a link that opens the questions in a modal window, in the header tag and the footer
// (owner, 2026-10-25). A window, not a page, so a forecast in progress stays where it is.
import { useState } from "react";
import { DEFAULT_MODEL, MODELS } from "../config.ts";
import { Dialogruta, Fraga } from "./components/index.ts";
import { COPY, t, type CopyKey } from "./copy.ts";

const TOPICS = ["data", "file", "model", "offline", "trust", "bands", "save", "phone", "cost"] as const;
const mb = Math.round(MODELS[DEFAULT_MODEL].bytes / 1e6);

export function Faq() {
  const [oppen, setOppen] = useState(false);
  return (
    <>
      <button type="button" className="n-textlank n-lankknapp" onClick={() => setOppen(true)}>
        {COPY["faq.link"]}
      </button>
      {oppen && (
        <Dialogruta rubrik={COPY["faq.heading"]} oppen onStang={() => setOppen(false)}>
          {TOPICS.map((k) => (
            <Fraga key={k} grupp="faq" rubrik={t(`faq.${k}.q` as CopyKey, { mb })}>
              <p>{t(`faq.${k}.a` as CopyKey, { mb })}</p>
            </Fraga>
          ))}
          <p>
            {/* A new tab: the user's data lives only in this one. */}
            <a className="n-textlank" href="/om" target="_blank" rel="noopener">
              {COPY["faq.more"]}
              <span className="n-dold"> ({COPY["link.newtab"]})</span>
            </a>
          </p>
        </Dialogruta>
      )}
    </>
  );
}
