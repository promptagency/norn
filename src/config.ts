// Product name, address and model hosting. The only place these live (see CLAUDE.md).

export const PRODUCT_NAME = "Norn";
export const PRODUCT_URL = "https://nornor.app";

// amine40's fp16 ONNX exports, pinned by revision and checksum. scripts/fetch-model.mjs fetches them at
// build time and splits them into chunks in public/model/; the browser only ever asks our own origin.
export const MODELS = {
  "28M": {
    hubId: "amine40/Timestral-28M-ONNX",
    revision: "9ca259c817e95b668fb5b3853e4e1edcc6175689",
    file: "timestral-28m.onnx",
    bytes: 59254097,
    sha256: "5c232e3d6aacf51a1f6eb2b18ee355c4ef35bf52fd716839954acae6de6e2cfa",
  },
  "5M": {
    hubId: "amine40/Timestral-5M-ONNX",
    revision: "83c332168e8ab5d78d11ac74850202a59dcc7d31",
    file: "timestral-5m.onnx",
    bytes: 13274175,
    sha256: "13773030cc3d61a980542ebca834ebf4dd576ddc530e771119b12394514f59c9",
  },
} as const;

export type ModelSize = keyof typeof MODELS;
export const DEFAULT_MODEL: ModelSize = "28M";

// Cloudflare Pages serves files up to 25 MiB.
export const CHUNK_BYTES = 24 * 1024 * 1024;

// Folder named by revision, so a new model never mixes with a cached old one.
export function modelChunkUrls(size: ModelSize): string[] {
  const m = MODELS[size];
  const n = Math.ceil(m.bytes / CHUNK_BYTES);
  return Array.from({ length: n }, (_, i) => `/model/${m.revision.slice(0, 12)}/${m.file}.${i}`);
}
