import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "../design/fonts.css";
import "../design/tokens.css";
import "./dev/galleri.css";
import { Galleri } from "./dev/Galleri.tsx";

// Phase 1 scaffold: until the app exists, the dev server shows the component gallery.
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Galleri />
  </StrictMode>,
);
