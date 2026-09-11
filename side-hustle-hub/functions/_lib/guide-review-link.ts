/**
 * Link Guide Library activations ↔ Testing Portal GUIDE-REV-* cases.
 * Format: GUIDE-REV-{launch|kids|junior|senior}-{guideId}
 * Keep in sync with src/lib/guide-review-link.ts + gysh-guide-review-cases.ts.
 */

const GUIDE_REVIEW_KINDS = ["launch", "kids", "junior", "senior"] as const;

export function guideIdFromGuideReviewCaseId(caseId: string): string | null {
  const m = String(caseId || "").match(/^GUIDE-REV-(launch|kids|junior|senior)-(.+)$/i);
  if (!m) return null;
  const guideId = String(m[2] || "").trim();
  return guideId || null;
}

/** Prefer adult/launch when unknown — Workers cannot import the full Vite catalog. */
export function guideReviewCaseIdsForGuide(guideId: string): string[] {
  const id = String(guideId || "").trim();
  if (!id) return [];
  // Primary first (launch), then other kinds for legacy D1 rows.
  return GUIDE_REVIEW_KINDS.map((kind) => `GUIDE-REV-${kind}-${id}`);
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
