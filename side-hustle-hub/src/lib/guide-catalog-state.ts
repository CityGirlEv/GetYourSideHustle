/**
 * Guide catalog publish / soft-delete / field overrides.
 * Visibility: Active | Pending | Fixed/Re-Review | Reviewed by QA / No Changes | Reviewed by Dev | Inactive.
 * Reviewed by QA and Reviewed by Dev also hold Active (live + review badge).
 * Pending / Needs Further Review implies Reviewed + Inactive (hidden).
 * Fixed/Re-Review is after a Pending item is fixed — back to QA, Not Reviewed, still hidden.
 * Only Evelyn may set Reviewed by Dev. Pending / Fixed/Re-Review / Inactive stay admin/QA-only.
 */

import {
  adultLibraryMinTier,
  juniorLibraryMinTier,
  kidsLibraryMinTier,
  seniorLibraryMinTier,
} from "./age-library-tiers";
import { mergeKitFieldsIntoPatch } from "./guide-kit-overrides";
import type { GuideAuthoredStep, GuidePrerequisite, GuideToolCost } from "./guide-tools";
import type { TierId } from "./membership";
import { isFreeWizardHustle, SIDE_HUSTLES } from "./side-hustle-catalog";

/** Public-facing when Active, Reviewed by QA, or Reviewed by Dev. */
export type GuideVisibilityStatus =
  | "active"
  | "pending"
  | "fixed_rereview"
  | "reviewed_by_qa"
  | "reviewed_by_dev"
  | "inactive";

export const GUIDE_VISIBILITY_STATUSES: GuideVisibilityStatus[] = [
  "active",
  "pending",
  "fixed_rereview",
  "reviewed_by_qa",
  "reviewed_by_dev",
  "inactive",
];

/** True when the guide is live for members (Active, or a review status that also holds Active). */
export function guideHoldsActive(status: GuideVisibilityStatus): boolean {
  return status === "active" || status === "reviewed_by_qa" || status === "reviewed_by_dev";
}

/** Hidden review-cycle statuses: Pending and Fixed/Re-Review. */
export function guideIsHiddenReviewStatus(status: GuideVisibilityStatus): boolean {
  return status === "pending" || status === "fixed_rereview";
}

/** Pills / toggle checks: review statuses also surface Active; Pending also shows Inactive. */
export function guideHeldVisibilityStatuses(
  status: GuideVisibilityStatus,
): GuideVisibilityStatus[] {
  if (status === "reviewed_by_qa") return ["active", "reviewed_by_qa"];
  if (status === "reviewed_by_dev") return ["active", "reviewed_by_dev"];
  if (status === "pending") return ["pending", "inactive"];
  return [status];
}

/**
 * True when the guide has been through review.
 * Pending counts as Reviewed (hidden). Fixed/Re-Review is waiting for QA again (Not Reviewed).
 * Reviewed by QA / Dev also hold Active (live for members).
 */
export function guideIsReviewed(status: GuideVisibilityStatus): boolean {
  return status === "pending" || status === "reviewed_by_qa" || status === "reviewed_by_dev";
}

/** Status to apply when checking Reviewed (Evelyn → Dev; others → QA). */
export function guideReviewedStatusForActor(canSetReviewedByDev: boolean): GuideVisibilityStatus {
  return canSetReviewedByDev ? "reviewed_by_dev" : "reviewed_by_qa";
}

/**
 * Toggle the Not Reviewed / Reviewed checkbox.
 * Unchecking Not Reviewed → Reviewed (QA or Dev, live). Checking again → Active (Not Reviewed).
 * Pending already counts as Reviewed — checking Reviewed again leaves it hidden.
 * Fixed/Re-Review is waiting for QA — checking Reviewed goes live (QA or Dev).
 * Marking Not Reviewed from Pending / QA / Dev returns to live Active.
 */
export function toggleGuideReviewed(
  status: GuideVisibilityStatus,
  wantReviewed: boolean,
  canSetReviewedByDev: boolean,
): GuideVisibilityStatus {
  if (wantReviewed) {
    if (guideIsReviewed(status)) return status;
    return guideReviewedStatusForActor(canSetReviewedByDev);
  }
  return "active";
}

export type GuideVisibilityPick = "active" | "pending" | "fixed_rereview" | "inactive";

