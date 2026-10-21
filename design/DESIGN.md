# Norn design programme

Norn makes forecasts on your own numbers, in the browser, without anything leaving the computer. The name comes from the three norns who spin the thread of fate, and the app follows them in three steps: Urd (what has been), Verdandi (what is) and Skuld (what is to come). The look comes from the linen cupboard and the loom, not from finance. It should feel calm, warm and honest about uncertainty.

This folder is the source of truth for how the app looks. Read this file before any change to the interface.

The design system also exists in Claude as an artifact ("Norn", Design System type). Until the app is built, that artifact is the source and this folder is a copy. Once the app is built, this folder takes over, and the artifact is updated from here when something changes. Never change a value in one place only.

## What is in this folder

| Path | What it is | How to use it |
|---|---|---|
| `tokens.json` | All colours, type styles, spacing and radii as data, for both themes | The source for `tokens.css`. Read it from chart code when a value is needed in JS |
| `tokens.css` | The same tokens as CSS custom properties, generated | Import it. Every visual value in the app comes from here. Regenerate with `python scripts/build_tokens_css.py` |
| `fonts.css`, `fonts/` | The two typefaces as self-hosted variable fonts, with their licences | Import it. Never load fonts from a CDN |
| `logo/` | The logotype as SVG, outlined | Use the files as they are |
| `icon/` | The app icon as SVG and PNG (16, 32, 180, 512) | Favicon, apple-touch-icon and web manifest |

## Vocabulary

Token names are Swedish and belong to the brand. Keep them as they are.

| Token | Meaning |
|---|---|
| `grund` | ground, the page background |
| `yta` | surface, raised on the ground |
| `yta-sankt` | sunken surface |
| `text-dampad` | muted text |
| `indigo` | the brand colour, plant-dyed indigo yarn |
| `pa-indigo` | "on indigo", text on a brand fill |
| `kant` | border, decorative |
| `kant-kontroll` | border on a control |
| `krapp` | madder red, the accent that marks the present |
| `fel` | error |
| `fokus` | focus ring |
| `prognos-…` | forecast chart colours |
| `ljus`, `mork` | the light (positive) and dark (negative) themes |

## Logo

- The logo is the word **norn** in Bricolage Grotesque, weight 700, optical size 96, letter spacing −0.03 em, lower case, outlined. It has no symbol. Use the files in `logo/`. Never retype it in a font.
- Positive: `norn-logotyp-positiv.svg` (indigo `#26325F`) on linen (`--grund` in `ljus`), on `--yta` or on white.
- Negative: `norn-logotyp-negativ.svg` (linen `#EFE8DA`) on night indigo (`--grund` in `mork`) or on indigo.
- One colour: `norn-logotyp-svart.svg` and `norn-logotyp-vit.svg`, only where colour is not available.
- Clear space: the height of the logo's "o" on every side. The files have no padding of their own.
- Minimum size: 64 px wide on screen. Below that, use the icon.
- The icon is an "n" in weight 800 on a rounded plate (radius 112 of 512). Positive is the favicon and app icon. It replaces the logo on small surfaces and never stands next to it.
- Do not tilt, stretch, recolour or add effects to the logo. The logo says "norn" in lower case; running text says "Norn".

## Colour

Two themes that mirror each other. `ljus` is the positive version on linen, `mork` the negative on night indigo. `tokens.css` follows the operating system unless the app sets `data-theme` on `<html>`.

| Token | Light | Dark | Use |
|---|---|---|---|
| `grund` | `#EFE8DA` | `#1D2447` | Page background |
| `yta` | `#F8F4EA` | `#252D55` | Cards, fields, dialogs, the forecast card |
| `yta-sankt` | `#E5DCC8` | `#171D3A` | Footer, file drop zone, disabled fields |
| `text` | `#1B1F33` | `#EFE8DA` | Body text and headings |
| `text-dampad` | `#545664` | `#B7BBD1` | Secondary text, help text, axis labels, sources |
| `indigo` | `#26325F` | `#EFE8DA` | Logo, primary button, links, active step |
| `pa-indigo` | `#EFE8DA` | `#1D2447` | Text on an indigo fill |
| `kant` | `#D9D0BB` | `#39427A` | Decorative dividers, card borders |
| `kant-kontroll` | `#7D786B` | `#8A92C4` | Borders on controls |
| `fokus` | `#26325F` | `#EFE8DA` | Focus ring |
| `krapp` | `#A8432B` | `#E8896F` | The present, sparingly |
| `fel` | `#9A2E1F` | `#FFB4A2` | Error text |

Rules:

- Use tokens, never a hex value, in component CSS.
- Let `grund` and `text` carry almost everything. A screen is first of all background, text and one chart.
- `krapp` marks the present: the now-line in the chart, and at most one more mark per view.
- Errors are shown in `fel` and always say what is wrong in words.
- Every text pair is at least 4.5:1 in both themes (checked 2026-10-20). Controls, focus ring and chart lines are at least 3:1.

## The forecast chart

The chart is Norn's most important picture, and where the thread lives on now that the logo is plain. History is a spun thread that frays into bands as it passes the present.

