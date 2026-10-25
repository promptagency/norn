// The whole flow on every example, with every request listed: Norn may only ever talk to its own origin.
import { expect, test, type BrowserContext, type Page } from "@playwright/test";
import * as XLSX from "xlsx";

/** Every URL the page, its worker and its service worker ask for, plus any CSP refusal in the console. */
function watch(context: BrowserContext, page: Page) {
  const origin = new URL(test.info().project.use.baseURL!).origin;
  const requests: string[] = [];
  const bodies: string[] = [];
  const refused: string[] = [];
  context.on("request", (r) => {
    requests.push(r.url());
    bodies.push(r.postData() ?? "");
  });
  page.on("console", (m) => /Content Security Policy|Refused to/.test(m.text()) && refused.push(m.text()));
  return {
    foreign: () => requests.filter((u) => !u.startsWith(`${origin}/`) && !u.startsWith("data:") && !u.startsWith(`blob:${origin}/`)),
    refused,
    requests,
    bodies,
  };
}

type OwnFile = { name: string; mimeType: string; buffer: Buffer };

/** Through all three steps with an example card, or with the user's own file dropped on Start. */
async function throughSkuld(page: Page, card: string | OwnFile, grade?: string, sentence?: string) {
  await page.goto("/");
  if (typeof card === "string") await page.locator(".n-exempelkort", { hasText: card }).click();
  else await page.locator(".n-slappyta__input").setInputFiles(card);
  await expect(page.locator(".n-svar")).toContainText(" från ");
  await page.getByRole("button", { name: "Ja", exact: true }).click();
  // An own file's grade depends on its numbers; any grade shows that the backtest ran.
  if (grade) await expect(page.locator(".n-betyg")).toContainText(grade, { timeout: 120_000 });
  else await expect(page.locator(".n-betyg")).toBeVisible({ timeout: 120_000 });
  if (sentence) await expect(page.locator(".n-svar")).toContainText(sentence);
  await page.getByRole("button", { name: "Visa vad som kommer" }).click();
  const svar = page.locator(".n-svar");
  await expect(svar).toContainText("troligen", { timeout: 60_000 });
  const first = await svar.innerText();
  const buttons = page.getByRole("group", { name: "Hur långt fram" }).getByRole("button");
  await buttons.nth((await buttons.count()) - 1).click();
  await expect(svar).not.toHaveText(first, { timeout: 60_000 });
  // The sentence says "räknar" first; wait for the new horizon's answer before going on.
  await expect(svar).toContainText("troligen", { timeout: 60_000 });
  await page.getByText("Hur säker vill du vara?", { exact: true }).first().click();
  await page.getByLabel("Räcker i 9 fall av 10").check();
  await expect(page.getByRole("status").filter({ hasText: "Räkna med" })).toBeVisible();
}

// The grade and part of its sentence for each example's default series (rule in src/engine/backtest.ts).
const EXAMPLES = [
  ["Detaljhandel", "Pålitlig", "hade träffat nästan lika bra"], // within 7 %, barely better than last year
  // 5 % off, 18 % better than last week (8,192 hours of history): Pålitlig on accuracy, the plain sentence.
  ["Elförbrukning", "Pålitlig", "hade träffat nästan lika bra"],
  ["Wikipedia", "Pålitlig", "betydligt bättre än att upprepa"],
] as const;

for (const [card, grade, sentence] of EXAMPLES) {
  test(`${card}: from Start to Skuld without a request to another origin`, async ({ context, page }) => {
    const w = watch(context, page);
    await throughSkuld(page, card, grade, sentence);
    expect(w.foreign()).toEqual([]);
    expect(w.refused).toEqual([]);
    expect(w.requests.some((u) => u.includes("/model/"))).toBe(true); // the list really saw the worker
  });
}

test("works offline after the first forecast", async ({ context, page }) => {
  await throughSkuld(page, "Wikipedia", "Pålitlig");
  await context.setOffline(true);
  // Same example: example data is cached when first opened, like the model.
  await throughSkuld(page, "Wikipedia", "Pålitlig");
});

/** Everything the page has stored in the browser. */
const storedIn = (page: Page) =>
  page.evaluate(async () => ({
    local: localStorage.length,
    session: sessionStorage.length,
    cookies: document.cookie,
    databases: (await indexedDB.databases()).length,
    // The service worker's cache holds app files, the model and example data, never anything typed or dropped.
    cached: (await Promise.all((await caches.keys()).map(async (k) => (await (await caches.open(k)).keys()).map((r) => new URL(r.url).pathname)))).flat(),
  }));

