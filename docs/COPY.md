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
| app.title | Norn. Gör en prognos av dina egna siffror. |
| start.lead | Har du siffror över tid, som försäljning per dag eller elräkningen per månad? Lägg in dem här så visar Norn |
| start.gets.forecast | vad som troligen kommer under de närmaste dagarna, veckorna eller månaderna |
| start.gets.trust | hur mycket du kan lita på det, prövat mot din egen historik |
| start.gets.private | allt i din webbläsare, så filen skickas aldrig någonstans |
| start.drop | Släpp en fil här, eller välj en fil på datorn |
| start.drop.hint | CSV eller Excel med en kolumn för tid och en med siffror. Du kan också klistra in direkt från ett kalkylark. |
| start.drop.over | Släpp filen så läser Norn in den |
| start.examples | Eller prova med riktiga siffror |
| start.example.since | Per {enhet} sedan {ar} |
| header.home | Norn, till start |
| header.tag | Ett experiment från Prompt Agency |
| link.newtab | öppnas i en ny flik |
| step.label | Steg |
| step.done | klart |
| step.urd | Urd |
| step.verdandi | Verdandi |
| step.skuld | Skuld |
| step.urd.hint | Din data |
| step.verdandi.hint | Provet |
| step.skuld.hint | Prognosen |
| urd.confirm | Stämmer det? |
| urd.yes | Ja |
| urd.change | Nej, ändra kolumner |
| urd.pick | Vilken kolumn vill du förutse? |
| verdandi.heading | Kan du lita på prognosen? |
| verdandi.grade.good | Pålitlig |
| verdandi.grade.fair | Ungefärlig |
| verdandi.grade.poor | Osäker |
| verdandi.details | Visa detaljer |
| verdandi.next | Visa vad som kommer |
| verdandi.lead | Norn tog reda på det med ett prov på dina egna siffror. |
| verdandi.how | Så gick provet till |
| verdandi.how.hide | Norn gömmer {period} i din fil. |
| verdandi.how.guess | Norn gissar på det, utan facit. |
| verdandi.how.compare | Gissningen jämförs med det som hände. |
| verdandi.wait | Norn räknar. Det tar några sekunder. |
| verdandi.good | {Period} träffade Norn i snitt inom {procent} procent, betydligt bättre än att upprepa {jamfort}. |
| verdandi.fair | {Period} träffade Norn i snitt inom {procent} procent. Bättre än att gissa, men lita mer på banden än på linjen. |
| verdandi.good.abs | {Period} missade Norn i snitt med {fel} per {enhet}, betydligt bättre än att upprepa {jamfort}. |
| verdandi.fair.abs | {Period} missade Norn i snitt med {fel} per {enhet}. Bättre än att gissa, men lita mer på banden än på linjen. |
| verdandi.good.plain | {Period} träffade Norn i snitt inom {procent} procent. Att upprepa {jamfort} hade träffat nästan lika bra, så mönstret är tydligt. |
| verdandi.fair.plain | {Period} träffade Norn i snitt inom {procent} procent, ungefär som att upprepa {jamfort}. Lita mer på banden än på linjen. |
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
| verdandi.rule | Pålitlig betyder att minst {inom} procent av det som hände hamnade i det breda bandet, och att Norn antingen missade med högst {nara} procent eller missade minst {battre} procent mindre än att upprepa {jamfort}, med högst {langt} procent. Osäker betyder att Norn varken gjorde bättre än att upprepa {jamfort} eller missade med högst {nara} procent. Ungefärlig är allt däremellan. |
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
| model.once | Det sker bara första gången. |
| error.model | Norn kunde inte göra prognosen. Ladda om sidan och försök igen. |
| chart.seen | Det Norn fick se |
| chart.guessed | Gömt för Norn, med facit |
| chart.past | Senaste perioden |
| chart.now | Nu |
| legend.history | Det som varit |
| legend.outcome | Det som faktiskt hände |
| legend.median | Troligast |
| legend.median.backtest | Norns troligaste gissning |
| legend.band50 | Hamnar här i hälften av fallen |
| legend.band90 | Hamnar här i nio fall av tio |
| graf.nio | I nio fall av tio |
| graf.intervall | {lag} till {hog} |
| graf.klockslag | {datum} kl. {tid} |
| graf.vecka | veckan från {datum} |
| skuld.heading | Det som kommer |
| skuld.prov.percent | I provet på {period} träffade Norn i snitt inom {procent} procent. |
| skuld.prov.abs | I provet på {period} missade Norn i snitt med {fel} per {enhet}. |
| skuld.prov.poor | I provet på {period} såg Norn inget tydligt mönster. |
| skuld.prov.link | Se provet |
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
| skuld.answer.summa | {Period} landar det troligen på totalt {median}, mellan {lag} och {hog} i minst nio fall av tio. |
| skuld.answer.snitt | {Period} landar snittet troligen på {median}, mellan {lag} och {hog} i minst nio fall av tio. |
| skuld.plan.summa | Räkna med {varde} totalt {period}, så räcker det i minst {fall}. |
| skuld.plan.snitt | Räkna med högst {varde} i snitt {period}, så räcker det i minst {fall}. |
| skuld.fall.90 | nio fall av tio |
| skuld.fall.95 | 19 fall av 20 |
| skuld.wait | Norn räknar fram prognosen. |
| skuld.chart | {namn} den senaste tiden och Norns prognos för {period}. |
| skuld.details | Varför står det minst? |
| skuld.details.text | Norn räknar fram ett intervall för varje {enhet} och lägger ihop dem. Det antar att alla {enheter} slår åt samma håll samtidigt, så intervallet för helheten blir hellre för brett än för smalt. Därför står det minst nio fall av tio. |
| skuld.events.lead | Slå på det som gäller under perioden. Norn räknar om prognosen. |
| skuld.events.effect | Med {handelser} landar det på {med} i stället för {utan}. |
| skuld.events.empty | Inga av de händelser Norn känner till infaller under perioden. |
| skuld.events.daily | Norn känner bara till händelser för data per dag eller timme. |
| skuld.link.done | Länken är kopierad |
| event.roda | Röda dagar |
| event.midsommar | Midsommarafton |
| event.lucia | Lucia |
| event.julhandel | Julhandeln |
| event.industrisemester | Industrisemestern |
| narmast.dygn | det närmaste dygnet |
| narmast.vecka | den närmaste veckan |
| narmast.månad | den närmaste månaden |
| narmast.kvartal | det närmaste kvartalet |
| narmast.år | det närmaste året |
| narmast.n | de närmaste {antal} {enheter} |
| enhet.dygn | dygn |
| enhet.dygn.flera | dygn |
| enhet.dygn.bestamd | dygnen |
| csv.filename | norn-prognos.csv |
| csv.time | tid |
| csv.median | troligast |
| csv.low | lägst i nio fall av tio |
| csv.high | högst i nio fall av tio |
| csv.level | kvantil {procent} % |
| error.short | Serien är för kort. Norn behöver minst 64 värden för att se ett mönster. |
| error.irregular | Tiderna i filen kommer inte med jämna mellanrum. Välj en kolumn med datum eller tid i ordning. |
| error.column | Norn kan inte läsa kolumnen {namn} som tal. Kontrollera att den bara innehåller siffror. |
| start.heading | Gör en prognos av dina egna siffror |
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
| mobil.heading | Gör en prognos av dina egna siffror |
| mobil.lead | Du har siffror över tid, kanske försäljning per dag eller elräkningen per månad. Norn visar vad som troligen kommer och hur säker du kan vara. |
| mobil.steps | Tre steg, som de tre nornorna |
| mobil.urd | Urd, det som varit. Norn läser din fil och berättar med en mening vad den ser. |
| mobil.verdandi | Verdandi, det som är. Norn gissar på en period den inte fått se och jämför med det som faktiskt hände. Då vet du hur mycket du kan lita på den. |
| mobil.skuld | Skuld, det som kommer. Prognosen, med ett band där det hamnar i hälften av fallen och ett där det hamnar i nio fall av tio. |
| mobil.tech.heading | Allt händer i din dator |
| mobil.tech | Prognoserna görs av Timestral, en modell från Mistral AI som har lärt sig av mängder av tidsserier. Norn laddar ner modellen en gång och kör den i din webbläsare. Din fil skickas aldrig någonstans. |
| mobil.desktop.heading | Öppna Norn på en dator |
| mobil.desktop | Norn behöver en större skärm, och modellen är {mb} MB. Dina filer finns troligen på datorn också. Gå till {adress} där, så kan du börja direkt. Det finns exempel med riktiga siffror om du vill prova utan egna. |
| mobil.link | Kopiera länken |
| mobil.link.done | Länken är kopierad |
| footer.experiment | Norn är ett experiment från Prompt Agency. Ingen support, ingen garanti. Din data lämnar aldrig datorn. |
| footer.credits | Prognoserna görs av Timestral från Mistral AI, i webbläsaren tack vare amine40:s ONNX-export. Exempeldata från SCB, eSett och Wikimedia. |
| footer.version | Version {version} |
