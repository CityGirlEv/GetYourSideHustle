/**
 * Guide content review cases for Testing Portal — Sprint 6.
 * One manual GUIDE-REV case per unique Side Hustle Library guide
 * (same inventory as uniqueGuideLibraryEntries).
 */

import type { TestCase } from "./gysh-test-plan";
import {
  audiencesForLibraryGuideId,
  uniqueGuideLibraryEntries,
} from "./guide-library-pool";
import { dayOffset, getSprintWindow } from "./gysh-sprints";
import type { HustleAgeGroup } from "./side-hustle-catalog";
import { primaryGuideReviewKind } from "./guide-review-link";
import { formatGuideNumber, guideNumberLabel } from "./guide-numbers";
import {
  GUIDE_PREP_REVIEW_TAB_LABELS,
  GUIDE_PREP_REVIEW_TABS_PHRASE,
} from "./guide-prep-visibility";

/** Fixed sprint for the all-guides human + automated review pass. */
export const GUIDE_REVIEW_SPRINT = 6;

export type GuideReviewKind = "launch" | "kids" | "junior" | "senior" | "vitest";

export type GuideReviewCatalogEntry = {
  kind: Exclude<GuideReviewKind, "vitest">;
  guideId: string;
  title: string;
  minTier: string;
  path: string;
  audiences: HustleAgeGroup[];
};

export function guideReviewCaseId(kind: GuideReviewKind, guideId: string): string {
  if (kind === "vitest") return "VT-GUIDES-REVIEW";
  return `GUIDE-REV-${kind}-${guideId}`;
}

export function isGuideReviewCaseId(caseId: string): boolean {
  const id = String(caseId || "").toUpperCase();
  return id.startsWith("GUIDE-REV-") || id === "VT-GUIDES-REVIEW";
}

/** Extract hustle/guide id from GUIDE-REV-{kind}-{guideId}. */
export function guideIdFromGuideReviewCaseId(caseId: string): string | null {
  const m = String(caseId || "").match(/^GUIDE-REV-(launch|kids|junior|senior)-(.+)$/i);
  if (!m) return null;
  const guideId = String(m[2] || "").trim();
  return guideId || null;
}

/**
 * Primary GUIDE-REV kind for a library guide id — one case per guide.
 * Prefer a single-audience lane; otherwise adult (launch) when present.
 */
export { primaryGuideReviewKind };

/** Canonical GUIDE-REV case id for a library guide (one test per guide). */
export function guideReviewCaseIdForGuide(guideId: string): string | null {
  const id = String(guideId || "").trim();
  if (!id) return null;
  return guideReviewCaseId(primaryGuideReviewKind(id), id);
}

/** Public deep link — Side Hustle Library focused on that guide. */
export function guideReviewMemberHref(
  entry: Pick<GuideReviewCatalogEntry, "guideId"> | { guideId: string },
): string {
  return `/guides?hustle=${encodeURIComponent(entry.guideId)}`;
}

export function buildGuideReviewCatalog(): GuideReviewCatalogEntry[] {
  return uniqueGuideLibraryEntries()
    .slice()
    .sort((a, b) => {
      const na = formatGuideNumber(a.id);
      const nb = formatGuideNumber(b.id);
      return na.localeCompare(nb) || a.id.localeCompare(b.id);
    })
    .map((e) => {
      const kind = primaryGuideReviewKind(e.id);
      const audiences = audiencesForLibraryGuideId(e.id);
      return {
        kind,
        guideId: e.id,
        title: e.name,
        minTier: e.minTier,
        path: guideReviewMemberHref({ guideId: e.id }),
        audiences,
      };
    });
}

export const GUIDE_REVIEW_CATALOG = buildGuideReviewCatalog();

/** Scatter dues across Sprint 6 window (stable by catalog index). */
export function guideReviewDueDate(caseId: string, ref: Date = new Date()): string {
  const ids = [
    guideReviewCaseId("vitest", "all"),
    ...GUIDE_REVIEW_CATALOG.map((e) => guideReviewCaseId(e.kind, e.guideId)),
  ];
  const idx = ids.indexOf(caseId);
  const sw = getSprintWindow(GUIDE_REVIEW_SPRINT, ref);
  const day = idx < 0 ? 2 : idx % 7;
  const due = dayOffset(sw, day);
  due.setHours(0, 0, 0, 0);
  const mm = String(due.getMonth() + 1).padStart(2, "0");
  const dd = String(due.getDate()).padStart(2, "0");
  const yy = String(due.getFullYear()).slice(-2);
  return `${mm}/${dd}/${yy}`;
}

function audienceLabel(entry: GuideReviewCatalogEntry): string {
  if (entry.kind === "kids") return "Kids guide";
  if (entry.kind === "junior") return "Teens guide";
  if (entry.kind === "senior") return "Senior guide";
  if (entry.audiences.includes("adult") && entry.audiences.length > 1) {
    return "Library guide";
  }
  return "Adult Launch Guide";
}

