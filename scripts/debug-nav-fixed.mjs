import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto("http://localhost:8081/", { timeout: 60_000, waitUntil: "domcontentloaded" });
await page.waitForTimeout(3_000);

await page.locator('nav a[href="/learning-center"]').first().click({ timeout: 15_000 });
await page.waitForURL("**/learning-center**", { timeout: 15_000 });
console.log("nav click ok:", page.url());

await page.goto("http://localhost:8081/", { waitUntil: "domcontentloaded" });
await page.waitForTimeout(2_000);
await page.getByRole("button", { name: /USE THE PART B OPTIMIZER BENCHMARK TOOL/i }).click();
await page.waitForURL("**/scenario/new**", { timeout: 15_000 });
console.log("cta click ok:", page.url());

await browser.close();
