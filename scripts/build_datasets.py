"""Fetch Norn's example datasets from Swedish open data sources and write them as CSV.

Output goes to app/public/data/ together with examples.json (title, description, source,
licence, time column, target column, covariate columns). The app ships these files
statically and never calls the sources at runtime.

Sources
  SCB            detaljhandelns omsättningsindex per bransch, månad   (CC0)
  elprisetjustnu dagspris per timme SE3, speglar Nord Pool            (fri, utan garanti)
  SMHI           lufttemperatur per timme, Göteborg A                 (CC BY 4.0)
  Wikimedia      sidvisningar per dag, sv.wikipedia                   (CC0)

Usage
  python build_datasets.py                 # all
  python build_datasets.py scb el smhi     # a subset
"""

import csv
import datetime as dt
import json
import sys
import time
from pathlib import Path

import requests

OUT = Path(__file__).resolve().parent.parent / "app" / "public" / "data"
UA = {"User-Agent": "norn-build-datasets/0.1 (https://norn.promptagency.se; open source)"}
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


# ---------------------------------------------------------------- elpris SE3 + SMHI temperatur

EL_START = dt.date(2022, 11, 1)


def build_el(end: dt.date | None = None) -> None:
    end = end or dt.date.today()
    rows: dict[str, float] = {}
    d = EL_START
    sess = requests.Session()
    while d <= end:
        url = f"https://www.elprisetjustnu.se/api/v1/prices/{d.year}/{d.month:02d}-{d.day:02d}_SE3.json"
        r = sess.get(url, headers=UA, timeout=30)
        if r.status_code == 200:
            for item in r.json():
                ts = dt.datetime.fromisoformat(item["time_start"])
                key = ts.strftime("%Y-%m-%d %H:00")  # kvartsvärden sedan okt 2025 slås ihop till timme
                rows.setdefault(key, [])
                rows[key].append(item["SEK_per_kWh"])
        elif r.status_code != 404:
            print("  varning", d, r.status_code)
        d += dt.timedelta(days=1)
        time.sleep(0.05)
    hourly = {k: round(sum(v) / len(v), 5) for k, v in rows.items()}
    print(f"  elpris: {len(hourly)} timmar")
    return hourly


def build_smhi() -> dict[str, float]:
    url = ("https://opendata-download-metobs.smhi.se/api/version/1.0/parameter/1/"
           "station/71420/period/corrected-archive/data.csv")
    r = requests.get(url, headers=UA, timeout=120)
    r.raise_for_status()
    lines = r.text.splitlines()
    start = next(i for i, l in enumerate(lines) if l.startswith("Datum")) + 1
    temps: dict[str, float] = {}
    for line in lines[start:]:
        parts = line.split(";")
        if len(parts) < 3 or parts[0] < "2022-11-01":
            continue
        # SMHI rapporterar i UTC, elpriset i svensk tid. Vi flyttar temperaturen till svensk tid.
        utc = dt.datetime.fromisoformat(f"{parts[0]} {parts[1]}").replace(tzinfo=dt.timezone.utc)
        local = utc.astimezone(dt.timezone(dt.timedelta(hours=1)))  # CET, enkel och stabil
        temps[local.strftime("%Y-%m-%d %H:00")] = float(parts[2])
    # senaste tre månaderna ligger i en separat fil
    r = requests.get(url.replace("corrected-archive", "latest-months"), headers=UA, timeout=60)
    if r.ok:
        lines = r.text.splitlines()
        start = next(i for i, l in enumerate(lines) if l.startswith("Datum")) + 1
        for line in lines[start:]:
            parts = line.split(";")
            if len(parts) >= 3 and parts[2]:
                utc = dt.datetime.fromisoformat(f"{parts[0]} {parts[1]}").replace(tzinfo=dt.timezone.utc)
                local = utc.astimezone(dt.timezone(dt.timedelta(hours=1)))
                temps.setdefault(local.strftime("%Y-%m-%d %H:00"), float(parts[2]))
    print(f"  smhi: {len(temps)} timmar")
    return temps


def build_el_smhi() -> None:
    el = build_el()
    temps = build_smhi()
    hours = sorted(el)
    rows = [[h, el[h], temps.get(h, "")] for h in hours]
    write_csv("elpris_se3_temp_goteborg.csv", ["tid", "elpris_kr_per_kwh", "temperatur_goteborg"], rows)
    EXAMPLES.append({
        "id": "elpris",
        "title": "Elpris per timme, elområde 3",
        "frequency": "timme",
        "file": "elpris_se3_temp_goteborg.csv",
        "time": "tid",
        "targets": {"elpris_kr_per_kwh": "Dygnsrytm, vinter mot sommar, och ibland negativa priser."},
        "default_target": "elpris_kr_per_kwh",
        "covariates": {"temperatur_goteborg": "Temperaturen vet man ofta i förväg via väderprognosen."},
        "unit": "kr per kWh",
        "description": "Spotpriset på el i SE3 sedan november 2022, med temperaturen i Göteborg som hjälpserie.",
        "source": "elprisetjustnu.se (Nord Pool via entsoe) och SMHI station 71420 Göteborg A",
        "source_url": "https://www.elprisetjustnu.se/elpris-api",
        "license": "Elpris fritt utan garanti, temperatur CC BY 4.0 SMHI",
    })


# ---------------------------------------------------------------- Wikipedia sidvisningar

WIKI_ARTICLES = {
    "Midsommar": "En enda topp per år, resten av året nästan ingenting. Norn hittar dagen men underskattar höjden.",
    "Lucia": "Decembertopp med en vecka av uppladdning.",
    "Melodifestivalen": "Finalen flyttar sig varje år, och Norn hittar ändå rätt lördag.",
}


def build_wiki() -> None:
    start, end = "2016010100", dt.date.today().strftime("%Y%m%d00")
    series: dict[str, dict[str, int]] = {}
    for art in WIKI_ARTICLES:
        url = (f"https://wikimedia.org/api/rest_v1/metrics/pageviews/per-article/sv.wikipedia/"
               f"all-access/user/{art}/daily/{start}/{end}")
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
        "title": "Besök på svenska Wikipedia",
        "frequency": "dag",
        "file": "wikipedia_sv.csv",
        "time": "datum",
        "targets": {a.lower(): d for a, d in WIKI_ARTICLES.items()},
        "default_target": "melodifestivalen",
        "unit": "sidvisningar per dag",
        "description": "Dagliga besök på tre artiklar sedan 2016. Veckorytm och en årlig topp.",
        "source": "Wikimedia REST API, pageviews per article",
        "source_url": "https://wikimedia.org/api/rest_v1/",
        "license": "CC0",
    })


# ---------------------------------------------------------------- main

BUILDERS = {"scb": build_scb, "el": build_el_smhi, "wiki": build_wiki}


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
    order = ["detaljhandel", "elpris", "wikipedia"]
    out = [existing[k] for k in order if k in existing]
    ex_path.write_text(json.dumps({"built": dt.date.today().isoformat(), "examples": out},
                                  ensure_ascii=False, indent=2))
    print("examples.json:", [e["id"] for e in out])


if __name__ == "__main__":
    main()
