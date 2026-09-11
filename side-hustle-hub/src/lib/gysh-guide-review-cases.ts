/**
 * Guide content review cases for Testing Portal — Sprint 6.
 * One manual GUIDE-REV case per unique Side Hustle Library guide
 * (same inventory as uniqueGuideLibraryEntries).
 */

import type { TestCase } from "./gysh-test-plan";
import { guideReviewTaskId, hasLaunchGuide } from "./launch-guides";
import {
  audiencesForLibraryGuideId,
  uniqueGuideLibraryEntries,
} from "./guide-library-pool";
import { dayOffset, getSprintWindow } from "./gysh-sprints";
import type { HustleAgeGroup } from "./side-hustle-catalog";
import { primaryGuideReviewKind } from "./guide-review-link";

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
    .sort((a, b) => a.id.localeCompare(b.id))
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
  const openLink = `[${entry.title}](${href})`;
  const testDeepLink = `/admin?tab=testing&test=${encodeURIComponent(id)}`;
  return {
    id,
    area: "Guides",
    title: `Review ${audience}: ${entry.title}`,
    priority: entry.minTier === "free" ? "P1" : "P2",
    roles: ["qa", "admin"],
    assignees: ["lyriq"],
    suite: "manual",
    path: href,
    ...(hasLaunchGuide(entry.guideId)
      ? { relatedTaskIds: [guideReviewTaskId(entry.guideId)] }
      : {}),
    steps: [
      `Open ${openLink} in the Side Hustle Library (focused on this guide) — ${audience} (id: ${entry.guideId}, min tier: ${entry.minTier}). Cross-link: [Testing Portal](${testDeepLink})`,
      "Confirm Prerequisites and Tools are separate, named sections",
      "Confirm every named outside tool/source has an exact https link (e.g. AirDNA → https://www.airdna.co/)",
      "Confirm steps are precise (no vague “gather tools” — list ChatGPT, Gemini, Antigravity, Scratch, etc. where relevant)",
      "Confirm AI guides are Pro or Elite only — never Free or Starter",
      "Mark this test Pass when the guide is review-ready (Fail with a note if steps/tools/links need edits) — Pass sets Reviewed by QA / No Changes (guide stays live); Fail / Pending / Needs Further Review fails this test and sets the guide Inactive",
    ],
    expected:
      "Pass → Reviewed by QA / No Changes (public stays live). Fail or Pending / Needs Further Review → this test Failed and guide Inactive. Content accurate, linked, and tier-correct (Vitest guides-review.test.ts is the automated second set of eyes)",
  };
}

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
    "Confirm every guide kit has Prerequisites + Tools; tool URLs are https",
    "Confirm AI hustles/guides are never Free or Starter",
    "Confirm Free Membership guides list first in LAUNCH_GUIDES",
  ],
  expected: "All guides-review Vitest assertions pass — second set of eyes for human Sprint 6 review",
};

/** Testing Portal catalog: Vitest umbrella + one manual review per unique library guide. */
export const GUIDE_REVIEW_CASES: TestCase[] = [
  VT_GUIDES_REVIEW_CASE,
  ...GUIDE_REVIEW_CATALOG.map(entryToCase),
];
