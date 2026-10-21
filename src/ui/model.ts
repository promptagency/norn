import { COPY, t } from "./copy.ts";

/** The download progress in megabytes, and the promise it only happens once when the service worker will keep it. */
export function loadingText({ loaded, total }: { loaded: number; total: number }): string {
  const text = t("model.loading", { mb: Math.round(loaded / 1e6), total: Math.round(total / 1e6) });
  return navigator.serviceWorker?.controller ? `${text} ${COPY["model.once"]}` : text;
}
