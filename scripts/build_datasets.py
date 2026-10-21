"""Fetch Norn's example datasets from Swedish open data sources and write them as CSV.

Output goes to public/data/ together with examples.json (title, description, source,
licence, time column, target column, covariate columns). The app ships these files
statically and never calls the sources at runtime.

Sources
  SCB            detaljhandelns omsättningsindex per bransch, månad   (CC0)
  eSett          elförbrukning per timme, elområde SE3                 (CC0)
  Wikimedia      sidvisningar per dag, sv.wikipedia                   (CC0)

Usage
  python build_datasets.py                 # all
  python build_datasets.py scb el          # a subset
"""

import csv
import datetime as dt
import json
import sys
import time
from pathlib import Path
from urllib.parse import quote

import requests

OUT = Path(__file__).resolve().parent.parent / "public" / "data"
UA = {"User-Agent": "norn-build-datasets/0.1 (https://nornor.app; open source)"}
EXAMPLES: list[dict] = []


def write_csv(name: str, header: list[str], rows: list[list]) -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    with (OUT / name).open("w", newline="", encoding="utf-8") as f:
        w = csv.writer(f)
        w.writerow(header)
        w.writerows(rows)
    print(f"  {name}: {len(rows)} rader")


# ---------------------------------------------------------------- SCB detaljhandel

SCB_BRANSCHER = {
    "47.65": ("leksaksaffärer", "Julhandeln syns som en topp i december, tre gånger en vanlig månad."),
    "47.761": ("blomsterhandel", "Mors dag och studenten ger en topp i maj, januari är botten."),
    "47.64": ("sportaffärer", "Två säsonger, vår och jul, plus en långsam trend."),
    "47.91": ("e-handel", "Stark trend sedan 90-talet med julhandel ovanpå."),
}


def build_scb() -> None:
    url = "https://api.scb.se/OV0104/v1/doris/sv/ssd/START/HA/HA0101/HA0101B/DetOms07N"
    q = {
        "query": [
            {"code": "SNI2007", "selection": {"filter": "item", "values": list(SCB_BRANSCHER)}},
            {"code": "ContentsCode", "selection": {"filter": "item", "values": ["000006VV"]}},
        ],
        "response": {"format": "json"},
    }
    r = requests.post(url, json=q, headers=UA, timeout=90)
    r.raise_for_status()
    by: dict[str, dict[str, float]] = {k: {} for k in SCB_BRANSCHER}
    for row in r.json()["data"]:
        code, month = row["key"]
        val = row["values"][0]
        if val not in ("..", ".", ""):
            by[code][month] = float(val)
    months = sorted({m for d in by.values() for m in d})
    header = ["månad"] + [SCB_BRANSCHER[k][0] for k in SCB_BRANSCHER]
    rows = [[f"{m[:4]}-{m[5:]}"] + [by[k].get(m, "") for k in SCB_BRANSCHER] for m in months]
    write_csv("scb_detaljhandel.csv", header, rows)
    EXAMPLES.append({
        "id": "detaljhandel",
        "source_short": "SCB",
        "title": "Detaljhandel per bransch",
        "frequency": "månad",
        "file": "scb_detaljhandel.csv",
        "time": "månad",
        "targets": {SCB_BRANSCHER[k][0]: SCB_BRANSCHER[k][1] for k in SCB_BRANSCHER},
        "default_target": "leksaksaffärer",
        "unit": "index, 2021 = 100",
        "description": "Omsättning i svensk detaljhandel sedan 1991, löpande priser. Välj bransch.",
        "source": "SCB, Detaljhandelns omsättning efter näringsgren (DetOms07N)",
        "source_url": "https://www.statistikdatabasen.scb.se/pxweb/sv/ssd/START__HA__HA0101__HA0101B/DetOms07N/",
        "license": "CC0",
    })


# ---------------------------------------------------------------- elförbrukning SE3 (eSett)
# Replaced the SE3 spot price on 2026-10-21: consumption has a clear daily, weekly and yearly rhythm that
# Norn forecasts within a few percent, while the price is driven by wind and gas (docs/DATA.md).

EL_START = dt.date(2022, 11, 1)
SE3 = "10Y1001A1001A46L"  # eSett's code for metering balance area SE3


