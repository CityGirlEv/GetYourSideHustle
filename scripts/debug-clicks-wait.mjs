import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto("http://localhost:8081/", { timeout: 60_000, waitUntil: "load" });
await page.waitForTimeout(8_000);

await page.evaluate(() => {
  const a = document.createElement("a");
  a.href = "/about";
  a.id = "fresh-test-link";
  document.body.appendChild(a);
  a.click();
});
await page.waitForTimeout(3_000);
console.log("after fresh click + 3s:", page.url());

await page.goto("http://localhost:8081/", { waitUntil: "load" });
await page.waitForTimeout(3_000);
await page.locator('nav a[href="/learning-center"]').first().click({ noWaitAfter: true });
await page.waitForTimeout(3_000);
console.log("after nav link click + 3s:", page.url());

await browser.close();
