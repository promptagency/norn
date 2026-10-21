# Deploys and the offline cache

Adapted from Skrubba's `docs/DEPLOY.md`; the same setup, the same lessons.

## Hosting

Norn is a static site on Cloudflare Pages, project `norn`, built from `main` on GitHub (`promptagency/norn`). Every push to `main` deploys; other branches get preview URLs.

| Setting | Value |
|---|---|
| Framework preset | None |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Node version | from `.node-version` (24) |
| Pages address | `norn-3ke.pages.dev` (`norn.pages.dev` was taken) |
| Custom domain | `nornor.app`: a proxied CNAME to `norn-3ke.pages.dev` in the `nornor.app` zone, plus the domain under the project's Custom domains |
| Web Analytics | Off. It injects a script from another origin, which the CSP blocks and the privacy promise forbids. Visits are counted with our own Plausible instead (below) |

`www.nornor.app` redirects to `https://nornor.app` with a 301 that keeps path and query: an AAAA record `100::`, proxied, Always Use HTTPS, and one Single Redirect rule in the `nornor.app` zone.

**If a push does not go live.** Skrubba's launch saw deploys fail at the last step with "Failed to publish your Function. Got error: Unknown internal error occurred". It is on Cloudflare's side; retrying the same deployment fixed it every time (Workers & Pages → norn → Deployments → the failed one → Retry deployment).

**Visit counting.** `functions/api/event.ts` passes the page's anonymous page view on to Plausible (`plausible.app.promptagency.se`, site `nornor.app`, which must exist in Plausible). Automated browsers are never counted.

**The model.** The build downloads amine40's ONNX files from Hugging Face at a pinned revision and checks their sha256 (`scripts/fetch-model.mjs`), retrying a 429 up to five times. If amine40's repositories go away, new builds fail loudly while the live site keeps working (open question in `PLAN.md`).

**After a deploy**, run the end-to-end suite against the live site: `NORN_URL=https://nornor.app npm run e2e`. On the first live run it found a race local runs had missed: example data fetched before the service worker took control was never cached, so offline use failed now and then. Example data is now fetched under its control, like the model.

**The monthly data rebuild.** `.github/workflows/data.yml` runs on the 2nd of every month (and by hand under Actions → Data). It refetches the example data and runs every test with it. All green: it commits to `main` as github-actions[bot], which deploys like any push. A failure: the data goes to a branch `data/<year-month>` and an issue explains, and nothing goes live. A source that fails keeps its old file; Wikimedia in particular rate-limits cloud addresses, and the build log in the commit or issue says so.

## The offline cache

Browsers fetch `/sw.js` fresh on every visit (`public/_headers` sets `Cache-Control: no-cache`; do not override it in Cloudflare). Each build bakes a content hash of every file into it, so any change gives a new `sw.js`, installed in the background and used from the next load. The previous build's files are kept one more cycle for tabs still open on it. The app shell is fetched from `/`, since Cloudflare redirects `/index.html` there and a cached redirect breaks return visits.

**Kill switch.** If the service worker misbehaves in production:

```sh
SW_KILL=1 npm run build   # then deploy dist/ as usual
```

Every returning visitor gets a service worker that deletes Norn's caches, unregisters itself and reloads the tab. Caches hold app files, the model and example data only; Norn never stores the user's data. Deploy a normal build to turn it back on.
