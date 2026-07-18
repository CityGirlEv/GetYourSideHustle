import type { TestCase } from "@/lib/test-plan";
import {
  BENCHMARK_NEW_INPUT_HINT,
  BENCHMARK_RUN_UPDATED_SCENARIO,
  BENCHMARK_TAB_INPUT,
} from "@/lib/plan-comparison-copy";

const LYRIQ = "Lyriq";

const REPORT_PRECONDITION =
  "Open a saved BM- benchmark report (complete /scenario/new or reopen from Previous Benchmark Tool Reports on this device).";

/** Manual QA — benchmark report UX polish (Lyriq). */
export const BENCHMARK_REPORT_UX_TESTS: TestCase[] = [
  {
    id: "BM-022",
    area: "Benchmark · Report UX",
    priority: "P1",
    assignee: LYRIQ,
    path: "/scenario/estimate/$code",
    preconditions: REPORT_PRECONDITION,
    title: "New input hint on non–My Input tabs",
    steps: [
      `On the report, confirm the hint is hidden on the ${BENCHMARK_TAB_INPUT} tab.`,
      "Switch to Potential Options, Blueprint & Benchmarks, or Turning 65 Workbook.",
      "Locate the hint below the section tabs.",
    ],
    expected: `Hint reads: "${BENCHMARK_NEW_INPUT_HINT}"`,
  },
  {
    id: "BM-023",
    area: "Benchmark · Report UX",
    priority: "P1",
    assignee: LYRIQ,
    path: "/scenario/estimate/$code",
    preconditions: REPORT_PRECONDITION,
    title: "Potential Top 3 rank labels — #2 of 3 and #3 of 3",
    steps: [
      "Open Potential Options → Potential Top 3.",
      "Review the #2 and #3 plan cards (or tabs).",
    ],
    expected:
      'Runners-up show "#2 of 3" and "#3 of 3" (not "#2 · #2"). #1 keeps a best-match label such as "· Best overall match".',
  },
  {
    id: "BM-024",
    area: "Benchmark · Report UX",
    priority: "P1",
    assignee: LYRIQ,
    path: "/scenario/estimate/$code",
    preconditions: REPORT_PRECONDITION,
    title: "Run New Report — hourglass while Potential Options loads",
    steps: [
      `Go to ${BENCHMARK_TAB_INPUT}, change an answer so Run New Report is enabled.`,
      `Click ${BENCHMARK_RUN_UPDATED_SCENARIO}.`,
      "Watch for the hourglass overlay while the plan catalog loads.",
    ],
    expected:
      "Hourglass overlay appears after Run New Report (even on repeat runs in the same session). Overlay clears when Potential Options is ready. User lands on the Potential Options tab (not My Input).",
  },
  {
    id: "BM-025",
    area: "Benchmark · Report UX",
    priority: "P2",
    assignee: LYRIQ,
    path: "/scenario/estimate/$code",
    preconditions: REPORT_PRECONDITION,
    title: "CMS plan disclaimer — once between filter sections",
    steps: [
      "Open Potential Options and scroll to the My Available / All Plans filter block.",
      "Read the CMS disclaimer and last-loaded note at the bottom of both filter rows.",
    ],
    expected:
      "Disclaimer and CMS last-loaded timestamp appear once between upper and lower navy divider bars (not duplicated inside each filter section). Text is on one line.",
  },
];
