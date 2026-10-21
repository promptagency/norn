<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="design/logo/norn-logotyp-negativ.svg">
    <img src="design/logo/norn-logotyp-positiv.svg" alt="Norn" width="320">
  </picture>
</p>

<p align="center">
  <strong>See what is coming in your own numbers.</strong><br>
  Forecasts on your own time series, in your browser. Your data never leaves your computer.
</p>

<p align="center">
  <a href="https://nornor.app">nornor.app</a>
</p>

## What it does

You have numbers over time: sales per day, the electricity bill per month, visitors per week. You want to know what is likely to come, and how sure you can be.

Norn reads a CSV or Excel file (or cells pasted from a spreadsheet), and walks you through three steps named after the three norns who spin the thread of fate:

- **Urd, what has been.** Norn describes your data in one sentence ("Försäljning per dag, från 1 januari 2023 till 30 september 2026. 1 004 dagar, 3 saknas.") and asks if that is right.
- **Verdandi, how well Norn reads it.** Norn hides the last period from itself, forecasts it, and compares with what actually happened. You get a grade (Pålitlig, Ungefärlig or Osäker), a sentence on how close it came, and the chart where you can see the bands do their job.
- **Skuld, what is to come.** The forecast, with the answer in one sentence and two bands: where it lands in half of the cases and in nine of ten. Choose how far ahead, how sure you want to be, and whether a Swedish event like midsommar or julhandeln falls in the period.

It is made for people without a background in statistics: a shop owner, someone with the house's electricity bill, a municipal officer with visitor counts. The interface is Swedish and never says quantile.

It is free and open source, a labs project from [Prompt Agency](https://promptagency.se). An experiment, with no support promise.

## Privacy

- **Your data stays on your computer.** The file is read in your browser, the forecast runs in your browser, and the result is only ever saved when you press Ladda ner. There is no backend and no account.
- **Nothing is stored.** The data lives in memory only; close the tab and it is gone. No cookies, no local storage. A test checks this after a full run.
- **Every request goes to Norn's own address.** The model and the runtime are served from Norn's own origin, and a strict Content Security Policy (`connect-src 'self'`) stops the page from talking to anything else. An end-to-end test lists every request in a full run on each example and fails on any other origin.
- **Visits are counted anonymously.** One page view per visit goes to Prompt Agency's self-hosted Plausible, through a function on Norn's own address (`functions/api/event.ts`). It carries the page address (of its query string only `utm_` tags are kept), the referring page (origin and path) and the site's name. Never your file, its numbers, the forecast or the settings in a copied link. Do Not Track and Global Privacy Control are respected.
- **Kopiera länk** is only offered for the built-in examples, and only carries settings (example, column, horizon, certainty, events).

## What it is not

- Not a guarantee. Norn shows what is likely, not what will happen, and Verdandi says so plainly when it finds no pattern.
- Not an analyst's tool. There is no model choice, no several series at once, no anomaly detection. [amine40's app](https://github.com/amine-athmani/timestral-in-browser) does all of that; Norn is the version for everyone else.
- Not for every kind of data. Hourly, daily, weekly, monthly, quarterly or yearly steps only, and at least 64 values.

## How good is it

What we learned building it, with the numbers in `docs/DATA.md` and `docs/fas0-resultat.md`:

- **The browser matches the original.** Timestral runs in onnxruntime-web (WASM) and agrees with Mistral's Python package. With amine40's fp16 weights the forecasts are within 0.7 percent of the width of the nine-in-ten band; an fp32 export is within 0.05 percent. int8 weights moved the bands too much and were dropped.
- **It is good at rhythm, cautious at peaks.** On Swedish Wikipedia page views Norn finds the right day for every yearly peak, even the Melodifestivalen final that moves every year, but guesses well below the height of short peaks like midsommar. The wide band holds the real value every time.
- **Telling it about events helps a lot.** A plain midsommarafton marker moves Norn's guess for the peak day from 3,944 to 7,845 page views (it was 10,464) and cuts the error over the year by 28 percent.
- **Some series show off, some don't.** Electricity consumption in SE3 is forecast within about 3 percent, a week ahead. The spot price, an earlier example, was off by more than half: it is driven by wind and gas, not by its own history. Göteborg's temperature improved the price forecast by only 2 percent.
- **Some series are just hard.** On toy shop turnover Norn beats "same month last year" by only 3 percent, and says so with the grade Ungefärlig.
- **Totals are cautious.** The model gives a range per day, not for the sum of a month. Norn adds the daily ranges up, which is wider than needed (the real total landed inside it 99 times in 100 in our tests), so Skuld says "i minst nio fall av tio".

## Run it locally

```bash
npm install
npm run dev        # the app at http://localhost:5173, the component gallery at /?galleri
```

`npm run dev`, `build` and `test` first fetch the model files from Hugging Face at a pinned revision, check their checksums and split them into chunks under Cloudflare's 25 MiB limit in `public/model/` (`scripts/fetch-model.mjs`). Node 22.18 or later.

### Tests

```bash
npm test           # Vitest: parsing, detection, the engine against the Python package, grading, events, headers
npm run e2e        # Playwright on the production build: every example end to end, no foreign request, offline, nothing stored
```

`scripts/make_fixtures.py` regenerates the reference forecasts from Mistral's Python package (`pip install -r scripts/requirements.txt`).

### Turning the offline cache off

Norn works offline after the first forecast, through a service worker. If a deploy ever breaks it, build with `SW_KILL=1 npm run build` and deploy that: returning visitors' browsers delete Norn's caches, unregister the service worker and reload from the network. Deploy a normal build to turn it back on.

## How it is built

- Vite, React and TypeScript, plain CSS from the tokens in `design/`. Own SVG chart. PapaParse for CSV, SheetJS for Excel (loaded only for Excel files).
- The model runs in a Web Worker with onnxruntime-web 1.30.0, on several threads thanks to cross-origin isolation.
- Static files on Cloudflare Pages, plus one Pages Function for the anonymous page view.
- `PLAN.md` holds the phases and every decision; `docs/` the UX, architecture, Swedish copy and data notes; `design/` the visual identity.

## Credits

- [Timestral](https://huggingface.co/mistralai/Timestral-28M) by Mistral AI, the time-series model.
- [amine40](https://huggingface.co/amine40)'s ONNX exports (`Timestral-28M-ONNX`, `Timestral-5M-ONNX`) and the JavaScript port of the forecast function from [timestral-in-browser](https://github.com/amine-athmani/timestral-in-browser) (Apache 2.0), vendored unchanged in `src/engine/vendor/`.
- Example data: SCB, retail turnover per trade (CC0); eSett, electricity consumption in SE3 (CC0); Wikimedia, page views on Swedish Wikipedia (CC0).
- Bricolage Grotesque and Figtree, SIL Open Font License 1.1.

## License

The code is MIT, © Prompt Agency AB. Timestral's weights are under Mistral AI's Modified MIT licence, which requires a commercial licence for companies with more than 20 million USD in monthly revenue.
