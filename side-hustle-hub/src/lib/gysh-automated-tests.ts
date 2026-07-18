/** GYSH automated test catalog — Vitest unit + Playwright e2e suites */

import type { QaTesterId } from "./gysh-roles";
import type { TestCase, TestSuite } from "./gysh-test-plan";

export type GyshTestCase = TestCase & { suite: TestSuite };

export { SUITE_LABELS } from "./gysh-test-plan";

export const AUTOMATED_VITEST_CASES: GyshTestCase[] = [
  {
    id: "VT-AUTH-001",
    area: "Vitest",
    title: "login API authenticates T/E against D1 (not localStorage)",
    priority: "P0",
    roles: ["qa", "admin"],
    assignees: ["evelyn"],
    suite: "vitest",
    steps: ["Run: npm run test:unit", "Verify auth helper tests pass", "Manual: POST /api/auth/login against production"],
    expected: "Email canonicalize helpers work; live login uses D1 only",
  },
  {
    id: "VT-JOIN-001",
    area: "Vitest",
    title: "Kids/Junior team membership helpers read/write join flag",
    priority: "P1",
    roles: ["qa", "kid", "junior"],
    assignees: ["tina"],
    suite: "vitest",
    steps: ["Run: npm run test:unit", "Verify kids-guides / kids-team membership tests pass"],
    expected: "writeTeamMembership + isKidsCornerMember behave correctly; join copy covers give-back/savings/reinvest",
  },
  {
    id: "VT-MEMBER-001",
    area: "Vitest",
    title: "Membership tiers, schedule suite, and credit earn actions",
    priority: "P0",
    roles: ["qa", "all"],
    assignees: ["evelyn"],
    suite: "vitest",
    steps: ["Run: npm run test:unit", "Verify membership tests pass"],
    expected: "Four tiers; Pro unlocks schedule suite; Kids/Junior credit actions present",
  },
  {
    id: "VT-ROLE-001",
    area: "Vitest",
    title: "QA tester bubbles include T + E",
    priority: "P0",
    roles: ["qa", "admin"],
    assignees: ["evelyn"],
    suite: "vitest",
    steps: ["Run: npm run test:unit", "Verify gysh-roles.test.ts passes"],
    expected: "Both co-founders appear as QA tester bubbles",
  },
  {
    id: "VT-PLAN-001",
    area: "Vitest",
    title: "Manual test cases split fairly between T + E",
    priority: "P1",
    roles: ["qa"],
    assignees: ["evelyn"],
    suite: "vitest",
    steps: ["Run: npm run test:unit", "Verify gysh-test-plan.test.ts passes"],
    expected: "Each tester has assigned manual cases; no orphan IDs",
  },
  {
    id: "VT-WIZARD-001",
    area: "Vitest",
    title: "Wizard scenario matrix (Kids/Junior/Adult/Senior FMSH paths) covered by unit tests",
    priority: "P0",
    roles: ["qa", "admin"],
    assignees: ["lyriq"],
    suite: "vitest",
    steps: [
      "Run: npm run test:unit",
      "Verify gysh-wizard-scenarios.test.ts passes (972 automated path cases)",
      "Confirm suite=vitest on all *-FMSH-* cases in Testing Portal",
    ],
    expected: "All wizard matrix combinations are represented and assigned across T / E / Lyriq",
  },
  {
    id: "VT-WORK-001",
    area: "Vitest",
    title: "Workshops data helpers return valid speaker + filter counts",
    priority: "P2",
    roles: ["qa"],
    assignees: ["tina"],
    suite: "vitest",
    steps: ["Run: npm run test:unit", "Verify workshops.test.ts passes"],
    expected: "Workshop filters and speaker lookup work",
  },
  {
    id: "VT-FIND-001",
    area: "Vitest",
    title: "Find Mine wizard groups + Free Guides free-flag data",
    priority: "P0",
    roles: ["qa", "all"],
    assignees: ["tina"],
    suite: "vitest",
    steps: [
      "Run: npm run test:unit",
      "Verify find-mine-and-free-guides.test.ts passes",
    ],
    expected: "Kids/Junior/Adult/Senior Side Hustle Wizard titles; free adult + kids/junior guides present",
  },
];

