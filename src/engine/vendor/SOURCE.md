# Vendored code

`timestral.js` is copied unchanged from [amine-athmani/timestral-in-browser](https://github.com/amine-athmani/timestral-in-browser), `web/src/lib/timestral.js` at commit `695b5de1e42ade8469ec08f1dbcf0635e5c4ca15`. Licence: Apache 2.0, see `LICENSE` in this folder.

It is a JavaScript port of `TimestralForecaster.forecast` on top of the ONNX step graph. Do not edit it; update it by copying a newer upstream version and re-running the parity test (`npm test`).

`timestral.d.ts` is ours: types for the parts Norn uses.

Upstream's `web/src/lib/worker.js` is not vendored. Norn's `src/engine/worker.ts` follows its shape but loads the model in chunks from our own origin instead of from Hugging Face.
