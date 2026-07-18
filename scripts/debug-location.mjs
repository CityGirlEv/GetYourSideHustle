import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto("http://localhost:8081/", { timeout: 60_000, waitUntil: "load" });
await page.waitForTimeout(8_000);

const tests = await page.evaluate(() => {
  const out = {};
  try {
    history.pushState({}, "", "/about");
    out.pushStatePath = location.pathname;
  } catch (e) {
    out.pushStateErr = String(e);
  }

  const before = location.pathname;
  location.assign("/learning-center");
  out.assignStartedFrom = before;
  return out;
});

console.log("before assign wait:", tests);
await page.waitForURL("**/learning-center**", { timeout: 5_000 }).catch(() => {});
console.log("after assign:", page.url());

await browser.close();
