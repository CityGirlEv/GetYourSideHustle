import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage();
const logs = [];
const failed = [];
const responses = [];

page.on("console", (m) => logs.push(`[${m.type()}] ${m.text()}`));
page.on("pageerror", (e) => logs.push(`[pageerror] ${e.message}\n${e.stack ?? ""}`));
page.on("requestfailed", (r) => {
  if (!r.url().includes(".woff")) failed.push(`${r.url()} :: ${r.failure()?.errorText}`);
});
page.on("response", (r) => {
  const u = r.url();
  if (u.includes("node_modules") || u.includes("@id/virtual") || u.includes("/src/")) {
    if (r.status() >= 400) responses.push(`${r.status()} ${u}`);
  }
});

await page.goto("http://localhost:8081/", { timeout: 60_000, waitUntil: "domcontentloaded" });
await page.waitForTimeout(15_000);

const tsr = await page.evaluate(() => ({
  hydrated: window.$_TSR?.hydrated ?? false,
  streamEnded: window.$_TSR?.streamEnded ?? false,
}));

console.log("hydration:", tsr);
console.log("bad responses:\n", responses.slice(0, 30).join("\n") || "(none)");
console.log("failed:\n", failed.slice(0, 20).join("\n") || "(none)");
console.log(
  "errors:\n",
  logs.filter((l) => /pageerror|error/i.test(l)).slice(0, 30).join("\n") || "(none)",
);

await browser.close();
