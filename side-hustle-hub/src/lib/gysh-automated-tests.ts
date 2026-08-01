/** GYSH automated test catalog — Vitest unit + Playwright e2e suites */

import type { TestOwnerId } from "./gysh-roles";
import type { TestCase, TestSuite } from "./gysh-test-plan";
import { withPageLinkInFirstStep } from "./qa-page-links";

export type GyshTestCase = TestCase & { suite: TestSuite };

export { SUITE_LABELS } from "./gysh-test-plan";

const AUTOMATED_VITEST_CASES_RAW: GyshTestCase[] = [
  {
    id: "VT-AUTH-001",
    area: "Vitest",
    title: "login API authenticates T/E against D1 (not localStorage)",
    priority: "P0",
    roles: ["qa", "admin"],
    assignees: ["vitest"],
    suite: "vitest",
    steps: ["Run: npm run test:unit", "Verify auth helper tests pass", "Manual: POST /api/auth/login against production"],
    expected: "Email canonicalize helpers work; live login uses D1 only",
  },
  {
    id: "VT-JOIN-001",
    area: "Vitest",
    title: "Kids/Teens team membership helpers read/write join flag",
    priority: "P1",
    roles: ["qa", "kid", "junior"],
    assignees: ["vitest"],
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
    assignees: ["vitest"],
    suite: "vitest",
    steps: ["Run: npm run test:unit", "Verify membership tests pass"],
    expected: "Four tiers; Pro unlocks schedule suite; Kids/Teens credit actions present",
  },
  {
    id: "VT-ROLE-001",
    area: "Vitest",
    title: "QA tester bubbles include T + E",
    priority: "P0",
    roles: ["qa", "admin"],
    assignees: ["vitest"],
    suite: "vitest",
    steps: ["Run: npm run test:unit", "Verify gysh-roles.test.ts passes"],
    expected: "Both co-founders appear as QA tester bubbles",
  },
  {
    id: "VT-PLAN-001",
    area: "Vitest",
    title: "Manual cases owned by human QA; automated by suite runners",
    priority: "P1",
    roles: ["qa"],
    assignees: ["vitest"],
    suite: "vitest",
    steps: ["Run: npm run test:unit", "Verify gysh-test-plan.test.ts passes"],
    expected: "Manual cases use T/E/Lyriq; Vitest/Playwright cases use suite owners",
  },
  {
    id: "VT-WIZARD-001",
    area: "Vitest",
    title: "Wizard scenario matrix (Kids/Teens/Adult/Senior FMSH paths) covered by unit tests",
    priority: "P0",
    roles: ["qa", "admin"],
    assignees: ["vitest"],
    suite: "vitest",
    steps: [
      "Run: npm run test:unit",
      "Verify gysh-wizard-scenarios.test.ts passes (matrix catalog integrity)",
      "Portal Vitest counts use real it() totals from vitest-last-run.json — not FMSH inventory rows",
    ],
    expected: "Wizard matrix catalog is complete; Vitest suite reports real assertion counts",
  },
  {
    id: "VT-WORK-001",
    area: "Vitest",
    title: "Workshops data helpers return valid speaker + filter counts",
    priority: "P2",
    roles: ["qa"],
    assignees: ["vitest"],
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
    assignees: ["vitest"],
    suite: "vitest",
    steps: [
      "Run: npm run test:unit",
      "Verify find-mine-and-free-guides.test.ts passes",
    ],
    expected: "Kids/Teens/Adult/Senior Side Hustle Wizard titles; free adult + kids/teens guides present",
  },
  {
    id: "VT-LH-001",
    area: "Lighthouse",
    title: "[Lighthouse] public/robots.txt is valid plain-text robots syntax",
    priority: "P0",
    roles: ["qa", "admin"],
    assignees: ["vitest"],
    suite: "vitest",
    steps: [
      "Run: npm run test:unit -- src/lib/__tests__/robots-txt.test.ts",
      "Confirm User-agent / Allow / Disallow / Sitemap lines (not HTML)",
    ],
    expected: "robots.txt unit tests pass; file is not SPA HTML",
  },
];

