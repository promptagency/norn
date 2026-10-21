import type { ReactNode } from "react";

/** The sentence with `part` in <strong>, as Svar wants the important number. */
export function emphasize(text: string, part: string): ReactNode {
  const i = text.indexOf(part);
  return i < 0 ? text : <>{text.slice(0, i)}<strong>{part}</strong>{text.slice(i + part.length)}</>;
}
