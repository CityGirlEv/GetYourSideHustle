import type { TestCase } from "@/lib/test-plan";
import {
  buildBenchmarkMobileScenarioSteps,
  type BenchmarkMobileScenarioParts,
} from "@/lib/benchmark-mobile-qa-steps";

const UNASSIGNED = "Unassigned";

/** Mobile, iPhone, and iPad — all assigned to Unassigned for review. */
const MOBILE_PLATFORMS = [
  {
    suffix: "MOBILE",
    label: "Mobile (Android phone)",
    category: "Mobile" as const,
    viewport:
      "Use a mobile phone viewport (375–430px) or an Android phone browser.",
  },
  {
    suffix: "IPHONE",
    label: "iPhone",
    category: "Mobile" as const,
    viewport: "Use an iPhone in Safari or Chrome at phone width (375–430px).",
  },
  {
    suffix: "IPAD",
    label: "iPad",
    category: "Tablet" as const,
    viewport: "Use tablet width (768–1024px) or an iPad in Safari.",
  },
] as const;

type ScenarioBase = {
  id: string;
  title: string;
  priority: TestCase["priority"];
  parts: BenchmarkMobileScenarioParts;
  expected: string;
  notes?: string;
};

const SCENARIO_BASES: ScenarioBase[] = [
  {
    id: "BM-026",
    title: "ZIP 705 Evangeline — Hypertension + lisinopril · parish county report",
    priority: "P1",
    parts: {
      birthYear: "1958 (age 68 in 2026)",
      gender: "Female",
      tobacco: "Non-smoker",
      zip3: "705",
      countyLine:
        "From the county dropdown for ZIP3=705, select Evangeline Parish, LA — scopes MA plans to this parish.",
      medicareEnrolled: "Part B",
      incomeBand: "$35k–$55k",
      conditions: "Hypertension",
      medications: "Lisinopril 10 mg tablet (daily)",
      visitFrequency: "Medium (3–5 times)",
      preferredPharmacy: "No",
      benefitPriorities: "Dental Coverage",
      includeCountyReport: true,
    },
    expected:
      "BM- report loads on device; My Input shows ZIP 705 and Evangeline Parish; Potential Options top 3 and parish-scoped plan counts render; County report panel loads for agents with add-on; all four section tabs work on mobile/iPhone/iPad.",
    notes: "Louisiana parish naming — verify county dropdown label matches Evangeline Parish.",
  },
  {
    id: "BM-027",
    title: "ZIP 802 Denver — no conditions/meds · hamburger filters",
    priority: "P1",
    parts: {
      birthYear: "1961 (Turning 65 in 2026)",
      gender: "Male",
      tobacco: "Non-smoker",
      zip3: "802",
      countyLine:
        "From the county dropdown for ZIP3=802, select Denver, CO.",
      medicareEnrolled: "Unsure",
      eligibilityLine: "Eligibility: Turning 65 soon.",
      incomeBand: "$55k–$75k",
      conditions: "None",
      medications: "",
      visitFrequency: "Low (1–2 times)",
      preferredPharmacy: "No",
      benefitPriorities: "",
    },
    expected:
      "Minimal intake completes on phone/iPhone/iPad; Filters hamburger sheet opens and applies a filter without layout break; sticky tabs remain visible while scrolling; Blueprint shows Denver-area local benchmarks.",
    notes: "Focus on mobile filter sheet UX — no sticky bubble row on phone.",
  },
  {
    id: "BM-028",
    title: "ZIP 770 Harris — COPD + Spiriva · workbook Save my answers",
    priority: "P1",
    parts: {
      birthYear: "1956 (age 70 in 2026)",
      gender: "Male",
      tobacco: "Smoker",
      zip3: "770",
      countyLine:
        "From the county dropdown for ZIP3=770, select Harris, TX.",
      medicareEnrolled: "Both (Part A and Part B)",
      incomeBand: "$75k–$95k",
      conditions: "COPD",
      medications: "Tiotropium (Spiriva) 18 mcg inhaler (daily)",
      visitFrequency: "High (6+ times)",
      preferredPharmacy: "Yes",
      pharmacyName: "CVS",
      benefitPriorities: "Vision Care, Hearing Aids",
    },
    expected:
      "Medication appears in My Input; Potential Options renders with smoker + COPD context; Turning 65 Workbook Save my answers downloads filled PDF on touch devices; no horizontal overflow on wizard steps.",
  },
  {
    id: "BM-029",
    title: "ZIP 606 Cook — CHF + Entresto/Furosemide · full section audit",
    priority: "P2",
    parts: {
      birthYear: "1953 (age 73 in 2026)",
      gender: "Female",
      tobacco: "Non-smoker",
      zip3: "606",
      countyLine:
        "From the county dropdown for ZIP3=606, select Cook, IL.",
      medicareEnrolled: "Part B",
      incomeBand: "$95k–$115k",
      conditions: "Congestive Heart Failure, Hypertension",
      medications:
        "Entresto 97/103 mg tablet (twice daily); Furosemide 40 mg tablet (daily)",
      visitFrequency: "High (6+ times)",
      preferredPharmacy: "Yes",
      pharmacyName: "Walgreens",
      benefitPriorities: "Over-the-Counter (OTC) Allowances",
    },
    expected:
      "All wizard steps and all four report tabs audit cleanly on device; multiple medications listed; carrier link expands row details; CMS disclaimer appears once between filter sections.",
  },
  {
    id: "BM-030",
    title: "ZIP 331 Miami-Dade — minimal intake · compliance disclaimers",
    priority: "P2",
    parts: {
      birthYear: "1962 (Turning 65 in 2026)",
      gender: "Female",
      tobacco: "Non-smoker",
      zip3: "331",
      countyLine:
        "From the county dropdown for ZIP3=331, select Miami-Dade, FL.",
      medicareEnrolled: "None",
      eligibilityLine: "Eligibility: Turning 65 soon.",
      incomeBand: "Under $15k",
      conditions: "None",
      medications: "",
      visitFrequency: "Low (1–2 times)",
      preferredPharmacy: "No",
      benefitPriorities: "Gym Memberships / Fitness",
    },
    expected:
      "Educational disclaimer visible under subtitle; D-SNP filters respect low income band; Open PDF downloads; section tabs stay on one row; partner opt-in dialog dismisses without blocking report navigation.",
    notes: "Compliance spot-check — TPMO educational scope and PHI/PII banner on intake.",
  },
];