const AUTOMATED_PLAYWRIGHT_CASES_RAW: GyshTestCase[] = [
  {
    id: "PW-SMOKE-001",
    area: "Playwright",
    title: "Homepage loads with GYSH brand title",
    priority: "P0",
    roles: ["qa", "all"],
    assignees: ["playwright"],
    suite: "playwright",
    path: "dashboard",
    steps: ["Run: npm run test:e2e", "Open / and assert dashboard heading"],
    expected: "Discover Side Hustles visible; no console errors",
  },
  {
    id: "PW-SMOKE-007",
    area: "Playwright",
    title: "Home nav returns to Discover Side Hustles",
    priority: "P0",
    roles: ["qa", "all"],
    assignees: ["playwright"],
    suite: "playwright",
    path: "quiz",
    steps: ["Open Find Mine", "Click Home in header", "Assert Discover Side Hustles title"],
    expected: "Home nav restores the homepage view",
  },
  {
    id: "PW-SMOKE-002",
    area: "Playwright",
    title: "Workshops nav opens workshops hub",
    priority: "P0",
    roles: ["qa", "all"],
    assignees: ["playwright"],
    suite: "playwright",
    path: "workshops",
    steps: ["Click Workshops in header", "Assert workshops content visible"],
    expected: "GYSH Workshops & Guest Speakers section renders",
  },
  {
    id: "PW-SMOKE-003",
    area: "Playwright",
    title: "Kids/Teens Corner nav opens kids content",
    priority: "P0",
    roles: ["qa", "kid"],
    assignees: ["playwright"],
    suite: "playwright",
    path: "kids",
    steps: ["Click Kids/Teens Corner", "Assert Kids / Teens age modes + tabs visible"],
    expected: "Kids/Teens Corner loads without error",
  },
  {
    id: "PW-FIND-001",
    area: "Playwright",
    title: "Find Mine age selector routes Kids / Teens / Adult / Senior",
    priority: "P0",
    roles: ["qa", "all"],
    assignees: ["playwright"],
    suite: "playwright",
    path: "quiz",
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
    assignees: ["playwright"],
    suite: "playwright",
    path: "guides",
    steps: [
      "Click Guides in header",
      "Assert filter chips",
      "Click Free → free guides only",
      "Click Kids → Kids Guides section",
      "Click All → Adult/Senior + Kids + Teens sections",
    ],
    expected: "Filters change visible guide sections; nav label is Guides with Some Free banner",
  },
  {
    id: "PW-MEMBER-001",
    area: "Playwright",
    title: "Membership nav opens tiers and audience tabs",
    priority: "P0",
    roles: ["qa", "all"],
    assignees: ["playwright"],
    suite: "playwright",
    path: "join",
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
    assignees: ["playwright"],
    suite: "playwright",
    path: "login",
    steps: ["Open Login", "Assert no Admin123 or partner emails in page text"],
    expected: "Credentials not rendered in DOM (educational security check)",
  },
  {
    id: "PW-SMOKE-005",
    area: "Playwright",
    title: "Footer links navigate About, Join, and Contact",
    priority: "P1",
    roles: ["qa"],
    assignees: ["playwright"],
    suite: "playwright",
    path: "dashboard",
    steps: ["Scroll to footer", "Click About, Join, Contact Us"],
    expected: "Each footer link opens the correct static page",
  },
  {
    id: "PW-SMOKE-006",
    area: "Playwright",
    title: "Header nav opens About, Join, and Contact",
    priority: "P0",
    roles: ["qa", "admin"],
    assignees: ["playwright"],
    suite: "playwright",
    path: "dashboard",
    steps: ["Click About, Join, Contact Us in top header"],
    expected: "Each header link opens the correct static page",
  },
  {
    id: "PW-JOIN-001",
    area: "Playwright",
    title: "Join GYSH page shows Create account CTA and Kids/Teens teams",
    priority: "P0",
    roles: ["qa", "all"],
    assignees: ["playwright"],
    suite: "playwright",
    path: "join",
    steps: ["Click Join in header", "Assert join page + Create account / Sign in + Kids & Teens sections"],
    expected: "Join signup hub renders with member and family team paths",
  },
  {
    id: "PW-JOIN-002",
    area: "Playwright",
    title: "Contact signup form exposes required Name/Email/Message fields",
    priority: "P1",
    roles: ["qa"],
    assignees: ["playwright"],
    suite: "playwright",
    path: "contact",
    steps: ["Open Contact Us", "Assert contact form fields and Send message button"],
    expected: "Contact form is present with required inputs",
  },
  {
    id: "PW-JOIN-003",
    area: "Playwright",
    title: "Seniors Join Senior Team tab shows interest signup CTA",
    priority: "P1",
    roles: ["qa", "adult"],
    assignees: ["playwright"],
    suite: "playwright",
    path: "seniors",
    steps: ["Open Seniors", "Click Join Senior Team tab", "Assert I'm interested / Create free GYSH account"],
    expected: "Senior join panel renders signup actions",
  },
  {
    id: "PW-AUTH-001",
    area: "Playwright",
    title: "Login form requires email and password before submit",
    priority: "P1",
    roles: ["qa"],
    assignees: ["playwright"],
    suite: "playwright",
    path: "login",
    steps: ["Open Login", "Assert email and password inputs are required"],
    expected: "Required attributes present on login fields",
  },
  /* Foresight PDF: Issues found = 16 (improvement-list items). One catalog case each. */
  {
    id: "PW-FS-001",
    area: "Foresight",
    title: "[Foresight] Outcome-led homepage H1 (keeps brand)",
    priority: "P0",
    roles: ["qa", "all"],
    assignees: ["playwright"],
    suite: "playwright",
    path: "dashboard",
    steps: [
      "Run: npx playwright test tests/foresight-homepage.spec.ts -g PW-FS-001",
      "Assert page-title includes Get Your Side Hustle + family / solo + Find and launch",
    ],
    expected: "H1 keeps brand and centers family + solo starters (Positioning #1)",
  },
  {
    id: "PW-FS-002",
    area: "Foresight",
    title: "[Foresight] H1 names distinctive tools (wizards / calculators)",
    priority: "P0",
    roles: ["qa", "all"],
    assignees: ["playwright"],
    suite: "playwright",
    path: "dashboard",
    steps: [
      "Run Foresight suite -g PW-FS-002",
      "Assert page-title or purpose mentions side hustle / Match Wizards / calculators",
    ],
    expected: "Distinctive product elements appear in the lead (Positioning #2)",
  },
  {
    id: "PW-FS-003",
    area: "Foresight",
    title: "[Foresight] Benefit / purpose line ties tools to an outcome",
    priority: "P0",
    roles: ["qa", "all"],
    assignees: ["playwright"],
    suite: "playwright",
    path: "dashboard",
    steps: [
      "Run Foresight suite -g PW-FS-003",
      "Assert home-site-purpose mentions validate / profit / calculators and solo-or-family",
    ],
    expected: "Benefit line connects tools to a clear outcome and includes solo starters (Positioning #3)",
  },
  {
    id: "PW-FS-004",
    area: "Foresight",
    title: "[Foresight] Pricing / access explainer near homepage CTA",
    priority: "P0",
    roles: ["qa", "all"],
    assignees: ["playwright"],
    suite: "playwright",
    path: "dashboard",
    steps: [
      "Run Foresight suite -g PW-FS-004",
      "Assert home-join-expectation mentions Free tools / membership / Start free",
    ],
    expected: "CTA area explains free vs optional membership (Positioning #4)",
  },
  {
    id: "PW-FS-005",
    area: "Foresight",
    title: "[Foresight] Short expectation line next to primary CTA",
    priority: "P0",
    roles: ["qa", "all"],
    assignees: ["playwright"],
    suite: "playwright",
    path: "dashboard",
    steps: [
      "Run Foresight suite -g PW-FS-005",
      "Assert home-join-cta visible + expectation under 2 minutes",
    ],
    expected: "Primary CTA has a time/access expectation (Positioning #5)",
  },
  {
    id: "PW-FS-006",
    area: "Foresight",
    title: "[Foresight] Reason-to-choose line vs generic idea lists",
    priority: "P0",
    roles: ["qa", "all"],
    assignees: ["playwright"],
    suite: "playwright",
    path: "dashboard",
    steps: [
      "Run Foresight suite -g PW-FS-006",
      "Assert home-differentiator: Unlike generic idea lists",
    ],
    expected: "Homepage states why choose GYSH (Positioning #6)",
  },
  {
    id: "PW-FS-007",
    area: "Foresight",
    title: "[Foresight] Homepage FAQ covers profitability / access",
    priority: "P1",
    roles: ["qa", "all"],
    assignees: ["playwright"],
    suite: "playwright",
    path: "dashboard",
    steps: [
      "Run Foresight suite -g PW-FS-007",
      "Open FAQ; assert profit/Margin Match + free-access answers",
    ],
    expected: "FAQ answers biggest objections (Positioning #7)",
  },
  {
    id: "PW-FS-008",
    area: "Foresight",
    title: "[Foresight] Positioning block: audience + promise + method",
    priority: "P0",
    roles: ["qa", "all"],
    assignees: ["playwright"],
    suite: "playwright",
    path: "dashboard",
    steps: [
      "Run Foresight suite -g PW-FS-008",
      "Assert home-positioning block with Margin Match method name",
    ],
    expected: "Focused positioning block present (Positioning #8)",
  },
  {
    id: "PW-FS-009",
    area: "Foresight",
    title: "[Foresight] Named repeatable method (Margin Match)",
    priority: "P0",
    roles: ["qa", "all"],
    assignees: ["playwright"],
    suite: "playwright",
    path: "dashboard",
    steps: [
      "Run Foresight suite -g PW-FS-009",
      "Assert home-method-name contains Margin Match",
    ],
    expected: "Core capability is a named method (Differentiation #1)",
  },
  {
    id: "PW-FS-010",
    area: "Foresight",
    title: "[Foresight] Contrast sentence vs status-quo guesswork",
    priority: "P0",
    roles: ["qa", "all"],
    assignees: ["playwright"],
    suite: "playwright",
    path: "dashboard",
    steps: [
      "Run Foresight suite -g PW-FS-010",
      "Assert differentiator contrasts vs idea lists / guesswork",
    ],
    expected: "Status-quo contrast line present (Differentiation #2)",
  },
  {
    id: "PW-FS-012",
    area: "Foresight",
    title: "[Foresight] Branded name for calculator / evaluation process",
    priority: "P0",
    roles: ["qa", "all"],
    assignees: ["playwright"],
    suite: "playwright",
    path: "dashboard",
    steps: [
      "Run Foresight suite -g PW-FS-012",
      "Assert Margin Match is used as the branded evaluation name",
    ],
    expected: "Evaluation process has a memorable branded name (Differentiation #4)",
  },
  {
    id: "PW-FS-014",
    area: "Foresight",
    title: "[Foresight] ICP section: three audiences + problems",
    priority: "P0",
    roles: ["qa", "all"],
    assignees: ["playwright"],
    suite: "playwright",
    path: "dashboard",
    steps: [
      "Run Foresight suite -g PW-FS-014",
      "Assert home-icp-kids / teens / adults",
    ],
    expected: "ICP section complete (Target Audience #1)",
  },
  {
    id: "PW-FS-015",
    area: "Foresight",
    title: "[Foresight] Headline aligned with searcher intent (validate / launch)",
    priority: "P1",
    roles: ["qa", "all"],
    assignees: ["playwright"],
    suite: "playwright",
    path: "dashboard",
    steps: [
      "Run Foresight suite -g PW-FS-015",
      "Assert H1 states next step: find / launch / validate (not brand-only)",
    ],
    expected: "Headline matches searcher intent (Conversion #1)",
  },
  {
    id: "PW-FS-016",
    area: "Foresight",
    title: "[Foresight] Organization + WebPage + FAQPage schema",
    priority: "P0",
    roles: ["qa", "admin"],
    assignees: ["playwright"],
    suite: "playwright",
    path: "dashboard",
    steps: [
      "Run Foresight suite -g PW-FS-016",
      "Parse ld+json @graph for Organization, WebPage, FAQPage",
    ],
    expected: "Basic schema on homepage (Best SEO and AEO #1)",
  },
];

