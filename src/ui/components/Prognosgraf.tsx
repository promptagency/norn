import { useId, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { COPY, t } from "../copy.ts";
import { DEFAULT_LAYOUT, indexAt, layoutChart, MIN_VIEW, readingAt, zoomView } from "./chart.ts";
import { Knapp } from "./Knapp.tsx";
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
  markeringar = [],
}: PrognosgrafProps) {
  const layout = { ...DEFAULT_LAYOUT, height: hojd };
  const full = Math.max(historik.length + (prognos?.median.length ?? 0), 2);
  // Zooming in on time (owner, 2026-10-25): a stretch of the axis, or null for all of it. A stretch that no longer
  // fits, after a new horizon, falls back to all.
  const [zoom, setZoom] = useState<[number, number] | null>(null);
  const view = zoom && zoom[1] <= full - 1 ? zoom : null;
  const g = layoutChart(historik, prognos, utfall, layout, yIntervall, view ?? undefined);
  const [from, to] = g.view;
  const bottom = hojd - layout.padBottom;
  const efter = efterText ?? (prognos && !utfall ? COPY["chart.now"] : undefined);
  const [hover, setHover] = useState<number | null>(null);
  const [urval, setUrval] = useState<[number, number] | null>(null);
  const drag = useRef<number | null>(null);
  const fingers = useRef(new Map<number, number>());
  const pinch = useRef<{ distance: number; width: number; center: number } | null>(null);
  const clip = useId();
  const zoomable = Boolean(tidtext) && full > 2 * MIN_VIEW;

  // The hover indicator, only when the caller can say what time each point is.
  const at = (e: PointerEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return indexAt(((e.clientX - r.left) / r.width) * layout.width, g.total, layout, g.view);
  };
  const down = (e: PointerEvent<SVGSVGElement>) => {
    setHover(at(e));
    if (!zoomable) return;
    if (e.pointerType === "touch") {
      fingers.current.set(e.pointerId, e.clientX);
      const xs = [...fingers.current.values()];
      if (xs.length === 2) pinch.current = { distance: Math.abs(xs[0] - xs[1]), width: to - from, center: at(e) };
    } else if (e.button === 0) {
      e.preventDefault(); // a mouse drag selects no text and leaves no keyboard focus ring; Tab still reaches the chart
      drag.current = at(e);
      e.currentTarget.setPointerCapture(e.pointerId);
    }
  };
  const move = (e: PointerEvent<SVGSVGElement>) => {
    const i = at(e);
    setHover(i);
    if (pinch.current && fingers.current.has(e.pointerId)) {
      fingers.current.set(e.pointerId, e.clientX);
      const [a, b] = [...fingers.current.values()];
      const d = Math.abs(a - b);
      if (d > 0) setZoom(zoomView(pinch.current.center, (pinch.current.width * pinch.current.distance) / d, full));
    } else if (drag.current !== null && i !== drag.current) setUrval([drag.current, i]);
  };
  const up = (e: PointerEvent<SVGSVGElement>) => {
    fingers.current.delete(e.pointerId);
    if (fingers.current.size < 2) pinch.current = null;
    if (urval && Math.abs(urval[1] - urval[0]) >= MIN_VIEW - 1) setZoom([Math.min(...urval), Math.max(...urval)]);
    drag.current = null;
    setUrval(null);
  };
  const keys = (e: KeyboardEvent<SVGSVGElement>) => {
    const step = { ArrowLeft: -1, ArrowRight: 1 }[e.key];
    const around = hover ?? Math.round((from + to) / 2);
    if (e.key === "Home" || e.key === "End") setHover(e.key === "Home" ? from : to);
    else if (step) setHover((h) => Math.min(to, Math.max(from, (h ?? Math.min(to, historik.length - 1)) + step)));
    else if (zoomable && (e.key === "+" || e.key === "=")) setZoom(zoomView(around, (to - from) / 2, full));
    else if (zoomable && e.key === "-") setZoom(zoomView(around, (to - from) * 2, full));
    else if (zoomable && e.key === "Escape" && view) setZoom(null);
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
  const labels = typeof xEtiketter === "function" ? xEtiketter(from, to) : xEtiketter.filter((e) => e.index >= from && e.index <= to);
  const nowShown = g.nowX !== undefined && historik.length - 1 >= from && historik.length - 1 <= to;

  return (
    <>
      <div className="n-graf-ram">
        {/* Zoomed in: the way back sits in the chart's top right corner, with a zoom-out icon (owner, 2026-10-25). */}
        {view && (
          <Knapp variant="sekundar" className="n-graf__allt" onClick={() => setZoom(null)}>
            <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
              <circle cx="6.5" cy="6.5" r="5" fill="none" stroke="currentColor" strokeWidth="1.8" />
              <path d="M4 6.5h5M10.2 10.2 14.5 14.5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            {COPY["graf.zoom.reset"]}
          </Knapp>
        )}
        <svg
          className="n-graf"
          viewBox={`0 0 ${layout.width} ${hojd}`}
          role="img"
          aria-label={beskrivning}
          {...(tidtext && {
            tabIndex: 0,
            onPointerMove: move,
            onPointerDown: down,
            onPointerUp: up,
            onPointerCancel: up,
            // A finger "leaves" as it lifts; keep the card until a tap elsewhere takes the focus away.
            onPointerLeave: (e: PointerEvent<SVGSVGElement>) => e.pointerType !== "touch" && drag.current === null && setHover(null),
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
          <clipPath id={clip}>
            <rect x={layout.padLeft - 3} y="0" width={layout.width - layout.padLeft - layout.padRight + 6} height={hojd} />
          </clipPath>
          <g clipPath={`url(#${clip})`}>
            {g.band90 && <path className="n-graf__band90" d={g.band90} />}
            {g.band50 && <path className="n-graf__band50" d={g.band50} />}
            {g.median && <path className="n-graf__median" d={g.median} />}
            {g.outcome && <path className="n-graf__utfall" d={g.outcome} />}
            <path className={["n-graf__historik", tonadHistorik && "n-graf__historik--tonad"].filter(Boolean).join(" ")} d={g.history} />
          </g>
          {urval && (
            <rect
              className="n-graf__urval"
              x={Math.min(g.x(urval[0]), g.x(urval[1]))}
              y={layout.padTop}
              width={Math.abs(g.x(urval[1]) - g.x(urval[0]))}
              height={bottom - layout.padTop}
            />
          )}
          {nowShown && g.nowX !== undefined && (
            <>
              <line className="n-graf__nu" x1={g.nowX} x2={g.nowX} y1={10} y2={bottom + 6} />
              {foreText && <text className="n-graf__etikett" x={g.nowX - 12} y="20" textAnchor="end">{foreText}</text>}
              {efter && <text className={utfall ? "n-graf__etikett" : "n-graf__nu-text"} x={g.nowX + 12} y="20">{efter}</text>}
          </>
        )}
        {markeringar.map((m) => {
          const px = g.x(m.index), py = g.y(m.varde);
          return (
            <g key={m.text} className="n-graf__markering" aria-hidden="true">
              <line x1={px} y1={py} x2={px + m.dx} y2={py + m.dy} />
              <circle cx={px} cy={py} r="4" />
              <text x={px + m.dx} y={py + m.dy + (m.dy < 0 ? -8 : 20)} textAnchor="middle">{m.text}</text>
            </g>
          );
        })}
        {labels.map((e) => (
          <text key={`${e.index}-${e.text}`} className="n-graf__etikett" x={g.x(e.index)} y={hojd - 6}>{e.text}</text>
        ))}
        {hover !== null && (
          <g aria-hidden="true">
            <line className="n-graf__guide" x1={g.x(hover)} x2={g.x(hover)} y1={layout.padTop} y2={bottom} />
            {dots.map(([linje, v]) => <circle key={linje} className={`n-graf__punkt n-graf__punkt--${linje}`} cx={g.x(hover)} cy={g.y(v)} r="5" />)}
          </g>
        )}
      </svg>
      {zoomable && tidtext && (
        <div className="n-graf__zoom liten">
          {view ? (
            t("graf.zoom.shown", { start: tidtext(from), slut: tidtext(to) })
          ) : (
            <>
              {COPY["graf.zoom.hint"]}
              <span className="n-dold"> {COPY["graf.zoom.keys"]}</span>
            </>
          )}
        </div>
      )}
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
    </>
  );
}
