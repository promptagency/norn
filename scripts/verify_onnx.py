"""Compare the ONNX core against the PyTorch forecaster, and time it.

The forecaster's pre/post-processing stays in PyTorch; only the transformer core is swapped
for onnxruntime. That isolates the graph: any deviation here is the export, not the JS port.

Usage
  python verify_onnx.py --model mistralai/Timestral-28M --onnx export/28m/model.onnx
"""

import argparse
import time

import numpy as np
import onnxruntime as ort
import torch

from timestral import TimestralForecaster
from timestral.masks import build_forecast_positions, compute_enc_key_validity, group_first_observed_patch
from timestral.scaler import denormalize_quantiles


def make_onnx_predict(forecaster, sess):
    m = forecaster.model
    c = m.config
    ps = c.patch_size

    def _predict_context_only(inputs, observed, group_ids, horizon_patches):
        rows, t = inputs.shape
        ll = t // ps
        scaled, loc, scale = m.scale(inputs, observed)
        obs_per_patch = observed.unflatten(-1, (ll, ps)).any(dim=-1)
        key_valid = compute_enc_key_validity(obs_per_patch, c.attend_missing_patches)
        unique_ids, inverse = torch.unique(group_ids, return_inverse=True)
        first_obs = group_first_observed_patch(obs_per_patch, inverse, unique_ids.numel())[inverse]
        positions = build_forecast_positions(ll, horizon_patches, first_obs)
        feeds = {
            "scaled": scaled.numpy().astype(np.float32),
            "observed": observed.numpy(),
            "key_valid": key_valid.numpy(),
            "positions": positions.numpy().astype(np.int64),
            "dec_dummy": np.zeros((rows, horizon_patches), dtype=np.float32),
        }
        preds = torch.from_numpy(sess.run(["quantiles"], feeds)[0])
        anchor_loc = loc.unflatten(-1, (ll, ps))[..., 0][:, ll - 1 : ll]
        anchor_scale = scale.unflatten(-1, (ll, ps))[..., 0][:, ll - 1 : ll]
        return denormalize_quantiles(preds, anchor_loc.unsqueeze(-1), anchor_scale.unsqueeze(-1), c.use_asinh)

    return _predict_context_only


def cases(rng):
    t = np.arange(2000)
    out = {
        "random_walk": rng.standard_normal(2000).cumsum(),
        "seasonal": 100 + 20 * np.sin(2 * np.pi * t / 96) + 5 * np.sin(2 * np.pi * t / 7) + rng.standard_normal(2000),
        "trend_nonneg": np.abs(50 + 0.05 * t + 10 * np.sin(2 * np.pi * t / 24) + 3 * rng.standard_normal(2000)),
        "short_1033": rng.standard_normal(1033).cumsum() + 1000,  # not a multiple of patch size
    }
    gaps = out["seasonal"].copy()
    gaps[300:340] = np.nan
    gaps[::97] = np.nan
    out["with_gaps"] = gaps
    return out


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--model", default="mistralai/Timestral-28M")
    ap.add_argument("--onnx", default="export/28m/model.onnx")
    ap.add_argument("--threads", type=int, default=4)
    args = ap.parse_args()

    ref = TimestralForecaster.from_pretrained(args.model)
    so = ort.SessionOptions()
    so.intra_op_num_threads = args.threads
    sess = ort.InferenceSession(args.onnx, so, providers=["CPUExecutionProvider"])
    test = TimestralForecaster.from_pretrained(args.model)
    test.model._predict_context_only = make_onnx_predict(test, sess)

    rng = np.random.default_rng(0)
    worst = 0.0
    print(f"{'case':14} {'H':>5} {'max_abs':>10} {'rel_to_scale':>12} {'torch_ms':>9} {'onnx_ms':>8}")
    for name, series in cases(rng).items():
        for h in (24, 96, 500, 1500):
            t0 = time.perf_counter(); a = ref.forecast(series, h).quantiles; t1 = time.perf_counter()
            b = test.forecast(series, h).quantiles; t2 = time.perf_counter()
            scale = float(np.nanstd(series)) + 1e-9
            diff = float((a - b).abs().max())
            rel = diff / scale
            worst = max(worst, rel)
            print(f"{name:14} {h:5d} {diff:10.4g} {rel:12.2e} {(t1-t0)*1000:9.0f} {(t2-t1)*1000:8.0f}")
    print(f"\nworst deviation relative to series std: {worst:.2e}")


if __name__ == "__main__":
    main()
