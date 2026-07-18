import {
  PREP_OWNER_LABEL,
  REVIEW_OWNER_LABEL,
  type SubmissionChecklistItem,
} from "@/lib/submission-checklist-data";
import type { CarrierChecklistTask } from "@/lib/submission-checklist-carrier";
import type { SubmissionChecklistState } from "@/lib/submission-checklist-storage";

export const CARRIER_MAIN_CHECKLIST_SECTION_ID = "carrier-review-sync";
export const CARRIER_MAIN_CHECKLIST_SECTION_TITLE = "Carrier review";
export const CARRIER_MAIN_CHECKLIST_SECTION_SUBTITLE =
  "Synced from curated carrier checklists — assigned to both Evelyn and Catria.";

const CARRIER_MAIN_ITEM_PREFIX = "carrier-main-";

/** Stable main-checklist id for a curated carrier task. */
export function carrierMainChecklistItemId(carrierTaskId: string): string {
  return `${CARRIER_MAIN_ITEM_PREFIX}${carrierTaskId}`;
}

export function isCarrierMainChecklistItemId(itemId: string): boolean {
  return itemId.startsWith(CARRIER_MAIN_ITEM_PREFIX);
}

/** Curated carrier tasks synced to the main compliance checklist. */
export function carrierTasksForMainChecklistSync(
  tasks: CarrierChecklistTask[],
): CarrierChecklistTask[] {
  return tasks.filter((task) => task.assignee === "both" || task.assignee === "review");
}

export function buildCarrierMainChecklistItem(task: CarrierChecklistTask): SubmissionChecklistItem {
  const source = task.sourceFile ? ` (${task.sourceFile})` : "";
  return {
    id: carrierMainChecklistItemId(task.id),
    title: `${task.carrierName}: ${task.title}`,
    description: `Carrier checklist synced from ${task.carrierName}${source}. ${PREP_OWNER_LABEL} delivers; ${REVIEW_OWNER_LABEL} reviews and approves — both share this item.`,
    owner: "prep",
    channel: "website",
    prepDueDate: task.dueDate,
    reviewDueDate: task.reviewDueDate,
    requiresCatriaApproval: true,
  };
}

export function buildCarrierMainChecklistItems(
  tasks: CarrierChecklistTask[],
): SubmissionChecklistItem[] {
  return carrierTasksForMainChecklistSync(tasks).map(buildCarrierMainChecklistItem);
}

function pruneCarrierMainChecklistFields(
  record: Record<string, unknown>,
  activeItemIds: ReadonlySet<string>,
): Record<string, unknown> {
  const next: Record<string, unknown> = { ...record };
  for (const key of Object.keys(next)) {
    if (isCarrierMainChecklistItemId(key) && !activeItemIds.has(key)) {
      delete next[key];
    }
  }
  return next;
}

/**
 * Ensure main checklist has dual-assignee items for every curated carrier review task.
 * Removes stale synced progress when carrier tasks are excluded from the saved checklist.
 */
export function syncCarrierReviewToMainChecklist(
  state: SubmissionChecklistState,
): SubmissionChecklistState {
  const reviewTasks = carrierTasksForMainChecklistSync(state.carrierTasks);
  const activeItemIds = new Set(reviewTasks.map((task) => carrierMainChecklistItemId(task.id)));

  const itemAssignees = { ...state.itemAssignees };
  for (const task of reviewTasks) {
    itemAssignees[carrierMainChecklistItemId(task.id)] = "both";
  }
  for (const key of Object.keys(itemAssignees)) {
    if (isCarrierMainChecklistItemId(key) && !activeItemIds.has(key)) {
      delete itemAssignees[key];
    }
  }

  return {
    ...state,
    itemAssignees,
    completed: pruneCarrierMainChecklistFields(
      state.completed,
      activeItemIds,
    ) as SubmissionChecklistState["completed"],
    catriaReviewed: pruneCarrierMainChecklistFields(
      state.catriaReviewed,
      activeItemIds,
    ) as SubmissionChecklistState["catriaReviewed"],
    catriaApproved: pruneCarrierMainChecklistFields(
      state.catriaApproved,
      activeItemIds,
    ) as SubmissionChecklistState["catriaApproved"],
    catriaTaskFlags: pruneCarrierMainChecklistFields(
      state.catriaTaskFlags,
      activeItemIds,
    ) as SubmissionChecklistState["catriaTaskFlags"],
    itemNotes: pruneCarrierMainChecklistFields(
      state.itemNotes,
      activeItemIds,
    ) as SubmissionChecklistState["itemNotes"],
    itemStatuses: pruneCarrierMainChecklistFields(
      state.itemStatuses,
      activeItemIds,
    ) as SubmissionChecklistState["itemStatuses"],
    personStatuses: pruneCarrierMainChecklistFields(
      state.personStatuses,
      activeItemIds,
    ) as SubmissionChecklistState["personStatuses"],
  };
}
