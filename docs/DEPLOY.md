# Deploys and the offline cache

Adapted from Skrubba's `docs/DEPLOY.md`; the same setup, the same lessons.

## Hosting

Norn is a static site on Cloudflare Pages, project `norn`, built from `main` on GitHub (`promptagency/norn`). Every push to `main` deploys; other branches get preview URLs, `dev` at `https://dev.norn-3ke.pages.dev`.

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

## Branches

Two branches, since 2026-10-23 (owner's decision, as in Skrubba and VemSaVad):

- **`dev`** is where all work happens. Every push runs the type check, the unit tests and the full browser suite on GitHub, and Cloudflare builds a preview at `https://dev.norn-3ke.pages.dev`, where `NORN_URL=https://dev.norn-3ke.pages.dev npm run e2e` checks the real thing before it goes live. Previews count no visits (`src/ui/analytics.ts` only counts on `nornor.app`). The monthly data rebuild commits here too.
- **`main`** is production: Cloudflare deploys every push to `nornor.app`. Nothing is committed on `main` directly. It only moves by being fast-forwarded to `dev` at a release, so `main` is always a released, tagged state and `git log main` is the release history.

A ruleset on GitHub ("main is production", since the repo went public on 2026-10-23) enforces it: `main` cannot be deleted or force-pushed, and a push to it is refused unless the commit has passed `checks` and `browser`, which every push to `dev` runs. So release only a commit that is green on `dev`. A push that only touches Markdown or `docs/` runs no tests, so when the newest commit on `dev` is one of those, start the tests on it by hand first (`gh workflow run test.yml --ref dev`, or Actions → Tests → Run workflow on `dev`) and release once that run is green.

A hotfix takes the same path: commit on `dev`, release.

## Releasing a version

Versions follow [Semantic Versioning](https://semver.org/): a bug fix bumps the last number (0.1.1), a new feature the middle one (0.2.0), and a change that breaks something users rely on, such as the downloaded CSV's columns or a shared link, the first.

1. While working on `dev`, note each user-visible change under `## [Unreleased]` in `CHANGELOG.md`.
2. To release, with `dev` green on GitHub and checked on its preview, rename that section to `## [X.Y.Z] - YYYY-MM-DD`, add a new empty `## [Unreleased]` above it, and update the compare links at the bottom.
3. Set the version, commit and tag on `dev`, wait for the tests on that commit, then move `main` to it:

   ```sh
   npm version X.Y.Z --no-git-tag-version   # package.json and package-lock.json
   git commit -am "Release X.Y.Z"
   git tag -a vX.Y.Z -m "Norn X.Y.Z"
   git push --follow-tags origin dev
   gh run watch "$(gh run list --branch dev --limit 1 --json databaseId --jq '.[0].databaseId')"
   git push origin dev:main                 # fast-forward: this deploys
   ```

`main`'s ruleset refuses the last push until `checks` and `browser` have passed on the release commit (about six minutes), which is why the run on `dev` is waited for first. Pushing the tag runs the full browser suite on GitHub once more (`.github/workflows/test.yml`), against the same commit `main` now deploys. Once it has passed, the workflow creates the GitHub release page, titled "Norn X.Y.Z", with that version's section from `CHANGELOG.md` as the notes (`scripts/release-notes.ts`). A version with failing tests gets no page; fix it on `dev` and release the next patch version. The page is only a label: the site was already deployed when `main` was pushed. Then run the end-to-end suite against the live site (below).

The footer shows the version from `package.json`, built into the app. A unit test (`scripts/changelog.test.ts`) fails if `CHANGELOG.md` has no entry for that version.

## Problems and checks

**If a push does not go live.** Skrubba's launch saw deploys fail at the last step with "Failed to publish your Function. Got error: Unknown internal error occurred". It is on Cloudflare's side; retrying the same deployment fixed it every time (Workers & Pages → norn → Deployments → the failed one → Retry deployment).

**Visit counting.** `functions/api/event.ts` passes the page's anonymous page view on to Plausible (`plausible.app.promptagency.se`, site `nornor.app`, which must exist in Plausible). Automated browsers are never counted.

**The model.** The build downloads amine40's ONNX files from Hugging Face at a pinned revision and checks their sha256 (`scripts/fetch-model.mjs`), retrying a 429 up to five times. If amine40's repositories go away, new builds fail loudly while the live site keeps working (open question in `PLAN.md`).

**After a deploy**, run the end-to-end suite against the live site: `NORN_URL=https://nornor.app npm run e2e`. On the first live run it found a race local runs had missed: example data fetched before the service worker took control was never cached, so offline use failed now and then. Example data is now fetched under its control, like the model.

Playwright's WebKit is not Safari. `npm run e2e:safari` runs the examples and an own CSV in real Safari on a Mac against `nornor.app` (`scripts/safari.mjs`, which says how to allow it once). It sees only the page's own requests, not the worker's, and cannot go offline, so it adds to the suite rather than replacing it.

**The monthly data rebuild.** `.github/workflows/data.yml` runs on the 2nd of every month (and by hand under Actions → Data). It refetches the example data and runs every test with it. All green: it commits to `dev` as github-actions[bot] and starts the Tests workflow on that commit (a push by the workflow itself starts none, and `main`'s ruleset needs those results), and the new data goes live with the next release. A failure: the data goes to a branch `data/<year-month>` and an issue explains, and nothing goes live. A source that fails keeps its old file; Wikimedia in particular rate-limits cloud addresses, and the build log in the commit or issue says so.

## The offline cache

Browsers fetch `/sw.js` fresh on every visit (`public/_headers` sets `Cache-Control: no-cache`; do not override it in Cloudflare). Each build bakes a content hash of every file into it, so any change gives a new `sw.js`, installed in the background and used from the next load. The previous build's files are kept one more cycle for tabs still open on it. The app shell is fetched from `/`, since Cloudflare redirects `/index.html` there and a cached redirect breaks return visits.

**Kill switch.** If the service worker misbehaves in production:

```sh
SW_KILL=1 npm run build   # then deploy dist/ as usual
```

Every returning visitor gets a service worker that deletes Norn's caches, unregisters itself and reloads the tab. Caches hold app files, the model and example data only; Norn never stores the user's data. Deploy a normal build to turn it back on.
