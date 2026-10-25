"""Reference forecasts from the official Timestral package, for src/engine/parity.test.ts.

The same cases as the spike (scripts/verify_onnx.py), plus a backtest on the default series of each example
dataset. Run from the repo root:  .venv/bin/python scripts/make_fixtures.py
"""

import csv
import json
from pathlib import Path

import numpy as np
from timestral import TimestralForecaster

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "public" / "data"
OUT = ROOT / "src" / "engine" / "fixtures" / "parity.json"
MAX_CONTEXT = 8192  # MAX_HISTORY in src/engine/Forecaster.ts; longer histories are cut to it before forecasting
BACKTEST = {"timme": 168, "dag": 91, "vecka": 26, "månad": 12}  # docs/UX.md


def spike_cases():
    rng = np.random.default_rng(0)
    t = np.arange(2000)
    out = {
        "random_walk": rng.standard_normal(2000).cumsum(),
        "seasonal": 100 + 20 * np.sin(2 * np.pi * t / 96) + 5 * np.sin(2 * np.pi * t / 7) + rng.standard_normal(2000),
        "trend_nonneg": np.abs(50 + 0.05 * t + 10 * np.sin(2 * np.pi * t / 24) + 3 * rng.standard_normal(2000)),
        "short_1033": rng.standard_normal(1033).cumsum() + 1000,
    }
    gaps = out["seasonal"].copy()
    gaps[300:340] = np.nan
    gaps[::97] = np.nan
    out["with_gaps"] = gaps
    for name, series in out.items():
        for h in (24, 1100):  # one block and two (the graph decodes 1024 steps at a time)
            yield {"name": f"{name} h{h}", "kind": "forecast", "series": series, "horizon": h, "known": None}


def example_cases():
    examples = json.loads((DATA / "examples.json").read_text())["examples"]
    for ex in examples:
        with open(DATA / ex["file"], newline="") as f:
            rows = list(csv.DictReader(f))
        col = lambda name: np.array([float(r[name]) if r[name] != "" else np.nan for r in rows])
        h = BACKTEST[ex["frequency"]]
        keep = MAX_CONTEXT + h
        series = col(ex["default_target"])[-keep:]
        known = [col(c)[-keep:] for c in ex.get("covariates", {})] or None
        yield {"name": f"{ex['id']} backtest", "kind": "backtest", "series": series, "horizon": h, "known": known}


def nan_list(a):
    return [None if np.isnan(v) else round(float(v), 6) for v in a]


def main():
    f = TimestralForecaster.from_pretrained("mistralai/Timestral-28M")
    fixtures = []
    for case in [*spike_cases(), *example_cases()]:
        series, h, known = case["series"], case["horizon"], case["known"]
        context = series[:-h] if case["kind"] == "backtest" else series
        extra = {"known_covariates": np.array(known)[None]} if known else {}
        q = f.forecast(context[None, None], h, **extra).quantiles[0, 0].numpy()  # H x 21
        fixtures.append({
            "name": case["name"], "kind": case["kind"], "horizon": h, "series": nan_list(series),
            "known": [nan_list(k) for k in known] if known else None,
            "expected": q.round(5).tolist(),
        })
        print(case["name"], q.shape)
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(fixtures, separators=(",", ":")))


if __name__ == "__main__":
    main()
