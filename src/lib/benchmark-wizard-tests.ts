import type { TestCase } from "@/lib/test-plan";

const LYRIQ = "Lyriq";

/** Manual QA cases for the educational benchmark wizard (/scenario/new) — assigned to Lyriq. */
export const BENCHMARK_WIZARD_TESTS: TestCase[] = [
  {
    id: "BM-001",
    area: "Benchmark · Intake",
    priority: "P0",
    assignee: LYRIQ,
    title: "Step 1 — ZIP3, county, enrollment, income required",
    path: "/scenario/new",
    steps: [
      "Open /scenario/new",
      "Leave ZIP3 empty and click Continue",
    ],
    expected: "Toast asks for exactly 3 digits of ZIP code; does not advance.",
  },
  {
    id: "BM-002",
    area: "Benchmark · Intake",
    priority: "P0",
    assignee: LYRIQ,
    title: "County combobox filters and selects after ZIP3",
    path: "/scenario/new",
    steps: [
      "Enter ZIP3=770",
      "Open county dropdown and type 'har'",
      "Select Harris County",
    ],
    expected: "County field shows Harris; Continue passes step 1 when other required fields are filled.",
  },
  {
    id: "BM-003",
    area: "Benchmark · Intake",
    priority: "P1",
    assignee: LYRIQ,
    title: "Income band label includes (annually)",
    path: "/scenario/new",
    steps: ["On step 1, locate the income band question"],
    expected: 'Field legend reads "Income band (annually)" with explanatory tip text.',
  },
  {
    id: "BM-004",
    area: "Benchmark · Intake",
    priority: "P1",
    assignee: LYRIQ,
    title: "Intro banner states no PHI/PII collection",
    path: "/scenario/new",
    steps: ["Read the blue intro banner at top of wizard"],
    expected:
      "Copy includes that Personal Health Information (PHI) and Personally Identifiable Information (PII) are not collected.",
  },
  {
    id: "BM-005",
    area: "Benchmark · Intake",
    priority: "P1",
    assignee: LYRIQ,
    title: "Final step — How did you hear about us (referral sources)",
    path: "/scenario/new",
    steps: [
      "Complete steps through benefit priorities (final step)",
      "Locate 'How did you hear about us?' card",
      "Check 'Agent referral' and enter an agency name",
    ],
    expected:
      "Same checkbox grid and detail fields as /scenario/old step 3; agent name required when agent referral is checked.",
  },
  {
    id: "BM-006",
    area: "Benchmark · Intake",
    priority: "P1",
    assignee: LYRIQ,
    title: "Submit goes directly to benchmark report page",
    path: "/scenario/new",
    steps: [
      "Complete all wizard steps and click Submit",
    ],
    expected:
      "Navigates directly to /scenario/estimate/{BM-…} with report sections and action links side by side; no intermediate View your benchmark report page.",
  },
  {
    id: "BM-007",
    area: "Benchmark · Report",
    priority: "P1",
    assignee: LYRIQ,
    title: "Report page — area plans and PDF download actions",
    path: "/scenario/new",
    steps: [
      "Complete intake and open the benchmark report",
      "Confirm 'See possible plans in your area' and 'Download full report' buttons",
    ],
    expected: "Both actions render; PDF downloads; plan comparison expands in-page when requested.",
  },
  {
    id: "BM-008",
    area: "Admin · Operations",
    priority: "P0",
    assignee: LYRIQ,
    title: "Admin menu — Competitor Scouting navigates without crash",
    path: "/admin/competitor-scouting",
    steps: [
      "Sign in as admin",
      "Open Admin menu → Operations → Competitor Scouting",
    ],
    expected:
      "Opens /admin/competitor-scouting with the competitor scouting table — not the main admin dashboard.",
  },
  {
    id: "BM-009",
    area: "Benchmark · Intake",
    priority: "P0",
    assignee: LYRIQ,
    title: "Conditions then medications — matches old scenario wizard",
    path: "/scenario/new",
    steps: [
      "Complete step 1 and continue",
      "On step 2 select Hypertension (and optionally Other condition)",
      "On step 3 confirm common medication chips appear and add a drug via catalog search",
    ],
    expected:
      "Step 2 is conditions only; step 3 shows common meds for selected conditions, medication cards with Add this Drug, and Add New Drug — not a free-text chip list.",
  },
];
