# DATA.md – example datasets

Norn's examples are real Swedish open data, not synthetic. They are built by `scripts/build_datasets.py`, written to `public/data/` and shipped statically. The app never calls the sources at runtime.

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
| wikipedia | `wikipedia_sv.csv` | day | 2016 | Wikimedia REST API, user page views on sv.wikipedia for Midsommar, Lucia, Melodifestivalen. Default series: melodifestivalen | CC0 |

Notes:

- Since October 2025 the spot price is published per quarter hour. The builder averages it to hours.
- SMHI reports in UTC; the builder shifts temperature to CET. The spot price is in Swedish local time, so the four spring daylight-saving hours are missing (one per year). Handle them as gaps.
- 16 of 34,796 hours lack a temperature value.
- The Wikipedia dataset (3,946 days, 1 January 2016 to 20 October 2026, no gaps) was built on the owner's machine on 2026-10-21. Wikimedia rate-limits shared cloud IPs; rebuild it from a normal connection.

## Backtest with Timestral-28M (2026-10-20)

Last period held out, compared with repeating last season.

| Series | Horizon | Error vs. repeating last season | Inside the 80 % band |
|---|---|---|---|
| e-handel | 12 months | 53 % lower | 75 % |
| sportaffärer | 12 months | 32 % lower | 100 % |
| blomsterhandel | 12 months | 22 % lower | 92 % |
| leksaksaffärer | 12 months | 3 % lower | 67 % |
| elpris SE3 | 7 days | 30 % lower | 99 % |
| Wikipedia, midsommar | 12 months | 30 % lower | 82 % |
| Wikipedia, lucia | 12 months | 19 % lower | 86 % |
| Wikipedia, melodifestivalen | 12 months | 63 % lower | 70 % |

The Wikipedia rows compare with the same day a year earlier. Averages say little for a series that is quiet for 360 days and then peaks, so the peaks were checked on their own (forecast made a year ahead, 2026-10-21):

| Series | Actual peak | Norn's most likely, same day | 90 % band that day |
|---|---|---|---|
| midsommar | 19 June 2026, 10,464 | 3,943 (right day) | 1,033 to 20,240 |
| lucia | 13 December 2025, 12,998 | 3,300 (Norn's own peak a day early) | 1,111 to 23,859 |
| melodifestivalen | 7 March 2026, 4,712 | 4,132 (right day) | 1,223 to 8,728 |

What this means for the UI:

- Leksaksaffärer has the clearest season (December three times a normal month) and is the one where the model barely beats "same as last year". Under the revised grade (2026-10-21) it is Pålitlig on accuracy alone (within 7 percent), and Verdandi says that repeating last year would have done nearly as well. Midsommar is now the honest Ungefärlig: Norn hits the day but misses the height of the peak by far (42 percent off over the year).
- Wikipedia shows the core message of Verdandi with real data: Norn finds the day of every peak, including Melodifestivalen's final, which moves from year to year, but the median is far too low for the short Midsommar and Lucia peaks. The 90 % band still holds the real value every time. Trust the bands more than the line. Melodifestivalen is the default series because it makes the best first impression; Midsommar and Lucia stay as choices in Urd and show the honest case.
- Göteborg temperature as a known-future covariate lowers the SE3 price error by only 2 percent (0.293 → 0.286 kr/kWh). The price is driven more by wind and gas than by Göteborg's temperature. The covariate example works technically but proves little. Open question in `PLAN.md`.

## Adding a dataset

1. Add a builder function to `scripts/build_datasets.py` and an entry in `examples.json` through it.
2. Prefer Swedish official or open sources with a clear licence. Record source, URL and licence.
3. Run a backtest and add the row above before the example ships.
