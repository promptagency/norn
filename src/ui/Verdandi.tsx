import { useEffect, useState, type ReactNode } from "react";
import { DEFAULT_MODEL } from "../config.ts";
import { axisUnit, columnName, comparedWith, formatPoint, formatTime, periodWords, unit, type Units } from "../data/describe.ts";
import type { DataSeries } from "../data/detect.ts";
import { backtestSteps, grade, improvement, percentFits, score, SEASON, THRESHOLDS, type Backtest, type Forecaster } from "../engine/index.ts";
import { Betyg, Forklaring, Fraga, Knapp, Kort, Nyckeltal, Prognosgraf, Svar } from "./components/index.ts";
import { COPY, t } from "./copy.ts";
import { emphasize } from "./emphasize.tsx";
import { loadingText } from "./model.ts";
import { timeLabels } from "./historik.ts";

interface Props {
  series: DataSeries;
  forecaster: Forecaster;
  /** Bytes of the model downloaded so far, while it downloads. */
  download?: { loaded: number; total: number };
  /** Known for the examples; puts the unit on the axis and after the error. */
  units?: Units;
  onNext: () => void;
}

const number = new Intl.NumberFormat("sv-SE", { maximumSignificantDigits: 3 });
const percent = (x: number) => Math.round(100 * x);

export function Verdandi({ series, forecaster, download, units, onNext }: Props) {
  // "410 MWh" where the unit is known, else the bare number.
  const amount = (v: number) => (units?.amount ? `${number.format(v)} ${units.amount}` : number.format(v));
  const n = series.values.length;
  const steps = backtestSteps(series.frequency, n);
  const cut = n - steps;
  const [result, setResult] = useState<Backtest | "fel" | null>(null);

  useEffect(() => {
    let live = true;
    forecaster.backtest(series.values, steps).then(
      (bt) => live && setResult(bt),
      () => live && setResult("fel"),
    );
    return () => { live = false; };
  }, [forecaster, series, steps]);

  const period = periodWords(series.frequency, steps);
  const jamfort = comparedWith(series.frequency);
  const s = result && result !== "fel" ? score(series.values.slice(0, cut), result, SEASON[series.frequency]) : null;
  const niva = s && grade(s);

  let svar: ReactNode;
  if (result === "fel" || (result && !s)) svar = COPY["error.model"];
  else if (!s) svar = download ? loadingText(download) : COPY["verdandi.wait"];
  else if (niva === "osaker") svar = COPY["verdandi.poor"];
  else {
    const Period = period.charAt(0).toUpperCase() + period.slice(1);
    const good = niva === "palitlig";
    if (percentFits(s)) {
      const procent = `${percent(s.relative)} procent`;
      // Without clearly beating the naive guess, the sentence must not claim it did.
      const plain = !(improvement(s) >= THRESHOLDS.betterThanNaive);
      const key = good ? (plain ? "verdandi.good.plain" : "verdandi.good") : !(improvement(s) > 0) ? "verdandi.fair.plain" : "verdandi.fair";
      svar = emphasize(t(key, { Period, procent: percent(s.relative), jamfort }), procent);
    } else {
      // Near zero or below it a percent explodes, so the miss is said in the data's own numbers.
      const fel = `${amount(s.error)} per ${unit(series.frequency)}`;
      svar = emphasize(t(good ? "verdandi.good.abs" : "verdandi.fair.abs", { Period, fel: amount(s.error), enhet: unit(series.frequency), jamfort }), fel);
    }
  }

  // As much history before the cut as the period held out, so the guess sits in context.
  const from = Math.max(0, cut - steps);
  const nan = (v: number | null) => v ?? NaN;

  return (
    <main className="sida sida--steg">
      <div className="intro">
        <h1 className="rubrik-l">{COPY["verdandi.heading"]}</h1>
        <p className="dampad">{t("verdandi.lead", { period })}</p>
        <div className="betyg-rad">
          {niva && <Betyg niva={niva} />}
          <Svar>{svar}</Svar>
        </div>
      </div>

      {s && result && result !== "fel" && (
        <>
          <Kort figur>
            <Prognosgraf
              historik={series.values.slice(from, cut).map(nan)}
              prognos={{
                median: result.forecast.median,
                band50: { lo: result.forecast.band50.low, hi: result.forecast.band50.high },
                band90: { lo: result.forecast.band90.low, hi: result.forecast.band90.high },
              }}
              utfall={result.actual.map(nan)}
              xEtiketter={timeLabels(series.times.slice(from))}
              formatY={number.format}
              foreText={COPY["chart.seen"]}
              efterText={COPY["chart.guessed"]}
              enhet={axisUnit(series, units)}
              tidtext={(i) => formatPoint(series.frequency, series.times[from + i])}
              beskrivning={t("verdandi.chart", {
                namn: columnName(series.name),
                start: formatTime(series.frequency, series.times[from]),
                slut: formatTime(series.frequency, series.times[n - 1]),
              })}
            />
            <Forklaring poster={["utfall", "median-backtest", "band50", "band90"]} />
          </Kort>
          <p className="smal">{t("verdandi.bands", { in50: percent(s.inside50), in90: percent(s.inside90) })}</p>
          <Fraga rubrik={COPY["verdandi.details"]} variant="liten">
            <Nyckeltal
              poster={[
                { etikett: t("verdandi.d.error", { enhet: unit(series.frequency) }), varde: amount(s.error) },
                { etikett: t("verdandi.d.naive", { jamfort }), varde: amount(s.naiveError) },
                ...(percentFits(s) ? [{ etikett: COPY["verdandi.d.relative"], varde: `${percent(s.relative)} %` }] : []),
                // What the grade rule compares, so the numbers add up. Missing for a series with nothing to beat.
                ...(Number.isFinite(improvement(s))
                  ? [{ etikett: t("verdandi.d.improvement", { jamfort }), varde: `${percent(improvement(s))} %` }]
                  : []),
                { etikett: COPY["verdandi.d.in50"], varde: t("verdandi.d.share", { andel: percent(s.inside50), vantat: 50 }) },
                { etikett: COPY["verdandi.d.in90"], varde: t("verdandi.d.share", { andel: percent(s.inside90), vantat: 90 }) },
                {
                  etikett: COPY["verdandi.d.period"],
                  varde: t("verdandi.d.period.value", {
                    start: formatTime(series.frequency, series.times[cut]),
                    slut: formatTime(series.frequency, series.times[n - 1]),
                    modell: `Timestral-${DEFAULT_MODEL}`,
                  }),
                  text: true,
                },
              ]}
            />
            <p className="liten dampad">
              {t("verdandi.rule", {
                battre: percent(THRESHOLDS.betterThanNaive),
                inom: percent(THRESHOLDS.inside90),
                nara: percent(THRESHOLDS.closeError),
                langt: percent(THRESHOLDS.farError),
                jamfort,
              })}
            </p>
          </Fraga>
          <div>
            <Knapp onClick={onNext}>{COPY["verdandi.next"]}</Knapp>
          </div>
        </>
      )}
    </main>
  );
}
