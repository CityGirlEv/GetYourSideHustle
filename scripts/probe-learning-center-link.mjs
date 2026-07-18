import { chromium } from "playwright";

const base = process.env.BASE_URL ?? "http://localhost:8081";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
page.on("pageerror", (e) => console.log("PAGEERR:", e.message));

await page.goto(`${base}/`, { waitUntil: "networkidle", timeout: 60000 });
await page.getByRole("link", { name: /Learning Center/i }).first().click();
await page.waitForTimeout(2500);
const body = await page.locator("body").innerText();
console.log("url:", page.url());
console.log("crashed:", body.includes("This page didn't load"));
console.log("has Learning Center text:", body.includes("Learning Center"));
console.log("snippet:", body.replace(/\s+/g, " ").slice(0, 250));

await browser.close();
