import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage();
const logs = [];
page.on("console", (m) => logs.push(`${m.type()}: ${m.text()}`));
page.on("pageerror", (e) => logs.push(`pageerror: ${e.message}`));
page.on("requestfailed", (r) => logs.push(`fail: ${r.url()} ${r.failure()?.errorText ?? ""}`));

await page.goto("http://localhost:8081/", { timeout: 60_000, waitUntil: "domcontentloaded" });
await page.waitForTimeout(5_000);

const link = page.locator('nav a[href="/learning-center"]').first();
const href = await link.getAttribute("href");
console.log("link href:", href);

const before = page.url();
await link.click({ timeout: 5_000 }).catch((e) => console.log("click error:", e.message));
await page.waitForTimeout(2_000);
console.log("after click:", before, "->", page.url());

// Native navigation test (bypass SPA)
await page.evaluate(() => {
  window.location.assign("/learning-center");
});
await page.waitForTimeout(2_000);
console.log("after location.assign:", page.url());

const errors = logs.filter((l) => l.startsWith("pageerror") || l.startsWith("error") || l.startsWith("fail"));
console.log("errors:", errors.slice(0, 15).join("\n") || "(none)");

await browser.close();
