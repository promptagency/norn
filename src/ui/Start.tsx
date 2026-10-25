import { useEffect, useState } from "react";
import { unit } from "../data/describe.ts";
import type { Example } from "../data/examples.ts";
import { loadExamples } from "../data/examples.ts";
import { DEFAULT_MODEL, MODELS } from "../config.ts";
import { Exempelkort, Kort, Slappyta } from "./components/index.ts";
import { COPY, t } from "./copy.ts";

// What a file can look like: an illustration, not data. Swedish dates and amounts, as a till export would have them.
const EXAMPLE_ROWS = [["2026-10-01", "12 400"], ["2026-10-02", "9 850"], ["2026-10-03", "11 200"]] as const;

interface Props {
  fel?: string;
  onFil: (file: File) => void;
  onText: (text: string) => void;
  onExempel: (ex: Example) => void;
}

export function Start({ fel, onFil, onText, onExempel }: Props) {
  const [exempel, setExempel] = useState<Example[]>([]);
  useEffect(() => {
    loadExamples().then(setExempel, () => setExempel([]));
  }, []);
  // Cells copied from a spreadsheet can be pasted anywhere on the page.
  useEffect(() => {
    const paste = (e: ClipboardEvent) => {
      const text = e.clipboardData?.getData("text/plain");
      if (text?.trim()) onText(text);
    };
    document.addEventListener("paste", paste);
    return () => document.removeEventListener("paste", paste);
  }, [onText]);

  return (
    <main className="sida">
      <div className="start">
        <div className="intro">
          <h1 className="rubrik-xl">{COPY["start.heading"]}</h1>
          <p className="ingress">{COPY["start.lead"]}</p>
          <ul className="start__ger">
            <li>{COPY["start.gets.forecast"]}</li>
            <li>{COPY["start.gets.trust"]}</li>
            <li>{COPY["start.gets.private"]}</li>
          </ul>
          <Kort>
            <table className="start__fil liten">
              <caption className="etikett">{COPY["start.file"]}</caption>
              <thead>
                <tr><th scope="col">{COPY["start.file.time"]}</th><th scope="col">{COPY["start.file.value"]}</th></tr>
              </thead>
              <tbody>
                {EXAMPLE_ROWS.map(([d, v]) => <tr key={d}><td>{d}</td><td>{v}</td></tr>)}
                <tr aria-hidden="true"><td>…</td><td>…</td></tr>
              </tbody>
            </table>
          </Kort>
          <p>
            <a className="n-textlank" href="/om">{COPY["om.link"]}</a>
          </p>
        </div>
        <div>
          <Slappyta onFiler={(files) => onFil(files[0])} fel={fel} />
          <p className="liten dampad start__ladda">{t("start.download", { mb: Math.round(MODELS[DEFAULT_MODEL].bytes / 1e6) })}</p>
        </div>
      </div>
      {exempel.length > 0 && (
        <section className="avsnitt">
          <h2 className="rubrik-s">{COPY["start.examples"]}</h2>
          <div className="rutnat">
            {exempel.map((ex) => (
              <Exempelkort
                key={ex.id}
                overrad={t("start.example.since", { enhet: unit(ex.frequency), ar: ex.since })}
                titel={ex.title}
                text={ex.card ?? ex.targets[ex.default_target]}
                kalla={ex.source_short}
                onClick={() => onExempel(ex)}
              />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
