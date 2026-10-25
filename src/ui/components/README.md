# Norn components

The component library. The app builds every screen from these, and the Norn design system in Claude shows the same code, built with `npm run build:ds`.

- Change a component here, never in the design system. Then run `npm run build:ds` and upload `dist-ds/components/bundle.js`, `bundle.css` and `index.d.ts` to the design system's `project/components/` (index.d.ts as text/plain), together with any changed `README.md` or `preview.html`.
- Props are documented in `types.ts`. Chart geometry is in `chart.ts`, pure and unit tested.
- Styles are in `components.css`, prefixed `n-`, and use only variables from `design/tokens.css`.
- Swedish strings come from `../copy.ts`, which mirrors `docs/COPY.md`.
- `npm run dev` and `/?galleri` show every component with real data in a gallery (`src/dev/Galleri.tsx`), with a theme switch.

The guidelines below are the same as in the design system (Swedish, like the UI).

## Knapp

En knapp för en handling, eller en länk som ser ut som en knapp när den leder till nästa skärm.

## Regler

- Ha en enda `primar` per skärm. Det är steget framåt, till exempel Ja, Visa vad som kommer.
- Använd `sekundar` för det man kan göra med resultatet, Ladda ner och Spara som PDF, och för Så fungerar Norn på Start.
- Använd `lank` för att backa eller ändra, till exempel Nej, ändra kolumner.
- Ge `href` när knappen leder till en annan skärm, så blir den en riktig länk.
- Skriv handlingen som ett verb eller ett svar. Inga ikoner utan text.

## Exempel

```tsx
<Knapp href="/verdandi">Ja</Knapp>
<Knapp variant="sekundar" onClick={ladda}>Ladda ner</Knapp>
<Knapp variant="lank" onClick={andra}>Nej, ändra kolumner</Knapp>
```

Källkoden finns i repot under `src/ui/components/Knapp.tsx` och propsen i `src/ui/components/types.ts`.

## Valknapp

Ett val bland flera som utesluter varandra, till exempel horisont eller vilken kolumn som ska förutses.

## Regler

- Lägg alltid valknapparna i en `Valgrupp` med en `etikett` som säger vad valet gäller.
- Exakt en knapp i gruppen är `vald`. Den får indigo fyllning.
- Skriv tid i användarens enhet, 1 dygn, 1 vecka, 3 månader. Aldrig steg.
- Använd `Sakerhetsval` för säkerhetsnivån. Valknapp är för kortare val utan förklaring.

## Exempel

```tsx
<Valgrupp etikett="Hur långt fram">
  <Valknapp vald={h === "1 vecka"} onClick={() => setH("1 vecka")}>1 vecka</Valknapp>
</Valgrupp>
```

Källkoden finns i repot under `src/ui/components/Valknapp.tsx` och propsen i `src/ui/components/types.ts`.

## Steg

De tre nornorna som steg, Urd, Verdandi och Skuld, med det aktiva steget fyllt.

## Regler

- Använd `NORNORNA` för namn och tips, så följer texten `docs/COPY.md`.
- Avklarade steg får en bock och en länk tillbaka. Kommande steg går inte att klicka på.
- Stegen sitter i `Sidhuvud`, till höger om logotypen. På Start visas de inte.
- Skärmläsare får stegen som en lista med det aktiva markerat som aria-current step.

## Exempel

```tsx
<Steg steg={NORNORNA.map((s, i) => i < aktivt ? { ...s, onClick: () => ga(i) } : s)} aktivt={aktivt} />
```

Källkoden finns i repot under `src/ui/components/Steg.tsx` och propsen i `src/ui/components/types.ts`.

## Slappyta

Ytan på Start där man släpper en fil eller väljer en från datorn.

## Regler

- Ytan är också en etikett för filväljaren, så hela ytan går att klicka på och nå med tangentbordet.
- Visa fel i ytan med `fel`. Texten säger vad som hände och vad man kan göra.
- Ytan läser bara in filen. Inget skickas någonstans, och texten får aldrig påstå något annat.

## Exempel

```tsx
<Slappyta onFiler={(filer) => lasIn(filer[0])} fel={fel} />
```

Källkoden finns i repot under `src/ui/components/Slappyta.tsx` och propsen i `src/ui/components/types.ts`.

## Exempelkort

Ett exempeldataset på Start, med vad det lär ut och varifrån datan kommer.

## Regler

- Läs `overrad`, `titel`, `text` och `kalla` från `examples.json`, aldrig från koden.
- `text` är en mening om vad exemplet visar, inte en beskrivning av datakällan.
- Lägg korten i ett rutnät med minst 260 px per kort.

## Exempel

```tsx
<Exempelkort overrad="Per timme sedan 2022" titel="Elpris i elområde 3" text="Dygnsrytm, vinter mot sommar, och ibland negativa priser." kalla="elprisetjustnu.se och SMHI" onClick={valj} />
```

