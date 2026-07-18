import {
  CHECKLIST_CHANNEL_LABELS,
  channelForItem,
  type ChecklistChannelId,
} from "@/lib/submission-checklist-channels";
import {
  allSubmissionChecklistItems,
  isChecklistItemComplete,
  SUBMISSION_CHECKLIST_SECTIONS,
  type SubmissionChecklistItem,
} from "@/lib/submission-checklist-data";
import type { MetaAdChecklistItemProgress, MetaAdConformanceRecord } from "@/lib/submission-checklist-meta-ads";
import {
  applyBoolRecordPatch,
  type SubmissionChecklistState,
} from "@/lib/submission-checklist-storage";

/** Per-ad creative/copy checklist items in the Facebook section. */
const FACEBOOK_CREATIVE_COPY_ITEM_IDS = new Set([
  "fb-ad-copy-draft",
  "fb-creative-assets",
  "fb-copy-review",
  "fb-creative-review",
  "fb-landing-url",
  "fb-lead-forms",
  "fb-special-ad-category",
  "fb-targeting-review",
  "fb-meta-submission",
]);

/** Meta-ads channel gap items shown as pre-flight on each ad record. */
const META_AD_GAP_ITEM_IDS = new Set([
  "gap-meta-pixel-live",
  "gap-fb-business-manager",
  "gap-smid-registry",
  "gap-mobile-disclaimer-placement",
]);

export type MetaAdChecklistCategory = {
  sectionId: string;
  sectionTitle: string;
  channelId: ChecklistChannelId;
  channelLabel: string;
  items: SubmissionChecklistItem[];
};

export type ResolvedMetaAdChecklistProgress = {
  prepDone: boolean;
  catriaApproved: boolean;
  note: string;
  complete: boolean;
  inheritedFromGlobal: {
    prepDone: boolean;
    catriaApproved: boolean;
  };
};

const sectionByItemId = (() => {
  const map = new Map<string, { sectionId: string; sectionTitle: string }>();
  for (const section of SUBMISSION_CHECKLIST_SECTIONS) {
    for (const item of section.items) {
      map.set(item.id, { sectionId: section.id, sectionTitle: section.title });
    }
  }
  return map;
})();

/** Whether a checklist item should repeat on each Meta ad conformance record. */
export function isMetaAdConformanceChecklistItem(itemId: string): boolean {
  if (itemId.startsWith("cms-")) return true;
  if (FACEBOOK_CREATIVE_COPY_ITEM_IDS.has(itemId)) return true;
  if (META_AD_GAP_ITEM_IDS.has(itemId)) return true;
  return false;
}

export function metaAdConformanceChecklistItems(): SubmissionChecklistItem[] {
  return allSubmissionChecklistItems().filter((item) => isMetaAdConformanceChecklistItem(item.id));
}

export function checklistItemCategoryForMetaAd(itemId: string): {
  sectionId: string;
  sectionTitle: string;
  channelId: ChecklistChannelId;
  channelLabel: string;
} {
  const section = sectionByItemId.get(itemId);
  const channelId = channelForItem(itemId);
  return {
    sectionId: section?.sectionId ?? "unknown",
    sectionTitle: section?.sectionTitle ?? "Checklist",
    channelId,
    channelLabel: CHECKLIST_CHANNEL_LABELS[channelId],
  };
}

/** Group linked checklist items by checklist section, preserving section order. */
export function groupMetaAdConformanceChecklistByCategory(): MetaAdChecklistCategory[] {
  const linkedIds = new Set(metaAdConformanceChecklistItems().map((item) => item.id));
  const groups: MetaAdChecklistCategory[] = [];

  for (const section of SUBMISSION_CHECKLIST_SECTIONS) {
    const items = section.items.filter((item) => linkedIds.has(item.id));
    if (items.length === 0) continue;
    const channelId = channelForItem(items[0]!.id);
    groups.push({
      sectionId: section.id,
      sectionTitle: section.title,
      channelId,
      channelLabel: CHECKLIST_CHANNEL_LABELS[channelId],
      items,
    });
  }

  return groups;
}

export function resolveMetaAdChecklistItemProgress(
  item: SubmissionChecklistItem,
  state: Pick<
    SubmissionChecklistState,
    "completed" | "catriaReviewed" | "catriaApproved" | "itemNotes" | "catriaTaskFlags"
  >,
  recordProgress?: Record<string, MetaAdChecklistItemProgress>,
): ResolvedMetaAdChecklistProgress {
  const local = recordProgress?.[item.id];
  const globalPrep = !!state.completed[item.id];
  const globalCatriaReview = !!state.catriaReviewed[item.id];
  const globalCatria = !!state.catriaApproved[item.id];
  const prepDone = globalPrep || !!local?.prepDone;
  const catriaApproved = globalCatria || !!local?.catriaApproved;
  const note = local?.note?.trim() || state.itemNotes[item.id]?.trim() || "";

  return {
    prepDone,
    catriaApproved,
    note,
    complete: isChecklistItemComplete(
      item,
      { [item.id]: prepDone },
      { [item.id]: catriaApproved },
      { [item.id]: globalCatriaReview },
      state.catriaTaskFlags,
    ),
    inheritedFromGlobal: {
      prepDone: globalPrep,
      catriaApproved: globalCatria,
    },
  };
}

