// "Så fungerar Norn" at /om: the reasoning, the model and the details, plain words first (PLAN.md, 2026-10-25).
// Static text: nothing here loads the model or the forecasting worker, so phones get it too.
import logoNegativ from "../../design/logo/norn-logotyp-negativ.svg";
import logoPositiv from "../../design/logo/norn-logotyp-positiv.svg";
import pkg from "../../package.json";
import { DEFAULT_MODEL, MODELS } from "../config.ts";
import { MAX_HISTORY, THRESHOLDS } from "../engine/index.ts";
import { Betyg, Knapp, Kort, Nyckeltal, Sidfot, Sidhuvud } from "./components/index.ts";
import { BandBild, Flode, KvantilBild, StegBilder } from "./OmBilder.tsx";
import { Faq } from "./Faq.tsx";
import { COPY, t, type CopyKey } from "./copy.ts";
import { emphasize } from "./emphasize.tsx";
import { useDark } from "./theme.ts";
import "./app.css";

const CODE_URL = "https://github.com/promptagency/norn";
const MODEL_URL = "https://huggingface.co/mistralai/Timestral-28M";

const mb = Math.round(MODELS[DEFAULT_MODEL].bytes / 1e6);
const max = new Intl.NumberFormat("sv-SE").format(MAX_HISTORY);
const percent = (x: number) => Math.round(100 * x);

/** A paragraph whose first sentence is its heading in bold: "Inköp. Hur mycket …". */
const Lead = ({ k }: { k: CopyKey }) => {
  const text = COPY[k];
  return <p>{emphasize(text, text.slice(0, text.indexOf(".") + 1))}</p>;
};

/** A section of the page. With `bild`, the picture stands beside the text on a wide screen and under it on a narrow one. */
const Section = ({ id, heading, bild, children }: { id: string; heading: CopyKey; bild?: React.ReactNode; children: React.ReactNode }) =>
  bild ? (
    <section className="om__avsnitt om__avsnitt--bild" id={id}>
      <h2 className="rubrik-m">{COPY[heading]}</h2>
      <div className="om__text">{children}</div>
      <div className="om__bild">{bild}</div>
    </section>
  ) : (
    <section className="avsnitt om__avsnitt" id={id}>
      <h2 className="rubrik-m">{COPY[heading]}</h2>
      {children}
    </section>
  );

const External = ({ href, children }: { href: string; children: string }) => (
  <a className="n-textlank" href={href} target="_blank" rel="noopener">
    {children}
    <span className="n-dold"> ({COPY["link.newtab"]})</span>
  </a>
);