type MobileScenarioBase = Omit<TestCase, "id" | "assignee">;

function unassignedMobilePlatformCases(baseId: string, base: MobileScenarioBase): TestCase[] {
  return MOBILE_PLATFORMS.map((platform) => ({
    ...base,
    id: `${baseId}-${platform.suffix}`,
    title: `${base.title} — ${platform.label}`,
    area: `${base.area} · ${platform.category}`,
    assignee: UNASSIGNED,
    steps: [platform.viewport, ...base.steps],
    notes: base.notes
      ? `${base.notes}\n\nPlatform: ${platform.label}. Assigned to Unassigned for review.`
      : `Platform: ${platform.label}. Assigned to Unassigned for review.`,
  }));
}

const MOBILE_SCENARIO_BASES: Array<{ id: string; test: MobileScenarioBase }> = SCENARIO_BASES.map(
  (scenario) => ({
    id: scenario.id,
    test: {
      area: "Benchmark · Mobile scenario",
      priority: scenario.priority,
      path: "/scenario/new",
      preconditions:
        "Anonymous user on a fresh browser session (or QA tester executing assigned cases from /testing).",
      title: scenario.title,
      steps: buildBenchmarkMobileScenarioSteps(scenario.parts),
      expected: scenario.expected,
      notes: scenario.notes,
    },
  }),
);

/** Manual QA — benchmark intake + report on Mobile / iPhone / iPad — Unassigned. */
export const BENCHMARK_MOBILE_SCENARIO_TESTS: TestCase[] = MOBILE_SCENARIO_BASES.flatMap(
  ({ id, test }) => unassignedMobilePlatformCases(id, test),
);

export const BENCHMARK_MOBILE_SCENARIO_BASE_IDS = SCENARIO_BASES.map((s) => s.id);
