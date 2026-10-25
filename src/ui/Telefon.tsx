// What a phone gets instead of the app (PLAN.md, 2026-10-21): the idea, the three steps, that it all runs on your
// computer, and a firm request to open Norn there. Nothing here loads the model or the forecasting worker.
import { useState } from "react";
import logoNegativ from "../../design/logo/norn-logotyp-negativ.svg";
import logoPositiv from "../../design/logo/norn-logotyp-positiv.svg";
import { DEFAULT_MODEL, MODELS, PRODUCT_URL } from "../config.ts";
import { Knapp, Kort, Prognosgraf, Sidfot, Sidhuvud } from "./components/index.ts";
import { Faq } from "./Faq.tsx";
import { COPY, t } from "./copy.ts";
import { emphasize } from "./emphasize.tsx";
import { HISTORY, ILLUSTRATION, RANGE } from "./illustration.ts";
import { useDark } from "./theme.ts";
import "./app.css";

/** A phone: the screen's short side is narrow and touch is the only pointer. Tablets and laptop windows get the app. */
export const isPhone = () => Math.min(screen.width, screen.height) < 600 && matchMedia("(pointer: coarse)").matches;


const STEPS = ["mobil.urd", "mobil.verdandi", "mobil.skuld"] as const;

export function Telefon() {
  const dark = useDark();
  const [copied, setCopied] = useState(false);
  const kopiera = () =>
    navigator.clipboard.writeText(location.href).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });

  return (
    <div className="app">
      <Sidhuvud logoSrc={dark ? logoNegativ : logoPositiv} tillagg={<Faq />} />
      <main className="sida telefon">
        <div className="intro">
          <h1 className="rubrik-l">{COPY["mobil.heading"]}</h1>
          <p className="ingress">{COPY["mobil.lead"]}</p>
        </div>

        <Kort figur>
          <Prognosgraf
            historik={HISTORY}
            prognos={ILLUSTRATION}
            yIntervall={RANGE}
            formatY={() => ""}
            hojd={400}
            beskrivning="En kurva som går fram till nu och sedan fortsätter som en prickad linje i två band som vidgas mot framtiden."
          />
        </Kort>

        <section className="avsnitt">
          <h2 className="rubrik-s">{COPY["mobil.steps"]}</h2>
          <ol className="steglista">
            {STEPS.map((key, i) => {
              const text = COPY[key];
              return (
                <li key={key}>
                  <span className="nummer" aria-hidden="true">{i + 1}</span>
                  <p>{emphasize(text, text.slice(0, text.indexOf(".") + 1))}</p>
                </li>
              );
            })}
          </ol>
        </section>

        <Kort>
          <h2 className="rubrik-s">{COPY["mobil.tech.heading"]}</h2>
          <p>{COPY["mobil.tech"]}</p>
          <p>
            <a className="n-textlank" href="/om">{COPY["om.link"]}</a>
          </p>
        </Kort>

        <Kort framhavd>
          <h2 className="rubrik-m">{COPY["mobil.desktop.heading"]}</h2>
          <p>
            {emphasize(
              t("mobil.desktop", { mb: Math.round(MODELS[DEFAULT_MODEL].bytes / 1e6), adress: new URL(PRODUCT_URL).host }),
              new URL(PRODUCT_URL).host,
            )}
          </p>
          <Knapp className="telefon__knapp" onClick={kopiera}>{copied ? COPY["mobil.link.done"] : COPY["mobil.link"]}</Knapp>
        </Kort>
      </main>
      <Sidfot tillagg={<Faq />} />
    </div>
  );
}
