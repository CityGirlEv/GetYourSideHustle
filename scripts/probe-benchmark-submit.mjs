import { chromium } from "playwright";

const base = process.env.BASE_URL ?? "http://localhost:8081";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

const errors = [];
page.on("pageerror", (err) => errors.push(`PAGE: ${err.message}`));
page.on("console", (msg) => {
  if (msg.type() === "error") errors.push(`CONSOLE: ${msg.text().slice(0, 200)}`);
});

await page.goto(`${base}/scenario/new`, { waitUntil: "networkidle", timeout: 60000 });

// Step 1
await page.getByPlaceholder("e.g. 1960").fill("1960");
await page.getByPlaceholder("e.g. 770").fill("770");
await page.locator("select").first().selectOption({ index: 1 });
await page.getByText("Female", { exact: true }).click();
await page.getByText("No — I do not use tobacco").click();
await page.getByText("No — not enrolled yet", { exact: true }).click();
await page.getByText("Turning 65 soon", { exact: true }).click();
await page.getByText("$55k–$75k", { exact: true }).click();
await page.getByRole("button", { name: "Next" }).click();

// Step 2
await page.getByText("Minimize monthly cost").click();
await page.getByText("Low — mostly healthy").click();
await page.getByText("No preferred pharmacy").click();
await page.getByRole("button", { name: "Next" }).click();

// Step 3
await page.getByRole("button", { name: "Next" }).click();
// Step 4
await page.getByRole("button", { name: "Next" }).click();
// Step 5
await page.getByRole("button", { name: "Submit" }).click();

await page.waitForURL(/\/scenario\/estimate\//, { timeout: 30000 });
console.log("URL:", page.url());
await page.waitForTimeout(1200);

const dialog = page.getByRole("dialog");
const nameInput = page.locator("#opt-name");
const overlay = page.locator("[data-state='open'].bg-black\\/80");

console.log("errors:", errors.slice(0, 8));
console.log("dialog visible:", await dialog.isVisible().catch(() => false));
console.log("name input visible:", await nameInput.isVisible().catch(() => false));
console.log("overlay count:", await overlay.count());

if (await dialog.isVisible().catch(() => false)) {
  console.log("dialog text:", (await dialog.innerText()).slice(0, 200));
} else if ((await overlay.count()) > 0) {
  console.log("DARK SCREEN: overlay without dialog");
  const bodyHtml = await page.locator("body").innerHTML();
  const hasDialogContent = bodyHtml.includes("expert-lead-opt-in-form");
  console.log("body has form:", hasDialogContent);
}

const flags = await page.evaluate(() => {
  const keys = Object.keys(sessionStorage).filter((k) => k.includes("expert-optin") || k.includes("just-created"));
  return Object.fromEntries(keys.map((k) => [k, sessionStorage.getItem(k)]));
});
console.log("session flags:", flags);

await browser.close();
