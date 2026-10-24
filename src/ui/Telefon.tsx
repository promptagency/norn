// What a phone gets instead of the app (PLAN.md, 2026-10-21): the idea, the three steps, that it all runs on your
// computer, and a firm request to open Norn there. Nothing here loads the model or the forecasting worker.
import { useState } from "react";
import logoNegativ from "../../design/logo/norn-logotyp-negativ.svg";
import logoPositiv from "../../design/logo/norn-logotyp-positiv.svg";
import { DEFAULT_MODEL, MODELS, PRODUCT_URL } from "../config.ts";
import { Knapp, Kort, Prognosgraf, Sidfot, Sidhuvud } from "./components/index.ts";
import { COPY, t } from "./copy.ts";
import { emphasize } from "./emphasize.tsx";
import { useDark } from "./theme.ts";
import "./app.css";

/** A phone: the screen's short side is narrow and touch is the only pointer. Tablets and laptop windows get the app. */
export const isPhone = () => Math.min(screen.width, screen.height) < 600 && matchMedia("(pointer: coarse)").matches;

// The illustration: a made-up history and a widening forecast. Not data, so the chart shows no numbers.
const HISTORY = [150, 170, 140, 200, 155, 175, 145, 210, 160, 185, 150, 220, 165, 190, 175];
const MEDIAN = [185, 155, 205, 162, 188, 152, 215, 164, 190, 156, 210];
const around = (spread: (k: number) => number, sign: number) => MEDIAN.map((v, k) => v + sign * spread(k + 1));
const ILLUSTRATION = {
  median: MEDIAN,
  band50: { lo: around((k) => 4 + 3 * k, -1), hi: around((k) => 4 + 3 * k, 1) },
  band90: { lo: around((k) => 8 + 8 * k, -1), hi: around((k) => 8 + 8 * k, 1) },
};

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
      <Sidhuvud logoSrc={dark ? logoNegativ : logoPositiv} />
      <main className="sida telefon">
        <div className="intro">
          <h1 className="rubrik-l">{COPY["mobil.heading"]}</h1>
          <p className="ingress">{COPY["mobil.lead"]}</p>
        </div>

        <Kort figur>
          <Prognosgraf
            historik={HISTORY}
            prognos={ILLUSTRATION}
            yIntervall={[0, 330]}
            formatY={() => ""}
            hojd={400}
            beskrivning="En kurva som går fram till nu och sedan fortsätter som en prickad linje i två band som vidgas mot framtiden."
          />
        </Kort>

        <section className="avsnitt">
          <h2 className="rubrik-s">{COPY["mobil.steps"]}</h2>
          <ol className="telefon__steg">
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
      <Sidfot />
    </div>
  );
}
