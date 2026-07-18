import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage();
const logs = [];
page.on("console", (m) => logs.push(`[${m.type()}] ${m.text()}`));
page.on("pageerror", (e) => logs.push(`[pageerror] ${e.message}`));

await page.goto("http://localhost:8081/", { timeout: 60_000, waitUntil: "load" });
await page.waitForTimeout(8_000);

const tsr = await page.evaluate(() => ({
  hasTSR: typeof window.$_TSR !== "undefined",
  hydrated: window.$_TSR?.hydrated ?? null,
  streamEnded: window.$_TSR?.streamEnded ?? null,
  refreshInstalled: !!window.__vite_plugin_react_preamble_installed__,
}));

console.log("TSR state:", tsr);

// Programmatic .click() on anchor
const clicked = await page.evaluate(() => {
  const a = document.querySelector('nav a[href="/learning-center"]');
  if (!a) return "no link";
  a.click();
  return "clicked";
});
await page.waitForTimeout(2_000);
console.log("after a.click():", clicked, "->", page.url());

// Hard assign
await page.goto("http://localhost:8081/", { waitUntil: "load" });
await page.waitForTimeout(3_000);
await page.evaluate(() => { window.location.assign("/learning-center"); });
await page.waitForURL("**/learning-center**", { timeout: 10_000 }).catch(() => {});
console.log("after assign:", page.url());

const errs = logs.filter((l) => /error|pageerror|warn.*router|warn.*hydrat/i.test(l));
console.log("console:\n", errs.slice(0, 25).join("\n") || logs.slice(-10).join("\n"));

await browser.close();
