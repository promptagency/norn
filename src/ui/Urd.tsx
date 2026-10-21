import { useState } from "react";
import { describe, columnName, unit } from "../data/describe.ts";
import { buildSeries, detectColumns, type Columns, type Combine, type DataSeries } from "../data/detect.ts";
import type { Table } from "../data/parse.ts";
import { Knapp, Kort, Prognosgraf, Svar, Valgrupp, Valknapp } from "./components/index.ts";
import { COPY, t } from "./copy.ts";
import { historik } from "./historik.ts";

interface Props {
  table: Table;
  columns: Columns;
  /** Column index of the series to forecast. */
  value: number;
  /** How several rows per day are put together, once the user has said. */
  combine?: Combine;
  onColumns: (columns: Columns, value: number) => void;
  onCombine: (combine: Combine) => void;
  onJa: (series: DataSeries) => void;
}

const number = new Intl.NumberFormat("sv-SE", { maximumFractionDigits: 2 });

export function Urd({ table, columns, value, combine, onColumns, onCombine, onJa }: Props) {
  const [andra, setAndra] = useState(false);
  const result = buildSeries(table, columns, value, combine);
  const valjTid = (time: number) => {
    const c = detectColumns(table, time);
    if (c.ok) onColumns(c.value, c.value.numeric.includes(value) ? value : c.value.numeric[0]);
  };
  const h = result.ok ? historik(result.value) : null;

  return (
    <main className="sida sida--steg">
      <div className="intro">
        <h1 className="rubrik-l">{COPY["urd.heading"]}</h1>
        <Svar>{result.ok ? describe(result.value) : t(result.error.key, result.error.values)}</Svar>
      </div>

      {result.ok && h && (
        <Kort figur>
          <Prognosgraf historik={h.values} xEtiketter={h.labels} formatY={number.format} hojd={300} beskrivning={describe(result.value)} />
          {h.grupp && (
            <figcaption className="liten dampad">{t("urd.bucketed", { grupp: h.grupp, enhet: unit(result.value.frequency) })}</figcaption>
          )}
        </Kort>
      )}

      {(combine || (!result.ok && result.error.key === "urd.many")) && (
        <section className="avsnitt">
          <h2 className="rubrik-s">{COPY["urd.many.pick"]}</h2>
          <Valgrupp etikett={COPY["urd.many.pick"]}>
            <Valknapp vald={combine === "summa"} onClick={() => onCombine("summa")}>{COPY["urd.many.sum"]}</Valknapp>
            <Valknapp vald={combine === "snitt"} onClick={() => onCombine("snitt")}>{COPY["urd.many.mean"]}</Valknapp>
          </Valgrupp>
          <p className="liten dampad">{COPY["urd.many.hint"]}</p>
        </section>
      )}

      {(andra || !result.ok) && columns.times.length > 1 && (
        <section className="avsnitt">
          <h2 className="rubrik-s">{COPY["urd.time"]}</h2>
          <Valgrupp etikett={COPY["urd.time"]}>
            {columns.times.map((c) => (
              <Valknapp key={c} vald={c === columns.time} onClick={() => valjTid(c)}>{columnName(table.headers[c])}</Valknapp>
            ))}
          </Valgrupp>
        </section>
      )}

      {columns.numeric.length > 1 && (
        <section className="avsnitt">
          <h2 className="rubrik-s">{COPY["urd.pick"]}</h2>
          <Valgrupp etikett={COPY["urd.pick"]}>
            {columns.numeric.map((c) => (
              <Valknapp key={c} vald={c === value} onClick={() => onColumns(columns, c)}>{columnName(table.headers[c])}</Valknapp>
            ))}
          </Valgrupp>
        </section>
      )}

      {result.ok && (
        <section className="bekrafta">
          <span className="ingress bekrafta__fraga">{COPY["urd.confirm"]}</span>
          <Knapp onClick={() => onJa(result.value)}>{COPY["urd.yes"]}</Knapp>
          {/* Only when there is a choice the screen does not already show. */}
          {!andra && columns.times.length > 1 && <Knapp variant="lank" onClick={() => setAndra(true)}>{COPY["urd.change"]}</Knapp>}
        </section>
      )}
    </main>
  );
}
