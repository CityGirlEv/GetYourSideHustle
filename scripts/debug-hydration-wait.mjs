import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage();
const logs = [];
page.on("console", (m) => logs.push(`[${m.type()}] ${m.text()}`));
page.on("pageerror", (e) => logs.push(`[pageerror] ${e.message}`));

await page.goto("http://localhost:8081/", { timeout: 60_000, waitUntil: "domcontentloaded" });

for (const sec of [5, 15, 30, 60]) {
  await page.waitForTimeout(sec === 5 ? 5000 : sec === 15 ? 10000 : sec === 30 ? 15000 : 30000);
  const s = await page.evaluate(() => ({
    hasTSR: typeof window.$_TSR !== "undefined",
    hydrated: window.$_TSR?.hydrated ?? "deleted",
    pendingResources: performance
      .getEntriesByType("resource")
      .filter((e) => e.name.includes("node_modules") || e.name.includes("@id"))
      .slice(-5)
      .map((e) => `${Math.round(e.duration)}ms ${e.name.split("/").slice(-2).join("/")}`),
    reactRoot: !!document.querySelector("[data-tsr-router]"),
  }));
  console.log(`after ${sec}s:`, JSON.stringify(s));
}

console.log("errors:", logs.filter((l) => /pageerror|error/i.test(l)).join("\n") || "(none)");

await browser.close();
