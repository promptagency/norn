// The forecast as a file the user saves: every level per step, for Swedish Excel.
import type { Time } from "../data/parse.ts";
import type { Forecast } from "../engine/index.ts";
import { COPY, t } from "./copy.ts";

/** Semicolons and decimal commas, as Swedish Excel expects; the BOM makes it read å, ä and ö right. */
export function forecastCsv(f: Forecast, times: Time[], hourly: boolean): string {
  const time = (x: Time) => new Date(x).toISOString().slice(0, hourly ? 16 : 10).replace("T", " ");
  const num = (x: number) => String(Number(x.toPrecision(6))).replace(".", ",");
  const head = [COPY["csv.time"], COPY["csv.median"], COPY["csv.low"], COPY["csv.high"], ...f.levels.map((l) => t("csv.level", { procent: Math.round(l * 100) }))];
  const rows = f.quantiles.map((q, i) => [time(times[i]), num(f.median[i]), num(f.band90.low[i]), num(f.band90.high[i]), ...q.map(num)]);
  return "\ufeff" + [head, ...rows].map((r) => r.join(";")).join("\r\n");
}
