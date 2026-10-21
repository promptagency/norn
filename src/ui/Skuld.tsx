import { useEffect, useMemo, useState, type ReactNode } from "react";
import { columnName, summing, unit } from "../data/describe.ts";
import { futureTimes, type DataSeries } from "../data/detect.ts";
import { DEFAULT_HORIZON, horizons, type Horizon } from "../data/horizon.ts";
import { EVENTS, eventOn, eventSeries, summarize, type EventId, type Forecast, type Forecaster } from "../engine/index.ts";
import { Forklaring, Fraga, Knapp, Kort, Prognosgraf, Sakerhetsval, Svar, Valgrupp, Valknapp } from "./components/index.ts";
import type { Sakerhetsniva } from "./components/index.ts";
import { COPY, t, type CopyKey } from "./copy.ts";
import { emphasize } from "./emphasize.tsx";
import { loadingText } from "./model.ts";
import { forecastCsv } from "./csv.ts";
import { timeLabels } from "./historik.ts";

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
  /** A link that opens these settings again; only examples have one (settings only, never data). */
  link?: (settings: SkuldSettings) => string;
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

export function Skuld({ series, forecaster, download, initial = {}, link }: Props) {
  const n = series.values.length;
  const options = useMemo(() => horizons(series.frequency, series.times[n - 1]), [series, n]);
  const [h, setH] = useState(Math.min(initial.horisont ?? DEFAULT_HORIZON, options.length - 1));
  const [niva, setNiva] = useState<Sakerhetsniva>(initial.sakerhet ?? "median");
  const [on, setOn] = useState<EventId[]>(initial.handelser ?? []);
  const [copied, setCopied] = useState(false);

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

  const [result, setResult] = useState<{ key: string; base: Forecast; events?: Forecast } | "fel" | null>(null);
  const key = `${steps}|${activeKey}`;
  useEffect(() => {
    let live = true;
    const times = [...series.times, ...future];
    const known = activeKey ? activeKey.split(",").map((id) => eventSeries(id as EventId, times)) : [];
    Promise.all([
      forecaster.forecast(series.values, steps),
      known.length ? forecaster.forecast(series.values, steps, { known }) : undefined,
    ]).then(
      ([base, events]) => live && setResult({ key, base, events }),
      () => live && setResult("fel"),
    );
    return () => { live = false; };
  }, [forecaster, series, future, steps, activeKey, key]);

  const ready = result && result !== "fel" ? result : null;
  const shown = ready ? (ready.events ?? ready.base) : null;
  const how = summing(series);
  const period = ahead(options[h]);
  const sum = shown && summarize(shown, how);

  let svar: ReactNode;
  if (result === "fel") svar = COPY["error.model"];
  else if (!sum) svar = download ? loadingText(download) : COPY["skuld.wait"];
  else {
    const fmt = sameStep(sum.median);
    const median = fmt(sum.median);
    svar = emphasize(t(`skuld.answer.${how}`, { Period: capital(period), median, lag: fmt(sum.low), hog: fmt(sum.high) }), median);
  }

  let effect: string | null = null;
  // Only for the forecast that matches the switches, not one still on its way.
  if (ready?.events && ready.key === key && sum) {
    const utan = summarize(ready.base, how).median;
    effect = Math.abs(sum.median - utan) < 0.01 * Math.abs(utan)
      ? COPY["skuld.events.none"]
      : t("skuld.events.effect", {
          handelser: list.format(active.map((id) => t(`event.${id}` as CopyKey).toLowerCase())),
          med: sameStep(sum.median)(sum.median),
          utan: sameStep(sum.median)(utan),
        });
  }

  const shownFrom = Math.max(0, n - steps);
  const nan = (v: number | null) => v ?? NaN;
  const settings = { horisont: h, sakerhet: niva, handelser: on };
  const fall = niva === "median" ? "" : COPY[`skuld.fall.${niva}`];

  const ladda = () => {
    if (!shown) return;
    const url = URL.createObjectURL(new Blob([forecastCsv(shown, future, series.frequency === "timme")], { type: "text/csv;charset=utf-8" }));
    const a = Object.assign(document.createElement("a"), { href: url, download: COPY["csv.filename"] });
    a.click();
    URL.revokeObjectURL(url);
  };
  const kopiera = () =>
    link && navigator.clipboard.writeText(link(settings)).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });

  return (
    <main className="sida sida--steg">
      <div className="intro">
        <h1 className="rubrik-l">{COPY["skuld.heading"]}</h1>
        <Svar>{svar}</Svar>
      </div>

      <Valgrupp etikett={COPY["skuld.horizon"]}>
        {options.map((o, i) => (
          <Valknapp key={label(o)} vald={i === h} onClick={() => setH(i)}>{label(o)}</Valknapp>
        ))}
      </Valgrupp>

      {shown && (
        <Kort figur>
          <Prognosgraf
            historik={series.values.slice(shownFrom).map(nan)}
            prognos={{
              median: shown.median,
              band50: { lo: shown.band50.low, hi: shown.band50.high },
              band90: { lo: shown.band90.low, hi: shown.band90.high },
            }}
            xEtiketter={timeLabels([...series.times.slice(shownFrom), ...future])}
            formatY={number.format}
            foreText={COPY["chart.past"]}
            tonadHistorik
            hojd={340}
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
        <Sakerhetsval varde={niva} onChange={setNiva} />
        {sum && niva !== "median" && (
          <p role="status">
            {emphasize(
              t(`skuld.plan.${how}`, { varde: sameStep(sum.median)(niva === "90" ? sum.plan90 : sum.plan95), period, fall }),
              sameStep(sum.median)(niva === "90" ? sum.plan90 : sum.plan95),
            )}
          </p>
        )}
      </Fraga>

      <Fraga rubrik={COPY["skuld.details"]} variant="liten">
        <p className="liten dampad">
          {t("skuld.details.text", { enhet: unit(series.frequency), enheter: unit(series.frequency, 2) })}
        </p>
      </Fraga>

      <div className="knapprad">
        <Knapp variant="sekundar" onClick={ladda} disabled={!shown}>{COPY["skuld.download"]}</Knapp>
        <Knapp variant="sekundar" onClick={() => print()}>{COPY["skuld.print"]}</Knapp>
        {link && <Knapp variant="sekundar" onClick={kopiera}>{copied ? COPY["skuld.link.done"] : COPY["skuld.link"]}</Knapp>}
      </div>
    </main>
  );
}
