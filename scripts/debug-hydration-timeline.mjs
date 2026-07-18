import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage();
const logs = [];
page.on("console", (m) => logs.push(`[${m.type()}] ${m.text()}`));
page.on("pageerror", (e) => logs.push(`[pageerror] ${e.message}\n${e.stack ?? ""}`));

await page.goto("http://localhost:8081/", { timeout: 60_000, waitUntil: "domcontentloaded" });

for (const sec of [5, 10, 20, 30, 45, 60]) {
  await page.waitForTimeout(sec === 5 ? 5_000 : 5_000);
  const state = await page.evaluate(() => ({
    hasTSR: typeof window.$_TSR !== "undefined",
    hydrated: window.$_TSR?.hydrated ?? "deleted",
    streamEnded: window.$_TSR?.streamEnded ?? null,
    reactOnNavLink: Object.keys(document.querySelector('nav a[href="/learning-center"]') ?? {}).some((k) =>
      k.startsWith("__react"),
    ),
  }));
  console.log(`@${sec}s`, state);
  if (state.hydrated === true || state.hydrated === "deleted") break;
}

const clickResult = await page.evaluate(async () => {
  const a = document.querySelector('nav a[href="/learning-center"]');
  if (!a) return { error: "no link" };
  a.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
  await new Promise((r) => setTimeout(r, 500));
  return { pathname: location.pathname };
});
console.log("after dispatchEvent click:", clickResult);

await page.locator('nav a[href="/learning-center"]').first().click({ noWaitAfter: true });
await page.waitForTimeout(2_000);
console.log("after playwright click:", page.url());

const errs = logs.filter((l) => /error|pageerror|hydrat|mismatch|Warning:/i.test(l));
console.log("issues:\n", errs.slice(0, 30).join("\n") || "(none)");

await browser.close();
