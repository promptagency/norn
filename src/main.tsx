import { lazy, StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "../design/fonts.css";
import "../design/tokens.css";
import { App } from "./ui/App.tsx";

// The component gallery, at /?galleri on the dev server only. Not part of the build.
const Galleri = import.meta.env.DEV && location.search === "?galleri"
  ? lazy(() => import("./dev/Galleri.tsx").then((m) => ({ default: m.Galleri })))
  : null;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {Galleri ? <Suspense><Galleri /></Suspense> : <App />}
  </StrictMode>,
);
