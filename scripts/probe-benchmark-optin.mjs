import { chromium } from "playwright";

const base = process.env.BASE_URL ?? "http://localhost:8081";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();

const errors = [];
page.on("pageerror", (err) => errors.push(`PAGE: ${err.message}`));
page.on("console", (msg) => {
  if (msg.type() === "error") errors.push(`CONSOLE: ${msg.text().slice(0, 300)}`);
});

// Seed via the app's own finalize path in the browser
await page.goto(`${base}/scenario/new`, { waitUntil: "networkidle", timeout: 60000 });

const code = await page.evaluate(async () => {
  const { finalizeBenchmarkIntake } = await import("/src/lib/benchmark-intake.ts");
  const { saveBenchmarkEstimate } = await import("/src/lib/benchmark-estimate-storage.ts");

  const finalized = finalizeBenchmarkIntake({
    birthYear: 1960,
    gender: "female",
    tobacco: false,
    zip3: "770",
    county: "Harris",
    medicareEnrolled: "none",
    eligibilityCircumstance: "turning_65",
    eligibilityCircumstanceOther: "",
    incomeBand: "$55k–$75k",
    conditions: [],
    medications: [],
    medicationDetails: [],
    visitFrequency: "low",
    preferredPharmacy: "no",
    preferredPharmacyName: "",
    benefitPriorities: [],
  });

  saveBenchmarkEstimate(finalized);
  sessionStorage.setItem(`benchmark-just-created:${finalized.estimateId}`, "1");
  sessionStorage.removeItem(`expert-optin-shown:${finalized.estimateId}`);
  return finalized.estimateId;
});

console.log("code:", code);
await page.goto(`${base}/scenario/estimate/${code}`, { waitUntil: "networkidle", timeout: 60000 });
await page.waitForTimeout(1200);

const dialog = page.getByRole("dialog");
const nameInput = page.locator("#opt-name");
const overlay = page.locator("[data-state='open'].bg-black\\/80");

console.log("errors:", errors);
console.log("dialog visible:", await dialog.isVisible().catch(() => false));
console.log("name input visible:", await nameInput.isVisible().catch(() => false));
console.log("overlay count:", await overlay.count());

if (await dialog.isVisible().catch(() => false)) {
  console.log("dialog text:", (await dialog.innerText()).slice(0, 250));
} else if ((await overlay.count()) > 0) {
  console.log("DARK SCREEN: overlay without dialog role");
}

const flags = await page.evaluate((c) => ({
  justCreated: sessionStorage.getItem(`benchmark-just-created:${c}`),
  shown: sessionStorage.getItem(`expert-optin-shown:${c}`),
}), code);
console.log("session flags:", flags);

// Manual CTA
if (!(await nameInput.isVisible().catch(() => false))) {
  await page.keyboard.press("Escape");
  await page.waitForTimeout(200);
}
const cta = page.getByRole("button", { name: /Connect with Licensed Agent/i }).first();
if (await cta.isVisible().catch(() => false)) {
  await cta.click();
  await page.waitForTimeout(500);
  console.log("manual CTA - dialog:", await dialog.isVisible().catch(() => false));
  console.log("manual CTA - name input:", await nameInput.isVisible().catch(() => false));
}

await browser.close();