function stampRecordProgress(
  record: MetaAdConformanceRecord,
  itemId: string,
  progress: MetaAdChecklistItemProgress,
): MetaAdConformanceRecord {
  return {
    ...record,
    checklistProgress: {
      ...record.checklistProgress,
      [itemId]: progress,
    },
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Global checklist → all Meta ad records.
 * Checked items on the main checklist propagate to every ad's per-item map.
 */
export function propagateGlobalChecklistItemToMetaAds(
  state: SubmissionChecklistState,
  itemId: string,
): SubmissionChecklistState {
  if (!isMetaAdConformanceChecklistItem(itemId)) return state;
  if (state.metaAdConformanceRecords.length === 0) return state;

  const prepDone = state.completed[itemId] === true;
  const catriaApproved = state.catriaApproved[itemId] === true;
  const note = state.itemNotes[itemId]?.trim();

  return {
    ...state,
    metaAdConformanceRecords: state.metaAdConformanceRecords.map((record) => {
      const existing = record.checklistProgress?.[itemId];
      const next: MetaAdChecklistItemProgress = {
        prepDone: prepDone || !!existing?.prepDone,
        catriaApproved: catriaApproved || !!existing?.catriaApproved,
      };
      if (note) next.note = note;
      else if (existing?.note) next.note = existing.note;
      return stampRecordProgress(record, itemId, next);
    }),
  };
}

/** Apply main-checklist patch and sync linked Meta ad records. */
export function applyMainChecklistItemPatch(
  state: SubmissionChecklistState,
  itemId: string,
  patch: Partial<
    Pick<
      SubmissionChecklistState,
      "completed" | "catriaReviewed" | "catriaApproved" | "catriaTaskFlags" | "itemNotes"
    >
  >,
): SubmissionChecklistState {
  const next: SubmissionChecklistState = {
    ...state,
    completed:
      patch.completed !== undefined
        ? applyBoolRecordPatch(state.completed, patch.completed)
        : state.completed,
    catriaReviewed:
      patch.catriaReviewed !== undefined
        ? applyBoolRecordPatch(state.catriaReviewed, patch.catriaReviewed)
        : state.catriaReviewed,
    catriaApproved:
      patch.catriaApproved !== undefined
        ? applyBoolRecordPatch(state.catriaApproved, patch.catriaApproved)
        : state.catriaApproved,
    catriaTaskFlags: patch.catriaTaskFlags
      ? {
          ...state.catriaTaskFlags,
          ...Object.fromEntries(
            Object.entries(patch.catriaTaskFlags).map(([key, value]) => [
              key,
              { ...state.catriaTaskFlags[key], ...value },
            ]),
          ),
        }
      : state.catriaTaskFlags,
    itemNotes: patch.itemNotes ? { ...state.itemNotes, ...patch.itemNotes } : state.itemNotes,
  };
  return propagateGlobalChecklistItemToMetaAds(next, itemId);
}

/** Per-ad checklist update — local progress; does not change global state. */
export function updateMetaAdRecordChecklistProgress(
  state: SubmissionChecklistState,
  recordId: string,
  itemId: string,
  patch: Partial<MetaAdChecklistItemProgress>,
): SubmissionChecklistState {
  if (!isMetaAdConformanceChecklistItem(itemId)) return state;

  const globalPrep = !!state.completed[itemId];
  const globalCatria = !!state.catriaApproved[itemId];

  return {
    ...state,
    metaAdConformanceRecords: state.metaAdConformanceRecords.map((record) => {
      if (record.id !== recordId) return record;
      const existing = record.checklistProgress?.[itemId] ?? {};
      const next: MetaAdChecklistItemProgress = { ...existing, ...patch };

      if (globalPrep) next.prepDone = true;
      if (globalCatria) next.catriaApproved = true;
      if (patch.prepDone === false && globalPrep) return record;
      if (patch.catriaApproved === false && globalCatria) return record;

      return stampRecordProgress(record, itemId, next);
    }),
  };
}

export function countMetaAdRecordChecklistProgress(
  record: MetaAdConformanceRecord,
  state: Pick<SubmissionChecklistState, "completed" | "catriaApproved" | "itemNotes">,
): { done: number; total: number } {
  const items = metaAdConformanceChecklistItems();
  const done = items.filter((item) => {
    const resolved = resolveMetaAdChecklistItemProgress(item, state, record.checklistProgress);
    return resolved.complete;
  }).length;
  return { done, total: items.length };
}

/** Seed a new ad record with checklist progress already checked on the main checklist. */
export function buildMetaAdChecklistProgressFromGlobal(
  state: Pick<SubmissionChecklistState, "completed" | "catriaApproved" | "itemNotes">,
): Record<string, MetaAdChecklistItemProgress> {
  const progress: Record<string, MetaAdChecklistItemProgress> = {};
  for (const item of metaAdConformanceChecklistItems()) {
    const prepDone = !!state.completed[item.id];
    const catriaApproved = !!state.catriaApproved[item.id];
    const note = state.itemNotes[item.id]?.trim();
    if (prepDone || catriaApproved || note) {
      progress[item.id] = {
        prepDone,
        catriaApproved,
        ...(note ? { note } : {}),
      };
    }
  }
  return progress;
}

export function seedMetaAdRecordFromGlobalChecklist(
  record: MetaAdConformanceRecord,
  state: Pick<SubmissionChecklistState, "completed" | "catriaApproved" | "itemNotes">,
): MetaAdConformanceRecord {
  const checklistProgress = buildMetaAdChecklistProgressFromGlobal(state);
  if (Object.keys(checklistProgress).length === 0) return record;
  return { ...record, checklistProgress };
}
