// The screens and the steps between them. The user's data lives in this component's state only.
import { useCallback, useEffect, useState } from "react";
import logoNegativ from "../../design/logo/norn-logotyp-negativ.svg";
import logoPositiv from "../../design/logo/norn-logotyp-positiv.svg";
import { buildSeries, detectColumns, type Columns, type DataSeries } from "../data/detect.ts";
import { loadExample, type Example } from "../data/examples.ts";
import { parseExcel, parseText, type Table } from "../data/parse.ts";
import { NORNORNA, Sidfot, Sidhuvud, Steg } from "./components/index.ts";
import { COPY, t } from "./copy.ts";
import { Start } from "./Start.tsx";
import { Urd } from "./Urd.tsx";
import "./app.css";

type Screen =
  | { name: "start"; fel?: string }
  | { name: "urd"; table: Table; columns: Columns; value: number }
  | { name: "verdandi"; series: DataSeries; urd: { table: Table; columns: Columns; value: number } };

function useDark() {
  const query = "(prefers-color-scheme: dark)";
  const [dark, setDark] = useState(() => matchMedia(query).matches);
  useEffect(() => {
    const m = matchMedia(query);
    const change = () => setDark(m.matches);
    m.addEventListener("change", change);
    return () => m.removeEventListener("change", change);
  }, []);
  return dark;
}

export function App() {
  const [screen, setScreen] = useState<Screen>({ name: "start" });
  const dark = useDark();

  const open = useCallback((table: Table, target?: string) => {
    const c = detectColumns(table);
    if (!c.ok) return setScreen({ name: "start", fel: t(c.error.key, c.error.values) });
    const wanted = target === undefined ? -1 : table.headers.indexOf(target);
    const value = c.value.numeric.includes(wanted) ? wanted : c.value.numeric[0];
    // An error that no other choice of columns can fix belongs on Start, where another file can be dropped.
    const r = buildSeries(table, c.value, value);
    if (!r.ok && c.value.times.length === 1 && c.value.numeric.length === 1)
      return setScreen({ name: "start", fel: t(r.error.key, r.error.values) });
    setScreen({ name: "urd", table, columns: c.value, value });
  }, []);
  const failed = () => setScreen({ name: "start", fel: COPY["error.file"] });

  const onFil = (file: File) =>
    (/\.xlsx?$/i.test(file.name) ? file.arrayBuffer().then(parseExcel) : file.text().then(parseText)).then((table) => open(table), failed);
  const onText = useCallback((text: string) => open(parseText(text)), [open]);
  const onExempel = (ex: Example) => loadExample(ex).then(({ table, target }) => open(table, target), failed);

  const step = screen.name === "urd" ? 0 : screen.name === "verdandi" ? 1 : -1;
  const back = [() => screen.name === "verdandi" && setScreen({ name: "urd", ...screen.urd })];

  return (
    <div className="app">
      <Sidhuvud logoSrc={dark ? logoNegativ : logoPositiv}>
        {step >= 0 ? <Steg steg={NORNORNA.map((s, i) => (i < step ? { ...s, onClick: back[i] } : s))} aktivt={step} /> : undefined}
      </Sidhuvud>
      {screen.name === "start" && <Start fel={screen.fel} onFil={onFil} onText={onText} onExempel={onExempel} />}
      {screen.name === "urd" && (
        <Urd
          key={screen.table.headers.join()}
          {...screen}
          onColumns={(columns, value) => setScreen({ ...screen, columns, value })}
          onJa={(series) => setScreen({ name: "verdandi", series, urd: screen })}
        />
      )}
      {screen.name === "verdandi" && (
        <main className="sida sida--steg">
          <h1 className="rubrik-l">{COPY["verdandi.heading"]}</h1>
        </main>
      )}
      <Sidfot />
    </div>
  );
}
