# Fas 0, verifiering av Timestral i webbläsaren

Datum 2026-10-20. Stopp-eller-kör-punkt för Norn.

## Resultat: kör

Timestral-5M och Timestral-28M exporterar till ONNX, kör i onnxruntime-web (WASM) och ger samma siffror som PyTorch.

## Vad som exporterades

Grafen innehåller patch-inbäddning, transformer och kvantilhuvud. Normalisering (kausal Welford i float64, asinh), nyckelvaliditet, positioner, denormalisering, blockloopen och clampsym ligger utanför grafen och portas till JS i fas 1. Skälen är tre. Welford-skanningen är float64 och cummax saknas som ONNX-op, båda är enkel aritmetik i JS, och grafen blir en ren transformer som är lätt att felsöka.

Exporten använder torch.onnx.export med dynamo=True och opset 18. Dynamiska axlar för rader, kontextlängd och horisont. Inga custom ops behövdes.

Scope i fas 0 är univariat utan kovariater. Kovariater kräver en andra exportväg (`_predict_window`) i fas 2.

## Storlek

| variant | 5M | 28M | avvikelse mot PyTorch |
|---|---|---|---|
| fp32 | 22,3 MB | 113,4 MB | ~1e-5 av std (flyttalsbrus) |
| fp16-vikter, fp32-beräkning | 11,9 MB | 57,8 MB | ~1e-3 av std |
| int8 per kanal, huvud i fp32 | 9,3 MB | 36,2 MB | medianfel ~4 % av 90-procentsbandets bredd |

Rekommendation är fp16-vikter som default. Int8 ger synligt sämre kvantiler och sparar bara ytterligare 20 MB. Naiv int8 (alla MatMul, per tensor) gav 12 % fel och förkastades.

## Latens i onnxruntime-web WASM

Mätt i Node med samma WASM-backend som webbläsaren, på en delad 2-kärnig servercontainer. En laptop är rimligen 2 till 4 gånger snabbare. R=2 betyder att både originalet och den speglade serien (clampsym) körs i samma anrop.

| modell | trådar | laddning | inferens, 2016 steg kontext, 96 steg horisont |
|---|---|---|---|
| 5M fp16 | 1 | 1,5 s | 116 ms |
| 28M fp16 | 1 | 2,0 s | 499 ms |
| 28M fp16 | 2 | 2,4 s | 400 ms |
| 28M int8 | 1 | 1,5 s | 279 ms |

Målet var under 2 sekunder. 28M klarar det med marginal.

## Testfall som passerade

Slumpvandring, säsongsserie, icke-negativ trend (triggar klipp vid 0), serie med 1033 steg (inte multipel av 32, triggar vänsterpaddning), serie med luckor (NaN-block och spridda NaN). Horisonter 24, 96, 500 och 1500 steg, där 500 och 1500 triggar `_refine_block` och 1500 triggar blockloopen med återmatning av medianen.

## Vad fas 1 måste porta till JS, exakt

1. `ffill_with_mask`, framåtfyllning, inledande saknade blir 0
2. `pad_to_patch`, vänsterpaddning till multipel av 32
3. `compute_causal_statistics`, kausal Welford i float64, Bessel-korrigering, golv 1e-6
4. `causal_patch_loc_scale`, statistik vid sista steget i varje patch
5. `apply_affine_asinh_masked`, asinh((x − loc) / scale), 0 där osett
6. `compute_enc_key_validity`, cummax över observerade patchar
7. `build_forecast_positions`, positioner förankrade i första observerade patch
8. `denormalize_quantiles`, sinh(q) · scale + loc, klampa oändligheter
9. `_refine_block`, advancing_block_frames, bara när horisont > 1 patch
10. `_cap_quantiles`, klamp till [min − k·s, max + k·s] med k = 1e4
11. Clampsym, kör −x som andra rad, spegla kvantilerna, medelvärde
12. Klipp vid 0 när hela kontexten är icke-negativ
13. Blockloop, max 32 patchar per anrop, median matas tillbaka

Jämförelsetest mot `scripts/verify_onnx.py` ingår i fas 1.

## Filer

- `scripts/export_onnx.py` export
- `scripts/quantize_onnx.py` fp16 och int8
- `scripts/verify_onnx.py` jämförelse mot PyTorch och latens
- `webtest/bench.mjs` latens i onnxruntime-web
- `export/5m/`, `export/28m/` modellerna, redo för Hugging Face
