import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage();
const logs = [];
page.on("console", (m) => logs.push(`[${m.type()}] ${m.text()}`));
page.on("pageerror", (e) => logs.push(`[pageerror] ${e.message}`));

await page.goto("http://localhost:8081/", { timeout: 60_000, waitUntil: "domcontentloaded" });
await page.waitForTimeout(8_000);

const before = await page.evaluate(() => ({
  pathname: location.pathname,
  historyLength: history.length,
}));

await page.locator('nav a[href="/learning-center"]').first().click({ noWaitAfter: true });

for (let i = 1; i <= 6; i++) {
  await page.waitForTimeout(1_000);
  const snap = await page.evaluate(() => ({
    pathname: location.pathname,
    href: location.href,
    historyLength: history.length,
    title: document.title.slice(0, 60),
    hasLearningHeading: !!document.querySelector("h1")?.textContent?.includes("Learning"),
  }));
  console.log(`+${i}s`, snap);
}

console.log("before:", before);
const errs = logs.filter((l) => /error|pageerror|warn.*router/i.test(l));
console.log("issues:\n", errs.slice(0, 15).join("\n") || "(none)");

await browser.close();
