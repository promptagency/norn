// Runs Timestral off the main thread: loads the model once from our own origin, then answers requests in order.
import * as ort from "onnxruntime-web/wasm";
import mjsUrl from "onnxruntime-web/ort-wasm-simd-threaded.mjs?url";
import wasmUrl from "onnxruntime-web/ort-wasm-simd-threaded.wasm?url";
import { DEFAULT_MODEL, MODELS, modelChunkUrls } from "../config.ts";
import type { Request, Response } from "./protocol.ts";
import { runBacktest, runForecast } from "./run.ts";

// Vite serves the runtime as hashed assets. The .mjs is needed too: with cross-origin isolation
// onnxruntime runs several threads, and each thread worker loads it by URL.
ort.env.wasm.wasmPaths = { wasm: wasmUrl, mjs: mjsUrl };

const post = (msg: Response) => postMessage(msg);

/** Fetches the chunks one after another into a single buffer, reporting bytes as they arrive. */
async function download(id: number): Promise<Uint8Array> {
  const total = MODELS[DEFAULT_MODEL].bytes;
  const bytes = new Uint8Array(total);
  let loaded = 0;
  for (const url of modelChunkUrls(DEFAULT_MODEL)) {
    const res = await fetch(url);
    if (!res.ok || !res.body) throw new Error(`Could not download the model (${res.status}).`);
    const reader = res.body.getReader();
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      if (loaded + value.length > total) throw new Error("The model download is larger than expected.");
      bytes.set(value, loaded);
      loaded += value.length;
      post({ id, type: "progress", loaded, total });
    }
  }
  if (loaded !== total) throw new Error("The model download is incomplete.");
  return bytes;
}

let session: Promise<ort.InferenceSession> | null = null;
const load = (id: number) =>
  (session ??= download(id)
    .then((bytes) => ort.InferenceSession.create(bytes, { executionProviders: ["wasm"] }))
    .catch((err) => {
      session = null;
      throw err;
    }));

async function handle(req: Request) {
  try {
    const s = await load(req.id);
    const result =
      req.type === "init"
        ? null
        : await (req.type === "forecast" ? runForecast : runBacktest)(ort, s, req.series, req.horizon, req.options);
    post({ id: req.id, type: "result", result });
  } catch (err) {
    post({ id: req.id, type: "error", message: err instanceof Error ? err.message : String(err) });
  }
}

// One at a time: an onnxruntime session runs a single inference at once.
let queue = Promise.resolve();
onmessage = ({ data }: MessageEvent<Request>) => {
  queue = queue.then(() => handle(data));
};