function expectNothingStored(stored: Awaited<ReturnType<typeof storedIn>>) {
  expect(stored).toMatchObject({ local: 0, session: 0, cookies: "", databases: 0 });
  for (const path of stored.cached) expect(path).toMatch(/^\/(index\.html|assets\/|model\/|data\/|__sw-manifest)/);
}

test("never stores the user's data in the browser", async ({ page }) => {
  await throughSkuld(page, "Wikipedia", "Pålitlig");
  expectNothingStored(await storedIn(page));
});

// The promise is about the user's own file, so one goes all the way through, as CSV and as Excel. The column name
// is a marker that must never appear in a request, its address or its body.
const MARKER = "Kassa7f3q";
const DAY = 86_400_000;
const days = Array.from({ length: 400 }, (_, i) => new Date(Date.UTC(2025, 0, 1) + i * DAY));
const sales = days.map((d, i) => 1000 + 300 * Math.sin(i / 3) + (d.getUTCDay() === 6 ? 500 : 0));

function ownCsv(): OwnFile {
  const rows = days.map((d, i) => `${d.toISOString().slice(0, 10)};${sales[i].toFixed(1).replace(".", ",")}`);
  return { name: "min-forsaljning.csv", mimeType: "text/csv", buffer: Buffer.from(`Datum;${MARKER}\n${rows.join("\n")}`) };
}

