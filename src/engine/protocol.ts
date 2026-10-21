// Messages between index.ts and worker.ts.
import type { Backtest, Forecast, ForecastOptions, Series } from "./Forecaster.ts";

export type RequestBody =
  | { type: "init" }
  | { type: "forecast" | "backtest"; series: Series; horizon: number; options?: ForecastOptions };

export type Request = RequestBody & { id: number };

export type Response =
  | { id: number; type: "progress"; loaded: number; total: number }
  | { id: number; type: "result"; result: Forecast | Backtest | null }
  | { id: number; type: "error"; message: string };
