# DATA.md – example datasets

Norn's examples are real Swedish open data, not synthetic. They are built by `scripts/build_datasets.py`, written to `app/public/data/` (moving to `public/data/` in Phase 1) and shipped statically. The app never calls the sources at runtime.

```
python scripts/build_datasets.py              # all
python scripts/build_datasets.py scb el wiki  # a subset
```

`examples.json` holds, per example: `id`, `title`, `frequency`, `file`, `time` (column), `targets` (column → what it teaches), `default_target`, `covariates` (column → why it helps), `unit`, `description`, `source`, `source_url`, `license`. The UI reads everything it shows about an example from there.

## Datasets

| id | File | Frequency | Since | Source | Licence |
|---|---|---|---|---|---|
| detaljhandel | `scb_detaljhandel.csv` | month | 1991 | SCB, Detaljhandelns omsättning efter näringsgren (DetOms07N), current prices, index 2021 = 100. Columns: leksaksaffärer, blomsterhandel, sportaffärer, e-handel | CC0 |
| elpris | `elpris_se3_temp_goteborg.csv` | hour | Nov 2022 | Spot price SE3 from elprisetjustnu.se (Nord Pool via ENTSO-E, free, no guarantee); temperature from SMHI station 71420 Göteborg A | Price free without guarantee, temperature CC BY 4.0 SMHI |
| wikipedia | `wikipedia_sv.csv` | day | 2016 | Wikimedia REST API, page views on sv.wikipedia for Midsommar, Lucia, Melodifestivalen | CC0 |

Notes:

- Since October 2025 the spot price is published per quarter hour. The builder averages it to hours.
- SMHI reports in UTC; the builder shifts temperature to CET. The spot price is in Swedish local time, so the four spring daylight-saving hours are missing (one per year). Handle them as gaps.
- 16 of 34,796 hours lack a temperature value.
- The Wikipedia dataset is not built yet. Wikimedia rate-limits the cloud container; run the builder from the owner's machine.

## Backtest with Timestral-28M (2026-10-20)

Last period held out, compared with repeating last season.

| Series | Horizon | Error vs. repeating last season | Inside the 80 % band |
|---|---|---|---|
| e-handel | 12 months | 53 % lower | 75 % |
| sportaffärer | 12 months | 32 % lower | 100 % |
| blomsterhandel | 12 months | 22 % lower | 92 % |
| leksaksaffärer | 12 months | 3 % lower | 67 % |
| elpris SE3 | 7 days | 30 % lower | 99 % |

What this means for the UI:

- Leksaksaffärer has the clearest season (December three times a normal month) and is the one where the model barely beats "same as last year". It is a good honest example of Ungefärlig, and a test case for the Verdandi grade.
- Göteborg temperature as a known-future covariate lowers the SE3 price error by only 2 percent (0.293 → 0.286 kr/kWh). The price is driven more by wind and gas than by Göteborg's temperature. The covariate example works technically but proves little. Open question in `PLAN.md`.

## Adding a dataset

1. Add a builder function to `scripts/build_datasets.py` and an entry in `examples.json` through it.
2. Prefer Swedish official or open sources with a clear licence. Record source, URL and licence.
3. Run a backtest and add the row above before the example ships.
