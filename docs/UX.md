# UX.md – four screens, one answer each

Norn shows one screen at a time and one answer per screen. The user never sees a setting before seeing a result. Everything advanced sits behind a question in plain Swedish. The norns are the steps, not decoration. Owner's flow, 2026-10-20.

```
Start  →  Urd (what has been)  →  Verdandi (how well the model reads it)  →  Skuld (what is to come)
```

The three step names are always visible at the top, clickable backwards. The user cannot jump forwards. Nothing in the flow links out of the app.

## 0. Start

```
   Gör en prognos av dina egna siffror          ┌───────────────────────────────┐
   Har du siffror över tid, som försäljning     │  Släpp en fil här, eller välj │   ← drop zone, yta-sankt
   per dag eller elräkningen per månad? Lägg    │  en fil på datorn             │
   in dem här så visar Norn                     └───────────────────────────────┘
   ✓ vad som troligen kommer …
   ✓ hur mycket du kan lita på det …
   ✓ allt i din webbläsare …

   ┌───────────────┐ ┌───────────────┐ ┌───────────────┐
   │ Detaljhandel  │ │ Elförbrukning │ │ Wikipedia     │            ← example cards
   └───────────────┘ └───────────────┘ └───────────────┘
```

- What Norn gives and how, in a few lines beside the drop zone, then the example cards. Under the points, "Så kan filen se ut" shows three rows of a file; under the drop zone one line says the model is downloaded the first time only, with its size (owner, 2026-10-25). No tutorial. The owner asked for this on 2026-10-24: the first version went straight to the drop zone, and the phone page explained more than the app did.
- Layout (owner, 2026-10-25): the drop zone's top lines up with the heading's; under it the download line and "Så kan filen se ut". The lead and the three points are a size larger, "Så fungerar Norn" is a secondary button, and a line divides the examples ("Eller prova med riktiga siffror") from the rest.
- Each example card has one line saying what it teaches (from `examples.json`). Clicking it goes straight to Urd with the file loaded.
- Pasting text from a spreadsheet works anywhere on the page.

## 1. Urd, what has been

- The chart shows the history only. No bands, no forecast.
- Above the chart, one sentence Norn writes itself: "Försäljning per dag, 1 januari 2023 till 30 september 2026. 1 004 dagar, 3 saknas."
- Under it: "Stämmer det?" with the button **Ja** and a quiet link "Nej, ändra kolumner".
- If the file has more than one number column: "Vilken kolumn vill du förutse?" with the column names as buttons. The other columns are kept silently for Skuld.
- For the retail example, the four trades are buttons here.
- Under "Stämmer det?" one quiet line says why it asks: Norn found the time and the numbers itself, so check the period and the count (owner, 2026-10-25).
- Errors are handled here, always with a suggestion, never only an error: irregular timestamps (add the values up per day, week or month), too short a series (under 64 points, since Norn needs them both to see a pattern and to test itself), a column that cannot be read (remove words and signs, or leave the cell empty), no time column (which date formats work).

## 2. Verdandi, the test: how well Norn guesses on your own data

Runs automatically after **Ja**. A backtest on the last period, its length set by frequency:

