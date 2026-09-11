/**
 * Client/shared helpers mirroring functions/_lib/guide-review-link.ts (keep in sync).
 * Cross-link GUIDE-REV-* Testing Portal cases ↔ Side Hustle Library guides.
 * Keep this module free of gysh-test-plan / GUIDE_REVIEW_CASES to avoid circular imports.
 */

import { audiencesForLibraryGuideId } from "./guide-library-pool";

const GUIDE_REVIEW_KINDS = ["launch", "kids", "junior", "senior"] as const;

export type GuideReviewLinkKind = (typeof GUIDE_REVIEW_KINDS)[number];

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
export function primaryGuideReviewKind(guideId: string): GuideReviewLinkKind {
  const ages = audiencesForLibraryGuideId(guideId);
  if (ages.length === 1) {
    if (ages[0] === "kids") return "kids";
    if (ages[0] === "junior") return "junior";
    if (ages[0] === "senior") return "senior";
    return "launch";
  }
  if (ages.includes("adult")) return "launch";
  if (ages.includes("senior")) return "senior";
  if (ages.includes("junior")) return "junior";
  if (ages.includes("kids")) return "kids";
  return "launch";
}

/** Canonical GUIDE-REV case id for a library guide (one test per guide). */
export function guideReviewCaseIdForGuide(guideId: string): string | null {
  const id = String(guideId || "").trim();
  if (!id) return null;
  return `GUIDE-REV-${primaryGuideReviewKind(id)}-${id}`;
}

/**
 * All possible GUIDE-REV case ids for a catalog guide id (primary first, then legacy kinds).
 * Primary is the live Testing Portal case; extras help match older D1 status rows.
 */
export function guideReviewCaseIdsForGuide(guideId: string): string[] {
  const id = String(guideId || "").trim();
  if (!id) return [];
  const primary = primaryGuideReviewKind(id);
  const primaryId = `GUIDE-REV-${primary}-${id}`;
  const rest = GUIDE_REVIEW_KINDS.filter((k) => k !== primary).map(
    (kind) => `GUIDE-REV-${kind}-${id}`,
  );
  return [primaryId, ...rest];
}

/** Note body when Admin Activates a guide in the Guide Library. */
export function guideLibraryActivationPassNote(opts: {
  guideId: string;
  approvedBy: string;
  approvedAt: string;
}): string {
  const guideId = String(opts.guideId || "").trim() || "(unknown)";
  const who = String(opts.approvedBy || "").trim() || "Admin";
  const at = String(opts.approvedAt || "").trim() || new Date().toISOString();
  let displayAt = at;
  const ms = Date.parse(at);
  if (!Number.isNaN(ms)) {
    displayAt = new Date(ms).toISOString();
  }
  return `Guide passed via Review in the Guide library. Guide id: ${guideId}. Approved by ${who} at ${displayAt}.`;
}

/** Note when Pending / Needs Further Review takes a guide offline. */
export function guideLibraryPendingFailNote(opts: {
  guideId: string;
  updatedBy: string;
  updatedAt: string;
}): string {
  const guideId = String(opts.guideId || "").trim() || "(unknown)";
  const who = String(opts.updatedBy || "").trim() || "Admin";
  const at = String(opts.updatedAt || "").trim() || new Date().toISOString();
  let displayAt = at;
  const ms = Date.parse(at);
  if (!Number.isNaN(ms)) {
    displayAt = new Date(ms).toISOString();
  }
  return `Pending / Needs Further Review in the Guide library — guide set Inactive. Guide id: ${guideId}. By ${who} at ${displayAt}.`;
}

/** Library deep link for a GUIDE-REV case (or null if not a guide-review case). */
export function guideHrefFromGuideReviewCaseId(caseId: string): string | null {
  const guideId = guideIdFromGuideReviewCaseId(caseId);
  if (!guideId) return null;
  return `/guides?hustle=${encodeURIComponent(guideId)}`;
}

/** Testing Portal deep link for a library guide’s GUIDE-REV case. */
export function testingPortalHrefForGuide(guideId: string): string | null {
  const caseId = guideReviewCaseIdForGuide(guideId);
  if (!caseId) return null;
  return `/admin?tab=testing&test=${encodeURIComponent(caseId)}`;
}

/** Chip label for GUIDE-REV test → library guide deep link. */
export function guideCrossLinkLabelFromCaseId(caseId: string): string | null {
  const guideId = guideIdFromGuideReviewCaseId(caseId);
  if (!guideId) return null;
  return `Guide · ${guideId}`;
}
