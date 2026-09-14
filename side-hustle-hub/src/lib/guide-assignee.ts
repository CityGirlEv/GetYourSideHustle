/**
 * Guide Library assignee ↔ linked GUIDE-REV test assignee.
 * Stored on guide as patch_json.assignee (one human QA id);
 * mirrored to test_case_status.assignee. Legacy multi values (`id1+id2`) keep the first id.
 */

import {
  isHumanQaTesterId,
  normalizeQaAssigneeId,
  QA_TESTERS,
  qaTestersFromUsers,
  testOwnerLabel,
  type GyshUser,
  type QaTester,
} from "./gysh-roles";
import { guideReviewCaseIdForGuide, guideIdFromGuideReviewCaseId } from "./guide-review-link";

/** Catalog default for GUIDE-REV cases when nothing is stored yet. */
export const DEFAULT_GUIDE_ASSIGNEE = "lyriq";

const QA_ACCENT_FALLBACKS = [
  "var(--crimson)",
  "var(--bronze)",
  "var(--accent-emerald)",
  "#3d6b8c",
  "#6b5b95",
  "#2e7d32",
] as const;

/** Split stored guide assignee into human QA ids (`tina`, `tina+evelyn`). */
export function parseGuideAssigneeIds(raw: unknown): string[] {
  const text = String(raw ?? "").trim();
  if (!text || /^unassigned$/i.test(text)) return [];
  const parts = text
    .split(/[+,&|/]/)
    .map((p) => normalizeQaAssigneeId(p))
    .filter(Boolean);
  const out: string[] = [];
  for (const id of parts) {
    if (id === "unassigned") continue;
    if (!isHumanQaTesterId(id)) continue;
    if (!out.includes(id)) out.push(id);
  }
  return out;
}

/** Encode guide assignee for patch storage (one id, or ""). */
export function formatGuideAssigneeIds(ids: readonly string[]): string {
  for (const raw of ids) {
    const id = normalizeQaAssigneeId(raw);
    if (!id || id === "unassigned" || !isHumanQaTesterId(id)) continue;
    return id;
  }
  return "";
}

/**
 * Next selection when the user clicks an assignee chip (single-select).
 * Replaces any previous assignee; clicking the same id is a no-op.
 */
export function nextSingleGuideAssignee(
  selected: readonly string[],
  clickedId: string,
): string[] | null {
  const id = normalizeQaAssigneeId(clickedId);
  if (!id || id === "unassigned" || !isHumanQaTesterId(id)) return null;
  if (selected.length === 1 && selected[0] === id) return null;
  return [id];
}

/** Normalize to the primary human QA assignee id, or "" (unassigned / invalid). */
export function normalizeGuideAssigneeId(raw: unknown): string {
  return parseGuideAssigneeIds(raw)[0] ?? "";
}

/** Effective guide assignees for display: patch → fallback → default. */
export function effectiveGuideAssignees(
  patchAssignee: unknown,
  fallback: string = "",
): string[] {
  const fromPatch = parseGuideAssigneeIds(patchAssignee);
  if (fromPatch.length) return fromPatch;
  const fromFallback = parseGuideAssigneeIds(fallback);
  if (fromFallback.length) return fromFallback;
  return [DEFAULT_GUIDE_ASSIGNEE];
}

/**
 * Guide Library chips / filter source of truth: saved patch only.
 * Empty patch is Unassigned — never fake Lyriq (catalog test default).
 */
export function guideLibraryAssigneeSelection(patchAssignee: unknown): string[] {
  return parseGuideAssigneeIds(patchAssignee).slice(0, 1);
}

/**
 * Next assignee to persist when a Library chip is clicked.
 * Clicking a new QA replaces the current one. Clicking the already-visible
 * person still saves when the patch is empty (hydrated/default display).
 */
export function guideAssigneeClickSelection(
  patchAssignee: unknown,
  selected: readonly string[],
  clickedId: string,
): string[] | null {
  const next = nextSingleGuideAssignee(selected, clickedId);
  if (next) return next;
  const id = normalizeQaAssigneeId(clickedId);
  if (!id || id === "unassigned" || !isHumanQaTesterId(id)) return null;
  if (!parseGuideAssigneeIds(patchAssignee).length && selected[0] === id) {
    return [id];
  }
  return null;
}

/** Effective primary guide assignee (first selected). */
export function effectiveGuideAssignee(
  patchAssignee: unknown,
  fallback: string = "",
): string {
  return effectiveGuideAssignees(patchAssignee, fallback)[0] ?? DEFAULT_GUIDE_ASSIGNEE;
}

