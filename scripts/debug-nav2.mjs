import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage();
const logs = [];
page.on("console", (m) => logs.push(`[${m.type()}] ${m.text()}`));
page.on("pageerror", (e) => logs.push(`[pageerror] ${e.message}\n${e.stack ?? ""}`));
page.on("requestfailed", (r) => logs.push(`[fail] ${r.url()} ${r.failure()?.errorText ?? ""}`));

await page.goto("http://localhost:8081/", { timeout: 60_000, waitUntil: "domcontentloaded" });
await page.waitForTimeout(4_000);

const diag = await page.evaluate(() => {
  const scripts = [...document.querySelectorAll("script[src]")].map((s) => s.getAttribute("src"));
  const hasRouter = !!window.__TSR_ROUTER__;
  const reactRoot = document.getElementById("root") ?? document.querySelector("[data-tsr-router]");
  return {
    url: location.href,
    scripts: scripts.slice(0, 8),
    hasRouter,
    bodyChildCount: document.body?.children?.length ?? 0,
    linkCount: document.querySelectorAll("a[href]").length,
    reactRootTag: reactRoot?.tagName ?? null,
  };
});
console.log("diag:", JSON.stringify(diag, null, 2));

// Click with noWaitAfter to avoid Playwright waiting on pending nav
await page.locator('nav a[href="/learning-center"]').first().click({ noWaitAfter: true });
await page.waitForTimeout(3_000);

const after = await page.evaluate(() => ({
  url: location.href,
  pathname: location.pathname,
  pendingLinks: document.querySelectorAll('a[aria-disabled="true"]').length,
}));
console.log("after click:", after);

const routerDiag = await page.evaluate(() => {
  const w = window;
  const keys = Object.keys(w).filter((k) => /router|tsr|tanstack/i.test(k));
  return { windowRouterKeys: keys };
});
console.log("router keys:", routerDiag);

const bad = logs.filter((l) => /error|fail|pageerror/i.test(l));
console.log("console issues:\n", bad.slice(0, 20).join("\n") || "(none)");

await browser.close();
