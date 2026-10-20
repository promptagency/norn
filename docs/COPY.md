# COPY.md – svensk text i Norn

Norn används av den som har siffror över tid och vill veta vad som väntar, utan att kunna statistik. Butiksägaren, den som betalar elräkningen, webbshoppen, kommunens handläggare. Texten ska kännas som en kunnig granne som förklarar, inte som ett analysverktyg.

## Regler

- Skriv som till en granne. Korta meningar, aktiv form, du-tilltal.
- Inga kolon och inga tankstreck i löpande text. Skriv om meningen i stället.
- Versal bara i första ordet i rubriker och meningar, i egennamn och i förkortningar.
- Ett svar per skärm. Det viktigaste står först, i en mening.
- Tid anges alltid i användarens enhet, timmar, dagar, veckor eller månader. Skriv aldrig "steg".
- Osäkerhet uttrycks i vardagliga ord. "I nio fall av tio", "i hälften av fallen", "troligast". Skriv aldrig kvantil, konfidensintervall, percentil, MASE eller kovariat i gränssnittet. Under "Visa detaljer" får begreppen finnas, men alltid med en förklaring.
- Säg "din dator" och "din webbläsare", inte "klienten" eller "lokalt".
- Säg ärligt när Norn inte hittar något mönster. Ett osäkert svar som sägs rakt är bättre än ett säkert som inte stämmer.
- Lova aldrig att prognosen stämmer. Norn visar vad som är troligt, inte vad som händer.
- Inga utropstecken. Ingen entusiasm. Lugn och saklig, med lite värme.
- Felmeddelanden säger vad som hände och vad man kan göra, i den ordningen.
- Belopp med mellanslag som tusentalsavgränsare och "kr" efter, "412 000 kr". Decimalkomma.

## Fasta strängar

Utkast. Ändras när skärmskisserna är godkända.

| Nyckel | Text |
|---|---|
| app.name | Norn |
| app.title | Norn. Se vad som väntar i dina egna siffror. |
| start.lead | Ladda upp en fil med siffror över tid, så visar Norn vad som väntar. |
| start.privacy | Inget lämnar din dator. |
| start.drop | Släpp en fil här, eller välj en fil på datorn |
| start.drop.hint | CSV eller Excel med en kolumn för tid och en med siffror. Du kan också klistra in direkt från ett kalkylark. |
| start.drop.over | Släpp filen så läser Norn in den |
| start.examples | Eller prova med riktiga siffror |
| header.home | Norn, till start |
| header.tag | Ett experiment från Prompt Agency |
| step.label | Steg |
| step.done | klart |
| step.urd | Urd |
| step.verdandi | Verdandi |
| step.skuld | Skuld |
| step.urd.hint | Det som varit |
| step.verdandi.hint | Det som är |
| step.skuld.hint | Det som kommer |
| urd.confirm | Stämmer det? |
| urd.yes | Ja |
| urd.change | Nej, ändra kolumner |
| urd.pick | Vilken kolumn vill du förutse? |
| verdandi.heading | Hur bra läser Norn din data? |
| verdandi.grade.good | Pålitlig |
| verdandi.grade.fair | Ungefärlig |
| verdandi.grade.poor | Osäker |
| verdandi.details | Visa detaljer |
| verdandi.next | Visa vad som kommer |
| chart.seen | Det Norn fick se |
| chart.guessed | Det Norn fick gissa på |
| chart.past | Senaste perioden |
| chart.now | Nu |
| legend.history | Det som varit |
| legend.outcome | Det som faktiskt hände |
| legend.median | Troligast |
| legend.median.backtest | Norns troligaste gissning |
| legend.band50 | Hamnar här i hälften av fallen |
| legend.band90 | Hamnar här i nio fall av tio |
| skuld.heading | Det som kommer |
| skuld.horizon | Hur långt fram |
| skuld.events | Vet du något om framtiden? |
| skuld.events.none | Den här händelsen ändrar inte prognosen. Norn ser ingen sådan effekt i din historik. |
| skuld.certainty | Hur säker vill du vara? |
| skuld.certainty.median | Troligast |
| skuld.certainty.90 | Räcker i 9 fall av 10 |
| skuld.certainty.95 | Räcker i 19 fall av 20 |
| skuld.download | Ladda ner |
| skuld.print | Skriv ut |
| skuld.link | Kopiera länk |
| model.loading | Norn laddar ner prognosmodellen, {mb} av {total} MB. Det sker bara första gången. |
| model.ready | Klar. Norn fungerar nu även utan internet. |
| error.short | Serien är för kort. Norn behöver minst 64 värden för att se ett mönster. |
| error.irregular | Tiderna i filen kommer inte med jämna mellanrum. Välj en kolumn med datum eller tid i ordning. |
| error.column | Norn kan inte läsa kolumnen {namn} som tal. Kontrollera att den bara innehåller siffror. |
| footer.experiment | Norn är ett experiment från Prompt Agency. Ingen support, ingen garanti. Din data lämnar aldrig datorn. |
| footer.credits | Prognoserna görs av Timestral från Mistral AI, i webbläsaren tack vare amine40:s ONNX-export. Exempeldata från SCB, SMHI, elprisetjustnu.se och Wikimedia. |
