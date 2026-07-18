import { chromium } from "playwright";

const base = process.env.BASE_URL ?? "http://localhost:8081";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

page.on("pageerror", (err) => console.log("PAGEERROR:", err.message));
page.on("request", (req) => {
  if (req.method() === "POST" && req.headers()["x-tsr-serverfn"]) {
    console.log("SERVERFN POST:", req.url());
  }
});
page.on("response", async (res) => {
  const hdr = res.request().headers()["x-tsr-serverfn"];
  if (hdr) {
    const body = await res.text().catch(() => "");
    console.log("SERVERFN RESP:", res.status(), body.slice(0, 600));
  }
});

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

const dialog = page.getByRole("dialog").or(page.locator("[role=dialog]"));
await page.getByRole("button", { name: /Connect with Licensed Agent/i }).click();
await page.getByRole("dialog").waitFor();

await page.getByRole("dialog").getByRole("checkbox", { name: /I have read and agree/i }).click();
await page.getByRole("dialog").getByRole("checkbox", { name: /authorize CMS Health/i }).click();
await page.getByRole("dialog").locator("#opt-name").fill("Dev Submit Test");
await page.getByRole("dialog").locator("#opt-email").fill(`dev-submit+${Date.now()}@example.com`);
await page.getByRole("dialog").locator("#opt-phone").fill("5551234567");

await page.getByRole("dialog").locator("form").evaluate((form) => {
  form.requestSubmit();
});

await page.waitForTimeout(5000);
console.log("DIALOG_OPEN:", (await page.getByRole("dialog").count()) > 0);

await browser.close();