Källkoden finns i repot under `src/ui/components/Exempelkort.tsx` och propsen i `src/ui/components/types.ts`.

## Betyg

Betyget i Verdandi, pålitlig, ungefärlig eller osäker, alltid följt av en mening som förklarar det.

## Regler

- Visa aldrig betyget utan en `Svar` bredvid som säger hur stort felet var och vad det jämförs med.
- Prickarna läses som stegen. Fyllda för det Norn är säker på, öppna för det den inte är.
- Trösklarna mellan nivåerna är ett öppet beslut i `PLAN.md` och ska kunna förklaras under Visa detaljer.

## Exempel

```tsx
<Betyg niva="ungefarlig" />
```

Källkoden finns i repot under `src/ui/components/Betyg.tsx` och propsen i `src/ui/components/types.ts`.

## Svar

Svaret i en mening ovanför grafen, det första användaren läser på varje skärm.

## Regler

- En mening, högst två. Det viktigaste talet först och i `<strong>`.
- Uttryck osäkerhet i vardagliga ord, i nio fall av tio. Aldrig kvantil eller procent av spridning.
- Summa för belopp som försäljning, snitt för nivåer som pris och temperatur.

## Exempel

```tsx
<Svar>Snittpriset de närmaste 7 dagarna landar troligen på <strong>89 öre per kWh</strong>, mellan 67 öre och 1,12 kr i nio fall av tio.</Svar>
```

Källkoden finns i repot under `src/ui/components/Svar.tsx` och propsen i `src/ui/components/types.ts`.

## Kort

En upphöjd yta för en graf med förklaring, en fråga eller en grupp nyckeltal.

## Regler

- Använd `figur` för en graf med sin förklaring, så hör de ihop för skärmläsare.
- Skilj kort från grunden med `yta` och en kant i `kant`, aldrig med skugga.
- Använd `framhavd` för det enda kort en skärm pekar mot, till exempel Öppna Norn på en dator på telefonsidan. Högst ett per skärm.
- Ge en graf en `rubrik` som säger vilken data den visar, till exempel Leksaksaffärer per månad, provet på det senaste året. Den blir grafens bildtext.

## Exempel

```tsx
<Kort figur rubrik="Leksaksaffärer per månad, prognos för de närmaste 6 månaderna">
  <Prognosgraf … />
  <Forklaring poster={["median", "band50", "band90"]} />
</Kort>
```

Källkoden finns i repot under `src/ui/components/Kort.tsx` och propsen i `src/ui/components/types.ts`.

## Prognosgraf

Prognosgrafen, en och samma komponent för historiken i Urd, backtestet i Verdandi och prognosen i Skuld.

## Regler

- Urd skickar bara `historik`. Verdandi lägger till `prognos` och `utfall`. Skuld lägger till `prognos` och oftast `tonadHistorik`.
- Prognosen och utfallet börjar i historikens sista punkt, så tråden fransar upp sig där. Nu-linjen dras i `prognos-nu`.
- Band 90 ligger under band 50, och medianen är prickad i ockra. Byt aldrig ordning eller stil.
- Varje värde på den lodräta axeln får en svag linje i `kant` bakom banden. Inga lodräta linjer.
- Ge `enhet`, så står enheten en gång ovanför den lodräta axeln. Exemplen har en enhet i `examples.json`; för en egen fil används kolumnens namn.
- Ge `tidtext`, så visar grafen värdena under pekaren: en linje, en punkt på varje kurva och ett litet kort med tid och värden. Det fungerar med mus, finger och piltangenter. Utan `tidtext` står grafen still, som illustrationen på telefonsidan.
- Med `tidtext` går det också att zooma in på tiden: dra över grafen med musen, nyp med två fingrar, eller tryck plus och minus. Under grafen står vilken period som visas och Visa allt, och Esc visar allt igen. Den lodräta axeln anpassas till det som visas. Ge `xEtiketter` som en funktion av första och sista punkten, så följer etiketterna med in.
- Ge alltid `beskrivning`, som läses av skärmläsare, och sätt `Forklaring` under grafen.
- Skriv `xEtiketter` i användarens enhet. `formatY` lägger till enheten på den lodräta axeln, som har högst fyra värden.
- Grafen ritar alla punkter den får. Minska långa historiker med `bucketMeans` först, till exempel snitt per vecka för timdata över flera år.
- Ritytan är alltid 1000 enheter bred och skalar till sin behållare. `hojd` sätter höjden i samma enheter.

## Exempel

```tsx
<Prognosgraf
  historik={senasteVeckan}
  prognos={{ median, band50: { lo: q25, hi: q75 }, band90: { lo: q05, hi: q95 } }}
  xEtiketter={[{ index: 0, text: "14 okt" }, { index: 168, text: "21 okt" }]}
  formatY={(v) => `${v} kr`}
  foreText="Senaste veckan"
  tonadHistorik
  beskrivning="Elpriset senaste veckan och Norns prognos för veckan som kommer."
/>
```