/**
 * Status after picking a visibility checkbox.
 * Pending implies Reviewed + Inactive (hidden).
 * Fixed/Re-Review is a QA queue after a fix — Not Reviewed, hidden, not Inactive.
 * Picking Inactive on Pending keeps Pending; on Fixed/Re-Review goes to Inactive.
 * Switching Pending or Fixed/Re-Review → Active goes live as Reviewed (QA or Dev).
 */
export function guideStatusAfterVisibilityPick(
  status: GuideVisibilityStatus,
  picked: GuideVisibilityPick,
  canSetReviewedByDev: boolean,
): GuideVisibilityStatus {
  if (picked === "pending") return "pending";
  if (picked === "fixed_rereview") return "fixed_rereview";
  if (picked === "inactive") {
    if (status === "pending") return "pending";
    return "inactive";
  }
  if (guideIsHiddenReviewStatus(status)) return guideReviewedStatusForActor(canSetReviewedByDev);
  if (guideIsReviewed(status) && guideHoldsActive(status)) return status;
  return "active";
}

export function guideMatchesStatusFilter(
  status: GuideVisibilityStatus,
  filter: GuideVisibilityStatus | "all" | "not_reviewed" | "reviewed",
): boolean {
  if (filter === "all") return true;
  if (filter === "not_reviewed") return !guideIsReviewed(status);
  if (filter === "reviewed") return guideIsReviewed(status);
  if (filter === "active") return guideHoldsActive(status);
  return status === filter;
}

export function guideVisibilityStatusLabel(status: GuideVisibilityStatus): string {
  switch (status) {
    case "active":
      return "Active";
    case "pending":
      return "Pending / Needs Further Review";
    case "fixed_rereview":
      return "Fixed/Re-Review";
    case "reviewed_by_qa":
      return "Reviewed by QA / No Changes";
    case "reviewed_by_dev":
      return "Reviewed by Dev";
    default:
      return "Inactive";
  }
}

/** Admin bulk-edit status options — same as GuideActiveToggle (Dev option is Evelyn-only in UI/API). */
export type GuideBulkStatus = GuideVisibilityStatus;
export const GUIDE_BULK_STATUS_OPTIONS: { value: GuideBulkStatus; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending / Needs Further Review" },
  { value: "fixed_rereview", label: "Fixed/Re-Review" },
  { value: "reviewed_by_qa", label: "Reviewed by QA / No Changes" },
  { value: "reviewed_by_dev", label: "Reviewed by Dev" },
  { value: "inactive", label: "Inactive" },
];

/** Bulk / toggle options visible for this actor (Reviewed by Dev only for Evelyn). */
export function guideStatusOptionsForActor(canSetReviewedByDev: boolean): typeof GUIDE_BULK_STATUS_OPTIONS {
  if (canSetReviewedByDev) return GUIDE_BULK_STATUS_OPTIONS;
  return GUIDE_BULK_STATUS_OPTIONS.filter((o) => o.value !== "reviewed_by_dev");
}

/** Admin bulk / individual membership floor options. */
export const GUIDE_BULK_MEMBERSHIP_OPTIONS: { value: TierId; label: string }[] = [
  { value: "free", label: "Free" },
  { value: "starter", label: "Starter" },
  { value: "pro", label: "Pro" },
  { value: "elite", label: "Elite" },
];

export function isGuideMinTier(value: unknown): value is TierId {
  return value === "free" || value === "starter" || value === "pro" || value === "elite";
}

/**
 * Effective membership floor: Admin catalog patch overrides code defaults.
 */
export function effectiveGuideMinTier(
  guideId: string,
  states: GuideCatalogStateMap | null | undefined,
  fallback: TierId,
): TierId {
  const patched = states?.[guideId]?.patch?.minTier;
  if (isGuideMinTier(patched)) return patched;
  return fallback;
}

export type GuideCatalogPatch = {
  name?: string;
  description?: string;
  peek?: string;
  minTier?: TierId;
  category?: string;
  audiences?: Array<"kids" | "junior" | "adult" | "senior">;
  /** Full ordered list — replaces code kit prerequisites when set. */
  prerequisites?: GuidePrerequisite[];
  /** Full ordered list — replaces code kit tools when set. */
  tools?: GuideToolCost[];
  /** Full ordered list — replaces code / detailed steps when set. */
  steps?: GuideAuthoredStep[];
};

