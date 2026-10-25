import { lazy, StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import "../design/fonts.css";
import "../design/tokens.css";
import { countVisit } from "./ui/analytics.ts";
import { App } from "./ui/App.tsx";
import { Om } from "./ui/Om.tsx";
import { isPhone, Telefon } from "./ui/Telefon.tsx";
import { serviceWorkerReady } from "./ui/serviceWorker.ts";

// The component gallery, at /?galleri on the dev server only. Not part of the build.
const Galleri = import.meta.env.DEV && location.search === "?galleri"
  ? lazy(() => import("./dev/Galleri.tsx").then((m) => ({ default: m.Galleri })))
  : null;

// A phone gets one page and no app (PLAN.md), so no offline cache either: it would fetch the app's files for nothing.
const phone = isPhone();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {Galleri ? <Suspense><Galleri /></Suspense> : location.pathname === "/om" ? <Om /> : phone ? <Telefon /> : <App />}
  </StrictMode>,
);

if (!phone) void serviceWorkerReady();
countVisit();
