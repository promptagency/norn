# Norn

Prognoser på dina egna siffror, direkt i webbläsaren. Inget lämnar datorn.

Norn är ett labbprojekt från [Prompt Agency](https://promptagency.se). Det bygger på Mistrals tidsseriemodell [Timestral](https://mistral.ai/news/timestral/), som körs lokalt med onnxruntime-web. Namnet kommer från de tre nornorna, och appen följer dem i tre steg.

- **Urd**, det som varit. Din data.
- **Verdandi**, det som är. Hur bra modellen läser just din serie.
- **Skuld**, det som kommer. Prognosen, med osäkerhet.

## Status

Under utveckling, oktober 2026. Experiment utan supportlöfte. Buggrapporter är välkomna men svar garanteras inte.

## Innehåll

```
PLAN.md                faser, beslut och öppna frågor
CLAUDE.md              instruktioner för Claude Code
design/                designprogrammet: token, typsnitt, logotyp och ikoner
docs/                  UX, arkitektur, svensk text, exempeldata och resultat från fas 0
public/data/           exempeldata från svenska öppna källor
scripts/               export, verifiering, datahämtning och token
webtest/               latensmätning i onnxruntime-web
src/ui/components/     komponenterna, samma kod som i designsystemet
src/dev/               komponentgalleri med riktig data
```

```bash
npm install
npm run dev        # appen på http://localhost:5173, komponentgalleriet på /?galleri
npm test
npm run build:ds   # bygger designsystemets komponentpaket till dist-ds/
```

Själva webbappen byggs i fas 1, se `PLAN.md`.

## Exempeldata

Byggs med `python scripts/build_datasets.py`. Datan ligger statiskt i appen och hämtas aldrig vid körning.

- SCB, detaljhandelns omsättning per bransch (CC0)
- elprisetjustnu.se, spotpris SE3 per timme (fri, utan garanti)
- SMHI, lufttemperatur Göteborg A (CC BY 4.0)
- Wikimedia, sidvisningar på svenska Wikipedia (CC0)

## Tack

Modellen körs via [amine40:s ONNX-export](https://huggingface.co/amine40/Timestral-28M-ONNX) och JavaScript-port från [timestral-in-browser](https://github.com/amine-athmani/timestral-in-browser) (Apache 2.0).

## Licens

Koden är MIT. Timestrals vikter är Mistral AI:s Modified MIT, som kräver kommersiell licens för företag med mer än 20 miljoner USD i månadsomsättning.