export type GuideCatalogState = {
  guideId: string;
  /** Active | Pending | Inactive — only Active shows to members/guests. */
  status: GuideVisibilityStatus;
  /** True only when status is Active (API / list-item compat). */
  published: boolean;
  /** Soft-delete — hidden from public; Admin can restore. */
  deleted: boolean;
  /** Custom guide created in Admin (not in code catalog). */
  custom: boolean;
  patch: GuideCatalogPatch;
  updatedAt?: string;
  updatedBy?: string;
};

export type GuideCatalogStateMap = Record<string, GuideCatalogState>;

export type GuideListItem = {
  id: string;
  name: string;
  peek?: string;
  description?: string;
  minTier?: TierId;
  category?: string;
  audiences?: Array<"kids" | "junior" | "adult" | "senior">;
  /** From code catalog vs Admin-created. */
  source: "catalog" | "custom";
  published: boolean;
  status: GuideVisibilityStatus;
  deleted: boolean;
};

const TIERS: TierId[] = ["free", "starter", "pro", "elite"];

/** True when this guide is Free on any age library (or Free Wizard allowlist). */
export function guideIsFreePlanGuide(guideId: string): boolean {
  const id = String(guideId || "").trim();
  if (!id) return false;
  if (isFreeWizardHustle(id)) return true;
  if (adultLibraryMinTier(id) === "free") return true;
  if (kidsLibraryMinTier(id) === "free") return true;
  if (juniorLibraryMinTier(id) === "free") return true;
  if (seniorLibraryMinTier(id) === "free") return true;
  return false;
}

/** Missing catalog row = Active (live in the library). Admin can set Inactive / Pending to hide. */
export function defaultStatusForGuide(guideId: string): GuideVisibilityStatus {
  void guideId;
  return "active";
}

/** @deprecated Prefer defaultStatusForGuide — missing rows are Active / published. */
export function guidesDefaultPublished(_isProd?: boolean): boolean {
  void _isProd;
  return true;
}

export function guidesDefaultStatus(_isProd?: boolean): GuideVisibilityStatus {
  return guidesDefaultPublished(_isProd) ? "active" : "inactive";
}

export function isGuideVisibilityStatus(value: unknown): value is GuideVisibilityStatus {
  return (
    value === "active" ||
    value === "pending" ||
    value === "fixed_rereview" ||
    value === "reviewed_by_qa" ||
    value === "reviewed_by_dev" ||
    value === "inactive"
  );
}

/** D1 `published` column: 0 inactive, 1 active, 2 pending, 3 reviewed_by_qa, 4 reviewed_by_dev, 5 fixed_rereview. */
export function guideStatusToPublishedCode(status: GuideVisibilityStatus): number {
  if (status === "active") return 1;
  if (status === "pending") return 2;
  if (status === "reviewed_by_qa") return 3;
  if (status === "reviewed_by_dev") return 4;
  if (status === "fixed_rereview") return 5;
  return 0;
}

export function guideStatusFromPublishedCode(code: number): GuideVisibilityStatus {
  if (code === 1) return "active";
  if (code === 2) return "pending";
  if (code === 3) return "reviewed_by_qa";
  if (code === 4) return "reviewed_by_dev";
  if (code === 5) return "fixed_rereview";
  return "inactive";
}

export function resolveGuideVisibilityStatus(raw: {
  status?: unknown;
  published?: unknown;
}): GuideVisibilityStatus {
  /** Legacy In Review → Reviewed by QA. */
  if (raw.status === "in_review") return "reviewed_by_qa";
  if (isGuideVisibilityStatus(raw.status)) return raw.status;
  if (typeof raw.published === "number") {
    return guideStatusFromPublishedCode(raw.published);
  }
  if (raw.published === true) return "active";
  if (raw.published === false) return "inactive";
  return guidesDefaultStatus();
}

export function emptyGuideCatalogState(guideId: string): GuideCatalogState {
  const status = defaultStatusForGuide(guideId);
  return {
    guideId,
    status,
    published: guideHoldsActive(status),
    deleted: false,
    custom: false,
    patch: {},
  };
}