| Token | Light | Dark | Drawn as |
|---|---|---|---|
| `prognos-historik` | `#26325F` | `#EFE8DA` | Solid line, 2.5 px |
| `prognos-median` | `#26325F` | `#EFE8DA` | Same colour, dotted (dash 1, gap 6, round caps) |
| `prognos-band-90` | `#C9CEE3` | `#323C74` | Fill, drawn first |
| `prognos-band-50` | `#9AA3CC` | `#4E5A9C` | Fill, on top of band-90 |
| `prognos-nu` | `= krapp` | `= krapp` | Vertical line, 2 px |
| `prognos-utfall` | `#6B6A72` | `#A3A7C2` | Solid line, 2 px, backtest only |

Rules:

- The bands take more of the picture than the median line. Uncertainty is the point, not the line.
- The future never looks as certain as the past: the median is dotted, history is solid.
- Always explain the bands in words next to the chart ("Hamnar här i nio fall av tio"). Colour never carries meaning alone. The bands also differ in lightness, not only in hue.
- At most four values on the vertical axis (owner's decision 2026-10-21, was three), with the unit written once, each with a faint 1 px line across the chart in `kant`, drawn behind the bands (owner's decision 2026-10-21; before that the chart had no grid). No vertical grid lines.
- Time on the horizontal axis in the user's unit (days, weeks, months), never "steps".

## Type

| Style | Family | Size / line | Weight | Use |
|---|---|---|---|---|
| `rubrik-xl` | Bricolage Grotesque | 56 / 60 | 700 | Page heading, one per page |
| `rubrik-l` | Bricolage Grotesque | 40 / 46 | 700 | Step heading (Urd, Verdandi, Skuld) |
| `rubrik-m` | Bricolage Grotesque | 28 / 34 | 700 | Subheadings, card headings |
| `rubrik-s` | Bricolage Grotesque | 20 / 26 | 600 | Small headings, example cards |
| `svar` | Figtree | 22 / 32 | 400 | The one-sentence answer above the chart, amount in 600 |
| `ingress` | Figtree | 20 / 30 | 400 | Lead paragraph |
| `brod` | Figtree | 16 / 26 | 400 | Body text |
| `brod-stark` | Figtree | 16 / 26 | 600 | Emphasis, button labels |
| `liten` | Figtree | 14 / 20 | 400 | Help text, sources, axis labels, footer |
| `etikett` | Figtree | 12 / 16 | 600, +0.04 em | Field labels, chart legends, overlines |

- Bricolage Grotesque only for headings and the logo. Buttons, fields and running text are always Figtree. Figtree is shared with Skrubba.
- Numbers that are compared (amounts, dates, axis labels) use `font-variant-numeric: tabular-nums` (the `.siffror` class). There is no separate number face.
- Capital letter only on the first word and on proper names. No all-caps words except in `etikett`.

## Form

- Radii: `radius-md` (10 px) on buttons and fields, `radius-lg` (16 px) on cards, `radius-sm` (6 px) on small labels, `radius-full` on pills and step markers.
- Spacing from `space-1` (4 px) to `space-16` (64 px). `space-6` inside cards, `space-12` between sections.
- Separate surfaces with colour and a thin `kant` border, not shadows.
- Keyboard focus: a solid ring in `fokus`, 2 px wide with 2 px offset.
- If the thread motif is used as decoration, it has round caps and frays to the right, in the direction of time.

## Tone

The full copy rules and fixed strings are in `docs/COPY.md`. In short: Swedish, "du", short sentences, one answer per screen, uncertainty in everyday words, honest when the model finds no pattern.

## Components

The components are React code in `src/ui/components/`, documented in `src/ui/components/README.md`. The design system in Claude shows the same code. Build screens from them: `Sidhuvud` with `Steg`, `Svar`, `Kort` with `Prognosgraf` and `Forklaring`, `Betyg`, `Fraga`, `Sakerhetsval`, `Nyckeltal`, `Valgrupp` with `Valknapp`, `Knapp`, `Slappyta`, `Exempelkort` and `Sidfot`. One `primar` button per screen.

The approved screen sketches (Start, Urd, Verdandi, Skuld, with real Timestral output on the SE3 price) are on the design canvas "Norn skärmskisser" in Claude.

## The phone page

Phones get one page instead of the app (decision in `PLAN.md`), approved on the design canvas "Norn skärmskisser" (artboard Telefon) on 2026-10-21. One column, 16 px side margin, light and dark from the tokens like every other screen.

1. `Sidhuvud` with the tagline, as on Start.
2. Heading in `rubrik-l` (`rubrik-xl` is too large at this width) and the lead in `ingress`.
3. A `Kort figur` with a `Prognosgraf` illustration: a made-up history up to the now-line, then the median and both bands widening. No axis numbers, since nothing on it is a real forecast.
4. "Tre steg, som de tre nornorna" in `rubrik-s`, then the three steps as a list with an indigo number marker (28 px, `radius-full`), the step's name in `brod-stark`.
5. "Allt händer i din dator" on a `Kort`.
6. "Öppna Norn på en dator" on a `Kort framhavd` with a heading in `rubrik-m`, and the page's one `primar` button, Kopiera länken, at full width.
7. `Sidfot`.

## Not yet defined

- Icons. Write actions out in words until an icon set is chosen. The only drawn marks are the upload arrow, the tick in `Steg`, the chevron in `Fraga` and the dots in `Betyg`.

If a design decision is not covered here, ask instead of inventing one.
