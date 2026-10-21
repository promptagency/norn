// Fetch the pinned Timestral ONNX files and split them into chunks under Cloudflare's 25 MiB limit.
// Runs before dev, build and test; does nothing when the files are already in place.
//
//   .cache/model/<file>                      the whole file, sha256-checked (the Node tests read this)
//   public/model/<revision>/<file>.<i>       the chunks the worker fetches and joins (see src/config.ts)

import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { CHUNK_BYTES, MODELS, modelChunkUrls } from "../src/config.ts";

const sha256 = (buf) => createHash("sha256").update(buf).digest("hex");

// Hugging Face sometimes answers 429 when several builds run close together (Skrubba's launch, docs/DEPLOY.md).
async function fetchWithRetry(url, tries = 5) {
  for (let i = 1; ; i++) {
    const res = await fetch(url);
    if (res.ok || i === tries || (res.status !== 429 && res.status < 500)) return res;
    const wait = Number(res.headers.get("retry-after")) * 1000 || 2000 * 2 ** i;
    console.log(`${url}: ${res.status}, trying again in ${Math.round(wait / 1000)} s`);
    await new Promise((r) => setTimeout(r, wait));
  }
}
const wanted = new Set();

for (const [size, m] of Object.entries(MODELS)) {
  const raw = join(".cache/model", m.file);
  if (!existsSync(raw) || sha256(readFileSync(raw)) !== m.sha256) {
    const url = `https://huggingface.co/${m.hubId}/resolve/${m.revision}/${m.file}`;
    console.log(`fetching ${url}`);
    const res = await fetchWithRetry(url);
    if (!res.ok) throw new Error(`${url}: ${res.status} ${res.statusText}`);
    const buf = Buffer.from(await res.arrayBuffer());
    if (sha256(buf) !== m.sha256) throw new Error(`checksum mismatch for ${m.file}, refusing to use it`);
    mkdirSync(dirname(raw), { recursive: true });
    writeFileSync(raw, buf);
  }
  const urls = modelChunkUrls(size);
  urls.forEach((u) => wanted.add(join("public", u)));
  if (urls.every((u) => existsSync(join("public", u)))) continue;
  const buf = readFileSync(raw);
  urls.forEach((u, i) => {
    mkdirSync(dirname(join("public", u)), { recursive: true });
    writeFileSync(join("public", u), buf.subarray(i * CHUNK_BYTES, (i + 1) * CHUNK_BYTES));
  });
  console.log(`${m.file}: ${urls.length} chunks`);
}

// Drop chunks from older revisions.
for (const f of readdirSync("public/model", { recursive: true })) {
  const p = join("public/model", f);
  if (p.includes(".onnx.") && !wanted.has(p)) rmSync(p);
}
