import type { TestCase } from "@/lib/test-plan";

const LYRIQ = "Lyriq";

const LAYOUT_PLATFORMS = [
  { suffix: "COMP", label: "Computer", category: "Desktop" as const },
  { suffix: "PHONE", label: "Phone", category: "Mobile" as const },
  { suffix: "IPAD", label: "iPad", category: "Tablet" as const },
];

const REPORT_PRECONDITION =
  "Complete /scenario/new through Submit (year of birth, ZIP3, county, enrollment, income band, and remaining steps) — or reopen a recent BM- report from Previous Benchmarks on this device.";

const VIEWPORT_STEP: Record<string, string> = {
  COMP: "Use desktop/laptop width (≥1280px).",
  PHONE: "Use phone width (375–430px) or a phone browser.",
  IPAD: "Use tablet width (768–1024px) or an iPad.",
};

type LayoutTestBase = Omit<TestCase, "id" | "assignee">;

/** Fan out one layout QA case to Computer / Phone / iPad — all assigned to Lyriq. */
function lyriqLayoutPlatformCases(baseId: string, base: LayoutTestBase): TestCase[] {
  return LAYOUT_PLATFORMS.map((platform) => ({
    ...base,
    id: `${baseId}-${platform.suffix}`,
    title: `${base.title} — ${platform.label}`,
    area: `${base.area} · ${platform.category}`,
    assignee: LYRIQ,
    steps: [VIEWPORT_STEP[platform.suffix], ...base.steps],
    notes: base.notes
      ? `${base.notes}\n\nPlatform: ${platform.label}.`
      : `Platform: ${platform.label}. Layout regression — Lyriq.`,
  }));
}