export function normalizeGuideCatalogState(
  guideId: string,
  raw: Partial<GuideCatalogState> | null | undefined,
): GuideCatalogState {
  const id = String(guideId || "").trim();
  const base = emptyGuideCatalogState(id);
  if (!raw || !id) return base;
  const hasExplicit =
    isGuideVisibilityStatus(raw.status) ||
    raw.status === "in_review" ||
    typeof raw.published === "boolean" ||
    typeof raw.published === "number";
  const status = hasExplicit
    ? resolveGuideVisibilityStatus(raw)
    : defaultStatusForGuide(id);
  return {
    guideId: id,
    status,
    published: guideHoldsActive(status),
    deleted: raw.deleted === true,
    custom: raw.custom === true,
    patch: sanitizeGuideCatalogPatch(raw.patch) ?? {},
    updatedAt: raw.updatedAt,
    updatedBy: raw.updatedBy,
  };
}

export function sanitizeGuideCatalogPatch(raw: unknown): GuideCatalogPatch | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const body = raw as Record<string, unknown>;
  const patch: GuideCatalogPatch = {};
  if (typeof body.name === "string" && body.name.trim()) patch.name = body.name.trim();
  if (typeof body.description === "string") patch.description = body.description.trim();
  if (typeof body.peek === "string") patch.peek = body.peek.trim();
  if (typeof body.category === "string" && body.category.trim()) {
    patch.category = body.category.trim();
  }
  if (typeof body.minTier === "string" && TIERS.includes(body.minTier as TierId)) {
    patch.minTier = body.minTier as TierId;
  }
  if (Array.isArray(body.audiences)) {
    const audiences = body.audiences
      .map((a) => String(a))
      .filter((a): a is "kids" | "junior" | "adult" | "senior" =>
        a === "kids" || a === "junior" || a === "adult" || a === "senior",
      );
    if (audiences.length) patch.audiences = audiences;
  }
  return mergeKitFieldsIntoPatch(patch, body);
}

/** All hustle ids that can appear in the Guides library. */
export function allCatalogGuideIds(): string[] {
  return SIDE_HUSTLES.map((h) => h.id);
}

/**
 * Force stage policy into a state map: Free → Active, else Inactive.
 * Keeps Pending and soft-deleted rows as-is.
 * Not applied on fetch — Admin sets status in the Guide Library.
 */
export function withForcedFreeActivePolicy(states: GuideCatalogStateMap): GuideCatalogStateMap {
  const out: GuideCatalogStateMap = { ...states };
  for (const id of allCatalogGuideIds()) {
    const prev = out[id];
    if (prev?.deleted) continue;
    if (prev && resolveGuideVisibilityStatus(prev) === "pending") {
      out[id] = normalizeGuideCatalogState(id, { ...prev, status: "pending" });
      continue;
    }
    if (prev && resolveGuideVisibilityStatus(prev) === "fixed_rereview") {
      out[id] = normalizeGuideCatalogState(id, { ...prev, status: "fixed_rereview" });
      continue;
    }
    if (prev && resolveGuideVisibilityStatus(prev) === "reviewed_by_qa") {
      out[id] = normalizeGuideCatalogState(id, { ...prev, status: "reviewed_by_qa" });
      continue;
    }
    if (prev && resolveGuideVisibilityStatus(prev) === "reviewed_by_dev") {
      out[id] = normalizeGuideCatalogState(id, { ...prev, status: "reviewed_by_dev" });
      continue;
    }
    const status: GuideVisibilityStatus = guideIsFreePlanGuide(id) ? "active" : "inactive";
    out[id] = normalizeGuideCatalogState(id, {
      ...prev,
      guideId: id,
      status,
      published: guideHoldsActive(status),
      deleted: false,
      custom: prev?.custom === true,
      patch: prev?.patch ?? {},
      updatedAt: prev?.updatedAt,
      updatedBy: prev?.updatedBy,
    });
  }
  return out;
}

/** Resolved visibility for Admin toggles (explicit state wins; else Free=Active policy). */
export function getGuideVisibilityStatus(
  guideId: string,
  states: GuideCatalogStateMap | null | undefined,
): GuideVisibilityStatus {
  const row = states?.[guideId];
  if (!row) return defaultStatusForGuide(guideId);
  if (row.deleted) return "inactive";
  return resolveGuideVisibilityStatus(row);
}

