import { useEffect, useState } from "react";
import { unit } from "../data/describe.ts";
import type { Example } from "../data/examples.ts";
import { loadExamples } from "../data/examples.ts";
import { Exempelkort, Slappyta } from "./components/index.ts";
import { COPY, t } from "./copy.ts";

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
      <div className="intro">
        <h1 className="rubrik-xl">{COPY["start.heading"]}</h1>
        <p className="ingress">{COPY["start.lead"]} {COPY["start.privacy"]}</p>
      </div>
      <Slappyta onFiler={(files) => onFil(files[0])} fel={fel} />
      {exempel.length > 0 && (
        <section className="avsnitt">
          <h2 className="rubrik-s">{COPY["start.examples"]}</h2>
          <div className="rutnat">
            {exempel.map((ex) => (
              <Exempelkort
                key={ex.id}
                overrad={t("start.example.since", { enhet: unit(ex.frequency), ar: ex.since })}
                titel={ex.title}
                text={ex.targets[ex.default_target]}
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
