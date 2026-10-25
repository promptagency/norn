import { useEffect, useRef } from "react";
import { COPY } from "../copy.ts";
import { Knapp } from "./Knapp.tsx";
import type { DialogrutaProps } from "./types.ts";

/** A modal window on the native <dialog>: focus stays inside, Esc and Stäng close it, the page behind is inert. */
export function Dialogruta({ rubrik, oppen, onStang, children }: DialogrutaProps) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (oppen && !d.open) d.showModal();
    if (!oppen && d.open) d.close();
  }, [oppen]);

  return (
    <dialog ref={ref} className="n-dialog" aria-label={rubrik} onClose={onStang}>
      <div className="n-dialog__topp">
        <h2 className="rubrik-m">{rubrik}</h2>
        <Knapp variant="sekundar" onClick={onStang}>{COPY["dialog.close"]}</Knapp>
      </div>
      <div className="n-dialog__innehall">{children}</div>
    </dialog>
  );
}
