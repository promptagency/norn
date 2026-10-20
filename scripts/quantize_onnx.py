"""Make smaller variants of an exported Timestral core.

  python quantize_onnx.py --dir export/28m

model_fp16.onnx       weights stored as fp16 with a Cast to fp32 at load; compute stays fp32.
                      Half the download, deviation ~1e-3 of series std. Recommended default.
model_quantized.onnx  per-channel dynamic int8 on MatMul weights, patch projection and quantile
                      head left in fp32. Quarter the download, median error ~4% of the 90% band
                      width. Use for low-bandwidth or as the 5M "fast" option, not as default.

A plain onnxconverter_common fp16 conversion does not load, because the graph carries
explicit fp32 Cast nodes from the model's own dtype promotion.
"""

import argparse
from pathlib import Path

import numpy as np
import onnx
from onnx import TensorProto, helper, numpy_helper
from onnxruntime.quantization import QuantType, quantize_dynamic


def fp16_weights(src: Path, dst: Path, min_size: int = 1024) -> int:
    m = onnx.load(str(src))
    g = m.graph
    casts, n = [], 0
    for init in g.initializer:
        if init.data_type != TensorProto.FLOAT:
            continue
        arr = numpy_helper.to_array(init)
        if arr.size < min_size:
            continue
        name, h = init.name, init.name + "_fp16"
        init.CopyFrom(numpy_helper.from_array(arr.astype(np.float16), h))
        casts.append(helper.make_node("Cast", [h], [name], to=TensorProto.FLOAT, name="cast_" + name))
        n += 1
    old = list(g.node)
    del g.node[:]
    g.node.extend(casts + old)
    onnx.save(m, str(dst))
    return n


def int8_weights(src: Path, dst: Path) -> None:
    m = onnx.load(str(src))
    inits = {i.name for i in m.graph.initializer}
    weighted = [n.name for n in m.graph.node
                if n.op_type in ("MatMul", "Gemm") and any(x in inits for x in n.input)]
    exclude = weighted[:2] + weighted[-2:]  # patch projection in, quantile head out
    quantize_dynamic(str(src), str(dst), weight_type=QuantType.QInt8, per_channel=True,
                     op_types_to_quantize=["MatMul", "Gemm"], nodes_to_exclude=exclude)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--dir", default="export/28m")
    args = ap.parse_args()
    d = Path(args.dir)
    src = d / "model.onnx"
    fp16_weights(src, d / "model_fp16.onnx")
    int8_weights(src, d / "model_quantized.onnx")
    for f in ("model.onnx", "model_fp16.onnx", "model_quantized.onnx"):
        print(f"{f:24} {(d / f).stat().st_size / 1e6:7.1f} MB")


if __name__ == "__main__":
    main()
