// Pure parts of the service worker (src/sw/sw.ts), kept apart for testing.

/** URL path → content revision. Written into sw.js at build time. */
export type SwManifest = Record<string, string>;

export const cacheKey = (path: string, rev: string) => `${path}?__rev=${rev}`;

/** Message the page sends a new build that is still waiting, to make it take over. */
export const SKIP_WAITING = "skip-waiting";

/**
 * Small files (examples.json among them) are fetched on install. The model chunks, the runtime and
 * the example CSVs are cached when the app first fetches them, so a visitor who only looks at Start downloads none of it.
 */
export function precacheList(manifest: SwManifest): string[] {
  return Object.keys(manifest).filter((path) => !path.startsWith("/model/") && !path.endsWith(".csv") && !path.endsWith(".wasm"));
}

/** Where the service worker keeps the manifest it activated with, to know the previous build. */
export const MANIFEST_KEY = "/__sw-manifest";

/**
 * Cached request URLs to delete on activate: anything that belongs neither to
 * this build nor to the previous one. The previous build's files stay one
 * more cycle, so a tab still running it never asks for a file that is gone.
 */
export function staleKeys(cachedUrls: string[], current: SwManifest, previous: SwManifest): string[] {
  return cachedUrls.filter((url) => {
    const { pathname, searchParams } = new URL(url);
    if (pathname === MANIFEST_KEY) return false;
    const rev = searchParams.get("__rev");
    return current[pathname] !== rev && previous[pathname] !== rev;
  });
}

/**
 * The URL to fetch a file from. The app shell is cached as /index.html but
 * fetched from /: Cloudflare Pages answers /index.html with a redirect to /,
 * and browsers refuse a redirected response from a service worker for a page
 * load, so returning visitors would get an error page.
 */
export const networkPath = (path: string) => (path === "/index.html" ? "/" : path);

/** A redirected response, copied so it no longer counts as redirected. A second guard for other hosts. */
export async function unredirected(res: Response): Promise<Response> {
  if (!res.redirected) return res;
  return new Response(await res.blob(), { status: res.status, statusText: res.statusText, headers: res.headers });
}

/**
 * A file from the cache, or from the network and then cached. The response goes back while the copy is still
 * being saved, so the page sees a model chunk arrive byte by byte: waiting for the save showed no download
 * progress for a whole 25 MB chunk, and on a slow line Verdandi said "räknar" all through the download.
 */
export async function cacheFirst(cache: Cache, path: string, rev: string, waitUntil: (p: Promise<unknown>) => void, get = fetch): Promise<Response> {
  const key = cacheKey(path, rev);
  const hit = await cache.match(key);
  if (hit) return hit;
  const res = await unredirected(await get(networkPath(path)));
  if (res.ok) waitUntil(cache.put(key, res.clone()));
  return res;
}
