// The engine's interface. The UI imports only this file and index.ts, never onnxruntime-web or the vendor code.

/** One series, oldest first. null where a value is missing. */
export type Series = (number | null)[];

export interface ForecastOptions {
  /** Series known in advance (holidays, a weather forecast), each covering the history plus the horizon. */
  known?: Series[];
}

export interface Band {
  low: number[];
  high: number[];
}

/** One value per step ahead. */
export interface Forecast {
  median: number[];
  /** Half of outcomes fall inside (0.25 to 0.75). */
  band50: Band;
  /** Nine of ten fall inside (0.05 to 0.95). */
  band90: Band;
  /** All 21 levels per step, for the download. */
  quantiles: number[][];
  levels: number[];
}

/** A forecast from before the last `horizon` steps, next to what actually happened. */
export interface Backtest {
  forecast: Forecast;
  actual: Series;
}

export type Progress = (loaded: number, total: number) => void;

export interface Forecaster {
  /** Downloads and loads the model once. Later calls return the same promise. */
  init(onProgress?: Progress): Promise<void>;
  forecast(series: Series, horizon: number, options?: ForecastOptions): Promise<Forecast>;
  backtest(series: Series, horizon: number, options?: ForecastOptions): Promise<Backtest>;
}
