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

## Sidan Så fungerar Norn

Texten på `/om` har nycklarna `om.*`, i tabellen nedan. Samma regler gäller. I avsnittet För den som vill veta mer får tekniska ord som kvantil och backtest finnas, alltid förklarade där de dyker upp första gången. Fakta om Timestral kommer från Mistral AI:s modellkort, kod och lanseringstext, inte ur minnet.

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
| start.file | Så kan filen se ut |
| start.file.time | Datum |
| start.file.value | Försäljning |
| start.download | Första gången laddar Norn ner prognosmodellen, {mb} MB. |
| start.download.after | Sedan finns den kvar i webbläsaren. Lokalt, privat och helt offline. |
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
| urd.confirm.hint | Norn har själv hittat tiden och siffrorna i filen. Kontrollera perioden och antalet, för det är dem Norn räknar på. |
| urd.change | Nej, ändra kolumner |
| urd.pick | Vilken kolumn vill du förutse? |
| verdandi.heading | Kan du lita på prognosen? |
| verdandi.chart.heading | {namn} per {enhet}, provet på {period} |
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
| verdandi.wait | Norn gissar på {period} utan att titta på facit. Det tar några sekunder. |
| verdandi.good | {Period} träffade Norn i snitt inom {procent} procent, betydligt bättre än att upprepa {jamfort}. |
| verdandi.fair | {Period} träffade Norn i snitt inom {procent} procent, bättre än att gissa. |
| verdandi.good.abs | {Period} missade Norn i snitt med {fel} per {enhet}, betydligt bättre än att upprepa {jamfort}. |
| verdandi.fair.abs | {Period} missade Norn i snitt med {fel} per {enhet}, bättre än att gissa. |
| verdandi.good.plain | {Period} träffade Norn i snitt inom {procent} procent. Att upprepa {jamfort} hade träffat nästan lika bra, så mönstret är tydligt. |
| verdandi.fair.plain | {Period} träffade Norn i snitt inom {procent} procent, ungefär som att upprepa {jamfort}. |
| verdandi.poor | Norn såg inget tydligt mönster i den här datan, så prognosen blir bred. Det hjälper ofta att ta med en längre period, eller att lägga ihop siffrorna per vecka eller månad. |
| verdandi.means.palitlig | Pålitlig betyder att du kan planera efter prognosen. |
| verdandi.means.ungefarlig | Ungefärlig betyder att du ska planera efter banden snarare än efter linjen. |
| verdandi.means.osaker | Osäker betyder att prognosen bara är en fingervisning. |
| verdandi.bands.held | Banden höll ungefär vad de lovar. Det breda bandet ska fånga nio fall av tio och fångade {in90} procent, det smala ska fånga hälften och fångade {in50} procent. |
| verdandi.bands.narrow | Banden var för smala. Det breda bandet ska fånga nio fall av tio men fångade bara {in90} procent, så verkligheten kan svänga mer än Norn tror. |
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
| legend.band50 | Smala bandet, hälften av fallen |
| legend.band90 | Breda bandet, nio fall av tio |
| legend.bands | Ju säkrare du vill vara, desto bredare blir bandet. |
| graf.nio | Breda bandet, nio fall av tio |
| graf.intervall | {lag} till {hog} |
| graf.zoom.hint | Dra över grafen, eller nyp med två fingrar, för att se en period närmare. |
| graf.zoom.keys | Med tangentbordet zoomar plus och minus, och Esc visar allt igen. |
| graf.zoom.shown | Visar {start} till {slut}. |
| graf.zoom.reset | Visa allt |
| graf.klockslag | {datum} kl. {tid} |
| graf.vecka | veckan från {datum} |
| skuld.heading | Det som kommer |
| skuld.chart.heading | {namn} per {enhet}, prognos för {period} |
| skuld.prov.percent | I provet på {period} träffade Norn i snitt inom {procent} procent. |
| skuld.prov.abs | I provet på {period} missade Norn i snitt med {fel} per {enhet}. |
| skuld.prov.poor | I provet på {period} såg Norn inget tydligt mönster. |
| skuld.prov.link | Se provet |
| skuld.horizon | Hur långt fram |
| skuld.horizon.hint | Ju längre fram du tittar, desto bredare blir banden. Mer hinner hända, och det säger Norn rakt ut. |
| skuld.events | Vet du något om framtiden? |
| skuld.events.none | Den här händelsen ändrar inte prognosen. Norn ser ingen sådan effekt i din historik. |
| skuld.certainty | Hur säker vill du vara? |
| skuld.certainty.lead | Välj vilken siffra du planerar efter. Troligast är bäst i snitt. Räcker i 9 fall av 10 passar när det kostar mer att ta slut än att ha för mycket, som varor eller personal. |
| skuld.certainty.more | Troligast är linjen i mitten, och den slår fel åt båda hållen ungefär lika ofta. Räcker i 9 fall av 10 är en högre siffra, vald så att den räcker nio gånger av tio. Du får oftare lite över, men det tar sällan slut. Räcker i 19 fall av 20 är ännu försiktigare. Siffran du väljer står i en mening under valen. |
| skuld.certainty.median | Troligast |
| skuld.certainty.90 | Räcker i 9 fall av 10 |
| skuld.certainty.95 | Räcker i 19 fall av 20 |
| skuld.download | Ladda ner |
| skuld.download.hint | Ladda ner ger en fil för Excel med prognosen per {enhet}, de två banden och alla {antal} nivåer. |
| skuld.pdf | Spara som PDF |
| skuld.pdf.hint | Spara som PDF öppnar utskriften, där du väljer att spara som PDF. Båda filerna skapas i din dator. |
| skuld.answer.summa | {Period} landar det troligen på totalt {median}, mellan {lag} och {hog} i minst nio fall av tio. |
| skuld.answer.snitt | {Period} landar snittet troligen på {median}, mellan {lag} och {hog} i minst nio fall av tio. |
| skuld.plan.summa | Räkna med {varde} totalt {period}, så räcker det i minst {fall}. |
| skuld.plan.snitt | Räkna med högst {varde} i snitt {period}, så räcker det i minst {fall}. |
| skuld.fall.90 | nio fall av tio |
| skuld.fall.95 | 19 fall av 20 |
| skuld.wait | Norn räknar fram prognosen. |
| skuld.chart | {namn} den senaste tiden och Norns prognos för {period}. |
| skuld.details | Varför står det minst nio fall av tio? |
| skuld.details.text | Spannet i meningen överst gäller hela perioden. Norn räknar fram ett spann för varje {enhet} och lägger ihop dem. Det är ett försiktigt sätt att räkna, som hellre ger ett för brett spann än ett för smalt. Därför hamnar det verkliga värdet troligen inom spannet i fler än nio fall av tio, och det står minst. |
| skuld.events.lead | Slå på det som gäller under perioden. Norn ser i din historik vad sådana dagar brukade göra med siffrorna och räknar om prognosen. |
| skuld.events.more | Norn känner till röda dagar, midsommarafton, lucia, julhandeln och industrisemestern. Här visas de som infaller under perioden och som också finns i din historik, för bara då kan Norn se vad de brukar betyda. Med en händelse påslagen ändras linjen och banden i grafen, och en mening under knapparna säger hur mycket. |
| skuld.events.effect | Med {handelser} landar det på {med} i stället för {utan}. |
| skuld.events.empty | Inga av de händelser Norn känner till infaller under perioden. |
| skuld.events.daily | Norn känner bara till händelser för data per dag eller timme. |
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
| error.short | Serien är för kort. Norn behöver minst 64 värden, både för att se ett mönster och för att kunna pröva sig själv på en del av dem. Ta med en längre period om du kan. |
| error.irregular | Tiderna i filen kommer inte med jämna mellanrum, så Norn kan inte se om det är timmar, dagar eller månader. Lägg ihop värdena per dag, vecka eller månad i ditt kalkylark och försök igen. |
| error.column | Norn kan inte läsa kolumnen {namn} som tal. Ta bort ord och tecken som inte är siffror, eller lämna cellen tom. Tomma celler räknas som saknade värden. |
| start.heading | Gör en prognos av dina egna siffror |
| urd.heading | Det här är din data |
| urd.chart.heading | {namn} per {enhet}, {start} till {slut} |
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
| error.notime | Norn hittar ingen kolumn med datum eller tid. Filen behöver en kolumn för tid och en med siffror. Datum som 2026-10-01 eller 1 oktober 2026 fungerar, liksom månader som 2026-10. |
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
| om.link | Så fungerar Norn |
| om.back | Till Norn |
| om.heading | Så fungerar Norn |
| om.lead | Norn gör prognoser av dina egna siffror, i din webbläsare. Här står varför Norn finns, hur det går till och vad som driver det. Först med vanliga ord, längre ner med fler detaljer. |
| om.what.heading | Vad Norn är |
| om.what.1 | Du har siffror över tid. Försäljning per dag, elförbrukningen per timme, besökare per vecka. Norn visar vad som troligen kommer och hur säker du kan vara på det. |
| om.what.2 | Verktyg för prognoser är oftast byggda för analytiker. De pratar om modeller, parametrar och konfidensintervall. Norn är för alla andra. Du behöver inte kunna statistik och du behöver inte ställa in något. |
| om.what.3 | Norn säger alltid hur osäker prognosen är. Ett ärligt svar med ett brett spann är mer värt än en exakt siffra som inte stämmer. |
| om.use.heading | Vad du kan använda det till |
| om.use.butik | Inköp. Hur mycket ska du beställa inför julhandeln? Välj nivån som räcker i nio fall av tio, så tar varorna slut mer sällan. |
| om.use.personal | Bemanning. Hur många behövs i kassan nästa lördag? Prognosen per dag visar vilka dagar som brukar sticka ut. |
| om.use.el | Elräkningen. Vad landar förbrukningen på nästa månad? Det troligaste värdet ger en budget, och det breda bandet visar hur mycket det kan slå fel. |
| om.use.besok | Besökare. Hur många kommer till biblioteket, badet eller webbplatsen i sommar? Slå på röda dagar eller industrisemestern om de ligger i perioden. |
| om.use.niva | Under Hur säker vill du vara väljer du vilken siffra du planerar efter. Troligast är bäst i snitt. En högre nivå kostar lite mer men räcker oftare. |
| om.steps.heading | Så går det till |
| om.steps.urd | Urd, din data. Norn läser filen, hittar kolumnen för tid och den med siffror, och säger med en mening vad den ser. Du bekräftar att det stämmer. |
| om.steps.verdandi | Verdandi, provet. Innan Norn tittar framåt prövar den sig själv. Den gömmer den senaste perioden i din fil, gissar på den utan facit och jämför sedan med det som faktiskt hände. Det ger ett betyg för just dina siffror. |
| om.steps.skuld | Skuld, prognosen. Nu får Norn se allt och gissar på det som kommer. Du väljer hur långt fram, hur säker du vill vara och om någon händelse ligger i perioden. |
| om.steps.why | Provet kommer först av en anledning. En prognos går inte att kontrollera förrän det är för sent. Provet går att kontrollera direkt, och det är gjort på dina egna siffror, inte på någon annans. |
| om.steps.names | Stegen har fått namn efter de tre nornorna i den nordiska mytologin, som spinner ödets tråd. Urd står för det som varit, Verdandi för det som är och Skuld för det som kommer. |
| om.bands.heading | Så läser du banden |
| om.bands.1 | Prognosen är en prickad linje med två band runt sig. Linjen är det troligaste värdet. Det smala bandet visar var det hamnar i hälften av fallen, det breda var det hamnar i nio fall av tio. Ju säkrare du vill vara, desto bredare blir bandet. |
| om.bands.2 | Banden blir bredare ju längre fram du tittar. Det är inget fel. Ju längre bort något ligger, desto mer hinner hända, och det säger Norn rakt ut. |
| om.bands.3 | I provet ser du om banden höll. Låg det som hände inne i det breda bandet ungefär nio gånger av tio, så stämmer Norns osäkerhet för dina siffror. |
| om.grades.heading | Betygen |
| om.grades.palitlig | Pålitlig. Norn träffade nära i provet, eller klart bättre än den enkla gissningen, och banden höll. Du kan planera efter prognosen. |
| om.grades.ungefarlig | Ungefärlig. Norn gjorde bättre än att gissa men missade mer. Planera efter banden snarare än efter linjen. |
| om.grades.osaker | Osäker. Norn hittade inget tydligt mönster. Se prognosen som en fingervisning. Fler värden, eller siffror summerade per vecka eller månad, hjälper ofta. |
| om.grades.naive | Den enkla gissningen är att upprepa samma timme eller dag förra veckan, eller samma vecka, månad eller kvartal förra året. Slår Norn inte den, finns det ingen anledning att lita på Norn. |
| om.grades.rule | Regeln i siffror. Pålitlig kräver att minst {inom} procent av det som hände låg i det breda bandet, och att Norn antingen missade med högst {nara} procent eller missade minst {battre} procent mindre än den enkla gissningen, utan att missa med mer än {langt} procent. Osäker betyder att Norn varken gjorde bättre än den enkla gissningen eller missade med högst {nara} procent. Ungefärlig är allt däremellan. |
| om.privacy.heading | Din data stannar hos dig |
| om.privacy.1 | Filen läses i din webbläsare och prognosen görs i din webbläsare. Ingenting av din data skickas någonstans. Norn har ingen server som tar emot filer, inga konton och inga kakor. |
| om.privacy.2 | Datan finns bara i minnet medan fliken är öppen. Stänger du den är den borta. Det enda som sparas är det du själv laddar ner. |
| om.privacy.3 | Första gången laddar Norn ner modellen, {mb} MB, från samma adress som sidan. Webbläsaren sparar den, så efter den första prognosen går Norn att använda utan nätverk. |
| om.privacy.4 | Besök räknas anonymt, en sidvisning per besök, i Prompt Agencys egen statistiktjänst. Aldrig något från din fil. |
| om.model.heading | Modellen, Timestral från Mistral AI |
| om.model.1 | Prognoserna görs av Timestral, en familj modeller för tidsserier från det franska AI-företaget Mistral AI, släppt i oktober 2026. |
| om.model.2 | Timestral är en grundmodell. Den har tränats i förväg på stora mängder tidsserier, de flesta skapade för ändamålet, och har lärt sig hur mönster över tid brukar se ut. Dygnsrytmer, veckor, säsonger och trender. Därför kan den göra prognoser på siffror den aldrig har sett, utan att tränas om eller ställas in. |
| om.model.3 | Timestral finns i fyra storlekar. Norn använder den näst minsta, med 28 miljoner parametrar, som är liten nog att köras i en vanlig webbläsare. |
| om.model.4 | Att den går att köra i webbläsaren har Norn amine40 att tacka, som har gjort om modellen till ett format webbläsaren kan köra och skrivit prognosfunktionen i JavaScript. |
| om.tech.heading | För den som vill veta mer |
| om.tech.lead | Här får de tekniska orden finnas, med en förklaring där de dyker upp. |
| om.tech.k.model | Modell |
| om.tech.v.model | Timestral-28M från Mistral AI |
| om.tech.k.arch | Uppbyggnad |
| om.tech.v.arch | En transformer i 12 lager som läser serien i bitar om 32 värden |
| om.tech.k.output | Svar från modellen |
| om.tech.v.output | 21 kvantiler, från 1 till 99 procent |
| om.tech.k.history | Historik som modellen får se |
| om.tech.v.history | Högst {max} värden, modellen klarar 32 768 |
| om.tech.k.horizon | Prognos per körning |
| om.tech.v.horizon | Upp till 1 024 värden, längre bit för bit |
| om.tech.k.weights | Vikter |
| om.tech.v.weights | amine40:s ONNX-export i fp16, {mb} MB, räknas i fp32 |
| om.tech.k.runtime | Körs med |
| om.tech.v.runtime | onnxruntime-web {version} i en Web Worker, på flera trådar |
| om.tech.k.licence | Licenser |
| om.tech.v.licence | Koden MIT, Timestrals vikter Mistral AI:s Modified MIT |
| om.tech.quantiles | Modellen ger inte ett värde per tidpunkt utan 21 kvantiler. En kvantil på 5 procent är ett värde som utfallet bara hamnar under i fem fall av hundra. Norn visar tre av dem. Medianen är linjen, 25 till 75 procent det smala bandet och 5 till 95 procent det breda. Filen du laddar ner har alla 21. |
| om.tech.history | Norn visar modellen högst {max} värden bakåt, ungefär elva månader med timvärden. I våra prov på timdata gav det bättre prognoser än 4 096 värden, medan längre historik inte gav något mer men tog längre tid. |
| om.tech.backtest | Provet i Verdandi kallas backtest. Norn gömmer de senaste 7 dagarna för timdata, det senaste året för dag- och månadsdata, ett halvår för veckodata och fyra perioder för kvartal och år. Felet mäts som medelfelet per tidpunkt och jämförs med felet för den enkla gissningen. |
| om.tech.events | Händelser som midsommar och röda dagar skickas till modellen som en extra serie som är känd i förväg, med en etta de dagar händelsen infaller. Modellen ser i din historik vad de dagarna brukade betyda. |
| om.tech.totals | Summan för en hel period är försiktig. Modellen ger ett spann per tidpunkt, inte för summan, så Norn lägger ihop spannen. Det blir bredare än nödvändigt, därför står det i minst nio fall av tio. |
| om.tech.check | Prognoserna i webbläsaren stämmer med Mistrals eget Python-paket. Med fp16-vikterna skiljer de sig mindre än 0,7 procent av det breda bandets bredd. |
| om.not.heading | Vad Norn inte gör |
| om.not.promise | Norn lovar inte att prognosen slår in. Den visar vad som är troligt. |
| om.not.one | Norn gör prognos på en kolumn i taget. |
| om.not.account | Det finns inga konton och inga sparade projekt. Vill du spara, ladda ner prognosen. |
| om.not.data | Siffrorna behöver jämna steg i tid, timmar, dagar, veckor, månader, kvartal eller år, och minst 64 värden. |
| om.not.support | Det finns ingen support. Norn är ett experiment. |
| om.project.heading | Om projektet |
| om.project.1 | Norn är ett experiment från Prompt Agency och fri programvara under MIT-licensen. Koden finns öppet på GitHub. |
| om.project.code | Koden på GitHub |
| om.project.model | Timestral hos Hugging Face |
| om.project.thanks | Tack till Mistral AI för Timestral, amine40 för ONNX-exporten och JavaScript-koden, och SCB, eSett och Wikimedia för exempeldatan. |
| om.fig.bands | En prognos med pilar som visar Troligast, det smala och det breda bandet, och hur banden blir bredare längre fram. |
| om.fig.bands.wider | Bredare längre fram |
| om.fig.urd | Urd, det som varit |
| om.fig.verdandi | Verdandi, provet med facit |
| om.fig.skuld | Skuld, det som kommer |
| om.fig.urd.desc | En kurva över det som varit, utan prognos. |
| om.fig.verdandi.desc | Kurvans sista del är gömd för Norn. Norns gissning med två band ligger över det som faktiskt hände. |
| om.fig.skuld.desc | Kurvan fram till nu, och sedan prognosen som en prickad linje i två band som vidgas. |
| om.flow.computer | Din dator |
| om.flow.file | Din fil |
| om.flow.norn | Norn räknar i webbläsaren |
| om.flow.result | Prognosen |
| om.flow.in | Från nornor.app, första gången |
| om.flow.in.what | Sidan och prognosmodellen |
| om.flow.out | Ut går bara en anonym sidvisning, aldrig något från din fil. |
| om.flow.caption | Allt som har med dina siffror att göra stannar i din dator. |
| om.fig.quantiles | Modellens 21 kvantiler som tunna linjer, med de fem som Norn visar markerade. |
| om.fig.quantiles.caption | De tunna linjerna är modellens 21 kvantiler. Norn visar fem av dem, medianen som den prickade linjen och kanterna på de två banden. |
| dialog.close | Stäng |
| faq.link | Vanliga frågor |
| faq.heading | Vanliga frågor |
| faq.data.q | Skickas mina siffror någonstans? |
| faq.data.a | Nej. Filen läses och prognosen görs i din webbläsare. Norn har ingen server som tar emot filer, och inget av din data sparas. Stänger du fliken är den borta. |
| faq.file.q | Vilka filer fungerar? |
| faq.file.a | CSV eller Excel med en kolumn för tid och en med siffror, eller celler du klistrar in från ett kalkylark. Tiden ska komma med jämna steg, timmar, dagar, veckor, månader, kvartal eller år, och det behövs minst 64 värden. |
| faq.model.q | Varför laddar Norn ner {mb} MB första gången? |
| faq.model.a | Det är prognosmodellen, Timestral från Mistral AI. Den hämtas från samma adress som sidan och sparas i webbläsaren, så nästa gång behöver den inte laddas ner igen. |
| faq.offline.q | Fungerar Norn utan internet? |
| faq.offline.a | Ja, efter den första prognosen. Då finns modellen och sidan sparade i webbläsaren. |
| faq.trust.q | Hur vet jag om jag kan lita på prognosen? |
| faq.trust.a | Det visar provet i steg 2. Norn gömmer den senaste perioden i din fil, gissar på den och jämför med det som hände. Betyget Pålitlig, Ungefärlig eller Osäker gäller just dina siffror. |
| faq.bands.q | Vad betyder banden? |
| faq.bands.a | Det smala bandet visar var det hamnar i hälften av fallen, det breda var det hamnar i nio fall av tio. Ju säkrare du vill vara, desto bredare blir bandet, och längre fram blir båda bredare. |
| faq.save.q | Hur sparar eller delar jag resultatet? |
| faq.save.a | Ladda ner ger en fil för Excel, och Spara som PDF ger en sida du kan skicka vidare. Båda skapas i din dator. Norn sparar ingenting själv. |
| faq.phone.q | Fungerar Norn på mobilen? |
| faq.phone.a | Norn behöver en större skärm och laddar ner en stor modell, så på en telefon visas en sida om Norn. Öppna Norn på en dator eller surfplatta i stället. |
| faq.cost.q | Vad kostar det? |
| faq.cost.a | Ingenting. Norn är ett experiment från Prompt Agency och fri programvara. Det finns ingen support och ingen garanti. |
| faq.more | Läs mer på sidan Så fungerar Norn |