export function Om() {
  const dark = useDark();
  return (
    <div className="app">
      <Sidhuvud logoSrc={dark ? logoNegativ : logoPositiv} tillagg={<Faq />} />
      <main className="sida om">
        <div className="intro">
          <h1 className="rubrik-xl">{COPY["om.heading"]}</h1>
          <p className="ingress">{COPY["om.lead"]}</p>
        </div>

        <Section id="vad" heading="om.what.heading">
          <p>{COPY["om.what.1"]}</p>
          <p>{COPY["om.what.2"]}</p>
          <p>{COPY["om.what.3"]}</p>
        </Section>

        <Section id="anvandning" heading="om.use.heading">
          {(["om.use.butik", "om.use.personal", "om.use.el", "om.use.besok"] as const).map((k) => <Lead key={k} k={k} />)}
          <p>{COPY["om.use.niva"]}</p>
        </Section>

        <Section id="steg" heading="om.steps.heading">
          <ol className="steglista">
            {(["om.steps.urd", "om.steps.verdandi", "om.steps.skuld"] as const).map((k, i) => (
              <li key={k}>
                <span className="nummer" aria-hidden="true">{i + 1}</span>
                <Lead k={k} />
              </li>
            ))}
          </ol>
          <StegBilder />
          <p>{COPY["om.steps.why"]}</p>
          <p className="dampad">{COPY["om.steps.names"]}</p>
        </Section>

        <Section id="banden" heading="om.bands.heading" bild={<BandBild />}>
          <p>{COPY["om.bands.1"]}</p>
          <p>{COPY["om.bands.2"]}</p>
          <p>{COPY["om.bands.3"]}</p>
        </Section>

        <Section id="betygen" heading="om.grades.heading">
          {(["palitlig", "ungefarlig", "osaker"] as const).map((niva) => (
            <div key={niva} className="om__betyg">
              <Betyg niva={niva} />
              <Lead k={`om.grades.${niva}`} />
            </div>
          ))}
          <p>{COPY["om.grades.naive"]}</p>
          <p className="dampad">
            {t("om.grades.rule", {
              inom: percent(THRESHOLDS.inside90),
              nara: percent(THRESHOLDS.closeError),
              battre: percent(THRESHOLDS.betterThanNaive),
              langt: percent(THRESHOLDS.farError),
            })}
          </p>
        </Section>

        <Section id="data" heading="om.privacy.heading" bild={<Flode />}>
          <p>{COPY["om.privacy.1"]}</p>
          <p>{COPY["om.privacy.2"]}</p>
          <p>{t("om.privacy.3", { mb })}</p>
          <p>{COPY["om.privacy.4"]}</p>
        </Section>

        <Section id="modellen" heading="om.model.heading">
          <p>{COPY["om.model.1"]}</p>
          <p>{COPY["om.model.2"]}</p>
          <p>{COPY["om.model.3"]}</p>
          <p>{COPY["om.model.4"]}</p>
        </Section>

        <Section id="teknik" heading="om.tech.heading" bild={<KvantilBild />}>
          <p className="dampad">{COPY["om.tech.lead"]}</p>
          <Kort>
            <Nyckeltal
              poster={[
                { etikett: COPY["om.tech.k.model"], varde: COPY["om.tech.v.model"], text: true },
                { etikett: COPY["om.tech.k.arch"], varde: COPY["om.tech.v.arch"], text: true },
                { etikett: COPY["om.tech.k.output"], varde: COPY["om.tech.v.output"], text: true },
                { etikett: COPY["om.tech.k.history"], varde: t("om.tech.v.history", { max }), text: true },
                { etikett: COPY["om.tech.k.horizon"], varde: COPY["om.tech.v.horizon"], text: true },
                { etikett: COPY["om.tech.k.weights"], varde: t("om.tech.v.weights", { mb }), text: true },
                { etikett: COPY["om.tech.k.runtime"], varde: t("om.tech.v.runtime", { version: pkg.dependencies["onnxruntime-web"] }), text: true },
                { etikett: COPY["om.tech.k.licence"], varde: COPY["om.tech.v.licence"], text: true },
              ]}
            />
          </Kort>
          <p>{COPY["om.tech.quantiles"]}</p>
          <p>{t("om.tech.history", { max })}</p>
          <p>{COPY["om.tech.backtest"]}</p>
          <p>{COPY["om.tech.events"]}</p>
          <p>{COPY["om.tech.totals"]}</p>
          <p>{COPY["om.tech.check"]}</p>
        </Section>

        <Section id="inte" heading="om.not.heading">
          <ul className="om__lista">
            {(["om.not.promise", "om.not.one", "om.not.account", "om.not.data", "om.not.support"] as const).map((k) => (
              <li key={k}>{COPY[k]}</li>
            ))}
          </ul>
        </Section>

        <Section id="projektet" heading="om.project.heading">
          <p>{COPY["om.project.1"]}</p>
          <p className="om__lankar">
            <External href={CODE_URL}>{COPY["om.project.code"]}</External>
            <External href={MODEL_URL}>{COPY["om.project.model"]}</External>
          </p>
          <p>{COPY["om.project.thanks"]}</p>
        </Section>

        <div>
          <Knapp href="/">{COPY["om.back"]}</Knapp>
        </div>
      </main>
      <Sidfot utanOm tillagg={<Faq />} />
    </div>
  );
}
