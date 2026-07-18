import { chromium } from "playwright";

const base = process.env.BASE_URL ?? "http://localhost:8081";

function watch(page) {
  page.on("pageerror", (err) => console.log("PAGE ERROR:", err.message));
  page.on("console", (msg) => {
    if (msg.type() === "error") console.log("CONSOLE ERROR:", msg.text().slice(0, 300));
  });
  page.on("response", async (res) => {
    const url = res.url();
    if (!/submitExpertContact|_server|serverFn/i.test(url)) return;
    const body = await res.text().catch(() => "");
    console.log("SERVER FN:", res.status(), url, body.slice(0, 800));
  });
}

async function crashed(page) {
  const bodyText = await page.locator("body").innerText();
  return bodyText.includes("This page didn't load");
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
watch(page);

await page.goto(`${base}/scenario/created/TEST99`, { waitUntil: "networkidle", timeout: 60000 });
await page.evaluate(() => {
  sessionStorage.setItem(
    "scenario:TEST99",
    JSON.stringify({
      year: 2026,
      birthYear: 1960,
      zip3: "902",
      medications: [],
      conditions: [],
      gender: "female",
      tobacco: false,
      incomeBand: "medium",
      costPreference: "balanced",
    }),
  );
  sessionStorage.setItem("expert-optin-shown:TEST99", "1");
});
await page.reload({ waitUntil: "networkidle", timeout: 60000 });

const dialog = page.getByRole("dialog");

await page.getByRole("button", { name: /Connect with Licensed Agent/i }).click();
await dialog.waitFor({ timeout: 5000 });
console.log("open dialog crashed:", await crashed(page));

await dialog.getByRole("checkbox", { name: /I have read and agree/i }).click();
await page.waitForTimeout(300);
console.log("privacy checkbox crashed:", await crashed(page));

await dialog.getByRole("checkbox", { name: /authorize CMS Health/i }).click();
await page.waitForTimeout(300);
console.log("authorize checkbox crashed:", await crashed(page));

await dialog.getByRole("checkbox", { name: /educational Medicare tips/i }).click();
await page.waitForTimeout(300);
console.log("marketing checkbox crashed:", await crashed(page));

await dialog.locator("#opt-name").fill("Jane Doe");
await dialog.locator("#opt-email").fill("jane@example.com");
await dialog.locator("#opt-phone").fill("5551234567");
await page.waitForTimeout(200);
console.log("fill fields crashed:", await crashed(page));

await dialog.getByRole("button", { name: "Contact me" }).click();
await page.waitForTimeout(2000);
console.log("submit crashed:", await crashed(page));

await browser.close();
