// The whole flow on every example, with every request listed: Norn may only ever talk to its own origin.
import { expect, test, type BrowserContext, type Page } from "@playwright/test";

/** Every URL the page, its worker and its service worker ask for, plus any CSP refusal in the console. */
function watch(context: BrowserContext, page: Page) {
  const origin = new URL(test.info().project.use.baseURL!).origin;
  const requests: string[] = [];
  const refused: string[] = [];
  context.on("request", (r) => requests.push(r.url()));
  page.on("console", (m) => /Content Security Policy|Refused to/.test(m.text()) && refused.push(m.text()));
  return {
    foreign: () => requests.filter((u) => !u.startsWith(`${origin}/`) && !u.startsWith("data:") && !u.startsWith(`blob:${origin}/`)),
    refused,
    requests,
  };
}

async function throughSkuld(page: Page, card: string, grade: string, sentence?: string) {
  await page.goto("/");
  await page.locator(".n-exempelkort", { hasText: card }).click();
  await expect(page.locator(".n-svar")).toContainText(" från ");
  await page.getByRole("button", { name: "Ja", exact: true }).click();
  await expect(page.locator(".n-betyg")).toContainText(grade, { timeout: 120_000 });
  if (sentence) await expect(page.locator(".n-svar")).toContainText(sentence);
  await page.getByRole("button", { name: "Visa vad som kommer" }).click();
  const svar = page.locator(".n-svar");
  await expect(svar).toContainText("troligen", { timeout: 60_000 });
  const first = await svar.innerText();
  const buttons = page.getByRole("group", { name: "Hur långt fram" }).getByRole("button");
  await buttons.nth((await buttons.count()) - 1).click();
  await expect(svar).not.toHaveText(first, { timeout: 60_000 });
  await page.getByText("Hur säker vill du vara?", { exact: true }).first().click();
  await page.getByLabel("Räcker i 9 fall av 10").check();
  await expect(page.getByRole("status").filter({ hasText: "Räkna med" })).toBeVisible();
}

// The grade and part of its sentence for each example's default series (rule in src/engine/backtest.ts).
const EXAMPLES = [
  ["Detaljhandel", "Pålitlig", "hade träffat nästan lika bra"], // within 7 %, barely better than last year
  // 5 % off and 21 % better than last week; the wide band held just under 80 % (the limit is 75 %).
  ["Elförbrukning", "Pålitlig", "betydligt bättre än att upprepa"],
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

test("never stores the user's data in the browser", async ({ page }) => {
  await throughSkuld(page, "Wikipedia", "Pålitlig");
  const stored = await page.evaluate(async () => ({
    local: localStorage.length,
    session: sessionStorage.length,
    cookies: document.cookie,
    databases: (await indexedDB.databases()).length,
    // The service worker's cache holds app files, the model and example data, never anything typed or dropped.
    cached: (await Promise.all((await caches.keys()).map(async (k) => (await (await caches.open(k)).keys()).map((r) => new URL(r.url).pathname)))).flat(),
  }));
  expect(stored).toMatchObject({ local: 0, session: 0, cookies: "", databases: 0 });
  for (const path of stored.cached) expect(path).toMatch(/^\/(index\.html|assets\/|model\/|data\/|__sw-manifest)/);
});

test("the chart says its unit and shows the values under the pointer", async ({ page }) => {
  await page.goto("/?exempel=wikipedia&horisont=1");
  await expect(page.locator(".n-svar")).toContainText("sidvisningar", { timeout: 120_000 });
  const chart = page.locator("svg.n-graf");
  await expect(chart.locator(".n-graf__enhet")).toHaveText("sidvisningar per dag");
  const box = (await chart.boundingBox())!;
  await page.mouse.move(box.x + box.width * 0.8, box.y + box.height / 2);
  const card = page.locator(".n-graf-kort");
  await expect(card).toContainText("Troligast");
  await expect(card).toContainText("I nio fall av tio");
  await page.mouse.move(box.x + box.width * 0.2, box.y + box.height / 2);
  await expect(card).toContainText("Det som varit");
  // The keyboard reaches the same values.
  await page.mouse.move(0, 0);
  await chart.focus();
  await page.keyboard.press("End");
  await expect(card).toContainText("Troligast");
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
