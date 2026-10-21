// createForecaster(): the UI's only way in to the engine.
import type { Backtest, Forecast, Forecaster, Progress } from "./Forecaster.ts";
import type { RequestBody, Response } from "./protocol.ts";

export type * from "./Forecaster.ts";

type Pending = { resolve: (v: unknown) => void; reject: (e: Error) => void; onProgress?: Progress };

export function createForecaster(): Forecaster {
  const worker = new Worker(new URL("./worker.ts", import.meta.url), { type: "module" });
  const pending = new Map<number, Pending>();
  let next = 0;
  let ready: Promise<void> | null = null;

  worker.onmessage = ({ data }: MessageEvent<Response>) => {
    const p = pending.get(data.id);
    if (!p) return;
    if (data.type === "progress") return p.onProgress?.(data.loaded, data.total);
    pending.delete(data.id);
    if (data.type === "result") p.resolve(data.result);
    else p.reject(new Error(data.message));
  };
  // A worker that fails to start or crashes leaves nothing to answer the open requests.
  worker.onerror = (e) => {
    for (const p of pending.values()) p.reject(new Error(e.message || "The forecasting worker stopped."));
    pending.clear();
  };

  function send<T>(req: RequestBody, onProgress?: Progress): Promise<T> {
    const id = next++;
    return new Promise<T>((resolve, reject) => {
      pending.set(id, { resolve: resolve as (v: unknown) => void, reject, onProgress });
      worker.postMessage({ ...req, id });
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