function entryToCase(entry: GuideReviewCatalogEntry): TestCase {
  const id = guideReviewCaseId(entry.kind, entry.guideId);
  const audience = audienceLabel(entry);
  const href = entry.path || guideReviewMemberHref(entry);
  const numLabel = guideNumberLabel(entry.guideId);
  const titled = numLabel ? `${numLabel} ${entry.title}` : entry.title;
  const openLink = `[${titled}](${href})`;
  const testDeepLink = `/admin?tab=testing&test=${encodeURIComponent(id)}`;
  return {
    id,
    area: "Guides",
    title: `Review ${audience}: ${titled}`,
    priority: entry.minTier === "free" ? "P1" : "P2",
    roles: ["qa", "admin"],
    assignees: ["lyriq"],
    suite: "manual",
    path: href,
    steps: guideReviewManualSteps({
      openLink,
      audience,
      guideId: entry.guideId,
      numLabel,
      minTier: entry.minTier,
      testDeepLink,
    }),
    expected: GUIDE_REVIEW_MANUAL_EXPECTED,
  };
}

/** Shared GUIDE-REV manual steps — every library guide uses this order (no redundancy). */
export function guideReviewManualSteps(opts: {
  openLink: string;
  audience: string;
  guideId: string;
  numLabel: string | null;
  minTier: string;
  testDeepLink: string;
}): string[] {
  const { openLink, audience, guideId, numLabel, minTier, testDeepLink } = opts;
  return [
    `Open ${openLink} in the Side Hustle Library (Guides Library Admin / focused guide) — ${audience} (id: ${guideId}${numLabel ? `, ${numLabel}` : ""}, min tier: ${minTier}). Cross-link: [Testing Portal](${testDeepLink})`,
    `Review all ${GUIDE_PREP_REVIEW_TAB_LABELS.length} prep tabs in order: ${GUIDE_PREP_REVIEW_TABS_PHRASE} — open each dedicated tab (do not rely on Show All alone); Suggested Pricing and Supply List must appear on their own tabs; content complete, accurate, and usable (calculator loads and runs)`,
    "Confirm About and Tools are separate, named sections; every named outside tool/source has an exact https link (e.g. AirDNA → https://www.airdna.co/)",
    "Confirm steps are precise (no vague “gather tools” — list ChatGPT, Gemini, Antigravity, Scratch, etc. where relevant); AI guides are Pro or Elite only — never Free or Starter",
    "As QA (same powers as Admin on these tabs): add, edit, re-order, delete, and Save About / Tools / Steps / Supply List / Suggested Pricing (and Notes if needed). After Save, re-check Show All plus each dedicated tab. Save all updates before leaving the guide",
    "In Guides Library Admin for this guide: check Active (if needed) and Reviewed — Fixed/Re-Review is only for the Pending fix queue, not for pass. Confirm Active and Reviewed stay checked",
    "Mark this test Pass when the guide is review-ready (Fail with a note if content still needs work). Pass auto-sets Active + Reviewed (Reviewed by QA / No Changes; guide stays live). Fail sets the guide Inactive. Save is already done — move to the next GUIDE-REV test",
  ];
}

export const GUIDE_REVIEW_MANUAL_EXPECTED =
  `Pass → Active + Reviewed (Reviewed by QA / No Changes; public stays live). Fail → this test Failed and guide Inactive. All ${GUIDE_PREP_REVIEW_TAB_LABELS.length} prep tabs (${GUIDE_PREP_REVIEW_TABS_PHRASE}) accurate on their dedicated tabs — not only under Show All; Vitest guides-review.test.ts is the automated second set of eyes`;

/** Automated Vitest suite case — run `bun run test` / vitest guides-review. */
export const VT_GUIDES_REVIEW_CASE: TestCase = {
  id: "VT-GUIDES-REVIEW",
  area: "Guides",
  title: "Vitest: all guides structure, tiers, kits, and links (Sprint 6)",
  priority: "P0",
  roles: ["qa", "admin"],
  assignees: ["evelyn"],
  suite: "vitest",
  path: "guides",
  steps: [
    "Run Vitest file src/lib/__tests__/guides-review.test.ts (or bun run test -- guides-review)",
    "Confirm every unique Side Hustle Library guide has a GUIDE-REV case",
    `Confirm every guide kit exposes all ${GUIDE_PREP_REVIEW_TAB_LABELS.length} prep tabs: ${GUIDE_PREP_REVIEW_TABS_PHRASE}`,
    "Confirm every guide kit has Prerequisites + Tools + Suggested Pricing + Supply List; tool URLs are https",
    "Confirm AI hustles/guides are never Free or Starter",
    "Confirm Free Membership guides list first in LAUNCH_GUIDES",
  ],
  expected: `All guides-review Vitest assertions pass — second set of eyes for human Sprint 6 review of all ${GUIDE_PREP_REVIEW_TAB_LABELS.length} prep tabs`,
};

/** Testing Portal catalog: Vitest umbrella + one manual review per unique library guide. */
export const GUIDE_REVIEW_CASES: TestCase[] = [
  VT_GUIDES_REVIEW_CASE,
  ...GUIDE_REVIEW_CATALOG.map(entryToCase),
];
