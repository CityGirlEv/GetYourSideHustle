import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage();
const logs = [];
const pending = new Set();

page.on("console", (m) => logs.push(`[${m.type()}] ${m.text()}`));
page.on("pageerror", (e) => logs.push(`[pageerror] ${e.message}`));
page.on("request", (r) => {
  if (r.resourceType() === "document" || r.url().includes("/learning-center")) {
    pending.add(`${r.method()} ${r.url()}`);
  }
});
page.on("requestfinished", (r) => pending.delete(`${r.method()} ${r.url()}`));
page.on("requestfailed", (r) => {
  pending.delete(`${r.method()} ${r.url()}`);
  logs.push(`[fail] ${r.url()} ${r.failure()?.errorText}`);
});

await page.goto("http://localhost:8081/", { timeout: 60_000, waitUntil: "domcontentloaded" });
await page.waitForTimeout(8_000);

console.log("clicking learning center...");
await page.locator('nav a[href="/learning-center"]').first().click({ timeout: 5_000, noWaitAfter: true });

for (let i = 1; i <= 12; i++) {
  await page.waitForTimeout(2_000);
  const state = await page.evaluate(() => ({
    href: location.href,
    pathname: location.pathname,
    title: document.title,
    bodyLen: document.body?.innerText?.length ?? 0,
  }));
  console.log(`+${i * 2}s`, state, "pending:", [...pending].slice(0, 5));
  if (state.pathname === "/learning-center" && state.bodyLen > 500) break;
}

const errs = logs.filter((l) => /error|pageerror|fail/i.test(l));
console.log("issues:\n", errs.slice(0, 20).join("\n") || "(none)");

await browser.close();
