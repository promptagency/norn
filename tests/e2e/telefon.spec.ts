// A phone gets the explainer page instead of the app, and never downloads the model.
import { expect, test } from "@playwright/test";

test.use({ viewport: { width: 390, height: 844 }, screen: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
// Playwright cannot emulate a phone in Firefox (no isMobile), so these run in Chromium and WebKit.
test.skip(({ browserName }) => browserName === "firefox", "Firefox has no phone emulation in Playwright");

for (const path of ["/", "/?exempel=wikipedia&horisont=1"]) {
  test(`a phone opening ${path} gets the explainer and no model`, async ({ context, page }) => {
    const requests: string[] = [];
    context.on("request", (r) => requests.push(r.url()));
    await page.goto(path);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText("Gör en prognos av dina egna siffror");
    await expect(page.getByRole("heading", { name: "Öppna Norn på en dator" })).toBeVisible();
    await expect(page.getByRole("button", { name: "Kopiera länken" })).toBeVisible();
    await expect(page.locator(".n-exempelkort")).toHaveCount(0);
    await page.waitForLoadState("networkidle");
    const origin = new URL(test.info().project.use.baseURL!).origin;
    expect(requests.filter((u) => !u.startsWith(origin) && !u.startsWith("data:"))).toEqual([]);
    expect(requests.filter((u) => u.includes("/model/") || u.includes(".wasm") || u.includes("worker"))).toEqual([]);
  });
}
