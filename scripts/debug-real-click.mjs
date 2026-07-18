import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage();
const logs = [];
page.on("console", (m) => logs.push(`[${m.type()}] ${m.text()}`));
page.on("pageerror", (e) => logs.push(`[pageerror] ${e.message}`));

await page.goto("http://localhost:8081/", { timeout: 60_000, waitUntil: "networkidle" });
await page.waitForTimeout(5_000);

const before = await page.evaluate(() => ({
  hydrated: window.$_TSR?.hydrated ?? null,
  reactOnLink: Object.keys(document.querySelector('nav a[href="/learning-center"]') ?? {}).some((k) =>
    k.startsWith("__react"),
  ),
}));

console.log("before click:", before);

const [response] = await Promise.all([
  page.waitForNavigation({ timeout: 10_000 }).catch((e) => `timeout: ${e.message}`),
  page.locator('nav a[href="/learning-center"]').first().click(),
]);

console.log("navigation:", response?.url?.() ?? response);
console.log("after url:", page.url());

const errs = logs.filter((l) => /error|pageerror|hydrat/i.test(l));
console.log("logs:\n", errs.slice(0, 20).join("\n") || "(none)");

await browser.close();
