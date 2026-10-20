import { useState } from "react";
import { COPY } from "../copy.ts";
import type { SlappytaProps } from "./types.ts";

export function Slappyta({ onFiler, fel, accept = ".csv,.txt,.tsv,.xlsx" }: SlappytaProps) {
  const [over, setOver] = useState(false);
  const cls = ["n-slappyta", over && "n-slappyta--over", fel && "n-slappyta--fel"].filter(Boolean).join(" ");
  return (
    <label
      className={cls}
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        if (e.dataTransfer.files.length) onFiler(e.dataTransfer.files);
      }}
    >
      <svg className="n-slappyta__ikon" width="40" height="40" viewBox="0 0 40 40" aria-hidden="true">
        <g fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 26 V8" />
          <path d="M12 15 L20 7 L28 15" />
          <path d="M8 26 V32 H32 V26" />
        </g>
      </svg>
      <span className="n-slappyta__rubrik">{over ? COPY["start.drop.over"] : COPY["start.drop"]}</span>
      {fel ? <span className="n-slappyta__fel" role="alert">{fel}</span> : <span className="n-slappyta__tips">{COPY["start.drop.hint"]}</span>}
      <input
        className="n-slappyta__input"
        type="file"
        accept={accept}
        onChange={(e) => { if (e.target.files?.length) onFiler(e.target.files); }}
      />
    </label>
  );
}
