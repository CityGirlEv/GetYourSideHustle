import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage();
const logs = [];
const failed = [];
page.on("console", (m) => logs.push(`[${m.type()}] ${m.text()}`));
page.on("pageerror", (e) => logs.push(`[pageerror] ${e.message}`));
page.on("requestfailed", (r) => failed.push(`${r.url()} :: ${r.failure()?.errorText}`));

await page.goto("http://localhost:8081/", { timeout: 60_000, waitUntil: "load" });
await page.waitForTimeout(10_000);

const state = await page.evaluate(() => ({
  url: location.href,
  barrier: document.getElementById("$tsr-stream-barrier")?.textContent?.slice(0, 200) ?? null,
  moduleScripts: [...document.querySelectorAll('script[type="module"]')].map((s) => s.getAttribute("src")),
  clickTest: null,
}));

// native navigation without playwright waiting
await page.evaluate(() => {
  const a = document.querySelector('nav a[href="/learning-center"]');
  if (a) a.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
});
await page.waitForTimeout(2_000);
const urlAfter = page.url();

console.log("state:", JSON.stringify({ ...state, urlAfter }, null, 2));
console.log("failed requests:", failed.slice(0, 15).join("\n") || "(none)");
console.log("errors:", logs.filter((l) => /error|fail/i.test(l)).slice(0, 20).join("\n") || "(none)");

await browser.close();
