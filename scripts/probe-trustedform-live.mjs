import { chromium } from "playwright";

const base = process.env.BASE_URL ?? "https://mypartb.com";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

const tfRequests = [];
page.on("request", (req) => {
  if (/trustedform\.com/i.test(req.url())) tfRequests.push(req.url());
});

await page.goto(`${base}/scenario/created/TFPROBE`, { waitUntil: "networkidle", timeout: 60000 });
await page.evaluate(() => {
  sessionStorage.setItem("expert-optin-shown:TFPROBE", "1");
});
await page.reload({ waitUntil: "networkidle", timeout: 60000 });

await page.getByRole("button", { name: /Connect with Licensed Agent/i }).click();
await page.getByRole("dialog").waitFor({ timeout: 10000 });
await page.waitForTimeout(2500);

const certField = await page
  .locator('input[name="xxTrustedFormCertUrl"]')
  .getAttribute("value")
  .catch(() => null);

console.log("host:", new URL(base).hostname);
console.log("trustedform script requests:", tfRequests.length);
if (tfRequests[0]) console.log("script url:", tfRequests[0].slice(0, 120));
console.log("cert field present:", await page.locator('input[name="xxTrustedFormCertUrl"]').count());
console.log("cert url captured:", certField ? certField.slice(0, 80) : "(empty)");

await browser.close();
