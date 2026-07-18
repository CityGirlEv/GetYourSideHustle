import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage();
const logs = [];
page.on("console", (m) => logs.push(`[${m.type()}] ${m.text()}`));
page.on("pageerror", (e) => logs.push(`[pageerror] ${e.message}`));
page.on("requestfailed", (r) => {
  if (!r.url().includes(".woff")) logs.push(`[fail] ${r.url()} ${r.failure()?.errorText}`);
});

const url = "http://localhost:8081/learning-center";
const res = await page.goto(url, { timeout: 30_000, waitUntil: "domcontentloaded" });
await page.waitForTimeout(6_000);

const title = await page.title();
const bodyText = await page.locator("body").innerText().catch(() => "");
const hasLearning = bodyText.toLowerCase().includes("learning");
const hydrated = await page.evaluate(() => ({
  hasTSR: !!window.$_TSR,
  hydrated: window.$_TSR?.hydrated,
  path: location.pathname,
}));

console.log(JSON.stringify({
  status: res?.status(),
  title,
  bodyLen: bodyText.length,
  hasLearning,
  hydrated,
  url: page.url(),
}, null, 2));
console.log("errors:\n", logs.filter((l) => /error|fail|pageerror/i.test(l)).slice(0, 15).join("\n") || "(none)");

await browser.close();
