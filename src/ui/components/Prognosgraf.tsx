import { useState, type KeyboardEvent, type PointerEvent } from "react";
import { COPY, t } from "../copy.ts";
import { DEFAULT_LAYOUT, indexAt, layoutChart, readingAt } from "./chart.ts";
import type { PrognosgrafProps } from "./types.ts";

export function Prognosgraf({
  historik,
  prognos,
  utfall,
  xEtiketter = [],
  formatY = (v) => String(v),
  yIntervall,
  foreText,
  efterText,
  tonadHistorik,
  hojd = DEFAULT_LAYOUT.height,
  enhet,
  tidtext,
  beskrivning,
}: PrognosgrafProps) {
  const layout = { ...DEFAULT_LAYOUT, height: hojd };
  const g = layoutChart(historik, prognos, utfall, layout, yIntervall);
  const bottom = hojd - layout.padBottom;
  const efter = efterText ?? (prognos && !utfall ? COPY["chart.now"] : undefined);
  const [hover, setHover] = useState<number | null>(null);

  // The hover indicator, only when the caller can say what time each point is.
  const move = (e: PointerEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setHover(indexAt(((e.clientX - r.left) / r.width) * layout.width, g.total, layout));
  };
  const keys = (e: KeyboardEvent<SVGSVGElement>) => {
    const last = g.total - 1;
    const step = { ArrowLeft: -1, ArrowRight: 1 }[e.key];
    if (e.key === "Home" || e.key === "End") setHover(e.key === "Home" ? 0 : last);
    else if (step) setHover((h) => Math.min(last, Math.max(0, (h ?? historik.length - 1) + step)));
    else return;
    e.preventDefault();
  };
  const reading = hover === null ? null : readingAt(hover, historik, prognos, utfall);
  const fmt = (v?: number) => (v === undefined || !Number.isFinite(v) ? null : formatY(v));
  const dots = reading && hover !== null
    ? ([["historik", reading.history], ["utfall", reading.outcome], ["median", reading.median]] as const).filter(
        (d): d is readonly [typeof d[0], number] => d[1] !== undefined && Number.isFinite(d[1]),
      )
    : [];
  const left = hover === null ? 0 : (g.x(hover) / layout.width) * 100;

  return (
    <div className="n-graf-ram">
      <svg
        className="n-graf"
        viewBox={`0 0 ${layout.width} ${hojd}`}
        role="img"
        aria-label={beskrivning}
        {...(tidtext && {
          tabIndex: 0,
          onPointerMove: move,
          onPointerDown: move,
          // A finger "leaves" as it lifts; keep the card until a tap elsewhere takes the focus away.
          onPointerLeave: (e: PointerEvent<SVGSVGElement>) => e.pointerType !== "touch" && setHover(null),
          onKeyDown: keys,
          onBlur: () => setHover(null),
        })}
      >
        {enhet && <text className="n-graf__etikett n-graf__enhet" x="0" y="12">{enhet}</text>}
        {g.yTicks.map((t) => (
          <line key={`r${t.value}`} className="n-graf__rutnat" x1={layout.padLeft} x2={layout.width - layout.padRight} y1={t.y} y2={t.y} />
        ))}
        <line className="n-graf__baslinje" x1={layout.padLeft} x2={layout.width - layout.padRight} y1={g.baseY} y2={g.baseY} />
        {g.yTicks.map((t) => (
          <text key={t.value} className="n-graf__etikett" x="0" y={t.y + 4}>{formatY(t.value)}</text>
        ))}
        {g.band90 && <path className="n-graf__band90" d={g.band90} />}
        {g.band50 && <path className="n-graf__band50" d={g.band50} />}
        {g.median && <path className="n-graf__median" d={g.median} />}
        {g.outcome && <path className="n-graf__utfall" d={g.outcome} />}
        <path className={["n-graf__historik", tonadHistorik && "n-graf__historik--tonad"].filter(Boolean).join(" ")} d={g.history} />
        {g.nowX !== undefined && (
          <>
            <line className="n-graf__nu" x1={g.nowX} x2={g.nowX} y1={10} y2={bottom + 6} />
            {foreText && <text className="n-graf__etikett" x={g.nowX - 12} y="20" textAnchor="end">{foreText}</text>}
            {efter && <text className={utfall ? "n-graf__etikett" : "n-graf__nu-text"} x={g.nowX + 12} y="20">{efter}</text>}
          </>
        )}
        {xEtiketter.map((e) => (
          <text key={`${e.index}-${e.text}`} className="n-graf__etikett" x={g.x(e.index)} y={hojd - 6}>{e.text}</text>
        ))}
        {hover !== null && (
          <g aria-hidden="true">
            <line className="n-graf__guide" x1={g.x(hover)} x2={g.x(hover)} y1={layout.padTop} y2={bottom} />
            {dots.map(([linje, v]) => <circle key={linje} className={`n-graf__punkt n-graf__punkt--${linje}`} cx={g.x(hover)} cy={g.y(v)} r="5" />)}
          </g>
        )}
      </svg>
      {reading && hover !== null && tidtext && (
        <div className={`n-graf-kort${left > 60 ? " n-graf-kort--vanster" : ""}`} style={{ left: `${left}%` }} aria-live="polite">
          <div className="n-graf-kort__tid">{tidtext(hover)}</div>
          {fmt(reading.history) && <div>{COPY["legend.history"]} <strong>{fmt(reading.history)}</strong></div>}
          {fmt(reading.outcome) && <div>{COPY["legend.outcome"]} <strong>{fmt(reading.outcome)}</strong></div>}
          {fmt(reading.median) && <div>{COPY["legend.median"]} <strong>{fmt(reading.median)}</strong></div>}
          {fmt(reading.low90) && fmt(reading.high90) && (
            <div>{COPY["graf.nio"]} <strong>{t("graf.intervall", { lag: fmt(reading.low90)!, hog: fmt(reading.high90)! })}</strong></div>
          )}
        </div>
      )}
    </div>
  );
}
