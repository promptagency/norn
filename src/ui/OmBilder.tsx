// The pictures on "Så fungerar Norn" (owner, 2026-10-25): drawn from the components and the made-up numbers in
// illustration.ts, not screenshots, so they follow the theme and the design.
import { DEFAULT_LAYOUT, Forklaring, Kort, layoutChart, Prognosgraf } from "./components/index.ts";
import { COPY } from "./copy.ts";
import { HISTORY, ILLUSTRATION, MEDIAN, RANGE, SPREAD, TEST } from "./illustration.ts";

const blank = () => "";
const n = HISTORY.length;

/** "Så läser du banden": the forecast with labels on what the text names. */
export function BandBild() {
  const at = (k: number) => n + k; // the k-th step ahead on the time axis
  return (
    <Kort figur>
      <Prognosgraf
        historik={HISTORY}
        prognos={ILLUSTRATION}
        yIntervall={RANGE}
        formatY={blank}
        hojd={420}
        beskrivning={COPY["om.fig.bands"]}
        markeringar={[
          // Above: the most likely line and the wide band. Below: the narrow band and the widening.
          { index: at(2), varde: MEDIAN[2], text: COPY["legend.median"], dx: -170, dy: -130 },
          { index: at(6), varde: MEDIAN[6] + SPREAD.band90(7), text: COPY["legend.band90"], dx: 0, dy: -55 },
          { index: at(5), varde: MEDIAN[5] - SPREAD.band50(6), text: COPY["legend.band50"], dx: -150, dy: 150 },
          { index: at(10), varde: MEDIAN[10] - SPREAD.band90(11), text: COPY["om.fig.bands.wider"], dx: -90, dy: 90 },
        ]}
      />
      <Forklaring poster={["median", "band50", "band90"]} />
    </Kort>
  );
}

/** "Så går det till": the three steps as three small charts. */
export function StegBilder() {
  const liten = { yIntervall: RANGE, formatY: blank, hojd: 560 };
  return (
    <div className="om__bilder">
      <Kort figur rubrik={COPY["om.fig.urd"]}>
        <Prognosgraf historik={HISTORY} {...liten} beskrivning={COPY["om.fig.urd.desc"]} />
      </Kort>
      <Kort figur rubrik={COPY["om.fig.verdandi"]}>
        <Prognosgraf historik={TEST.history} prognos={TEST.guess} utfall={TEST.actual} efterText="" {...liten} beskrivning={COPY["om.fig.verdandi.desc"]} />
      </Kort>
      <Kort figur rubrik={COPY["om.fig.skuld"]}>
        <Prognosgraf historik={HISTORY} prognos={ILLUSTRATION} tonadHistorik efterText="" {...liten} beskrivning={COPY["om.fig.skuld.desc"]} />
      </Kort>
    </div>
  );
}

/** "Din data stannar hos dig": what comes in, what stays, and the one thing that goes out. */
export function Flode() {
  return (
    <figure className="om__flode">
      <div className="om__flode-in">
        <span className="om__flode-ruta">{COPY["om.flow.in.what"]}</span>
        <span className="liten dampad">↓ {COPY["om.flow.in"]}</span>
      </div>
      <div className="om__flode-dator">
        <span className="etikett">{COPY["om.flow.computer"]}</span>
        <div className="om__flode-rad">
          <span className="om__flode-ruta">{COPY["om.flow.file"]}</span>
          <span aria-hidden="true">→</span>
          <span className="om__flode-ruta om__flode-ruta--norn">{COPY["om.flow.norn"]}</span>
          <span aria-hidden="true">→</span>
          <span className="om__flode-ruta">{COPY["om.flow.result"]}</span>
        </div>
      </div>
      <p className="liten dampad">↑ {COPY["om.flow.out"]}</p>
      <figcaption className="brod-stark">{COPY["om.flow.caption"]}</figcaption>
    </figure>
  );
}

// The 21 levels the model gives (src/engine/vendor), as distances from the median in standard deviations.
const Z = [-2.326, -1.645, -1.282, -1.036, -0.842, -0.674, -0.524, -0.385, -0.253, -0.126, 0, 0.126, 0.253, 0.385, 0.524, 0.674, 0.842, 1.036, 1.282, 1.645, 2.326];
const SHOWN: Record<number, string> = { [-1.645]: "kant90", [-0.674]: "kant50", 0: "median", 0.674: "kant50", 1.645: "kant90" };

/** "För den som vill veta mer": the model's 21 quantiles as thin lines, the five Norn shows picked out. */
export function KvantilBild() {
  const layout = { ...DEFAULT_LAYOUT, height: 360 };
  const g = layoutChart(HISTORY, ILLUSTRATION, undefined, layout, RANGE);
  // The nine-in-ten band reaches 1.645 standard deviations; the other levels are spread the same way.
  const line = (z: number) =>
    [[n - 1, HISTORY[n - 1]], ...MEDIAN.map((v, k) => [n + k, v + (z / 1.645) * SPREAD.band90(k + 1)])]
      .map(([i, v], k) => `${k ? "L" : "M"}${g.x(i).toFixed(1)} ${g.y(v).toFixed(1)}`)
      .join("");
  return (
    <figure className="n-kort om__kvantiler">
      <svg className="n-graf" viewBox={`0 0 ${layout.width} ${layout.height}`} role="img" aria-label={COPY["om.fig.quantiles"]}>
        <path className="n-graf__historik n-graf__historik--tonad" d={g.history} />
        {Z.map((z) => <path key={z} className={`om__kvantil om__kvantil--${SHOWN[z] ?? "ovrig"}`} d={line(z)} />)}
        <line className="n-graf__nu" x1={g.nowX} x2={g.nowX} y1={10} y2={layout.height - layout.padBottom + 6} />
      </svg>
      <figcaption className="liten dampad">{COPY["om.fig.quantiles.caption"]}</figcaption>
    </figure>
  );
}
