# DATA.md – example datasets

Norn's examples are real Swedish open data, not synthetic. They are built by `scripts/build_datasets.py`, written to `public/data/` and shipped statically. The app never calls the sources at runtime.

The data is rebuilt every month by `.github/workflows/data.yml` (owner's decision 2026-10-21), so Skuld always starts from recent days. If every test passes with the new data it is committed to `main` and deployed; if one fails, usually a grade that moved across a limit, the data waits on a branch `data/<year-month>` and an issue says what failed. The numbers in the tables below are from 2026-10-21 and are not updated by the rebuild.

```
python scripts/build_datasets.py              # all
python scripts/build_datasets.py scb el wiki  # a subset
```

`examples.json` holds, per example: `id`, `title`, `frequency`, `file`, `time` (column), `targets` (column → what it teaches), `default_target`, `labels` (column → the name shown), `card` (the example card's sentence, when the default target's own does not cover the example), `source_short`, `since`, `unit`, `description`, `source`, `source_url`, `license`. The UI reads everything it shows about an example from there.

## Datasets

| id | File | Frequency | Since | Source | Licence |
|---|---|---|---|---|---|
| detaljhandel | `scb_detaljhandel.csv` | month | 1991 | SCB, Detaljhandelns omsättning efter näringsgren (DetOms07N), current prices, index 2021 = 100. Columns: leksaksaffärer, blomsterhandel, sportaffärer, e-handel | CC0 |
| elforbrukning | `se3_elforbrukning.csv` | hour | Nov 2022 | eSett Open Data, consumption per metering balance area (EXP15, `total` = metered + profiled + flex), SE3, MWh per hour, Swedish local time. Replaced the SE3 spot price on 2026-10-21 | CC0 (stated on opendata.esett.com; terms at opendata.esett.com/terms) |
| wikipedia | `wikipedia_sv.csv` | day | 2016 | Wikimedia REST API, user page views on sv.wikipedia for Midsommar, Lucia, Melodifestivalen, Påsk (added 2026-10-21). Default series: melodifestivalen | CC0 |

Notes:

- eSett gives consumption as negative numbers in Swedish local time; the builder flips the sign and averages the repeated autumn hour. The spring daylight-saving hours are missing and count as gaps (34,799 hours, 5 missing).
- The Wikipedia dataset (3,946 days, 1 January 2016 to 20 October 2026, no gaps) was built on the owner's machine on 2026-10-21. Wikimedia rate-limits shared cloud IPs; rebuild it from a normal connection.

## Backtest with Timestral-28M (2026-10-20)

Last period held out, compared with repeating last season.

| Series | Horizon | Error vs. repeating last season | Inside the 80 % band |
|---|---|---|---|
| e-handel | 12 months | 53 % lower | 75 % |
| sportaffärer | 12 months | 32 % lower | 100 % |
| blomsterhandel | 12 months | 22 % lower | 92 % |
| leksaksaffärer | 12 months | 3 % lower | 67 % |
| elpris SE3 (replaced 2026-10-21) | 7 days | 30 % lower | 99 % |
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

## Replacing the price with consumption (2026-10-21)

A sceptical visitor learns little from the SE3 spot price: it is driven by wind, gas and interconnectors, not by its own history, so Norn's forecast is a smoothed daily rhythm with wide bands. Consumption has the same household theme and a strong daily, weekly and yearly rhythm. Same backtest as Verdandi (Timestral-28M, held-out week, compared with the same hour last week):

| Series | Twelve held-out weeks | Error vs. value | Better than repeating | Inside the 90 band |
|---|---|---|---|---|
| SE3 consumption | one week each | about 3 % | about 20 % | about 88 % |
| SE3 spot price (the old example) | one week each | about 58 % | about 24 % | about 91 % |

Under the revised grade, consumption is Pålitlig in 9 of the 12 weeks; the latest week, the one Verdandi shows, is Ungefärlig (5 % off, but the wide band held just under 80 % of the hours). Röda dagar did not help consumption over Christmas week 2025 (average error 492 MWh per hour without, 547 with): the model already knows Christmas from earlier years.

Påsk is the clearest case for the events feature. Easter moves by up to five weeks; forecast a year ahead from 20 October 2025, Norn's own peak lands five days late (9 April 2026). With röda dagar switched on, its guess for the real peak day (påskafton, 4 April, 2,368 views) goes from 650 to 2,828, and the average error over the year halves (56 to 29 views per day). Without events it is Ungefärlig (71 % off, which is mostly the peak).

Cycle counts were considered too, but no Swedish source without registration was found: Trafikverket's and Göteborg's APIs need a key, and Stockholm's portal lists only the counters' locations.

## Adding a dataset

1. Add a builder function to `scripts/build_datasets.py` and an entry in `examples.json` through it.
2. Prefer Swedish official or open sources with a clear licence. Record source, URL and licence.
3. Run a backtest and add the row above before the example ships.