function ownExcel(): OwnFile {
  // SheetJS writes a Date by the local clock, so local midnight is a plain date in Excel, as a typed one would be.
  const local = (d: Date) => new Date(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
  const sheet = XLSX.utils.aoa_to_sheet([["Datum", MARKER], ...days.map((d, i) => [local(d), Math.round(sales[i])])]);
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, "Blad1");
  const buffer = XLSX.write(book, { type: "buffer", bookType: "xlsx" }) as Buffer;
  return { name: "min-forsaljning.xlsx", mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", buffer };
}

for (const [kind, file] of [["CSV", ownCsv], ["Excel", ownExcel]] as const) {
  test(`an own ${kind} file goes from Start to Skuld without leaving the device or being stored`, async ({ context, page }) => {
    const w = watch(context, page);
    await throughSkuld(page, file());
    expect(w.foreign()).toEqual([]);
    expect(w.refused).toEqual([]);
    expect(w.requests.filter((u) => u.includes(MARKER))).toEqual([]);
    expect(w.bodies.filter((b) => b.includes(MARKER))).toEqual([]);
    expectNothingStored(await storedIn(page));
  });
}

test("the chart says its unit and shows the values under the pointer", async ({ page }) => {
  await page.goto("/?exempel=wikipedia&horisont=1");
  await expect(page.locator(".n-svar")).toContainText("sidvisningar", { timeout: 120_000 });
  const chart = page.locator("svg.n-graf");
  await expect(chart.locator(".n-graf__enhet")).toHaveText("sidvisningar per dag");
  const box = (await chart.boundingBox())!;
  await page.mouse.move(box.x + box.width * 0.8, box.y + box.height / 2);
  const card = page.locator(".n-graf-kort");
  await expect(card).toContainText("Troligast");
  await expect(card).toContainText("Breda bandet, nio fall av tio");
  await page.mouse.move(box.x + box.width * 0.2, box.y + box.height / 2);
  await expect(card).toContainText("Det som varit");
  // The keyboard reaches the same values.
  await page.mouse.move(0, 0);
  await chart.focus();
  await page.keyboard.press("End");
  await expect(card).toContainText("Troligast");
});

test("a link with a horizon that is not a button opens the default one", async ({ page }) => {
  for (const horisont of ["-1", "1.5", "99", "x"]) {
    await page.goto(`/?exempel=wikipedia&horisont=${horisont}`);
    await expect(page.locator(".n-svar")).toContainText("troligen", { timeout: 120_000 });
  }
});

test("Skuld reminds of the test, which runs once, and links back to it", async ({ page }) => {
  await page.addInitScript(() => {
    const w = window as unknown as { backtests: number };
    w.backtests = 0;
    const post = Worker.prototype.postMessage;
    Worker.prototype.postMessage = function (this: Worker, msg: { type?: string }, ...rest: never[]) {
      if (msg?.type === "backtest") w.backtests++;
      return post.call(this, msg, ...rest);
    };
  });
  const backtests = () => page.evaluate(() => (window as unknown as { backtests: number }).backtests);
  const reminder = page.locator(".provet-rad");
  // A link opens Skuld first, so Skuld runs the test itself.
  await page.goto("/?exempel=wikipedia&horisont=1");
  await expect(reminder).toContainText("I provet på det senaste året träffade Norn i snitt inom", { timeout: 120_000 });
  await expect(reminder.locator(".n-betyg")).toContainText("Pålitlig");
  await reminder.getByRole("button", { name: "Se provet" }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Kan du lita på prognosen?");
  await expect(page.getByRole("list", { name: "Så gick provet till" })).toContainText("Norn gömmer det senaste året i din fil.");
  await expect(page.locator(".n-betyg")).toContainText("Pålitlig");
  await page.getByRole("button", { name: "Visa vad som kommer" }).click();
  await expect(reminder).toBeVisible();
  expect(await backtests()).toBe(1);
  // The footer's link to the explanation page opens a new tab, so this forecast is not lost.
  await expect(page.getByRole("link", { name: /Så fungerar Norn/ })).toHaveAttribute("target", "_blank");
});

test("the explanation page opens from Start and loads no model", async ({ context, page }) => {
  const w = watch(context, page);
  await page.goto("/");
  await expect(page.getByRole("table", { name: "Så kan filen se ut" })).toContainText("Försäljning");
  await expect(page.getByText(/Första gången laddar Norn ner prognosmodellen, 59 MB/)).toBeVisible();
  await page.getByRole("link", { name: "Så fungerar Norn", exact: true }).click();
  await expect(page).toHaveURL(/\/om$/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Så fungerar Norn");
  await expect(page.getByRole("heading", { name: "Modellen, Timestral från Mistral AI" })).toBeVisible();
  await expect(page.getByText(/Högst 8\s192 värden/)).toBeVisible();
  await expect(page.getByText(/minst 75 procent av det som hände/)).toBeVisible();
  await page.getByRole("link", { name: "Till Norn" }).click();
  await expect(page.locator(".n-slappyta")).toBeVisible();
  expect(w.foreign()).toEqual([]);
  expect(w.requests.filter((u) => u.includes("/model/") || u.includes(".wasm"))).toEqual([]);
});

test("an event switched on asks the model only for the forecast with events", async ({ page }) => {
  // Counts the forecasts the page asks its worker for; the one without events is kept per horizon.
  await page.addInitScript(() => {
    const w = window as unknown as { forecasts: number };
    w.forecasts = 0;
    const post = Worker.prototype.postMessage;
    Worker.prototype.postMessage = function (this: Worker, msg: { type?: string }, ...rest: never[]) {
      if (msg?.type === "forecast") w.forecasts++;
      return post.call(this, msg, ...rest);
    };
  });
  const forecasts = () => page.evaluate(() => (window as unknown as { forecasts: number }).forecasts);
  await page.goto("/?exempel=wikipedia&horisont=3");
  await expect(page.locator(".n-svar")).toContainText("troligen", { timeout: 120_000 });
  const before = await forecasts();
  await page.getByText("Vet du något om framtiden?", { exact: true }).first().click();
  const lucia = page.getByRole("button", { name: "Lucia" });
  await lucia.click();
  await expect(page.getByRole("status").filter({ hasText: /Med lucia|ändrar inte/ })).toBeVisible({ timeout: 60_000 });
  expect(await forecasts()).toBe(before + 1);
  await lucia.click();
  await expect(page.locator(".n-svar")).toContainText("troligen");
  expect(await forecasts()).toBe(before + 1);
});

test.describe("on a touch screen", () => {
  test.use({ hasTouch: true });
  // Playwright cannot emulate touch in Firefox.
  test.skip(({ browserName }) => browserName === "firefox", "Firefox has no touch emulation in Playwright");

  test("a tap shows the values and they stay after the finger lifts", async ({ page }) => {
    await page.goto("/?exempel=elforbrukning&horisont=1");
    await expect(page.locator(".n-svar")).toContainText("troligen", { timeout: 120_000 });
    const box = (await page.locator("svg.n-graf").boundingBox())!;
    await page.touchscreen.tap(box.x + box.width * 0.7, box.y + box.height / 2);
    await page.waitForTimeout(300);
    await expect(page.locator(".n-graf-kort")).toContainText("Troligast");
  });
});

test("Urd says why it asks, and a short file is told what to do", async ({ page }) => {
  await page.goto("/");
  await page.locator(".n-exempelkort", { hasText: "Detaljhandel" }).click();
  await expect(page.locator(".bekrafta")).toContainText("Kontrollera perioden och antalet, för det är dem Norn räknar på.");
  await page.goto("/");
  const rows = Array.from({ length: 20 }, (_, i) => `2026-01-${String(i + 1).padStart(2, "0")};${100 + i}`);
  await page.locator(".n-slappyta__input").setInputFiles({ name: "kort.csv", mimeType: "text/csv", buffer: Buffer.from(`Datum;Kassa\n${rows.join("\n")}`) });
  await expect(page.getByRole("alert")).toContainText("Ta med en längre period om du kan.");
});
