/**
 * Full wizard + report-section steps for benchmark mobile/iPad/iPhone QA scenarios.
 * Used by benchmark-mobile-scenario-tests.ts in the /testing portal.
 */
import {
  BENCHMARK_TAB_INPUT,
  BENCHMARK_TAB_POSSIBLE_PLANS,
  BENCHMARK_TAB_PBO_LOCAL,
  BENCHMARK_TAB_PREPARE,
  BENCHMARK_TOOL_CTA,
} from "@/lib/plan-comparison-copy";
import { formatIncomeBandForQaStep, type IncomeBand } from "@/lib/income-bands";
import { formatCountyForQaStep } from "@/lib/scenario-qa-steps";

export interface BenchmarkMobileScenarioParts {
  birthYear: string;
  gender: string;
  tobacco: "Smoker" | "Non-smoker";
  zip3: string;
  countyLine: string;
  medicareEnrolled: string;
  eligibilityLine?: string;
  incomeBand: IncomeBand;
  conditions: string;
  medications: string;
  visitFrequency: "Low (1–2 times)" | "Medium (3–5 times)" | "High (6+ times)";
  preferredPharmacy: "Yes" | "No";
  pharmacyName?: string;
  benefitPriorities: string;
  includeCountyReport?: boolean;
}

function splitList(value: string): string[] {
  return value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function formatConditionStep(condition: string): string {
  return `Condition: ${condition} — check if listed; if not present, select Other and type the condition`;
}

function formatMedicationSteps(medications: string): string[] {
  const meds = splitList(medications.replace(/;/g, ","));
  if (meds.length === 0) {
    return ["Leave medications empty and tap Continue."];
  }
  return [
    "Add each medication via catalog search (type drug name, pick result, tap Add this Drug).",
    ...meds.map((med) => med.endsWith(".") ? med : `${med}.`),
    "Tap Continue when all medications are listed.",
  ];
}

/** Report-section audit steps shared across mobile scenario tests. */
export function buildBenchmarkReportSectionSteps(opts?: {
  includeCountyReport?: boolean;
  zip3?: string;
}): string[] {
  const filterDeviceNote =
    "On phone/iPhone: open the Filters hamburger sheet. On iPad: confirm filter pills or the Filters sheet at narrower widths.";
  const countyReportSteps = opts?.includeCountyReport
    ? [
        `${filterDeviceNote}`,
        "In the Filters sheet or filter rows, locate County report.",
        "If logged in as agent/admin with the county report add-on: open County report, enter a ZIP in scope (e.g. full ZIP for the scenario prefix), and confirm the parish/county plan table loads.",
        "If anonymous: note County report is agent-only and skip — not a fail.",
      ]
    : [
        filterDeviceNote,
        "Apply a My Available or Top 10 filter pill and confirm the plan list updates.",
        "Scroll the plan rankings — sticky header (tabs + filters) stays visible.",
      ];

  return [
    "After Submit, confirm navigation to /scenario/estimate/{BM-…} with no intermediate confirmation page.",
    "Locate Report ID, Copy link, and Open PDF on the row below section tabs.",
    `Open the ${BENCHMARK_TAB_INPUT} tab and confirm every intake answer from steps 1–5 is echoed (birth year, ZIP3, county, enrollment, income band, conditions, medications, utilization, benefit priorities).`,
    `Switch to ${BENCHMARK_TAB_POSSIBLE_PLANS}: confirm top 3 plan cards (#1 highlighted) and #1 vs #2 rationale render without an extra reveal step.`,
    ...countyReportSteps,
    "Tap a carrier name on a Top 3 card or in the plan table and confirm details expand under that row.",
    "Read the CMS plan disclaimer and last-loaded note once between the upper and lower filter divider bars.",
    `Switch to ${BENCHMARK_TAB_PBO_LOCAL}: confirm Part B premium, deductible, and income-band content in the PBO Blueprint section.`,
    "In the same panel, scroll to Local Benchmarks and confirm MA, Part D, and Medigap regional ranges reference the scenario ZIP prefix.",
    `Switch to ${BENCHMARK_TAB_PREPARE}: expand the Turning 65 Workbook section, check one checklist item, enter a note, and tap Save my answers.`,
    "Confirm the filled workbook PDF downloads and a success toast appears.",
    "Confirm the educational disclaimer sits directly under the page subtitle, above section tabs.",
    "Dismiss or complete the partner opt-in dialog if it auto-opens after submit.",
  ];
}

/** Full intake wizard steps for /scenario/new on mobile, iPhone, or iPad. */
export function buildBenchmarkMobileScenarioSteps(parts: BenchmarkMobileScenarioParts): string[] {
  const {
    birthYear,
    gender,
    tobacco,
    zip3,
    countyLine,
    medicareEnrolled,
    eligibilityLine,
    incomeBand,
    conditions,
    medications,
    visitFrequency,
    preferredPharmacy,
    pharmacyName,
    benefitPriorities,
    includeCountyReport,
  } = parts;

  const conditionParts = splitList(conditions);
  const benefitParts = splitList(benefitPriorities);

  const step1Substeps = [
    `Open /scenario/new (or tap ${BENCHMARK_TOOL_CTA} from the home page).`,
    "Read the intro banner — confirm PHI/PII are not collected.",
    `Step 1 · PBO Blueprint — year of birth: ${birthYear}.`,
    `Gender: ${gender}.`,
    `Smoker or non-smoker: ${tobacco}.`,
    `First 3 digits of ZIP: ${zip3}.`,
    formatCountyForQaStep(countyLine),
    `Medicare enrollment: ${medicareEnrolled}.`,
    ...(eligibilityLine ? [eligibilityLine] : []),
    formatIncomeBandForQaStep(incomeBand),
    "Tap Continue.",
  ];

  const step2Substeps = [
    "Step 2 · Conditions (optional):",
    ...(conditionParts.length > 0
      ? conditionParts.map(formatConditionStep)
      : ["Select None for conditions."]),
    "Tap Continue.",
  ];

  const step3Substeps = ["Step 3 · Medications (optional):", ...formatMedicationSteps(medications)];

  const step4Substeps = [
    "Step 4 · Utilization & pharmacy:",
    `Visit frequency: ${visitFrequency}.`,
    `Preferred pharmacy: ${preferredPharmacy}.`,
    ...(preferredPharmacy === "Yes" && pharmacyName
      ? [`Pharmacy name: ${pharmacyName}.`]
      : []),
    "Tap Continue.",
  ];

  const step5Substeps = [
    "Step 5 · Benefit priorities:",
    ...(benefitParts.length > 0
      ? benefitParts.map((b) => `Extra benefit priority: ${b}.`)
      : ["Leave extra benefit priorities unchecked."]),
    "Optional — How did you hear about us: leave unchecked or pick one referral source.",
    "Tap Submit.",
  ];

  return [
    ...step1Substeps,
    ...step2Substeps,
    ...step3Substeps,
    ...step4Substeps,
    ...step5Substeps,
    ...buildBenchmarkReportSectionSteps({ includeCountyReport, zip3 }),
  ];
}