export const AUTOMATED_PLAYWRIGHT_CASES: GyshTestCase[] = [
  {
    id: "PW-SMOKE-001",
    area: "Playwright",
    title: "Homepage loads with GYSH brand title",
    priority: "P0",
    roles: ["qa", "all"],
    assignees: ["tina"],
    suite: "playwright",
    steps: ["Run: npm run test:e2e", "Open / and assert dashboard heading"],
    expected: "Discover Side Hustles visible; no console errors",
  },
  {
    id: "PW-SMOKE-007",
    area: "Playwright",
    title: "Home nav returns to Discover Side Hustles",
    priority: "P0",
    roles: ["qa", "all"],
    assignees: ["tina"],
    suite: "playwright",
    steps: ["Open Find Mine", "Click Home in header", "Assert Discover Side Hustles title"],
    expected: "Home nav restores the homepage view",
  },
  {
    id: "PW-SMOKE-002",
    area: "Playwright",
    title: "Workshops nav opens workshops hub",
    priority: "P0",
    roles: ["qa", "all"],
    assignees: ["tina"],
    suite: "playwright",
    steps: ["Click Workshops in header", "Assert workshops content visible"],
    expected: "GYSH Workshops & Guest Speakers section renders",
  },
  {
    id: "PW-SMOKE-003",
    area: "Playwright",
    title: "Kids/Juniors Corner nav opens kids content",
    priority: "P0",
    roles: ["qa", "kid"],
    assignees: ["tina"],
    suite: "playwright",
    steps: ["Click Kids/Juniors Corner", "Assert Kids / Junior age modes + tabs visible"],
    expected: "Kids/Juniors Corner loads without error",
  },
  {
    id: "PW-FIND-001",
    area: "Playwright",
    title: "Find Mine age selector routes Kids / Junior / Adult / Senior",
    priority: "P0",
    roles: ["qa", "all"],
    assignees: ["tina"],
    suite: "playwright",
    steps: [
      "Click Find Mine",
      "Assert age-group selector + one-line lead copy",
      "Click Adult → Adult Side Hustle Wizard",
      "Back to Find Mine → Kids → Kids Side Hustle wizard tab",
      "Find Mine → Senior → GYSH Seniors Corner",
    ],
    expected: "Selector appears first; each age card opens the matching wizard/page",
  },
  {
    id: "PW-FREE-001",
    area: "Playwright",
    title: "Free Guides library filters All / Free / Kids",
    priority: "P0",
    roles: ["qa", "all"],
    assignees: ["tina"],
    suite: "playwright",
    steps: [
      "Click Guides in header",
      "Assert filter chips",
      "Click Free → free guides only",
      "Click Kids → Kids Guides section",
      "Click All → Adult/Senior + Kids + Junior sections",
    ],
    expected: "Filters change visible guide sections; nav label is Guides with Some Free banner",
  },
  {
    id: "PW-MEMBER-001",
    area: "Playwright",
    title: "Membership nav opens tiers and audience tabs",
    priority: "P0",
    roles: ["qa", "all"],
    assignees: ["evelyn"],
    suite: "playwright",
    steps: [
      "Click Membership in header",
      "Assert Membership page title + tier grid",
      "Click Kids audience tab → credit earn section visible",
    ],
    expected: "Membership page renders Free–Elite tiers; Kids shows credits",
  },
  {
    id: "PW-SMOKE-004",
    area: "Playwright",
    title: "Login page does not expose passwords on screen",
    priority: "P0",
    roles: ["qa", "admin"],
    assignees: ["evelyn"],
    suite: "playwright",
    steps: ["Open Login", "Assert no Admin123 or partner emails in page text"],
    expected: "Credentials not rendered in DOM (educational security check)",
  },
  {
    id: "PW-SMOKE-005",
    area: "Playwright",
    title: "Footer links navigate About, Join, and Contact",
    priority: "P1",
    roles: ["qa"],
    assignees: ["evelyn"],
    suite: "playwright",
    steps: ["Scroll to footer", "Click About, Join, Contact Us"],
    expected: "Each footer link opens the correct static page",
  },
  {
    id: "PW-SMOKE-006",
    area: "Playwright",
    title: "Header nav opens About, Join, and Contact",
    priority: "P0",
    roles: ["qa", "admin"],
    assignees: ["evelyn"],
    suite: "playwright",
    steps: ["Click About, Join, Contact Us in top header"],
    expected: "Each header link opens the correct static page",
  },
  {
    id: "PW-JOIN-001",
    area: "Playwright",
    title: "Join GYSH page shows Create account CTA and Kids/Junior teams",
    priority: "P0",
    roles: ["qa", "all"],
    assignees: ["tina"],
    suite: "playwright",
    steps: ["Click Join in header", "Assert join page + Create account / Sign in + Kids & Junior sections"],
    expected: "Join signup hub renders with member and family team paths",
  },
  {
    id: "PW-JOIN-002",
    area: "Playwright",
    title: "Contact signup form exposes required Name/Email/Message fields",
    priority: "P1",
    roles: ["qa"],
    assignees: ["evelyn"],
    suite: "playwright",
    steps: ["Open Contact Us", "Assert contact form fields and Send message button"],
    expected: "Contact form is present with required inputs",
  },
  {
    id: "PW-JOIN-003",
    area: "Playwright",
    title: "Seniors Join Senior Team tab shows interest signup CTA",
    priority: "P1",
    roles: ["qa", "adult"],
    assignees: ["evelyn"],
    suite: "playwright",
    steps: ["Open Seniors", "Click Join Senior Team tab", "Assert I'm interested / Create free GYSH account"],
    expected: "Senior join panel renders signup actions",
  },
  {
    id: "PW-AUTH-001",
    area: "Playwright",
    title: "Login form requires email and password before submit",
    priority: "P1",
    roles: ["qa"],
    assignees: ["tina"],
    suite: "playwright",
    steps: ["Open Login", "Assert email and password inputs are required"],
    expected: "Required attributes present on login fields",
  },
];

export const AUTOMATED_TEST_IDS = new Set([
  ...AUTOMATED_VITEST_CASES.map((t) => t.id),
  ...AUTOMATED_PLAYWRIGHT_CASES.map((t) => t.id),
]);

export function isAutomatedTestId(id: string): boolean {
  if (AUTOMATED_TEST_IDS.has(id)) return true;
  // Wizard matrix paths are Vitest-covered — treat as automated in the portal.
  return /^(KIDS|JR|ADULT|SENIOR)-FMSH-\d+$/i.test(id) || /^WIZARD-EDGE-\d+$/i.test(id);
}

export function casesForTester(
  cases: GyshTestCase[],
  testerId: QaTesterId | null,
): GyshTestCase[] {
  if (!testerId) return cases;
  return cases.filter((t) => t.assignees.includes(testerId));
}

export function casesForSuite(
  cases: GyshTestCase[],
  suite: TestSuite | "all",
): GyshTestCase[] {
  if (suite === "all") return cases;
  return cases.filter((t) => t.suite === suite);
}
