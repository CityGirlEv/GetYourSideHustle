/**
 * External proofread QA — every public page, each guide, and the Complete Guide.
 * Every logical proofread case is duplicated: one for Tina, one for Lyriq.
 * IDs are numbered like the rest of the catalog: PROOF-001-TINA / PROOF-001-LYRIQ.
 * Suggested / default sprint is Sprint 1 (public pages & launch content).
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

export const PROOFREAD_PAIR_SUFFIXES = ["TINA", "LYRIQ"] as const;
export type ProofreadPairSuffix = (typeof PROOFREAD_PAIR_SUFFIXES)[number];

/** Strip -TINA / -LYRIQ to get the logical case id (e.g. PROOF-001). */
export function proofreadLogicalId(caseId: string): string {
  return caseId.replace(/-(TINA|LYRIQ)$/i, "");
}

export function isProofreadCaseId(caseId: string): boolean {
  return /^PROOF-\d+/i.test(caseId) || caseId.toUpperCase().startsWith("PROOF-");
}

/** True when the id includes a numeric segment (AUTH-001, PROOF-014-TINA, VT-AUTH-001). */
export function testIdHasNumber(caseId: string): boolean {
  return /(?:^|-)(\d{3,})(?:-|$)/.test(caseId);
}

let nextProofNumber = 1;

function nextProofId(): string {
  const id = `PROOF-${String(nextProofNumber).padStart(3, "0")}`;
  nextProofNumber += 1;
  return id;
}

/** Expand one logical proofread into Tina + Lyriq sibling cases (identical content). */
export function pairProofreadCase(
  base: Omit<TestCase, "assignees" | "id"> & { id: string },
): TestCase[] {
  return [
    {
      ...base,
      id: `${base.id}-TINA`,
      assignees: ["tina"],
    },
    {
      ...base,
      id: `${base.id}-LYRIQ`,
      assignees: ["lyriq"],
    },
  ];
}

function pageCase(
  title: string,
  path: string,
  roles: TestCase["roles"],
): TestCase[] {
  return pairProofreadCase({
    id: nextProofId(),
    area: "Proofread",
    title,
    priority: "P2",
    roles,
    suite: "manual",
    steps: PROOF_STEPS_PAGE,
    expected: PROOF_EXPECTED_PAGE,
    path,
  });
}

function guideCase(
  title: string,
  path: string,
  roles: TestCase["roles"],
  openHint: string,
): TestCase[] {
  return pairProofreadCase({
    id: nextProofId(),
    area: "Proofread",
    title,
    priority: "P2",
    roles,
    suite: "manual",
    steps: [openHint, ...PROOF_STEPS_GUIDE.slice(1)],
    expected: PROOF_EXPECTED_GUIDE,
    path,
  });
}

/** Public pages members/guests see (External). */
const PAGE_PROOFREAD_CASES: TestCase[] = [
  ...pageCase("Proofread: Home", "dashboard", ["all", "qa"]),
  ...pageCase("Proofread: GYSH Match Wizard age selector", "quiz", ["all", "qa"]),
  ...pageCase("Proofread: Guides library hub", "guides", ["all", "qa"]),
  ...pageCase("Proofread: Side Hustle Checklist", "checklist", ["adult", "qa"]),
  ...pageCase("Proofread: Workshops", "workshops", ["all", "qa"]),
  ...pageCase("Proofread: Community", "community", ["all", "qa"]),
  ...pageCase("Proofread: Join / Membership", "join", ["all", "qa"]),
  ...pageCase("Proofread: About", "about", ["all", "qa"]),
  ...pageCase("Proofread: Contact", "contact", ["all", "qa"]),
  ...pageCase("Proofread: Kids / Teens Corner (both age modes)", "kids", ["kid", "junior", "qa"]),
  ...pageCase("Proofread: Seniors Corner", "seniors", ["senior", "qa"]),
  ...pageCase("Proofread: Login", "login", ["all", "qa"]),
  ...pageCase("Proofread: Member Portal (signed-in member view)", "user_portal", ["adult", "qa"]),
  ...pageCase("Proofread: Membership signup path", "membership_signup", ["adult", "qa"]),
  ...pageCase("Proofread: Site footer + disclaimer links", "dashboard", ["all", "qa"]),
];

const LAUNCH_GUIDE_PROOFREAD: TestCase[] = LAUNCH_GUIDES.flatMap((g) =>
  guideCase(
    `Proofread Launch Guide: ${g.name}`,
    "guides",
    ["adult", "senior", "qa"],
    `Open Launch Guides → open “${g.name}”${g.free ? " (free)" : " (member if gated)"}`,
  ),
);

const KIDS_GUIDE_PROOFREAD: TestCase[] = KIDS_GUIDES.flatMap((g) =>
  guideCase(
    `Proofread ${g.audience === "kids" ? "Kids" : "Teens"} Guide: ${g.title}`,
    "kids",
    g.audience === "kids" ? ["kid", "qa"] : ["junior", "qa"],
    `Open Kids/Teens Corner → ${g.audience === "kids" ? "Ages 4–12" : "Ages 13–17"} → Guides → “${g.title}”${g.free ? " (free)" : " (member preview + unlock)"}`,
  ),
);

const SENIOR_GUIDE_PROOFREAD: TestCase[] = SENIOR_GUIDE_TEASERS.flatMap((g) =>
  guideCase(
    `Proofread Senior Guide card: ${g.title}`,
    "seniors",
    ["senior", "qa"],
    `Open Seniors → Guides → “${g.title}” (${g.status.replace("_", " ")}) — proofread title, blurb, and any openable content`,
  ),
);

const MARKETING_GUIDE_PROOFREAD: TestCase[] = MARKETING_GUIDES.flatMap((g) =>
  guideCase(
    g.id === "master"
      ? "Proofread Complete Guide (master marketing manual)"
      : `Proofread Marketing Manual: ${g.menuLabel}`,
    "guides",
    ["all", "qa"],
    `Open Guides → Marketing manuals → “${g.menuLabel}” — read every section online (and PDF if downloaded)`,
  ),
);

/** All External proofread cases — Tina + Lyriq pairs; land in Sprint 1 by default. */
export const PROOFREAD_CASES: TestCase[] = [
  ...PAGE_PROOFREAD_CASES,
  ...LAUNCH_GUIDE_PROOFREAD,
  ...KIDS_GUIDE_PROOFREAD,
  ...SENIOR_GUIDE_PROOFREAD,
  ...MARKETING_GUIDE_PROOFREAD,
];