export const AUTOMATED_VITEST_CASES: GyshTestCase[] = AUTOMATED_VITEST_CASES_RAW.map(
  withPageLinkInFirstStep,
);
export const AUTOMATED_PLAYWRIGHT_CASES: GyshTestCase[] = AUTOMATED_PLAYWRIGHT_CASES_RAW.map(
  withPageLinkInFirstStep,
);

export const AUTOMATED_TEST_IDS = new Set([
  ...AUTOMATED_VITEST_CASES.map((t) => t.id),
  ...AUTOMATED_PLAYWRIGHT_CASES.map((t) => t.id),
]);

/** Wizard path inventory rows — not real Vitest `it()` tests. */
export function isWizardMatrixCaseId(id: string): boolean {
  return (
    /^(KIDS|JR|ADULT|SENIOR)-FMSH-\d+$/i.test(id) || /^WIZARD-EDGE-\d+$/i.test(id)
  );
}

export function isAutomatedTestId(id: string): boolean {
  if (AUTOMATED_TEST_IDS.has(id)) return true;
  // Wizard matrix paths are Vitest-covered — treat as automated in the portal.
  // VT-FAIL-* / PW-FAIL-* are generated from suite failures.
  return isWizardMatrixCaseId(id) || /^(VT|PW)-FAIL-/i.test(id);
}

