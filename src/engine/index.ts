// createForecaster(): the UI's only way in to the engine.
import type { Backtest, Forecast, Forecaster, Progress } from "./Forecaster.ts";
import type { RequestBody, Response } from "./protocol.ts";

export type * from "./Forecaster.ts";

type Pending = { resolve: (v: unknown) => void; reject: (e: Error) => void; onProgress?: Progress };

/**
 * `before` runs once before the worker starts: the app waits there for the service worker, since only a worker
 * created under its control has its model downloads cached for offline use.
 */
export function createForecaster(before: () => Promise<unknown> = async () => {}): Forecaster {
  const pending = new Map<number, Pending>();
  let next = 0;
  let ready: Promise<void> | null = null;
  let started: Promise<Worker> | null = null;
  const start = () => (started ??= before().catch(() => {}).then(() => {
    const worker = new Worker(new URL("./worker.ts", import.meta.url), { type: "module" });
    worker.onmessage = onmessage;
    worker.onerror = onerror;
    return worker;
  }));

  const onmessage = ({ data }: MessageEvent<Response>) => {
    const p = pending.get(data.id);
    if (!p) return;
    if (data.type === "progress") return p.onProgress?.(data.loaded, data.total);
    pending.delete(data.id);
    if (data.type === "result") p.resolve(data.result);
    else p.reject(new Error(data.message));
  };
  // A worker that fails to start or crashes leaves nothing to answer the open requests.
  const onerror = (e: ErrorEvent) => {
    for (const p of pending.values()) p.reject(new Error(e.message || "The forecasting worker stopped."));
    pending.clear();
  };

  function send<T>(req: RequestBody, onProgress?: Progress): Promise<T> {
    const id = next++;
    return new Promise<T>((resolve, reject) => {
      pending.set(id, { resolve: resolve as (v: unknown) => void, reject, onProgress });
      void start().then((worker) => worker.postMessage({ ...req, id }));
    });
  }

  return {
    init(onProgress) {
      ready ??= send<void>({ type: "init" }, onProgress).catch((err) => {
        ready = null;
        throw err;
      });
      return ready;
    },
    forecast: (series, horizon, options) => send<Forecast>({ type: "forecast", series, horizon, options }),
    backtest: (series, horizon, options) => send<Backtest>({ type: "backtest", series, horizon, options }),
  };
}

export { backtestSteps, grade, improvement, percentFits, score, SEASON, THRESHOLDS, type Grade, type Score } from "./backtest.ts";
export { EVENTS, eventOn, eventSeries, type EventId } from "./holidays.ts";
export { summarize, type Summary, type Summing } from "./summary.ts";
