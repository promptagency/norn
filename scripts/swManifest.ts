import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { inOfflineCache, type SwManifest } from "../src/sw/core.ts";

/** Every file in dist/ (except sw.js, Cloudflare's _headers, dotfiles and the unused 5M model) with a short content hash. */
export function buildSwManifest(dist: string): SwManifest {
  const manifest: SwManifest = {};
  for (const entry of readdirSync(dist, { recursive: true, withFileTypes: true })) {
    if (!entry.isFile()) continue;
    const file = join(entry.parentPath, entry.name);
    const path = `/${relative(dist, file).split(sep).join("/")}`;
    // Dotfiles (.DS_Store) are not served; one in the list would make every install fail.
    if (path === "/sw.js" || path === "/_headers" || entry.name.startsWith(".") || !inOfflineCache(path)) continue;
    manifest[path] = createHash("sha256").update(readFileSync(file)).digest("hex").slice(0, 12);
  }
  return manifest;
}
