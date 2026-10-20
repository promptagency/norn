// Props for every Norn component. This file is also copied into the design
// system as components/index.d.ts (scripts/build_ds_bundle.mjs), so keep the
// comments useful: they are the component documentation.

import type { ReactNode, ButtonHTMLAttributes } from "react";
import type { ForecastSeries } from "./chart.ts";

/** A button. One `primar` per screen; everything else is `sekundar` or `lank`. */
export interface KnappProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
  variant?: "primar" | "sekundar" | "lank";
  /** Renders an <a> instead of a <button>, for navigation between screens. */
  href?: string;
  children: ReactNode;
}

/** One choice in a row of mutually exclusive choices (horizon, column). */
export interface ValknappProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type"> {
  /** Whether this choice is the selected one. Sets aria-pressed. */
  vald: boolean;
  children: ReactNode;
}

/** Groups Valknapp so screen readers announce them as one set. */
export interface ValgruppProps {
  /** What the choice is about, read by screen readers ("Hur långt fram"). */
  etikett: string;
  children: ReactNode;
}

export interface StegPost {
  namn: string;
  tips: string;
  /** Set on finished steps so they can be revisited. */
  href?: string;
  onClick?: () => void;
}

/** The three norns as steps. Finished steps get a tick and a link; later steps are inert. */
export interface StegProps {
  steg: StegPost[];
  /** Index of the current step, 0 based. */
  aktivt: number;
}

/** File drop zone on Start. */
export interface SlappytaProps {
  onFiler: (files: FileList) => void;
  /** Error shown in the zone, in words. Turns the border to `fel`. */
  fel?: string;
  /** File types the picker offers. */
  accept?: string;
}

/** An example dataset on Start. */
export interface ExempelkortProps {
  /** Frequency and range, e.g. "Per timme sedan 2022". Shown in small caps. */
  overrad: string;
  titel: string;
  /** What the example teaches, one sentence. */
  text: string;
  /** The data source, shown last. */
  kalla: string;
  href?: string;
  onClick?: () => void;
}

/** The grade in Verdandi. Always followed by a sentence that explains it. */
export interface BetygProps {
  niva: "palitlig" | "ungefarlig" | "osaker";
}

/** The one-sentence answer above a chart. Put the amount in <strong>. */
export interface SvarProps {
  children: ReactNode;
}

/** A raised surface for a chart, a question or a group of numbers. */
export interface KortProps {
  children: ReactNode;
  /** Renders a <figure> so a chart and its legend belong together. */
  figur?: boolean;
}

export interface Axeletikett {
  /** Position on the combined time axis: history first, then the forecast. */
  index: number;
  text: string;
}

/**
 * The forecast chart. One component for all three steps:
 * Urd passes only `historik`, Verdandi adds `prognos` and `utfall`, Skuld adds `prognos`.
 * Follows the chart rules in design/DESIGN.md. Values are drawn as given; downsample long
 * histories with `bucketMeans` first.
 */
export interface PrognosgrafProps {
  historik: number[];
  prognos?: ForecastSeries;
  /** What actually happened over the forecast period. Backtest only. */
  utfall?: number[];
  /** Labels on the time axis. Use the user's unit, never "steg". */
  xEtiketter?: Axeletikett[];
  /** Formats a value on the vertical axis, e.g. (v) => `${v} kr`. */
  formatY?: (value: number) => string;
  /** Fixed value range; otherwise from 0 (or the minimum) to the maximum. */
  yIntervall?: [number, number];
  /** Text above the chart, left and right of the now-line. */
  foreText?: string;
  efterText?: string;
  /** Mutes the history so the forecast stands out. */
  tonadHistorik?: boolean;
  /** Height of the drawing in viewBox units; the width is always 1000. */
  hojd?: number;
  /** Describes the chart for screen readers. Required. */
  beskrivning: string;
}

export type Forklaringspost = "historik" | "utfall" | "median" | "median-backtest" | "band50" | "band90";

/** The legend under a chart. Every band is explained in words. */
export interface ForklaringProps {
  poster: Forklaringspost[];
}

/** A collapsible question or "Visa detaljer". Closed by default. */
export interface FragaProps {
  rubrik: string;
  /** `liten` is a text link, used for "Visa detaljer". */
  variant?: "rubrik" | "liten";
  oppen?: boolean;
  children: ReactNode;
}

export type Sakerhetsniva = "median" | "90" | "95";

/** "Hur säker vill du vara?" Three planning levels as radio buttons. */
export interface SakerhetsvalProps {
  varde: Sakerhetsniva;
  onChange: (varde: Sakerhetsniva) => void;
  /** Name of the radio group; unique per page. */
  namn?: string;
}

export interface NyckeltalPost {
  etikett: string;
  varde: string;
  /** Plain text instead of a large number. */
  text?: boolean;
}

/** The numbers behind a grade, under "Visa detaljer". */
export interface NyckeltalProps {
  poster: NyckeltalPost[];
}

/** Logo and, on the step screens, the steps. */
export interface SidhuvudProps {
  /** URL of design/logo/norn-logotyp-positiv.svg (or negativ in the dark theme). */
  logoSrc: string;
  hemHref?: string;
  /** Right-hand side: Steg on step screens, nothing on Start. */
  children?: ReactNode;
}

/** The footer on every screen. Children replace the credits line. */
export interface SidfotProps {
  children?: ReactNode;
}
