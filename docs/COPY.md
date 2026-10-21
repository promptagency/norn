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
| start.example.since | Per {enhet} sedan {ar} |
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
| verdandi.lead | Norn gissade på {period} utan att få se facit, och jämförde sedan med det som faktiskt hände. |
| verdandi.wait | Norn räknar. Det tar några sekunder. |
| verdandi.good | {Period} träffade Norn i snitt inom {procent} procent, betydligt bättre än att upprepa {jamfort}. |
| verdandi.fair | {Period} träffade Norn i snitt inom {procent} procent. Bättre än att gissa, men lita mer på banden än på linjen. |
| verdandi.good.abs | {Period} missade Norn i snitt med {fel} per {enhet}, betydligt bättre än att upprepa {jamfort}. |
| verdandi.fair.abs | {Period} missade Norn i snitt med {fel} per {enhet}. Bättre än att gissa, men lita mer på banden än på linjen. |
| verdandi.poor | Norn såg inget tydligt mönster i den här datan. Prognosen blir bred. Fler datapunkter eller en jämnare serie hjälper. |
| verdandi.bands | Det som faktiskt hände hamnade i det smala bandet {in50} procent av gångerna och i det breda {in90} procent. Banden lovar hälften och nio av tio. |
| verdandi.chart | {namn} från {start} till {slut}. Den senare delen visar Norns gissning som band och det som faktiskt hände som en grå linje. |
| verdandi.d.error | Medelfel per {enhet} |
| verdandi.d.naive | Om du upprepat {jamfort} |
| verdandi.d.relative | Felet i förhållande till värdet |
| verdandi.d.improvement | Mindre fel än om du upprepat {jamfort} |
| verdandi.d.in50 | Inom bandet för hälften av fallen |
| verdandi.d.in90 | Inom bandet för nio fall av tio |
| verdandi.d.share | {andel} %, väntat {vantat} % |
| verdandi.d.period | Testperiod och modell |
| verdandi.d.period.value | {start} till {slut}, {modell} |
| verdandi.rule | Pålitlig betyder att Norn missade minst {battre} procent mindre än att upprepa {jamfort}, och att minst {inom} procent av det som hände hamnade i det breda bandet. Osäker betyder att Norn inte gjorde bättre än att upprepa {jamfort}. Ungefärlig är allt däremellan. |
| period.ar | det senaste året |
| period.n | de senaste {antal} {enheter} |
| jamfort.vecka | samma {enhet} förra veckan |
| jamfort.ar | samma {enhet} förra året |
| jamfort.forra | förra året |
| enhet.timme.bestamd | timmarna |
| enhet.dag.bestamd | dagarna |
| enhet.vecka.bestamd | veckorna |
| enhet.månad.bestamd | månaderna |
| enhet.kvartal.bestamd | kvartalen |
| enhet.år.bestamd | åren |
| model.loading | Norn laddar ner prognosmodellen, {mb} av {total} MB. |
| error.model | Norn kunde inte göra prognosen. Ladda om sidan och försök igen. |
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
| model.ready | Klar. Norn fungerar nu även utan internet. |
| error.short | Serien är för kort. Norn behöver minst 64 värden för att se ett mönster. |
| error.irregular | Tiderna i filen kommer inte med jämna mellanrum. Välj en kolumn med datum eller tid i ordning. |
| error.column | Norn kan inte läsa kolumnen {namn} som tal. Kontrollera att den bara innehåller siffror. |
| start.heading | Se vad som väntar i dina egna siffror |
| urd.heading | Det här är din data |
| urd.describe | {namn} per {enhet}, från {start} till {slut}. |
| urd.count | {antal} {enheter}. |
| urd.count.missing | {antal} {enheter}, {saknas} saknas. |
| urd.bucketed | Visas som snitt per {grupp}. Norn räknar på varje {enhet}. |
| urd.time | Vilken kolumn har tiden? |
| urd.many | Filen har flera rader per {enhet}. Ska Norn lägga ihop dem? |
| urd.many.pick | Hur ska raderna läggas ihop? |
| urd.many.sum | Summera |
| urd.many.mean | Ta snittet |
| urd.many.hint | Summera passar för försäljning och besök. Snittet passar för pris och temperatur. |
| data.column | Kolumn {n} |
| datum.kvartal | kvartal {kvartal} {ar} |
| enhet.timme | timme |
| enhet.timme.flera | timmar |
| enhet.dag | dag |
| enhet.dag.flera | dagar |
| enhet.vecka | vecka |
| enhet.vecka.flera | veckor |
| enhet.månad | månad |
| enhet.månad.flera | månader |
| enhet.kvartal | kvartal |
| enhet.kvartal.flera | kvartal |
| enhet.år | år |
| enhet.år.flera | år |
| error.file | Norn kan inte läsa filen. Spara den som CSV eller Excel och försök igen, eller klistra in siffrorna direkt. |
| error.notime | Norn hittar ingen kolumn med datum eller tid. Filen behöver en kolumn för tid och en med siffror. |
| footer.experiment | Norn är ett experiment från Prompt Agency. Ingen support, ingen garanti. Din data lämnar aldrig datorn. |
| footer.credits | Prognoserna görs av Timestral från Mistral AI, i webbläsaren tack vare amine40:s ONNX-export. Exempeldata från SCB, SMHI, elprisetjustnu.se och Wikimedia. |
