import { COPY } from "../copy.ts";
import { DEFAULT_LAYOUT, layoutChart } from "./chart.ts";
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
  beskrivning,
}: PrognosgrafProps) {
  const layout = { ...DEFAULT_LAYOUT, height: hojd };
  const g = layoutChart(historik, prognos, utfall, layout, yIntervall);
  const bottom = hojd - layout.padBottom;
  const efter = efterText ?? (prognos && !utfall ? COPY["chart.now"] : undefined);
  return (
    <svg className="n-graf" viewBox={`0 0 ${layout.width} ${hojd}`} role="img" aria-label={beskrivning}>
      {g.yTicks.map((t) => (
        <text key={t.value} className="n-graf__etikett" x="0" y={t.y + 4}>{formatY(t.value)}</text>
      ))}
      {g.yTicks.map((t) => (
        <line key={`r${t.value}`} className="n-graf__rutnat" x1={layout.padLeft} x2={layout.width - layout.padRight} y1={t.y} y2={t.y} />
      ))}
      <line className="n-graf__baslinje" x1={layout.padLeft} x2={layout.width - layout.padRight} y1={g.baseY} y2={g.baseY} />
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
    </svg>
  );
}
