// Every Swedish string in the interface. The source of truth is docs/COPY.md;
// keep the keys and texts identical to the table there.

export const COPY = {
  "app.name": "Norn",
  "app.title": "Norn. Se vad som väntar i dina egna siffror.",
  "start.lead": "Ladda upp en fil med siffror över tid, så visar Norn vad som väntar.",
  "start.privacy": "Inget lämnar din dator.",
  "start.drop": "Släpp en fil här, eller välj en fil på datorn",
  "start.drop.hint": "CSV eller Excel med en kolumn för tid och en med siffror. Du kan också klistra in direkt från ett kalkylark.",
  "start.drop.over": "Släpp filen så läser Norn in den",
  "start.examples": "Eller prova med riktiga siffror",
  "step.label": "Steg",
  "step.urd": "Urd",
  "step.verdandi": "Verdandi",
  "step.skuld": "Skuld",
  "step.urd.hint": "Det som varit",
  "step.verdandi.hint": "Det som är",
  "step.skuld.hint": "Det som kommer",
  "step.done": "klart",
  "urd.confirm": "Stämmer det?",
  "urd.yes": "Ja",
  "urd.change": "Nej, ändra kolumner",
  "urd.pick": "Vilken kolumn vill du förutse?",
  "verdandi.heading": "Hur bra läser Norn din data?",
  "verdandi.grade.good": "Pålitlig",
  "verdandi.grade.fair": "Ungefärlig",
  "verdandi.grade.poor": "Osäker",
  "verdandi.details": "Visa detaljer",
  "verdandi.next": "Visa vad som kommer",
  "chart.seen": "Det Norn fick se",
  "chart.guessed": "Det Norn fick gissa på",
  "chart.past": "Senaste perioden",
  "chart.now": "Nu",
  "legend.history": "Det som varit",
  "legend.outcome": "Det som faktiskt hände",
  "legend.median": "Troligast",
  "legend.median.backtest": "Norns troligaste gissning",
  "legend.band50": "Hamnar här i hälften av fallen",
  "legend.band90": "Hamnar här i nio fall av tio",
  "skuld.heading": "Det som kommer",
  "skuld.horizon": "Hur långt fram",
  "skuld.events": "Vet du något om framtiden?",
  "skuld.events.none": "Den här händelsen ändrar inte prognosen. Norn ser ingen sådan effekt i din historik.",
  "skuld.certainty": "Hur säker vill du vara?",
  "skuld.certainty.median": "Troligast",
  "skuld.certainty.90": "Räcker i 9 fall av 10",
  "skuld.certainty.95": "Räcker i 19 fall av 20",
  "skuld.download": "Ladda ner",
  "skuld.print": "Skriv ut",
  "skuld.link": "Kopiera länk",
  "footer.experiment": "Norn är ett experiment från Prompt Agency. Ingen support, ingen garanti. Din data lämnar aldrig datorn.",
  "footer.credits": "Prognoserna görs av Timestral från Mistral AI, i webbläsaren tack vare amine40:s ONNX-export. Exempeldata från SCB, SMHI, elprisetjustnu.se och Wikimedia.",
  "header.home": "Norn, till start",
  "header.tag": "Ett experiment från Prompt Agency",
} as const;

export type CopyKey = keyof typeof COPY;

/** The string for a key, with {name} placeholders filled in. */
export function t(key: CopyKey, values: Record<string, string | number> = {}): string {
  return COPY[key].replace(/\{(\w+)\}/g, (_, name: string) => String(values[name] ?? `{${name}}`));
}
