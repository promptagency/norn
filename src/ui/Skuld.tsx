import { useEffect, useMemo, useState, type ReactNode } from "react";
import { axisUnit, columnName, formatPoint, periodWords, summing, textUnit, unit, type Units } from "../data/describe.ts";
import { futureTimes, type DataSeries } from "../data/detect.ts";
import type { Time } from "../data/parse.ts";
import { DEFAULT_HORIZON, horizons, type Horizon } from "../data/horizon.ts";
import { EVENTS, eventOn, eventSeries, percentFits, summarize, type Backtest, type EventId, type Forecast, type Forecaster } from "../engine/index.ts";
import { Betyg, Forklaring, Fraga, Knapp, Kort, Prognosgraf, Sakerhetsval, Svar, Valgrupp, Valknapp } from "./components/index.ts";
import type { Sakerhetsniva } from "./components/index.ts";
import { COPY, t, type CopyKey } from "./copy.ts";
import { emphasize } from "./emphasize.tsx";
import { loadingText } from "./model.ts";
import { forecastCsv } from "./csv.ts";
import { windowLabels } from "./historik.ts";
import { backtestOf, graded } from "./provet.ts";

export interface SkuldSettings {
  horisont: number;
  sakerhet: Sakerhetsniva;
  handelser: EventId[];
}

interface Props {
  series: DataSeries;
  forecaster: Forecaster;
  download?: { loaded: number; total: number };
  initial?: Partial<SkuldSettings>;
  /** Known for the examples; puts the unit on the axis and after the amounts. */
  units?: Units;
  /** Back to Verdandi, from the reminder of the test. */
  onProvet: () => void;
}

const number = new Intl.NumberFormat("sv-SE", { maximumSignificantDigits: 3 });

/** Rounds every number in a sentence to the same step, three digits of `reference`: 0,881 and 0,074, not 0,0737. */
function sameStep(reference: number) {
  const exp = Math.floor(Math.log10(Math.abs(reference) || 1)) - 2;
  const f = new Intl.NumberFormat("sv-SE", { maximumFractionDigits: Math.max(0, -exp) });
  return (x: number) => f.format(Math.round(x / 10 ** exp) * 10 ** exp);
}
const list = new Intl.ListFormat("sv", { type: "conjunction" });
const capital = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** "den närmaste veckan", "de närmaste 3 månaderna". */
const ahead = (h: Horizon) =>
  h.n === 1 ? t(`narmast.${h.unit}` as CopyKey) : t("narmast.n", { antal: h.n, enheter: t(`enhet.${h.unit}.bestamd` as CopyKey) });
const label = (h: Horizon) => `${h.n} ${t(`enhet.${h.unit}${h.n === 1 ? "" : ".flera"}` as CopyKey)}`;