| Frequency | Backtest period |
|---|---|
| Hour | the last 7 days |
| Day | the last 12 months (owner's decision 2026-10-21, so yearly peaks are tested) |
| Week | the last 6 months |
| Month | the last 12 months |
| Quarter, year | the last 4 periods |

- The chart shows the end of the history with the model's forecast laid over what actually happened. The bands appear here for the first time, so the user learns what they mean on data where the answer is known.
- It must be unmistakable that this is a test with a known answer, not a forecast (owner, 2026-10-25): the heading asks "Kan du lita på prognosen?", one lead sentence says Norn found out with a test on the user's own numbers, and three numbered steps say how (Norn hides the period, guesses without the answer, and the guess is compared with what happened). The chart's halves are "Det Norn fick se" and "Gömt för Norn, med facit".
- Above the chart, a grade in three levels with one sentence:
  - **Pålitlig.** "Norn träffade i snitt inom 6 procent de senaste tre månaderna, betydligt bättre än att upprepa förra året."
  - **Ungefärlig.** "Norn träffade inom 18 procent. Bättre än att gissa, men lita mer på intervallet än på linjen."
  - **Osäker.** "Norn såg inget tydligt mönster i den här datan. Prognosen blir bred. Fler datapunkter eller en jämnare serie hjälper."
- The numbers behind the grade (error, error of repeating last season, share inside each band) sit under a collapsible "Visa detaljer", with the rule in words. The thresholds are decided in `PLAN.md`.
- Under the grade's sentence, one line says what the grade means for the user (owner, 2026-10-25): Pålitlig, plan by the forecast; Ungefärlig, plan by the bands rather than the line; Osäker, take it as a hint. Osäker's sentence also says what helps (a longer period, or the numbers added up per week or month).
- Under the chart, one sentence says whether the bands held, by the same 75 percent limit as the grade: "Banden höll ungefär vad de lovar…" or "Banden var för smala…".
- While the test runs it is named: "Norn gissar på det senaste året utan att titta på facit."
- One button: **Visa vad som kommer**.

## 3. Skuld, what is to come

- The chart fills the screen. History muted, forecast with the median and two bands. The bands dominate. The chart ends at the end of the horizon.
- Above the chart, the answer in one sentence: "De närmaste 30 dagarna landar troligen på 412 000 kr, mellan 371 000 och 458 000 i nio fall av tio." Sums for amounts like sales, averages for levels like price or temperature.
- Under the answer, one line reminds of the test: the grade, "I provet på det senaste året träffade Norn i snitt inom 7 procent." and a link "Se provet" back to Verdandi (owner, 2026-10-25). A link that opens Skuld directly runs the test there, once.
- Horizon: three or four buttons in the user's unit. For daily data "2 veckor, 1 månad, 3 månader, 6 månader". Never "steg".
- Under the chart, two collapsed questions:
  - **Vet du något om framtiden?** Opens a list of Swedish events that can be switched on (röda dagar, midsommar, julhandel, industrisemester) plus the user's own ("Kampanj 3 till 9 november", "Stängt 24 till 26 december"). Each change re-runs the forecast and shows the difference as a second line. If an event does not change the forecast, say so in words, so the tool does not look broken.
  - **Hur säker vill du vara?** Three choices: "Troligast", "Räcker i 9 fall av 10", "Räcker i 19 fall av 20". The answer sentence updates. This is the planning level for stock or staff.
- At the bottom: **Ladda ner** (CSV with all quantiles) and **Spara som PDF** (the browser's print dialog, with a print layout that leaves out what only works on screen and keeps the bands' colours). Kopiera länk was removed (owner, 2026-10-25): it read as sharing, which Norn otherwise never does; old example links still open.
- Every chart has a heading that says what data it shows: "Leksaksaffärer per månad, provet på det senaste året" (owner, 2026-10-25).
- "Vet du något om framtiden?" and "Hur säker vill du vara?" each have a longer explanation in quiet text under their lead. The details question is "Varför står det minst nio fall av tio?".
- Four short guidance lines (owner, 2026-10-25): under the horizon buttons why the bands widen further ahead; in the events question what Norn does with an event (it looks in the history for what such days did); in the certainty question which number to plan by and when 9 of 10 pays off; and under the buttons what the download holds. The download line is not printed.

## Zooming in on a chart

Every chart with values under the pointer can zoom in on time (owner, 2026-10-25): drag across it with the mouse, pinch with two fingers, or press plus and minus with the chart focused. A row above the chart says which stretch is shown, with the button "Visa hela perioden" to go back (Esc does the same). In Urd a long history is drawn as means per day or week; zooming in shows those means closer, not the single hours.

## Vanliga frågor

A window over the page (owner, 2026-10-25), opened from "Vanliga frågor" after the header tag ("Ett experiment från Prompt Agency | Vanliga frågor") on Start, the explanation page and the phone page, and from the footer on every screen. Nine questions as `Fraga`, one open at a time, then a link to Så fungerar Norn in a new tab. A window, so a forecast in progress stays where it is.

## Så fungerar Norn (`/om`)

A page of its own for the curious reader who wants the reasoning, the model and the details (owner, 2026-10-25). Plain words first, the technical part further down: what Norn is and why, what it can be used for, the three steps and why the test comes first, how to read the bands, the grades and their rule, where the data is, the Timestral model from Mistral AI, a technical part with the facts in a table, what Norn does not do, and the project with its links.

- Reached from Start (a link under the three points), from the footer on every screen, from Verdandi's "Visa detaljer" (to the grades) and from the phone page. Phones get the page too; it loads no model.
- The footer and Verdandi open it in a new tab, since the user's data lives only in the tab they are in. Start and the phone page open it in the same tab.
- It is the only place outside "Visa detaljer" where words like kvantil and backtest appear, each explained where it first does. Its two links out (the code on GitHub and Timestral on Hugging Face) open in a new tab; the user flow still links nowhere but Prompt Agency.

## Always

- The footer says it is an experiment from Prompt Agency, with no support, and that the data never leaves the computer. Credits to Mistral (Timestral), amine40 (ONNX export and JavaScript port) and the data sources.
- The first visit downloads the model once, with honest progress in megabytes. After that Norn works offline.
- On a phone, Norn shows one page instead of the app: what Norn does, the three steps, that everything runs on your computer, and a firm request to open it on a computer, with a button to copy the link. No way through to the app, and the model is never downloaded there (decision in `PLAN.md`).

## Not in v1

Model choice, several series, anomalies, cycles, state space, a draggable backtest start. They exist in amine40's app. Norn does not link to it from the flow.
