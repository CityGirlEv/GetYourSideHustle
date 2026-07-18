import { listPublishedArticleSlugs } from "@/lib/articles";
import type { TestCase } from "@/lib/test-plan";

const LYRIQ = "Lyriq";

/** Representative published article for deep-link checks. */
function sampleArticlePath(): string {
  const slug = listPublishedArticleSlugs()[0];
  return slug ? `/learning-center/${slug}` : "/learning-center";
}

/**
 * One QA link test per public route — assigned to Lyriq.
 * Shown automatically in /testing when this module is merged into TEST_CASES.
 */
export const PUBLIC_PAGE_LINK_TESTS: TestCase[] = [
  {
    id: "LINK-001",
    area: "Navigation · Links",
    priority: "P1",
    assignee: LYRIQ,
    title: "Home (/) loads",
    path: "/",
    steps: ["Open / in a fresh tab (signed out)."],
    expected: "Page loads (HTTP 200), hero and main CTA visible — no 404 or blank screen.",
  },
  {
    id: "LINK-002",
    area: "Navigation · Links",
    priority: "P1",
    assignee: LYRIQ,
    title: "About (/about) loads",
    path: "/about",
    steps: ["Open /about."],
    expected: "About page title and TPMO disclaimer card render.",
  },
  {
    id: "LINK-003",
    area: "Navigation · Links",
    priority: "P0",
    assignee: LYRIQ,
    title: "About page — Learning Center button navigates",
    path: "/about",
    steps: [
      "Open /about",
      'Click the outline "Learning Center" button beside the plan comparison CTA',
    ],
    expected:
      "URL changes to /learning-center and the Learning Center page heading is visible.",
    notes: "Regression for broken Button/Link composition on About.",
  },
  {
    id: "LINK-004",
    area: "Navigation · Links",
    priority: "P1",
    assignee: LYRIQ,
    title: "Learning Center index loads",
    path: "/learning-center",
    steps: ["Open /learning-center."],
    expected: "Learning Center heading and at least one article card or empty-state message.",
  },
  {
    id: "LINK-005",
    area: "Navigation · Links",
    priority: "P1",
    assignee: LYRIQ,
    title: "Learning Center article loads",
    path: sampleArticlePath(),
    steps: [`Open ${sampleArticlePath()}.`],
    expected: "Article title and body render; no 404.",
  },
  {
    id: "LINK-006",
    area: "Navigation · Links",
    priority: "P1",
    assignee: LYRIQ,
    title: "Benchmark tool (/scenario/new) loads",
    path: "/scenario/new",
    steps: ["Open /scenario/new."],
    expected: "Build-your-scenario wizard step 1 is visible for anonymous users.",
  },
  {
    id: "LINK-007",
    area: "Navigation · Links",
    priority: "P2",
    assignee: LYRIQ,
    title: "Auth sign-in (/auth) loads",
    path: "/auth",
    steps: ["Open /auth."],
    expected: "Sign-in form with email and password fields.",
  },
  {
    id: "LINK-008",
    area: "Navigation · Links",
    priority: "P2",
    assignee: LYRIQ,
    title: "Beta registration (/register) loads",
    path: "/register",
    steps: ["Open /register."],
    expected: "NDA + registration form fields render.",
  },
  {
    id: "LINK-009",
    area: "Navigation · Links",
    priority: "P2",
    assignee: LYRIQ,
    title: "Reset password (/reset-password) loads",
    path: "/reset-password",
    steps: ["Open /reset-password."],
    expected: "Password reset request form renders without error.",
  },
  {
    id: "LINK-010",
    area: "Navigation · Links",
    priority: "P2",
    assignee: LYRIQ,
    title: "NDA page (/nda) loads",
    path: "/nda",
    steps: ["Open /nda."],
    expected: "NDA document text is readable.",
  },
  {
    id: "LINK-011",
    area: "Navigation · Links",
    priority: "P1",
    assignee: LYRIQ,
    title: "Legal & privacy (/legal) loads",
    path: "/legal",
    steps: ["Open /legal."],
    expected: "Privacy Policy and Terms sections are reachable on the page.",
  },
  {
    id: "LINK-012",
    area: "Navigation · Links",
    priority: "P2",
    assignee: LYRIQ,
    title: "Data sources (/sources) loads",
    path: "/sources",
    steps: ["Open /sources."],
    expected: "CMS and drug pricing source citations list renders.",
  },
  {
    id: "LINK-013",
    area: "Navigation · Links",
    priority: "P2",
    assignee: LYRIQ,
    title: "Features pricing (/features) loads",
    path: "/features",
    steps: ["Open /features, select the Agents tab, and review agent pricing sections."],
    expected:
      "Consumers (Free) and Agents tabs render; under Agents, a single Agent Subscription Levels & Al La Carte section shows Bronze–Platinum tiers with lead allocation and per-lead add-ons, plus registration requirements before purchase (checkout may require admin sign-in).",
  },
  {
    id: "LINK-014",
    area: "Navigation · Links",
    priority: "P2",
    assignee: LYRIQ,
    title: "Workbook landing (/workbook) loads",
    path: "/workbook",
    steps: ["Open /workbook."],
    expected: "Part B Optimizer (PBO) Turning 65 Workbook headline and download/email capture render.",
  },
  {
    id: "LINK-015",
    area: "Navigation · Links",
    priority: "P2",
    assignee: LYRIQ,
    title: "Email unsubscribe (/unsubscribe) loads",
    path: "/unsubscribe",
    steps: ["Open /unsubscribe."],
    expected: "Unsubscribe heading and instructions render.",
  },
  {
    id: "LINK-016",
    area: "Navigation · Links",
    priority: "P1",
    assignee: LYRIQ,
    title: "Footer — Learning Center link from About",
    path: "/about",
    steps: [
      "Open /about",
      "Scroll to footer",
      'Click "Learning Center" in the footer nav',
    ],
    expected: "Navigates to /learning-center successfully.",
  },
  {
    id: "LINK-017",
    area: "Navigation · Links",
    priority: "P1",
    assignee: LYRIQ,
    title: "Parts of Medicare article loads",
    path: "/learning-center/parts-of-medicare",
    steps: ["Open /learning-center/parts-of-medicare."],
    expected:
      "Article title and Part A/B/C/D sections render; official Medicare.gov source link visible.",
  },
  {
    id: "LINK-018",
    area: "Navigation · Links",
    priority: "P1",
    assignee: LYRIQ,
    title: "When to sign up for Medicare article loads",
    path: "/learning-center/when-to-sign-up-for-medicare",
    steps: ["Open /learning-center/when-to-sign-up-for-medicare."],
    expected:
      "Article title and IEP/GEP/SEP sections render; official Medicare.gov sign-up link visible.",
  },
];
