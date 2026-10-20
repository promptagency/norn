# Norn, plan

Senast uppdaterad 2026-10-20.

## Ram

- Labbprojekt under Prompt Agency, open source, norn.promptagency.se. Marknadsföring lika mycket som teknik.
- Experiment utan supportlöfte, sagt tydligt i README och i appens sidfot.
- Handbyggt, inte Lovable. Statisk sida, ingen backend, inga cookies, ingen telemetri, self-hostade fonter.

## Teknik

- Vite + React + TypeScript, onnxruntime-web i en Web Worker, uPlot, PapaParse.
- Modell: amine40/Timestral-28M-ONNX (fp16-vikter, kovariatstöd), 5M som fallback på svag hårdvara.
- Prognoslogik: timestral.js från amine-athmani/timestral-in-browser (Apache 2.0), verifierad med scripts/verify_onnx.py.
- Deploy: Cloudflare Pages.
- Inga egna modeller publiceras på Hugging Face.

## Flöde

En skärm i taget, ett svar per skärm, aldrig en inställning innan användaren sett något. Inget länkar bort från sajten.

0. **Start.** En mening, släppyta för fil, exempelkort.
1. **Urd.** Bara historiken. Norn beskriver datan i en mening, användaren bekräftar. Kolumnval bara vid behov.
2. **Verdandi.** Automatiskt backtest på sista perioden. Betyg i tre nivåer (pålitlig, ungefärlig, osäker) med en mening. Siffrorna bakom under "Visa detaljer".
3. **Skuld.** Prognos med median och band 50 och 90 procent, horisont i användarens enhet. Svaret i en mening ovanför. Två hopfällda frågor, "Vet du något om framtiden?" (kovariater, svenska helgdagar, egna händelser) och "Hur säker vill du vara?" (planeringsnivå). Ladda ner, skriv ut, kopiera länk.

Inte i version ett: modellval, flera serier, anomalier, cycles, state space, dragbar backteststart.

## Öppna beslut

- Trösklar för betyget i Verdandi. Redaktionellt val som måste kunna försvaras i "Visa detaljer".
- Svenska helgdagar som kovariat måste visa när de inte påverkar prognosen, annars ser verktyget trasigt ut.
- Kovariatexemplet. Temperatur sänker elprisfelet bara 2 procent. Leta förbrukningsdata eller visa ärligt att en hjälpserie ibland inte hjälper.

## Backtest på exempeldatan (Timestral-28M)

| serie | horisont | lägre fel än förra säsongen | inom 80-procentsbandet |
|---|---|---|---|
| e-handel | 12 mån | 53 % | 75 % |
| sportaffärer | 12 mån | 32 % | 100 % |
| blomsterhandel | 12 mån | 22 % | 92 % |
| leksaksaffärer | 12 mån | 3 % | 67 % |
| elpris SE3 | 7 dygn | 30 % | 99 % |

## Nästa steg

1. Designprogram (logotyp, färg, typografi). Micke.
2. Wikipedia-data, körs från Mickes dator.
3. Skärmskisser.
4. Bygge.