/**
 * Locked suite runner for catalog automated cases.
 * VT-FAIL-* / PW-FAIL-* are human QA follow-ups and return null.
 */
export function suiteOwnerForAutomatedCase(
  caseId: string,
): "vitest" | "playwright" | null {
  const id = String(caseId || "").trim();
  if (!id) return null;
  if (/^(VT|PW)-FAIL-/i.test(id)) return null;
  if (/^PW-/i.test(id)) return "playwright";
  if (/^VT-/i.test(id) || isWizardMatrixCaseId(id)) return "vitest";
  return null;
}

/** Force Vitest/Playwright catalog cases onto their suite runners (never human QA). */
export function sanitizeAutomatedTestAssignees(
  assignees: Record<string, string>,
  caseIds?: Iterable<string>,
): { assignees: Record<string, string>; changedIds: string[] } {
  const next = { ...assignees };
  const changedIds: string[] = [];
  const ids = new Set<string>([...(caseIds ?? []), ...Object.keys(next)]);
  for (const id of ids) {
    const owner = suiteOwnerForAutomatedCase(id);
    if (!owner) continue;
    if (String(next[id] ?? "").trim().toLowerCase() === owner) continue;
    next[id] = owner;
    changedIds.push(id);
  }
  return { assignees: next, changedIds };
}

export function casesForTester(
  cases: GyshTestCase[],
  testerId: TestOwnerId | null,
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
