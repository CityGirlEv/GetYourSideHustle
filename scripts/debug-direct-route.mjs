import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage();
const logs = [];
page.on("console", (m) => logs.push(`[${m.type()}] ${m.text()}`));
page.on("pageerror", (e) => logs.push(`[pageerror] ${e.message}`));

await page.goto("http://localhost:8081/", { timeout: 60_000, waitUntil: "domcontentloaded" });
await page.waitForTimeout(10_000);

const navResult = await page.evaluate(async () => {
  const w = window;
  const keys = Object.keys(w).filter((k) => /router|TSR|tanstack/i.test(k));
  const before = location.pathname;
  try {
    const res = await fetch("/learning-center", {
      headers: { Accept: "text/html" },
    });
    return {
      before,
      fetchStatus: res.status,
      fetchUrl: res.url,
      windowKeys: keys,
      after: location.pathname,
    };
  } catch (e) {
    return { error: String(e), before, windowKeys: keys };
  }
});
console.log("fetch test:", navResult);

await page.goto("http://localhost:8081/learning-center", { timeout: 60_000, waitUntil: "domcontentloaded" });
await page.waitForTimeout(3_000);
console.log("direct goto:", page.url(), await page.title());

const errs = logs.filter((l) => /error|pageerror/i.test(l));
console.log("issues:\n", errs.slice(0, 15).join("\n") || "(none)");

await browser.close();