/** Primary GUIDE-REV case for syncing assignee with a library guide. */
export function linkedGuideReviewCaseId(guideId: string): string | null {
  return guideReviewCaseIdForGuide(guideId);
}

export function guideIdFromLinkedReviewCase(caseId: string): string | null {
  return guideIdFromGuideReviewCaseId(caseId);
}

/** Human QA ids found on persisted test assignees (D1 / status map). */
export function collectAssignedQaIdsFromTests(
  assignees: Record<string, string> | null | undefined,
): string[] {
  const out = new Set<string>();
  for (const value of Object.values(assignees ?? {})) {
    for (const id of parseGuideAssigneeIds(value)) out.add(id);
  }
  return [...out];
}

/** Human QA ids found on guide catalog patch.assignee values. */
export function collectAssignedQaIdsFromGuidePatches(
  patches: Iterable<unknown> | null | undefined,
): string[] {
  const out = new Set<string>();
  for (const value of patches ?? []) {
    for (const id of parseGuideAssigneeIds(value)) out.add(id);
  }
  return [...out];
}

function sortQaTesters(list: QaTester[]): QaTester[] {
  return [...list].sort((a, b) =>
    a.shortName.localeCompare(b.shortName, undefined, { sensitivity: "base" }),
  );
}

function testerFromId(id: string, index: number): QaTester {
  const catalog = QA_TESTERS.find((t) => t.id === id);
  if (catalog) return catalog;
  const label = testOwnerLabel(id);
  return {
    id,
    name: label,
    shortName: label,
    accent: QA_ACCENT_FALLBACKS[index % QA_ACCENT_FALLBACKS.length]!,
  };
}

/**
 * Guide Library assignee roster: Users-area QAs (or catalog fallback),
 * plus every human QA that currently has at least one guide / test assigned.
 * Tee Jay is always included so his assignments stay visible.
 */
export function guideAssigneeRoster(opts?: {
  users?: readonly GyshUser[];
  /** Persisted Testing Portal assignees map (caseId → assignee). */
  testAssignees?: Record<string, string> | null;
  /** Guide catalog patch.assignee values (any guides already assigned). */
  guidePatchAssignees?: Iterable<unknown> | null;
  /** Extra human ids to always include (e.g. catalog defaults). */
  extraIds?: readonly string[];
}): QaTester[] {
  const users = opts?.users ?? [];
  const fromUsers = users.length > 0 ? qaTestersFromUsers(users) : [...QA_TESTERS];
  const byId = new Map(fromUsers.map((t) => [t.id, t]));

  const assigned = [
    ...collectAssignedQaIdsFromTests(opts?.testAssignees),
    ...collectAssignedQaIdsFromGuidePatches(opts?.guidePatchAssignees),
  ];
  for (const id of assigned) {
    if (!byId.has(id)) byId.set(id, testerFromId(id, byId.size));
  }
  for (const raw of [...(opts?.extraIds ?? []), "teejay"]) {
    const id = normalizeQaAssigneeId(raw);
    if (!id || !isHumanQaTesterId(id) || byId.has(id)) continue;
    byId.set(id, testerFromId(id, byId.size));
  }

  // Always keep catalog partners visible even when Users Area is empty of QA role.
  for (const t of QA_TESTERS) {
    if (!byId.has(t.id)) byId.set(t.id, t);
  }

  return sortQaTesters([...byId.values()]);
}

/**
 * QAs who already have ≥1 guide assigned (plus optional extras).
 * Unassigned is rendered separately by the UI — not returned here.
 * Prefer {@link guideAssigneeRoster} for Filter Guides by Assignee / assign chips.
 */
export function guideAssigneeFilterRoster(opts?: {
  guidePatchAssignees?: Iterable<unknown> | null;
  extraIds?: readonly string[];
}): QaTester[] {
  const ids = new Set(collectAssignedQaIdsFromGuidePatches(opts?.guidePatchAssignees));
  for (const raw of opts?.extraIds ?? []) {
    const id = normalizeQaAssigneeId(raw);
    if (!id || !isHumanQaTesterId(id)) continue;
    ids.add(id);
  }
  return sortQaTesters([...ids].map((id, i) => testerFromId(id, i)));
}

/** Stored guide assignees for nav filtering (empty = unassigned). */
export function guideNavAssigneesFromPatch(patchAssignee: unknown): string[] {
  return parseGuideAssigneeIds(patchAssignee);
}
