import { COPY } from "../copy.ts";
import type { Sakerhetsniva, SakerhetsvalProps } from "./types.ts";

const VAL: { varde: Sakerhetsniva; text: string }[] = [
  { varde: "median", text: COPY["skuld.certainty.median"] },
  { varde: "90", text: COPY["skuld.certainty.90"] },
  { varde: "95", text: COPY["skuld.certainty.95"] },
];

export function Sakerhetsval({ varde, onChange, namn = "sakerhet" }: SakerhetsvalProps) {
  return (
    <fieldset className="n-sakerhet">
      <legend className="n-sakerhet__legend">{COPY["skuld.certainty"]}</legend>
      {VAL.map((v) => (
        <label key={v.varde} className="n-sakerhet__val">
          <input
            className="n-sakerhet__radio"
            type="radio"
            name={namn}
            value={v.varde}
            checked={varde === v.varde}
            onChange={() => onChange(v.varde)}
          />
          {v.text}
        </label>
      ))}
    </fieldset>
  );
}
