"""Export Timestral's transformer core to ONNX for onnxruntime-web.

Scope (fas 0): univariate series, no covariates, one decode block.

What lives in the graph:   patch embedding -> transformer -> quantile head.
What lives outside (JS):   causal Welford normalisation (float64), asinh, key validity,
                           positions, sinh-denormalisation, block loop, clampsym.

Inputs
  scaled    float32 (R, T)   asinh-normalised context, T multiple of patch_size
  observed  bool    (R, T)   observation mask
  key_valid bool    (R, L)   L = T / patch_size, which context patches may be attended
  positions int64   (R, L+H) time positions anchored at first observed patch
  dec_dummy float32 (R, H)   only its shape is used, H = horizon patches

Output
  quantiles float32 (R, H * patch_size, Q)  in normalised space (asinh), monotone along Q

Usage
  python export_onnx.py --model mistralai/Timestral-28M --out export/28m
"""

import argparse
import json
from pathlib import Path

import torch
from torch import Tensor, nn

from timestral.loading import load_model
from timestral.layers import TwoStreamMask


class TimestralCore(nn.Module):
    def __init__(self, model):
        super().__init__()
        self.m = model
        self.c = model.config

    def forward(self, scaled: Tensor, observed: Tensor, key_valid: Tensor, positions: Tensor, dec_dummy: Tensor):
        rows = scaled.shape[0]
        ll = key_valid.shape[1]
        h = dec_dummy.shape[1]
        x_enc = self.m.representation(scaled, observed)
        x_dec = self.m.representation.forecast_query.view(1, 1, -1).expand(rows, h, -1)

        # time mask (R, 1, L+H, L+H): causal encoder over valid keys, decoder reads all valid context + causal chain
        causal = torch.tril(torch.ones(ll, ll, dtype=torch.bool, device=scaled.device))
        eye = torch.eye(ll, dtype=torch.bool, device=scaled.device)
        enc = (causal[None] & key_valid[:, None, :]) | eye[None]
        enc_dec = torch.zeros(rows, ll, h, dtype=torch.bool, device=scaled.device)
        dec_enc = key_valid[:, None, :].expand(rows, h, ll)
        dec_dec = torch.tril(torch.ones(h, h, dtype=torch.bool, device=scaled.device))[None].expand(rows, h, h)
        top = torch.cat([enc, enc_dec], dim=2)
        bottom = torch.cat([dec_enc, dec_dec], dim=2)
        time_mask = torch.cat([top, bottom], dim=1).unsqueeze(1)

        # variate mask: every row is its own series (univariate) -> identity, so None is exact for R==1
        # and for R>1 we pass an explicit eye so the batch of +/- context never cross-attends.
        r_eye = torch.eye(rows, dtype=torch.bool, device=scaled.device)
        variate_mask = r_eye[None, None].expand(ll + h, 1, rows, rows)

        x = torch.cat([x_enc, x_dec], dim=1)
        mask = TwoStreamMask(mask=time_mask, enc_len=ll) if self.c.split_context_horizon_attn else time_mask
        hid = self.m.transformer(x, mask, variate_mask, positions)
        return self.m.head(hid[:, ll:, :])


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--model", default="mistralai/Timestral-28M")
    ap.add_argument("--out", default="export/28m")
    ap.add_argument("--opset", type=int, default=18)
    args = ap.parse_args()

    out = Path(args.out)
    out.mkdir(parents=True, exist_ok=True)
    model = load_model(args.model, device="cpu").eval()
    core = TimestralCore(model).eval()
    c = model.config
    ps = c.patch_size

    R, L, H = 2, 8, 3
    T = L * ps
    scaled = torch.randn(R, T)
    observed = torch.ones(R, T, dtype=torch.bool)
    key_valid = torch.ones(R, L, dtype=torch.bool)
    positions = torch.arange(L + H)[None].expand(R, -1).contiguous()
    dec_dummy = torch.zeros(R, H)

    rows, ctx, hor, ctxp = (torch.export.Dim("rows"), torch.export.Dim("ctx"), torch.export.Dim("hor"),
                            torch.export.Dim("ctxp"))
    dyn = {
        "scaled": {0: rows, 1: ctx},
        "observed": {0: rows, 1: ctx},
        "key_valid": {0: rows, 1: ctxp},
        "positions": {0: rows, 1: torch.export.Dim.DYNAMIC},
        "dec_dummy": {0: rows, 1: hor},
    }
    with torch.inference_mode():
        onnx_prog = torch.onnx.export(
            core, (scaled, observed, key_valid, positions, dec_dummy),
            input_names=["scaled", "observed", "key_valid", "positions", "dec_dummy"],
            output_names=["quantiles"],
            dynamic_shapes=dyn, opset_version=args.opset, dynamo=True,
        )
    onnx_prog.save(str(out / "model.onnx"))
    (out / "config.json").write_text(json.dumps({
        "patch_size": ps, "quantile_knots": list(c.quantile_knots), "block_size": c.block_size,
        "context_length": c.context_length, "minimum_scale": c.minimum_scale, "use_asinh": c.use_asinh,
        "stabilize_with_global": c.stabilize_with_global, "attend_missing_patches": c.attend_missing_patches,
        "source": args.model,
    }, indent=2))
    print("saved", out / "model.onnx", (out / "model.onnx").stat().st_size // 1024, "KB")


if __name__ == "__main__":
    main()