/** True when Active or Reviewed by QA (both are live / published). */
export function isGuidePublished(
  guideId: string,
  states: GuideCatalogStateMap | null | undefined,
): boolean {
  return guideHoldsActive(getGuideVisibilityStatus(guideId, states));
}

/**
 * Public visitors / members see Active, Reviewed by QA, and Reviewed by Dev guides.
 * Pending, Fixed/Re-Review, and Inactive stay admin/QA-only. Opening a guide is still gated by membership.
 */
export function isGuideVisibleToPublic(
  guideId: string,
  states: GuideCatalogStateMap | null | undefined,
): boolean {
  if (states?.[guideId]?.deleted === true) return false;
  return guideHoldsActive(getGuideVisibilityStatus(guideId, states));
}

/** Admins see unpublished + soft-deleted for review (unless permanently purged). */
export function isGuideVisibleToAdmin(
  guideId: string,
  states: GuideCatalogStateMap | null | undefined,
): boolean {
  void guideId;
  void states;
  return true;
}

export function filterGuidesForViewer<T extends { id: string }>(
  guides: T[],
  states: GuideCatalogStateMap | null | undefined,
  opts?: { isAdmin?: boolean },
): T[] {
  if (opts?.isAdmin) return guides;
  return guides.filter((g) => isGuideVisibleToPublic(g.id, states));
}

export function applyGuideCatalogPatch<T extends Record<string, unknown>>(
  base: T,
  patch?: GuideCatalogPatch | null,
): T {
  if (!patch || Object.keys(patch).length === 0) return base;
  const next = { ...base };
  if (patch.name) (next as Record<string, unknown>).name = patch.name;
  if (patch.description !== undefined) {
    (next as Record<string, unknown>).description = patch.description;
  }
  if (patch.peek !== undefined) (next as Record<string, unknown>).peek = patch.peek;
  if (patch.minTier) (next as Record<string, unknown>).minTier = patch.minTier;
  if (patch.category) (next as Record<string, unknown>).category = patch.category;
  if (patch.audiences) (next as Record<string, unknown>).audiences = patch.audiences;
  return next;
}

export function mergeGuideListItem(
  base: Omit<GuideListItem, "published" | "deleted" | "source" | "status"> & {
    source?: "catalog" | "custom";
  },
  state?: GuideCatalogState | null,
): GuideListItem {
  const normalized = state
    ? normalizeGuideCatalogState(base.id, state)
    : emptyGuideCatalogState(base.id);
  const patched = applyGuideCatalogPatch(
    {
      id: base.id,
      name: base.name,
      peek: base.peek,
      description: base.description,
      minTier: base.minTier,
      category: base.category,
      audiences: base.audiences,
    },
    normalized.patch,
  );
  return {
    ...patched,
    id: base.id,
    name: String(patched.name || base.name),
    source: normalized.custom ? "custom" : base.source ?? "catalog",
    status: normalized.status,
    published: normalized.published,
    deleted: normalized.deleted,
  };
}

export type GuideCatalogBulkAction =
  | "publish"
  | "unpublish"
  | "pending"
  | "fixed_rereview"
  | "reviewed_by_qa"
  | "reviewed_by_dev"
  | "delete"
  | "restore";

export function applyBulkGuideAction(
  state: GuideCatalogState,
  action: GuideCatalogBulkAction,
): GuideCatalogState {
  switch (action) {
    case "publish":
      return { ...state, status: "active", published: true, deleted: false };
    case "unpublish":
      return { ...state, status: "inactive", published: false };
    case "pending":
      return { ...state, status: "pending", published: false, deleted: false };
    case "fixed_rereview":
      return { ...state, status: "fixed_rereview", published: false, deleted: false };
    case "reviewed_by_qa":
      return { ...state, status: "reviewed_by_qa", published: true, deleted: false };
    case "reviewed_by_dev":
      return { ...state, status: "reviewed_by_dev", published: true, deleted: false };
    case "delete":
      return { ...state, deleted: true, status: "inactive", published: false };
    case "restore":
      return { ...state, deleted: false };
    default:
      return state;
  }
}

export function slugifyGuideId(name: string): string {
  return String(name || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}
