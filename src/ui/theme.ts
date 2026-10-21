// Which logo to show: the page follows the operating system's light or dark setting (design/tokens.css).
import { useEffect, useState } from "react";

export function useDark() {
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
