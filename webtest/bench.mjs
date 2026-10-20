// Run the exported core in onnxruntime-web's WASM backend (same engine as the browser) and time it.
import * as ort from 'onnxruntime-web';
import { readFileSync } from 'node:fs';

const file = process.argv[2] ?? '../export/28m/model_fp16.onnx';
const threads = Number(process.argv[3] ?? 1);
ort.env.wasm.numThreads = threads;

const R = 2, L = 63, PS = 32, H = 3, T = L * PS;
const feeds = {
  scaled: new ort.Tensor('float32', Float32Array.from({ length: R * T }, () => Math.random() * 2 - 1), [R, T]),
  observed: new ort.Tensor('bool', new Uint8Array(R * T).fill(1), [R, T]),
  key_valid: new ort.Tensor('bool', new Uint8Array(R * L).fill(1), [R, L]),
  positions: new ort.Tensor('int64', BigInt64Array.from({ length: R * (L + H) }, (_, i) => BigInt(i % (L + H))), [R, L + H]),
  dec_dummy: new ort.Tensor('float32', new Float32Array(R * H), [R, H]),
};

const t0 = performance.now();
const sess = await ort.InferenceSession.create(readFileSync(file).buffer, { executionProviders: ['wasm'] });
const t1 = performance.now();
await sess.run(feeds); // warm-up
const times = [];
for (let i = 0; i < 5; i++) { const s = performance.now(); await sess.run(feeds); times.push(performance.now() - s); }
const out = (await sess.run(feeds)).quantiles;
console.log(`${file.split('/').slice(-2).join('/')} threads=${threads} load=${(t1 - t0).toFixed(0)}ms run(R=${R},T=${T},H=${H * PS})=${Math.min(...times).toFixed(0)}ms (min of 5) out=${out.dims}`);
