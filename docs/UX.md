# UX.md – four screens, one answer each

Norn shows one screen at a time and one answer per screen. The user never sees a setting before seeing a result. Everything advanced sits behind a question in plain Swedish. The norns are the steps, not decoration. Owner's flow, 2026-10-20.

```
Start  →  Urd (what has been)  →  Verdandi (how well the model reads it)  →  Skuld (what is to come)
```

The three step names are always visible at the top, clickable backwards. The user cannot jump forwards. Nothing in the flow links out of the app.

## 0. Start

```
                                norn
   Ladda upp en fil med siffror över tid, så visar Norn vad som väntar.
                       Inget lämnar din dator.

   ┌──────────────────────────────────────────────────────────────┐
   │        Släpp en fil här, eller välj en fil på datorn         │   ← drop zone, yta-sankt
   └──────────────────────────────────────────────────────────────┘

   ┌───────────────┐ ┌───────────────┐ ┌───────────────┐
   │ Detaljhandel  │ │ Elförbrukning │ │ Wikipedia     │            ← example cards
   │ per månad     │ │ per timme     │ │ per dag       │
   │ julhandeln …  │ │ dygnsrytm …   │ │ en topp …     │
   └───────────────┘ └───────────────┘ └───────────────┘
```

- One sentence, the drop zone and the example cards. That is the whole onboarding. No tutorial.
- Each example card has one line saying what it teaches (from `examples.json`). Clicking it goes straight to Urd with the file loaded.
- Pasting text from a spreadsheet works anywhere on the page.

## 1. Urd, what has been

- The chart shows the history only. No bands, no forecast.
- Above the chart, one sentence Norn writes itself: "Försäljning per dag, 1 januari 2023 till 30 september 2026. 1 004 dagar, 3 saknas."
- Under it: "Stämmer det?" with the button **Ja** and a quiet link "Nej, ändra kolumner".
- If the file has more than one number column: "Vilken kolumn vill du förutse?" with the column names as buttons. The other columns are kept silently for Skuld.
- For the retail example, the four trades are buttons here.
- Errors are handled here, always with a suggestion, never only an error: irregular timestamps, too short a series (under 64 points), a column that cannot be read.

## 2. Verdandi, how well Norn reads your data

Runs automatically after **Ja**. A backtest on the last period, its length set by frequency:

| Frequency | Backtest period |
|---|---|
| Hour | the last 7 days |
| Day | the last 12 months (owner's decision 2026-10-21, so yearly peaks are tested) |
| Week | the last 6 months |
| Month | the last 12 months |
| Quarter, year | the last 4 periods |

- The chart shows the end of the history with the model's forecast laid over what actually happened. The bands appear here for the first time, so the user learns what they mean on data where the answer is known.
- Above the chart, a grade in three levels with one sentence:
  - **Pålitlig.** "Norn träffade i snitt inom 6 procent de senaste tre månaderna, betydligt bättre än att upprepa förra året."
  - **Ungefärlig.** "Norn träffade inom 18 procent. Bättre än att gissa, men lita mer på intervallet än på linjen."
  - **Osäker.** "Norn såg inget tydligt mönster i den här datan. Prognosen blir bred. Fler datapunkter eller en jämnare serie hjälper."
- The numbers behind the grade (error, error of repeating last season, share inside each band) sit under a collapsible "Visa detaljer", with the rule in words. The thresholds are decided in `PLAN.md`.
- One button: **Visa vad som kommer**.

## 3. Skuld, what is to come

- The chart fills the screen. History muted, forecast with the median and two bands. The bands dominate. The chart ends at the end of the horizon.
- Above the chart, the answer in one sentence: "De närmaste 30 dagarna landar troligen på 412 000 kr, mellan 371 000 och 458 000 i nio fall av tio." Sums for amounts like sales, averages for levels like price or temperature.
- Horizon: three or four buttons in the user's unit. For daily data "2 veckor, 1 månad, 3 månader, 6 månader". Never "steg".
- Under the chart, two collapsed questions:
  - **Vet du något om framtiden?** Opens a list of Swedish events that can be switched on (röda dagar, midsommar, julhandel, industrisemester) plus the user's own ("Kampanj 3 till 9 november", "Stängt 24 till 26 december"). Each change re-runs the forecast and shows the difference as a second line. If an event does not change the forecast, say so in words, so the tool does not look broken.
  - **Hur säker vill du vara?** Three choices: "Troligast", "Räcker i 9 fall av 10", "Räcker i 19 fall av 20". The answer sentence updates. This is the planning level for stock or staff.
- At the bottom: **Ladda ner** (CSV with all quantiles), **Skriv ut**, **Kopiera länk** (settings only, never data).

## Always

- The footer says it is an experiment from Prompt Agency, with no support, and that the data never leaves the computer. Credits to Mistral (Timestral), amine40 (ONNX export and JavaScript port) and the data sources.
- The first visit downloads the model once, with honest progress in megabytes. After that Norn works offline.
- On a phone, Norn shows one page instead of the app: what Norn does, the three steps, that everything runs on your computer, and a firm request to open it on a computer, with a button to copy the link. No way through to the app, and the model is never downloaded there (decision in `PLAN.md`).

## Not in v1

Model choice, several series, anomalies, cycles, state space, a draggable backtest start. They exist in amine40's app. Norn does not link to it from the flow.
