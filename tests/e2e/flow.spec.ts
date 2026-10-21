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

async function throughSkuld(page: Page, card: string, grade: string) {
  await page.goto("/");
  await page.locator(".n-exempelkort", { hasText: card }).click();
  await expect(page.locator(".n-svar")).toContainText(" från ");
  await page.getByRole("button", { name: "Ja", exact: true }).click();
  await expect(page.locator(".n-betyg")).toContainText(grade, { timeout: 120_000 });
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

const EXAMPLES = [
  ["Detaljhandel", "Ungefärlig"],
  ["Elpris", "Pålitlig"],
  ["Wikipedia", "Pålitlig"],
] as const;

for (const [card, grade] of EXAMPLES) {
  test(`${card}: from Start to Skuld without a request to another origin`, async ({ context, page }) => {
    const w = watch(context, page);
    await throughSkuld(page, card, grade);
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
