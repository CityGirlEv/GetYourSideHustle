import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage();
page.on("console", (m) => console.log(`[${m.type()}]`, m.text()));

await page.goto("http://localhost:8081/", { timeout: 60_000, waitUntil: "load" });
await page.waitForTimeout(12_000);

const state = await page.evaluate(() => {
  const a = document.querySelector('nav a[href="/learning-center"]');
  const listeners = typeof getEventListeners === "function" ? "devtools only" : "n/a";
  return {
    hasRouterProvider: !!document.querySelector("[data-status]"),
    linkTag: a?.tagName,
    linkOnclick: a?.getAttribute("onclick"),
    linkAttrs: a ? [...a.attributes].map((x) => `${x.name}=${x.value.slice(0,40)}`) : [],
    hydratedFlag: window.$_TSR?.hydrated,
    hasTSR: !!window.$_TSR,
    reactFiber: a ? Object.keys(a).filter((k) => k.startsWith("__react")).join(",") : "",
  };
});
console.log(JSON.stringify(state, null, 2));

await browser.close();