const LAYOUT_BASES: Array<{ id: string; test: LayoutTestBase }> = [
  {
    id: "BM-010",
    test: {
      area: "Benchmark · Report layout",
      priority: "P0",
      path: "/scenario/new",
      preconditions: REPORT_PRECONDITION,
      title: "Report ID row with section tabs",
      steps: [
        "On the benchmark report, confirm the educational disclaimer sits directly under the page subtitle, above the section tabs.",
        "Confirm section tabs are the first navigation row below the disclaimer (My Input, Potential Options, Blueprint & Benchmarks, Turning 65 Workbook) and stay on one line.",
        "Confirm the active tab has a green top border.",
        "On the row below the tabs (same row as Previous Scenarios when history exists), locate Report ID, Copy link, and Open PDF on the right.",
        "Scroll the Potential Options plan list — tabs, filters, and toolbar stay sticky at the top.",
        "Confirm there is no Jump to section menu, bubble submenu, or duplicate section nav row.",
      ],
      expected:
        "Flat section tabs on one row below the disclaimer. Report ID + Copy link + Open PDF sit on the row with Previous Scenarios (right-aligned; Previous Scenarios on the left when history exists). Sticky header keeps tabs and plan filters visible while scrolling lists. Partner connect is available via the auto opt-in dialog after submit, not as a tab or toolbar button.",
    },
  },
  {
    id: "BM-011",
    test: {
      area: "Benchmark · Report layout",
      priority: "P0",
      path: "/scenario/new",
      preconditions: REPORT_PRECONDITION,
      title: "Section tabs — one click switches panel",
      steps: [
        "Click Potential Options and confirm top 3 plan cards and rationale load without an extra reveal step.",
        "Click Blueprint & Benchmarks tab and confirm Part B premium, deductible, income-band, and local MA/Part D/Medigap ranges in one panel.",
      ],
      expected:
        "Each tab click switches the visible panel immediately. No jump-to-section dropdown or scroll-to-subsection navigation.",
    },
  },
  {
    id: "BM-012",
    test: {
      area: "Benchmark · Report layout",
      priority: "P1",
      path: "/scenario/new",
      preconditions: REPORT_PRECONDITION,
      title: "Section tabs — switching tabs changes visible content",
      steps: [
        "Click My Input tab, then Potential Options tab, then Blueprint & Benchmarks tab.",
      ],
      expected:
        "Only the active tab's panel is visible; tab order is My Input → Potential Options → Blueprint & Benchmarks → Turning 65 Workbook.",
    },
  },
  {
    id: "BM-013",
    test: {
      area: "Benchmark · Report layout",
      priority: "P1",
      path: "/scenario/new",
      preconditions: REPORT_PRECONDITION,
      title: "Blueprint & Benchmarks combined tab",
      steps: [
        "Click Blueprint & Benchmarks and confirm Part B premium, deductible, and income-band content.",
        "In the same panel, scroll to Local Benchmarks and confirm MA, Part D, and Medigap regional ranges.",
      ],
      expected:
        "PBO Blueprint and Local Benchmarks appear as stacked sections in one tab — not separate top-level tabs.",
    },
  },
  {
    id: "BM-014",
    test: {
      area: "Benchmark · Report layout",
      priority: "P1",
      path: "/scenario/new",
      preconditions: REPORT_PRECONDITION,
      title: "My Input tab label and panel heading",
      steps: [
        "Locate the My Input tab.",
        "Click it and confirm the in-page heading matches.",
      ],
      expected: 'Tab and panel heading both use "My Input" (not "Your profile").',
    },
  },
  {
    id: "BM-015",
    test: {
      area: "Benchmark · Report layout",
      priority: "P1",
      path: "/scenario/new",
      preconditions: REPORT_PRECONDITION,
      title: "Potential Options — top 3 and carrier links",
      steps: [
        "Open Potential Options and confirm top 3 plan cards (#1 highlighted) plus #1 vs #2 rationale.",
        "If ranks #4–#10 appear below, inspect the Carrier / plan column.",
        "Click a carrier name on a plan row (not the plan name line below it).",
      ],
      expected:
        "Top 3 and rationale visible at top. Clicking a carrier on a Top 3 card or a filter pill (Top 10, All Plans, etc.) scrolls to the plan rankings table; clicking a carrier in the table expands details under that row.",
    },
  },
  {
    id: "BM-016",
    test: {
      area: "Benchmark · Report layout",
      priority: "P1",
      path: "/scenario/new",
      preconditions: REPORT_PRECONDITION,
      title: "Workbook — Save my answers downloads filled PDF",
      steps: [
        "Expand the Part B Optimizer (PBO) Turning 65 Workbook section.",
        "Check one checklist item and enter text in a notes line.",
        'Click "Save my answers".',
      ],
      expected:
        'PDF downloads (PBO_Turning_65_Workbook-my-answers.pdf) containing the checked item and note; toast confirms success.',
    },
  },
  {
    id: "BM-017",
    test: {
      area: "Benchmark · Report layout",
      priority: "P1",
      path: "/scenario/new",
      preconditions: REPORT_PRECONDITION,
      title: "Responsive Report ID row and section tabs",
      steps: [
        "On the benchmark report, locate the sticky header with section tabs on one line and Report ID / actions on the row below.",
        "Resize or rotate the device if needed.",
        "On Potential Options, open the Filters menu on phone (or confirm filter pills on tablet/desktop) and confirm the sticky header remains visible after scrolling to the plan list.",
      ],
      expected:
        "All viewports: section tabs on one row at top of sticky header; Report ID + actions on the row below (with Previous Scenarios on the left when history exists). Toolbar may wrap on phone. No jump menu. Sticky chrome stays visible when browsing long plan lists. On phone, filter bubbles live in a Filters sheet — not a sticky bubble row.",
    },
  },
  {
    id: "BM-018",
    test: {
      area: "Benchmark · Report layout",
      priority: "P2",
      path: "/scenario/new",
      preconditions: "Anonymous user; fresh browser session.",
      title: "Spot check — Miami ZIP3 331 minimal intake",
      steps: [
        "Complete step 1 with birth year 1962, Female, Non-smoker, ZIP3=331, select a Florida county, Medicare Unsure + Turning 65, income $55k–$75k.",
        "Skip optional conditions/meds; complete utilization (e.g. 2–4 visits, no preferred pharmacy) and benefit priorities; Submit.",
      ],
      expected:
        "Report loads with BM- ID, My Input populated, and Blueprint & Benchmarks tab showing local ranges referencing ZIP 331xx — layout matches other regions.",
    },
  },
  {
    id: "BM-019",
    test: {
      area: "Benchmark · Report layout",
      priority: "P2",
      path: "/scenario/new",
      preconditions: "Anonymous user.",
      title: "Spot check — Chicago ZIP3 606 with Hypertension + lisinopril",
      steps: [
        "Step 1: birth year 1959, Male, Non-smoker, ZIP3=606, Cook County, Part B enrolled, income $75k–$100k.",
        "Step 2: select Hypertension.",
        "Step 3: add lisinopril via search, click Add this Drug, Continue.",
        "Finish steps 4–5 and Submit.",
        "Expand Potential Options and confirm top 3 plan cards render.",
      ],
      expected:
        "Report shows medication in My Input; Potential Options top 3 and rationale render without layout break; carrier links work.",
    },
  },
  {
    id: "BM-020",
    test: {
      area: "Benchmark · Report layout",
      priority: "P2",
      path: "/scenario/new",
      preconditions: "Anonymous user.",
      title: "Spot check — Los Angeles ZIP3 902 no medications",
      steps: [
        "Step 1: birth year 1965, ZIP3=902, select a California county, None for Medicare enrollment, income Under $55k.",
        "Step 2: select None for conditions.",
        "Step 3: leave medications empty and Continue through Submit.",
      ],
      expected:
        "Report loads; My Input shows intake answers; sections 2–4 expand cleanly; workbook Save my answers button visible at bottom of workbook block.",
    },
  },
  {
    id: "BM-021",
    test: {
      area: "Benchmark · Intake layout",
      priority: "P2",
      path: "/scenario/new",
      preconditions: "Anonymous user on step 3 medications.",
      title: "Spot check — medication card footer buttons",
      steps: [
        "Reach step 3 with at least one medication card open.",
        "Locate Add this Drug and Add New Drug at the bottom of the card.",
      ],
      expected:
        'Add this Drug is green at card footer; Add New Drug is medium blue (not the same as Continue). Only the last card shows Add New Drug.',
    },
  },
];

/** Manual QA — benchmark report & intake layout (Computer / Phone / iPad) — Lyriq. */
export const BENCHMARK_REPORT_LAYOUT_TESTS: TestCase[] = LAYOUT_BASES.flatMap(({ id, test }) =>
  lyriqLayoutPlatformCases(id, test),
);

export const BENCHMARK_REPORT_LAYOUT_BASE_IDS = LAYOUT_BASES.map((b) => b.id);