Källkoden finns i repot under `src/ui/components/Prognosgraf.tsx` och propsen i `src/ui/components/types.ts`.

## Forklaring

Förklaringen under en graf, där varje linje och varje band får sina ord.

## Regler

- Ta bara med det som syns i grafen. I Skuld `median`, `band50` och `band90`. I Verdandi `utfall`, `median-backtest`, `band50` och `band90`.
- Texterna kommer från `docs/COPY.md` och får inte skrivas om i en vy.

## Exempel

```tsx
<Forklaring poster={["median", "band50", "band90"]} />
```

Källkoden finns i repot under `src/ui/components/Forklaring.tsx` och propsen i `src/ui/components/types.ts`.

## Fraga

En hopfälld fråga eller Visa detaljer, stängd från början.

## Regler

- Använd standardvarianten för frågorna i Skuld, Vet du något om framtiden? och Hur säker vill du vara?
- Använd `liten` för Visa detaljer, så läses det som en länk till mer, inte som en egen fråga.
- Det som står i en fråga får aldrig vara nödvändigt för att förstå svaret ovanför.

## Exempel

```tsx
<Fraga rubrik="Hur säker vill du vara?">
  <Sakerhetsval varde={v} onChange={setV} />
</Fraga>
```

Källkoden finns i repot under `src/ui/components/Fraga.tsx` och propsen i `src/ui/components/types.ts`.

## Sakerhetsval

Hur säker vill du vara? Tre planeringsnivåer som radioknappar.

## Regler

- Standard är `median`, troligast. De andra två svarar på hur mycket man ska ha hemma för att det ska räcka.
- När valet ändras uppdateras svarsmeningen, inte bara grafen.
- Ge varje grupp ett eget `namn` om fler än en finns på sidan.

## Exempel

```tsx
<Sakerhetsval varde={niva} onChange={setNiva} />
```

Källkoden finns i repot under `src/ui/components/Sakerhetsval.tsx` och propsen i `src/ui/components/types.ts`.

## Nyckeltal

Siffrorna bakom betyget, under Visa detaljer.

## Regler

- Varje tal har en etikett i vardagsspråk. Fackord som MASE får finnas här, men med en förklaring i etiketten.
- Sätt `text` för värden som är ord och inte tal, till exempel testperiod och modell.

## Exempel

```tsx
<Nyckeltal poster={[{ etikett: "Medelfel per timme", varde: "0,31 kr" }]} />
```

Källkoden finns i repot under `src/ui/components/Nyckeltal.tsx` och propsen i `src/ui/components/types.ts`.

## Sidhuvud

Logotypen och, på stegskärmarna, stegen. Sidfoten med experiment och tack hör till samma fil.

## Regler

- Ge `logoSrc` den positiva logotypen i ljust tema och den negativa i mörkt.
- På Start står Ett experiment från Prompt Agency till höger, och efter ett streck det som skickas i `tillagg`, Vanliga frågor. På stegskärmarna står `Steg` där.
- `Sidfot` tar också `tillagg`, som hamnar efter länken till Så fungerar Norn.
- `Sidfot` visas på varje skärm och säger alltid att datan aldrig lämnar datorn. Skicka egna barn för att byta raden med tack och källor. Länken till Så fungerar Norn öppnas i en ny flik, så en pågående prognos finns kvar. På den sidan själv skickas `utanOm`.
- Prompt Agency är en länk till promptagency.se i både taggen och sidfoten. Den öppnas i en ny flik, så att användarens data inte försvinner.

## Exempel

```tsx
<Sidhuvud logoSrc={logo}>
  <Steg steg={NORNORNA} aktivt={1} />
</Sidhuvud>
<Sidfot tillagg={<Faq />} />
```

Källkoden finns i repot under `src/ui/components/Sidhuvud.tsx` och propsen i `src/ui/components/types.ts`.

## Dialogruta

Ett fönster ovanpå sidan, för Vanliga frågor. Byggt på webbläsarens egen `<dialog>`, så fokus stannar i fönstret och sidan bakom går inte att nå.

## Regler

- Använd det bara för innehåll man läser och stänger, aldrig för ett steg i flödet. Användarens data finns kvar bakom fönstret.
- Rubriken står överst och knappen Stäng till höger om den. Esc stänger också.
- Innehållet byggs av andra komponenter, till exempel en `Fraga` per fråga.

## Exempel

```tsx
<Dialogruta rubrik="Vanliga frågor" oppen={oppen} onStang={() => setOppen(false)}>
  <Fraga rubrik="Skickas mina siffror någonstans?"><p>Nej …</p></Fraga>
</Dialogruta>
```

Källkoden finns i repot under `src/ui/components/Dialogruta.tsx` och propsen i `src/ui/components/types.ts`.
