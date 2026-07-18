import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage();
const logs = [];
page.on("console", (m) => logs.push(`[${m.type()}] ${m.text()}`));
page.on("pageerror", (e) => logs.push(`[pageerror] ${e.message}`));

await page.goto("http://localhost:8081/", { timeout: 60_000, waitUntil: "domcontentloaded" });
await page.waitForTimeout(10_000);

const result = await page.evaluate(() => {
  let defaultPrevented = false;
  const a = document.createElement("a");
  a.href = "/about";
  document.body.appendChild(a);
  a.addEventListener("click", (e) => {
    defaultPrevented = e.defaultPrevented;
  });
  a.click();
  return {
    defaultPrevented,
    pathname: location.pathname,
    hydrated: window.$_TSR?.hydrated ?? null,
    hasReactRoot: !!document.querySelector("#root") || !!document.querySelector("[data-tsr-router]"),
  };
});
console.log("click test:", result);

await page.evaluate(() => {
  window.location.href = "/about";
});
await page.waitForURL("**/about**", { timeout: 10_000 }).catch(() => {});
console.log("after location.href:", page.url());

const errs = logs.filter((l) => /error|pageerror/i.test(l));
console.log("errors:\n", errs.slice(0, 15).join("\n") || "(none)");

await browser.close();