export function Skuld({ series, forecaster, download, initial = {}, units, onProvet }: Props) {
  const n = series.values.length;
  const options = useMemo(() => horizons(series.frequency, series.times[n - 1]), [series, n]);
  // The horizon may come from a link, so anything but a valid button index falls back to the default.
  const [h, setH] = useState(() => {
    const i = initial.horisont ?? DEFAULT_HORIZON;
    return Number.isInteger(i) && i >= 0 ? Math.min(i, options.length - 1) : DEFAULT_HORIZON;
  });
  const [niva, setNiva] = useState<Sakerhetsniva>(initial.sakerhet ?? "median");
  const [on, setOn] = useState<EventId[]>(initial.handelser ?? []);

  const { steps } = options[h];
  const future = useMemo(() => futureTimes(series, steps), [series, steps]);
  const daily = series.frequency === "dag" || series.frequency === "timme";
  // Only events the history has seen (so the model can learn them) and the horizon contains.
  const available = useMemo(
    () => (daily ? EVENTS.filter((id) => future.some((t) => eventOn(id, t)) && series.times.some((t) => eventOn(id, t))) : []),
    [daily, future, series],
  );
  const active = available.filter((id) => on.includes(id));
  const activeKey = active.join();

  const [result, setResult] = useState<{ key: string; base: Forecast; events?: Forecast; future: Time[] } | "fel" | null>(null);
  const key = `${steps}|${activeKey}`;
  // The forecast without events, once per horizon: switching an event on or off only needs the one with events.
  const baseFor = useMemo(() => {
    const done = new Map<number, Promise<Forecast>>();
    return (s: number) => {
      let p = done.get(s);
      if (!p) {
        done.set(s, (p = forecaster.forecast(series.values, s)));
        p.catch(() => done.delete(s));
      }
      return p;
    };
  }, [forecaster, series]);
  useEffect(() => {
    let live = true;
    const times = [...series.times, ...future];
    const known = activeKey ? activeKey.split(",").map((id) => eventSeries(id as EventId, times)) : [];
    Promise.all([
      baseFor(steps),
      known.length ? forecaster.forecast(series.values, steps, { known }) : undefined,
    ]).then(
      ([base, events]) => live && setResult({ key, base, events, future }),
      () => live && setResult("fel"),
    );
    return () => { live = false; };
  }, [forecaster, baseFor, series, future, steps, activeKey, key]);

  // The sentence and the download only use the forecast for the current settings: an older one would put its
  // numbers next to the new period. The chart keeps the last one, with its own dates, so the page does not jump.
  const last = result && result !== "fel" ? result : null;
  const ready = last?.key === key ? last : null;
  const shown = ready ? (ready.events ?? ready.base) : null;
  const drawn = last ? (last.events ?? last.base) : null;
  const how = summing(series);
  // "18 300 sidvisningar", "8 500 MWh per timme": the unit once, after the main amount, where it is known.
  const tu = textUnit(series, how, units);
  const withUnit = (v: string) => (tu ? `${v} ${tu}` : v);
  const period = ahead(options[h]);
  const sum = shown && summarize(shown, how);

  // The test from Verdandi, run here too when a link opened Skuld first.
  const [test, setTest] = useState<Backtest | null>(null);
  useEffect(() => {
    let live = true;
    backtestOf(forecaster, series).then((bt) => live && setTest(bt), () => {});
    return () => { live = false; };
  }, [forecaster, series]);
  const g = test && graded(series, test);
  let prov: string | null = null;
  if (g) {
    const tested = periodWords(series.frequency, test.actual.length);
    if (g.niva === "osaker") prov = t("skuld.prov.poor", { period: tested });
    else if (percentFits(g.s)) prov = t("skuld.prov.percent", { period: tested, procent: Math.round(100 * g.s.relative) });
    else {
      const fel = units?.amount ? `${number.format(g.s.error)} ${units.amount}` : number.format(g.s.error);
      prov = t("skuld.prov.abs", { period: tested, fel, enhet: unit(series.frequency) });
    }
  }

  let svar: ReactNode;
  if (result === "fel") svar = COPY["error.model"];
  else if (!sum) svar = download ? loadingText(download) : COPY["skuld.wait"];
  else {
    const fmt = sameStep(sum.median);
    const median = withUnit(fmt(sum.median));
    svar = emphasize(t(`skuld.answer.${how}`, { Period: capital(period), median, lag: fmt(sum.low), hog: fmt(sum.high) }), median);
  }

  let effect: string | null = null;
  if (ready?.events && sum) {
    const utan = summarize(ready.base, how).median;
    effect = Math.abs(sum.median - utan) < 0.01 * Math.abs(utan)
      ? COPY["skuld.events.none"]
      : t("skuld.events.effect", {
          handelser: list.format(active.map((id) => t(`event.${id}` as CopyKey).toLowerCase())),
          med: withUnit(sameStep(sum.median)(sum.median)),
          utan: sameStep(sum.median)(utan),
        });
  }

  const drawnTimes = last ? [...series.times.slice(Math.max(0, n - last.future.length)), ...last.future] : [];
  const nan = (v: number | null) => v ?? NaN;
  const fall = niva === "median" ? "" : COPY[`skuld.fall.${niva}`];

  const ladda = () => {
    if (!shown) return;
    const url = URL.createObjectURL(new Blob([forecastCsv(shown, future, series.frequency === "timme")], { type: "text/csv;charset=utf-8" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: COPY["csv.filename"] });
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="sida sida--steg">
      <div className="intro">
        <h1 className="rubrik-l">{COPY["skuld.heading"]}</h1>
        <Svar>{svar}</Svar>
        {g && prov && (
          <div className="provet-rad">
            <Betyg niva={g.niva} />
            <span>{prov}</span>
            <Knapp variant="lank" onClick={onProvet}>{COPY["skuld.prov.link"]}</Knapp>
          </div>
        )}
      </div>

      <div className="avsnitt">
        <Valgrupp etikett={COPY["skuld.horizon"]}>
          {options.map((o, i) => (
            <Valknapp key={label(o)} vald={i === h} onClick={() => setH(i)}>{label(o)}</Valknapp>
          ))}
        </Valgrupp>
        <p className="liten dampad">{COPY["skuld.horizon.hint"]}</p>
      </div>

      {last && drawn && (
        <Kort figur rubrik={t("skuld.chart.heading", { namn: columnName(series.name), enhet: unit(series.frequency), period })}>
          <Prognosgraf
            historik={series.values.slice(Math.max(0, n - last.future.length)).map(nan)}
            prognos={{
              median: drawn.median,
              band50: { lo: drawn.band50.low, hi: drawn.band50.high },
              band90: { lo: drawn.band90.low, hi: drawn.band90.high },
            }}
            xEtiketter={windowLabels(drawnTimes)}
            formatY={number.format}
            foreText={COPY["chart.past"]}
            tonadHistorik
            hojd={340}
            enhet={axisUnit(series, units)}
            tidtext={(i) => formatPoint(series.frequency, drawnTimes[i])}
            beskrivning={t("skuld.chart", { namn: columnName(series.name), period })}
          />
          <Forklaring poster={["median", "band50", "band90"]} />
        </Kort>
      )}

      <Fraga rubrik={COPY["skuld.events"]} oppen={active.length > 0}>
        {!daily ? (
          <p>{COPY["skuld.events.daily"]}</p>
        ) : available.length === 0 ? (
          <p>{COPY["skuld.events.empty"]}</p>
        ) : (
          <>
            <p>{COPY["skuld.events.lead"]}</p>
            <p className="liten dampad">{COPY["skuld.events.more"]}</p>
            <Valgrupp etikett={COPY["skuld.events"]}>
              {available.map((id) => (
                <Valknapp
                  key={id}
                  vald={on.includes(id)}
                  onClick={() => setOn(on.includes(id) ? on.filter((x) => x !== id) : [...on, id])}
                >
                  {COPY[`event.${id}`]}
                </Valknapp>
              ))}
            </Valgrupp>
            {effect && <p role="status">{effect}</p>}
          </>
        )}
      </Fraga>

      <Fraga rubrik={COPY["skuld.certainty"]} oppen={niva !== "median"}>
        <p>{COPY["skuld.certainty.lead"]}</p>
        <p className="liten dampad">{COPY["skuld.certainty.more"]}</p>
        <Sakerhetsval varde={niva} onChange={setNiva} />
        {sum && niva !== "median" && (
          <p role="status">
            {emphasize(
              t(`skuld.plan.${how}`, { varde: withUnit(sameStep(sum.median)(niva === "90" ? sum.plan90 : sum.plan95)), period, fall }),
              withUnit(sameStep(sum.median)(niva === "90" ? sum.plan90 : sum.plan95)),
            )}
          </p>
        )}
      </Fraga>

      <Fraga rubrik={COPY["skuld.details"]} variant="liten">
        <p className="liten dampad">
          {t("skuld.details.text", { enhet: unit(series.frequency), enheter: unit(series.frequency, 2) })}
        </p>
      </Fraga>

      <div className="avsnitt">
        <div className="knapprad">
          <Knapp variant="sekundar" onClick={ladda} disabled={!shown}>{COPY["skuld.download"]}</Knapp>
          {/* The browser's own print dialog saves a PDF on the computer: no library, nothing sent (owner, 2026-10-25). */}
          <Knapp variant="sekundar" onClick={() => print()} disabled={!shown}>{COPY["skuld.pdf"]}</Knapp>
        </div>
        {shown && (
          <p className="liten dampad">
            {t("skuld.download.hint", { enhet: unit(series.frequency), antal: shown.levels.length })} {COPY["skuld.pdf.hint"]}
          </p>
        )}
      </div>
    </main>
  );
}
