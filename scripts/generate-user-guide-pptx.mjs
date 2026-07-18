/**
 * Capture key app screens and build an end-user PowerPoint guide.
 *
 * Prerequisite: dev server running on port 8081 (or set BASE_URL).
 *
 * Usage: npm run generate:user-guide-pptx
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { chromium } from "playwright";
import PptxGenJS from "pptxgenjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const baseUrl = process.env.BASE_URL ?? "http://localhost:8081";
const shotsDir = path.join(root, "docs", ".user-guide-screenshots");
const outputPath = path.join(root, "public", "downloads", "Part-B-Optimizer-End-User-Guide.pptx");
const logoPath = path.join(root, "src", "assets", "part-b-optimizer-logo.png");

const NAV_TIMEOUT = 45_000;

const SLIDES = [
  {
    title: "Part B Optimizer",
    subtitle: "End-user guide — how the benchmark tool works",
    bullets: [
      "Educational only — not enrollment or insurance sales",
      "No phone, email, or login required to benchmark",
      "You control if/when you connect with a licensed partner",
    ],
  },
  {
    title: "Start on the home page",
    shot: "01-home.png",
    bullets: [
      "Open mypartb.com and choose the Part B Optimizer Benchmark Tool",
      "Privacy banner: de-identified inputs only (year of birth + ZIP3)",
    ],
  },
  {
    title: "Part B Optimizer Benchmark Tool",
    shot: "02-scenario-new.png",
    bullets: [
      "Five quick steps: PBO Blueprint → Conditions → Medications → Utilization → Benefits",
      "Optional: reopen a previous benchmark from this device at the bottom",
    ],
  },
  {
    title: "Step 1 — PBO Blueprint",
    shot: "03-wizard-step1.png",
    bullets: [
      "Year of birth, gender, tobacco, ZIP3, county, Medicare enrollment, income band",
      "No full ZIP, SSN, phone, or email",
    ],
  },
  {
    title: "Steps 2–3 — Optional health inputs",
    shot: "04-wizard-step3.png",
    bullets: [
      "Conditions and medications are optional but improve the educational report",
      "Continue through each step — nothing is shared until you choose partner contact",
    ],
  },
  {
    title: "Submit — get your Benchmark Tool ID",
    shot: "05-wizard-step5.png",
    bullets: [
      "Step 5: benefit priorities, then Submit",
      "You receive a BM-… ID stored on this device only",
    ],
  },
  {
    title: "Your benchmark report",
    shot: "06-benchmark-report.png",
    bullets: [
      "Federal Part B baselines, regional context, Top 10 framework, workbook, PDF download",
      "Section menu scrolls to PBO Blueprint, Possible Plans, workbook, and more",
    ],
  },
  {
    title: "PBO Turning 65 Workbook",
    shot: "07-workbook.png",
    bullets: [
      "Interactive checklist — progress saves in your browser",
      "Save my answers as PDF when ready",
    ],
  },
  {
    title: "Partner contact is optional",
    bullets: [
      "After the report, you may connect with a licensed partner — only if you opt in",
      "Benchmark Tool ID is yours to share or keep private",
      "Educational tool — we do not sell insurance or enroll you in coverage",
    ],
  },
];

async function waitForServer(page) {
  try {
    await page.goto(baseUrl, { waitUntil: "domcontentloaded", timeout: 15_000 });
    return true;
  } catch {
    return false;
  }
}

async function captureScreenshots() {
  fs.mkdirSync(shotsDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });

  const ok = await waitForServer(page);
  if (!ok) {
    await browser.close();
    throw new Error(
      `Dev server not reachable at ${baseUrl}. Run: npm run dev — then retry.`,
    );
  }

  await page.goto(`${baseUrl}/`, { waitUntil: "networkidle", timeout: NAV_TIMEOUT });
  await page.screenshot({ path: path.join(shotsDir, "01-home.png"), fullPage: false });

  await page.goto(`${baseUrl}/scenario/new`, { waitUntil: "networkidle", timeout: NAV_TIMEOUT });
  await page.screenshot({ path: path.join(shotsDir, "02-scenario-new.png"), fullPage: false });

  await page.getByRole("heading", { name: /Step 1 ·/i }).waitFor({ timeout: 10_000 }).catch(() => {});
  await page.screenshot({ path: path.join(shotsDir, "03-wizard-step1.png"), fullPage: false });

  // Advance to step 3 (medications) for a mid-wizard screenshot
  await page.getByPlaceholder("e.g. 1960").fill("1960");
  await page.getByPlaceholder("e.g. 770").fill("770");
  const countyBtn = page.getByRole("button", { name: /Select your county/i });
  if (await countyBtn.isVisible().catch(() => false)) {
    await countyBtn.click();
    await page.getByRole("option").first().click({ timeout: 5000 }).catch(() => {});
  }
  await page.getByText("Non-smoker", { exact: true }).click().catch(() => {});
  await page.getByText("$55k–$75k", { exact: true }).click().catch(() => {});
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(shotsDir, "04-wizard-step3.png"), fullPage: false });

  // Step 5
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(shotsDir, "05-wizard-step5.png"), fullPage: false });

  // Seed a demo benchmark report in localStorage for screenshot
  await page.evaluate(() => {
    const demo = {
      estimateId: "BM-USER-GUIDE-DEMO",
      intake: {
        birthYear: 1960,
        gender: "female",
        tobacco: false,
        zip3: "770",
        county: "Harris",
        medicareEnrolled: "unsure",
        eligibilityCircumstance: "turning_65",
        eligibilityCircumstanceOther: "",
        incomeBand: "$55k–$75k",
        conditions: [],
        medications: [],
        medicationDetails: [],
        visitFrequency: "low",
        preferredPharmacy: "no",
        preferredPharmacyName: "",
        benefitPriorities: ["dental"],
      },
      intakeSnapshot: { kind: "part_b_benchmark_tool" },
      report: {
        zip3: "770",
        county: "Harris",
        birthYear: 1960,
        gender: "female",
        tobacco: false,
        incomeBand: "$55k–$75k",
        medicareEnrolled: "unsure",
        eligibilityCircumstance: "turning_65",
        conditions: [],
        medications: [],
        visitFrequency: "low",
        preferredPharmacy: null,
        benefitPriorities: ["dental"],
        partB: { monthlyPremium: 185, annualDeductible: 257 },
        possiblePlansIntro: "Educational regional framework only.",
        topTen: [],
        localBenchmarks: [],
        workbookChecklist: [],
      },
    };
    localStorage.setItem("benchmark-estimate:store:BM-USER-GUIDE-DEMO", JSON.stringify(demo));
  });

  await page.goto(`${baseUrl}/scenario/estimate/BM-USER-GUIDE-DEMO`, {
    waitUntil: "networkidle",
    timeout: NAV_TIMEOUT,
  });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(shotsDir, "06-benchmark-report.png"), fullPage: false });

  await page.goto(`${baseUrl}/workbook`, { waitUntil: "networkidle", timeout: NAV_TIMEOUT });
  await page.screenshot({ path: path.join(shotsDir, "07-workbook.png"), fullPage: false });

  await browser.close();
  console.log(`Screenshots saved to ${path.relative(root, shotsDir)}`);
}

function addTitleSlide(pptx, slide, logoData) {
  const s = pptx.addSlide();
  s.background = { color: "F8FAFC" };
  if (logoData) {
    s.addImage({ data: logoData, x: 0.5, y: 0.4, w: 3.2, h: 0.9 });
  }
  s.addText(slide.title, {
    x: 0.5,
    y: 1.6,
    w: 9,
    h: 1,
    fontSize: 32,
    bold: true,
    color: "1E3A5F",
  });
  if (slide.subtitle) {
    s.addText(slide.subtitle, {
      x: 0.5,
      y: 2.5,
      w: 9,
      h: 0.6,
      fontSize: 16,
      color: "475569",
    });
  }
  if (slide.bullets?.length) {
    s.addText(slide.bullets.map((b) => ({ text: b, options: { bullet: true, breakLine: true } })), {
      x: 0.7,
      y: 3.3,
      w: 8.5,
      h: 2,
      fontSize: 14,
      color: "334155",
    });
  }
}

function addContentSlide(pptx, slide, logoData) {
  const s = pptx.addSlide();
  s.background = { color: "FFFFFF" };
  if (logoData) {
    s.addImage({ data: logoData, x: 8.8, y: 0.15, w: 1.1, h: 0.3 });
  }
  s.addText(slide.title, {
    x: 0.4,
    y: 0.25,
    w: 8.5,
    h: 0.55,
    fontSize: 22,
    bold: true,
    color: "1E3A5F",
  });

  const shotPath = slide.shot ? path.join(shotsDir, slide.shot) : null;
  const hasShot = shotPath && fs.existsSync(shotPath);

  if (hasShot) {
    s.addImage({
      path: shotPath,
      x: 0.4,
      y: 0.95,
      w: 5.8,
      h: 3.65,
      sizing: { type: "contain", w: 5.8, h: 3.65 },
    });
    if (slide.bullets?.length) {
      s.addText(slide.bullets.map((b) => ({ text: b, options: { bullet: true, breakLine: true } })), {
        x: 6.4,
        y: 1.1,
        w: 3.2,
        h: 3.4,
        fontSize: 11,
        color: "334155",
      });
    }
  } else if (slide.bullets?.length) {
    s.addText(slide.bullets.map((b) => ({ text: b, options: { bullet: true, breakLine: true } })), {
      x: 0.6,
      y: 1.2,
      w: 9,
      h: 4,
      fontSize: 16,
      color: "334155",
    });
  }
}

async function buildPptx() {
  const pptx = new PptxGenJS();
  pptx.author = "Part B Optimizer";
  pptx.title = "Part B Optimizer End User Guide";
  pptx.layout = "LAYOUT_16x9";

  let logoData = null;
  if (fs.existsSync(logoPath)) {
    const buf = fs.readFileSync(logoPath);
    logoData = `image/png;base64,${buf.toString("base64")}`;
  }

  for (const slide of SLIDES) {
    if (!slide.shot && slide.title === "Part B Optimizer") {
      addTitleSlide(pptx, slide, logoData);
    } else {
      addContentSlide(pptx, slide, logoData);
    }
  }

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  await pptx.writeFile({ fileName: outputPath });
  console.log(`Wrote ${path.relative(root, outputPath)}`);
}

async function main() {
  await captureScreenshots();
  await buildPptx();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
