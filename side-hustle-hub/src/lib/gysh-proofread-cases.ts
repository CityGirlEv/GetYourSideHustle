/**
 * External proofread QA — every public page, each guide, and the Complete Guide.
 * Unassigned + Backlog by default (empty assignees; suggestedSprintForTest → backlog).
 */

import type { TestCase } from "./gysh-test-plan";
import { KIDS_GUIDES } from "./kids-guides";
import { LAUNCH_GUIDES } from "./launch-guides";
import { MARKETING_GUIDES } from "./marketing-guides";
import { SENIOR_GUIDE_TEASERS } from "./seniors-content";

const PROOF_STEPS_PAGE = [
  "Open the page as a guest (or Profile Switcher → matching Member role)",
  "Read every heading, lead, button, badge, and footer blurb on the page",
  "Check spelling, grammar, capitalization, and brand names (GYSH / Get Your Side Hustle / Kevina Starr)",
  "Flag awkward, duplicated, placeholder, or age-inappropriate copy",
  "Confirm CTAs and links match the surrounding message",
];

const PROOF_EXPECTED_PAGE =
  "Copy is clear, consistent, and publish-ready — no typos, placeholders, or confusing claims";

const PROOF_STEPS_GUIDE = [
  "Open the guide from Guides (or the audience Corner) — unlock if member-gated",
  "Read the title, summary/intro, and every step body in order",
  "Check spelling, grammar, and brand wording; note any broken or empty steps",
  "Confirm free vs member messaging matches what guests actually see",
  "Skim parent/coach tips or pricing notes for clarity and safety tone",
];

const PROOF_EXPECTED_GUIDE =
  "Guide reads cleanly end-to-end — steps complete, tone fits the audience, no typos or placeholders";

function pageCase(
  id: string,
  title: string,
  path: string,
  roles: TestCase["roles"],
): TestCase {
  return {
    id,
    area: "Proofread",
    title,
    priority: "P2",
    roles,
    assignees: [],
    suite: "manual",
    steps: PROOF_STEPS_PAGE,
    expected: PROOF_EXPECTED_PAGE,
    path,
  };
}

function guideCase(
  id: string,
  title: string,
  path: string,
  roles: TestCase["roles"],
  openHint: string,
): TestCase {
  return {
    id,
    area: "Proofread",
    title,
    priority: "P2",
    roles,
    assignees: [],
    suite: "manual",
    steps: [openHint, ...PROOF_STEPS_GUIDE.slice(1)],
    expected: PROOF_EXPECTED_GUIDE,
    path,
  };
}

/** Public pages members/guests see (External). */
const PAGE_PROOFREAD_CASES: TestCase[] = [
  pageCase("PROOF-PAGE-HOME", "Proofread: Home", "dashboard", ["all", "qa"]),
  pageCase("PROOF-PAGE-FIND-MINE", "Proofread: Find Mine / Match Wizard selector", "quiz", ["all", "qa"]),
  pageCase("PROOF-PAGE-GUIDES", "Proofread: Guides library hub", "guides", ["all", "qa"]),
  pageCase("PROOF-PAGE-CHECKLIST", "Proofread: Side Hustle Checklist", "checklist", ["adult", "qa"]),
  pageCase("PROOF-PAGE-WORKSHOPS", "Proofread: Workshops", "workshops", ["all", "qa"]),
  pageCase("PROOF-PAGE-COMMUNITY", "Proofread: Community", "community", ["all", "qa"]),
  pageCase("PROOF-PAGE-JOIN", "Proofread: Join / Membership", "join", ["all", "qa"]),
  pageCase("PROOF-PAGE-ABOUT", "Proofread: About", "about", ["all", "qa"]),
  pageCase("PROOF-PAGE-CONTACT", "Proofread: Contact", "contact", ["all", "qa"]),
  pageCase("PROOF-PAGE-KIDS", "Proofread: Kids / Teens Corner (both age modes)", "kids", ["kid", "junior", "qa"]),
  pageCase("PROOF-PAGE-SENIORS", "Proofread: Seniors Corner", "seniors", ["senior", "qa"]),
  pageCase("PROOF-PAGE-LOGIN", "Proofread: Login", "login", ["all", "qa"]),
  pageCase("PROOF-PAGE-PORTAL", "Proofread: Member Portal (signed-in member view)", "user_portal", ["adult", "qa"]),
  pageCase(
    "PROOF-PAGE-MEMBERSHIP-SIGNUP",
    "Proofread: Membership signup path",
    "membership_signup",
    ["adult", "qa"],
  ),
  pageCase("PROOF-PAGE-FOOTER", "Proofread: Site footer + disclaimer links", "dashboard", ["all", "qa"]),
];

const LAUNCH_GUIDE_PROOFREAD: TestCase[] = LAUNCH_GUIDES.map((g) =>
  guideCase(
    `PROOF-LG-${g.id}`,
    `Proofread Launch Guide: ${g.name}`,
    "guides",
    ["adult", "senior", "qa"],
    `Open Launch Guides → open “${g.name}”${g.free ? " (free)" : " (member if gated)"}`,
  ),
);

const KIDS_GUIDE_PROOFREAD: TestCase[] = KIDS_GUIDES.map((g) =>
  guideCase(
    `PROOF-KG-${g.id}`,
    `Proofread ${g.audience === "kids" ? "Kids" : "Teens"} Guide: ${g.title}`,
    "kids",
    g.audience === "kids" ? ["kid", "qa"] : ["junior", "qa"],
    `Open Kids/Teens Corner → ${g.audience === "kids" ? "Ages 4–12" : "Ages 13–17"} → Guides → “${g.title}”${g.free ? " (free)" : " (member preview + unlock)"}`,
  ),
);

const SENIOR_GUIDE_PROOFREAD: TestCase[] = SENIOR_GUIDE_TEASERS.map((g) =>
  guideCase(
    `PROOF-SG-${g.id}`,
    `Proofread Senior Guide card: ${g.title}`,
    "seniors",
    ["senior", "qa"],
    `Open Seniors → Guides → “${g.title}” (${g.status.replace("_", " ")}) — proofread title, blurb, and any openable content`,
  ),
);

const MARKETING_GUIDE_PROOFREAD: TestCase[] = MARKETING_GUIDES.map((g) =>
  guideCase(
    `PROOF-MG-${g.id}`,
    g.id === "master"
      ? "Proofread Complete Guide (master marketing manual)"
      : `Proofread Marketing Manual: ${g.menuLabel}`,
    "guides",
    ["all", "qa"],
    `Open Guides → Marketing manuals → “${g.menuLabel}” — read every section online (and PDF if downloaded)`,
  ),
);

/** All External proofread cases — Unassigned; sprint backlog via PROOF- prefix. */
export const PROOFREAD_CASES: TestCase[] = [
  ...PAGE_PROOFREAD_CASES,
  ...LAUNCH_GUIDE_PROOFREAD,
  ...KIDS_GUIDE_PROOFREAD,
  ...SENIOR_GUIDE_PROOFREAD,
  ...MARKETING_GUIDE_PROOFREAD,
];