def build_el(end: dt.date | None = None) -> None:
    end = end or dt.date.today()
    hours: dict[str, list[float]] = {}
    for year in range(EL_START.year, end.year + 1):
        start = max(EL_START, dt.date(year, 1, 1))
        stop = min(end, dt.date(year + 1, 1, 1))
        url = (f"https://api.opendata.esett.com/EXP15/Aggregate?mba={SE3}&resolution=hour"
               f"&start={start}T00:00:00.000Z&end={stop}T00:00:00.000Z")
        r = requests.get(url, headers=UA, timeout=180)
        r.raise_for_status()
        for item in r.json():
            # Swedish wall-clock time, like the other examples. The repeated autumn hour is averaged.
            hours.setdefault(item["timestamp"][:16].replace("T", " "), []).append(-item["total"])
    rows = [[h, round(sum(v) / len(v), 1)] for h, v in sorted(hours.items())]
    write_csv("se3_elforbrukning.csv", ["tid", "elforbrukning_mwh"], rows)
    EXAMPLES.append({
        "id": "elforbrukning",
        "source_short": "eSett",
        "title": "Elförbrukning per timme, elområde 3",
        "frequency": "timme",
        "file": "se3_elforbrukning.csv",
        "time": "tid",
        "targets": {"elforbrukning_mwh": "Dygn, vecka och årstid på en gång, och Norn träffar inom några procent."},
        "default_target": "elforbrukning_mwh",
        "labels": {"elforbrukning_mwh": "Elförbrukning"},
        "unit": "MWh per timme",
        "description": "All el som används i elområde 3 varje timme sedan november 2022.",
        "source": "eSett Open Data, förbrukning per elområde (EXP15)",
        "source_url": "https://opendata.esett.com/consumption",
        "license": "CC0",
    })


# ---------------------------------------------------------------- Wikipedia sidvisningar

WIKI_ARTICLES = {
    "Midsommar": "En enda topp per år, resten av året nästan ingenting. Norn hittar dagen men underskattar höjden.",
    "Lucia": "Decembertopp med en vecka av uppladdning.",
    "Melodifestivalen": "Finalen flyttar sig varje år, och Norn hittar ändå rätt lördag.",
    "Påsk": "Påsken flyttar sig upp till fem veckor mellan åren. Välj 6 månader och slå på röda dagar i sista steget, så hittar Norn toppen.",
}


def build_wiki() -> None:
    start, end = "2016010100", dt.date.today().strftime("%Y%m%d00")
    series: dict[str, dict[str, int]] = {}
    for art in WIKI_ARTICLES:
        url = (f"https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/sv.wikipedia/"
               f"all-access/user/{quote(art)}/daily/{start}/{end}")
        r = requests.get(url, headers=UA, timeout=60)
        if r.status_code == 429:
            print("  wikimedia: rate limit, försök igen senare eller från en annan adress")
            return
        r.raise_for_status()
        series[art] = {it["timestamp"][:8]: it["views"] for it in r.json()["items"]}
        time.sleep(1)
    days = sorted({d for s in series.values() for d in s})
    rows = [[f"{d[:4]}-{d[4:6]}-{d[6:]}"] + [series[a].get(d, "") for a in WIKI_ARTICLES] for d in days]
    write_csv("wikipedia_sv.csv", ["datum"] + [a.lower() for a in WIKI_ARTICLES], rows)
    EXAMPLES.append({
        "id": "wikipedia",
        "source_short": "Wikimedia",
        "title": "Besök på svenska Wikipedia",
        "frequency": "dag",
        "file": "wikipedia_sv.csv",
        "time": "datum",
        "targets": {a.lower(): d for a, d in WIKI_ARTICLES.items()},
        "default_target": "melodifestivalen",
        # The card's sentence, since it covers all four articles and not only the default.
        "card": "Finalen och påsken flyttar sig varje år. Välj påsk, 6 månader och röda dagar, så hittar Norn påsken också.",
        "unit": "sidvisningar per dag",
        "description": "Dagliga besök på fyra artiklar sedan 2016. Veckorytm och en årlig topp.",
        "source": "Wikimedia REST API, pageviews per article",
        "source_url": "https://wikimedia.org/api/rest_v1/",
        "license": "CC0",
    })


# ---------------------------------------------------------------- main

BUILDERS = {"scb": build_scb, "el": build_el, "wiki": build_wiki}


def main() -> None:
    wanted = sys.argv[1:] or list(BUILDERS)
    existing = {}
    ex_path = OUT / "examples.json"
    if ex_path.exists():
        saved = json.loads(ex_path.read_text())
        items = saved["examples"] if isinstance(saved, dict) else saved
        existing = {e["id"]: e for e in items}
    for name in wanted:
        print(name)
        try:
            BUILDERS[name]()
        except Exception as e:  # noqa: BLE001
            print(f"  misslyckades: {e}")
    for e in EXAMPLES:
        existing[e["id"]] = e
    order = ["detaljhandel", "elforbrukning", "wikipedia"]
    out = [existing[k] for k in order if k in existing]
    for e in out:  # the year the data starts, for the example cards
        with open(OUT / e["file"], newline="") as f:
            e["since"] = list(csv.reader(f))[1][0][:4]
    ex_path.write_text(json.dumps({"built": dt.date.today().isoformat(), "examples": out},
                                  ensure_ascii=False, indent=2))
    print("examples.json:", [e["id"] for e in out])


if __name__ == "__main__":
    main()
