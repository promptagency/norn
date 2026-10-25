import { useState } from "react";
import logoPositiv from "../../design/logo/norn-logotyp-positiv.svg";
import logoNegativ from "../../design/logo/norn-logotyp-negativ.svg";
import {
  Betyg, Exempelkort, Forklaring, Fraga, Knapp, Kort, NORNORNA, Nyckeltal, Prognosgraf, Sakerhetsval,
  Sidfot, Sidhuvud, Slappyta, Steg, Svar, Valgrupp, Valknapp, bucketMeans,
} from "../ui/components/index.ts";
import type { ForecastSeries, Sakerhetsniva } from "../ui/components/index.ts";
import exempel from "./elpris-exempel.json";

// Quantile columns in the sample: 0.05, 0.25, 0.5, 0.75, 0.95.
function series(q: number[][]): ForecastSeries {
  return {
    median: q.map((r) => r[2]),
    band50: { lo: q.map((r) => r[1]), hi: q.map((r) => r[3]) },
    band90: { lo: q.map((r) => r[0]), hi: q.map((r) => r[4]) },
  };
}
const kr = (v: number) => `${v} kr`;
const dag = (i: number, text: string) => ({ index: i * 24, text });

export function Galleri() {
  const [mork, setMork] = useState(false);
  const [horisont, setHorisont] = useState("1 vecka");
  const [sakerhet, setSakerhet] = useState<Sakerhetsniva>("90");
  const [kolumn, setKolumn] = useState("elpris");
  const vecka = bucketMeans(exempel.dagsnitt, 7);
  const ar = ["2023", "2024", "2025", "2026"].map((y) => ({ index: Math.floor(exempel.dagar.indexOf(`${y}-01-01`) / 7), text: y }));

  return (
    <div data-theme={mork ? "mork" : "ljus"} style={{ background: "var(--grund)", color: "var(--text)", minHeight: "100vh" }}>
      <div className="g-tema">
        <Knapp variant="sekundar" onClick={() => setMork(!mork)}>{mork ? "Ljust tema" : "Mörkt tema"}</Knapp>
      </div>
      <Sidhuvud logoSrc={mork ? logoNegativ : logoPositiv}>
        <Steg steg={NORNORNA.map((s, i) => (i < 2 ? { ...s, href: "#" } : s))} aktivt={2} />
      </Sidhuvud>
      <main className="g-sida">
        <section className="g-avsnitt">
          <h2>Knapp</h2>
          <div className="g-rad">
            <Knapp>Visa vad som kommer</Knapp>
            <Knapp variant="sekundar">Ladda ner</Knapp>
            <Knapp variant="lank">Nej, ändra kolumner</Knapp>
            <Knapp disabled>Inaktiv</Knapp>
          </div>
        </section>

        <section className="g-avsnitt">
          <h2>Valknapp</h2>
          <Valgrupp etikett="Hur långt fram">
            {["1 dygn", "3 dygn", "1 vecka", "2 veckor"].map((h) => (
              <Valknapp key={h} vald={h === horisont} onClick={() => setHorisont(h)}>{h}</Valknapp>
            ))}
          </Valgrupp>
          <Valgrupp etikett="Vilken kolumn vill du förutse?">
            <Valknapp vald={kolumn === "elpris"} onClick={() => setKolumn("elpris")}>Elpris, kr per kWh</Valknapp>
            <Valknapp vald={kolumn === "temp"} onClick={() => setKolumn("temp")}>Temperatur i Göteborg</Valknapp>
          </Valgrupp>
        </section>

        <section className="g-avsnitt">
          <h2>Steg</h2>
          <Steg steg={NORNORNA} aktivt={0} />
          <Steg steg={NORNORNA.map((s, i) => (i < 1 ? { ...s, href: "#" } : s))} aktivt={1} />
        </section>

        <section className="g-avsnitt">
          <h2>Släppyta och exempelkort</h2>
          <Slappyta onFiler={() => {}} />
          <Slappyta onFiler={() => {}} fel="Norn kan inte läsa kolumnen Belopp som tal. Ta bort ord och tecken som inte är siffror, eller lämna cellen tom. Tomma celler räknas som saknade värden." />
          <div className="g-rutnat">
            <Exempelkort overrad="Per månad sedan 1991" titel="Detaljhandel per bransch" text="Julhandeln syns som en topp i december, tre gånger en vanlig månad." kalla="SCB" href="#" />
            <Exempelkort overrad="Per timme sedan 2022" titel="Elpris i elområde 3" text="Dygnsrytm, vinter mot sommar, och ibland negativa priser." kalla="elprisetjustnu.se och SMHI" href="#" />
            <Exempelkort overrad="Per dag sedan 2016" titel="Besök på svenska Wikipedia" text="Midsommar, Lucia och Melodifestivalen. En topp per år, resten nästan ingenting." kalla="Wikimedia" href="#" />
          </div>
        </section>

        <section className="g-avsnitt">
          <h2>Prognosgraf, Urd</h2>
          <Svar>Elpris per timme i elområde 3, från 1 november 2022 till 20 oktober 2026. <strong>34 796</strong> timmar, 4 saknas.</Svar>
          <Kort figur>
            <Prognosgraf historik={vecka} xEtiketter={ar} formatY={kr} hojd={300} beskrivning="Elpriset per vecka från november 2022 till oktober 2026." />
          </Kort>
        </section>

        <section className="g-avsnitt">
          <h2>Betyg och prognosgraf, Verdandi</h2>
          <div className="g-rad">
            <Betyg niva="palitlig" />
            <Betyg niva="ungefarlig" />
            <Betyg niva="osaker" />
          </div>
          <Svar>Förra veckan missade Norn i snitt med <strong>31 öre per timme</strong>. Det är en fjärdedel mindre än om du hade gissat på samma pris som veckan innan.</Svar>
          <Kort figur>
            <Prognosgraf
              historik={exempel.historikVecka}
              prognos={series(exempel.backtest.q)}
              utfall={exempel.backtest.utfall}
              xEtiketter={[dag(0, "7 okt"), dag(3, "10 okt"), dag(7, "14 okt"), dag(10, "17 okt"), dag(13, "20 okt")]}
              formatY={kr}
              yIntervall={[-0.2, 3.2]}
              foreText="Det Norn fick se"
              efterText="Gömt för Norn, med facit"
              beskrivning="Elpriset 7 till 20 oktober. Andra veckan visar Norns prognos som band och utfallet som en grå linje."
            />
            <Forklaring poster={["utfall", "median-backtest", "band50", "band90"]} />
          </Kort>
          <Fraga rubrik="Visa detaljer" variant="liten" oppen>
            <Nyckeltal
              poster={[
                { etikett: "Medelfel per timme", varde: "0,31 kr" },
                { etikett: "Om du upprepat veckan innan", varde: "0,42 kr" },
                { etikett: "Inom bandet för hälften av fallen", varde: "77 %, väntat 50 %" },
                { etikett: "Testperiod och modell", varde: "14 till 20 oktober 2026, Timestral-28M", text: true },
              ]}
            />
          </Fraga>
        </section>

        <section className="g-avsnitt">
          <h2>Prognosgraf, Skuld</h2>
          <Svar>Snittpriset de närmaste 7 dagarna landar troligen på <strong>89 öre per kWh</strong>, mellan 67 öre och 1,12 kr i nio fall av tio.</Svar>
          <Kort figur>
            <Prognosgraf
              historik={exempel.senasteVeckan}
              prognos={series(exempel.prognos)}
              xEtiketter={[dag(0, "14 okt"), dag(3, "17 okt"), dag(7, "21 okt"), dag(10, "24 okt"), dag(13, "27 okt")]}
              formatY={kr}
              yIntervall={[-0.2, 3.2]}
              foreText="Senaste veckan"
              tonadHistorik
              hojd={340}
              beskrivning="Elpriset senaste veckan och Norns prognos för veckan som kommer."
            />
            <Forklaring poster={["median", "band50", "band90"]} />
          </Kort>
          <Fraga rubrik="Vet du något om framtiden?">
            <p style={{ margin: 0 }}>Röda dagar, helger eller något du planerat.</p>
          </Fraga>
          <Fraga rubrik="Hur säker vill du vara?" oppen>
            <Sakerhetsval varde={sakerhet} onChange={setSakerhet} />
          </Fraga>
        </section>
      </main>
      <Sidfot />
    </div>
  );
}
