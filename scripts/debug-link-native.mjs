import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage();
await page.goto("http://localhost:8081/", { timeout: 60_000, waitUntil: "load" });
await page.waitForTimeout(8_000);

const tests = await page.evaluate(() => {
  const results = {};

  const navLink = document.querySelector('nav a[href="/learning-center"]');
  const rect = navLink?.getBoundingClientRect();
  const topEl = rect
    ? document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2)
    : null;
  results.topElement = topEl ? `${topEl.tagName}.${topEl.className?.slice?.(0, 40)}` : null;
  results.sameAsLink = topEl === navLink;

  // Fresh anchor test
  const fresh = document.createElement("a");
  fresh.href = "/about";
  fresh.textContent = "fresh";
  fresh.id = "fresh-test-link";
  document.body.appendChild(fresh);
  fresh.click();
  results.afterFreshClick = location.pathname;

  return results;
});
console.log(tests);
await page.waitForTimeout(1_000);
console.log("final url:", page.url());

await browser.close();
