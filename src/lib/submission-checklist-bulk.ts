import {
  buildRemoveChecklistPersonPatch,
  deriveItemStatusFromProgress,
  getCatriaTaskFlags,
  getSubmissionTaskAssignee,
  isChecklistItemStatus,
  resolveCatriaPersonStatus,
  resolvePrepPersonStatus,
  statusFromCheckboxChecked,
  submissionTaskShowsCatria,
  submissionTaskShowsPrep,
  type CatriaTaskFlags,
  type ChecklistItemStatus,
  type ChecklistOwner,
  type ChecklistPerson,
  type ItemPersonStatuses,
} from "@/lib/submission-checklist-data";
import {
  applyBoolRecordPatch,
  type SubmissionChecklistState,
} from "@/lib/submission-checklist-storage";

export type BulkChecklistEditPatch = {
  assignee?: ChecklistOwner;
  status?: ChecklistItemStatus;
  /** Clear progress, notes, and status for selected items. */
  remove?: boolean;
};

export type ItemProgressSyncInput = {
  flags: CatriaTaskFlags;
  showPrep: boolean;
  showCatria: boolean;
  prepDone: boolean;
  catriaReviewed: boolean;
  catriaApproved: boolean;
};

function pruneKeys<T extends Record<string, unknown>>(
  record: T,
  ids: ReadonlySet<string>,
): T {
  const next = { ...record };
  for (const id of ids) {
    delete next[id];
  }
  return next;
}

function buildPersonStatusesForItem(
  existing: ItemPersonStatuses | undefined,
  input: ItemProgressSyncInput,
): ItemPersonStatuses {
  const next: ItemPersonStatuses = { ...(existing ?? {}) };
  if (input.showPrep) {
    next.prep = resolvePrepPersonStatus(input.prepDone, true);
  }
  if (input.showCatria) {
    next.review = resolveCatriaPersonStatus(
      input.flags,
      input.catriaReviewed,
      input.catriaApproved,
    );
  }
  return next;
}

/** Sync personStatuses + itemStatuses from checkbox progress after any toggle. */
export function syncItemProgressFromCheckboxes(
  state: SubmissionChecklistState,
  itemId: string,
  input: ItemProgressSyncInput,
): SubmissionChecklistState {
  return {
    ...state,
    personStatuses: {
      ...state.personStatuses,
      [itemId]: buildPersonStatusesForItem(state.personStatuses[itemId], input),
    },
    itemStatuses: {
      ...state.itemStatuses,
      [itemId]: deriveItemStatusFromProgress(
        input.prepDone,
        input.catriaReviewed,
        input.catriaApproved,
        input.flags,
        input.showPrep,
      ),
    },
  };
}

/** Clear checkbox progress, notes, and status for the given item ids. */
export function clearChecklistItemsProgress(
  state: SubmissionChecklistState,
  itemIds: Iterable<string>,
): SubmissionChecklistState {
  const ids = new Set(itemIds);
  if (ids.size === 0) return state;

  const boolPatch = Object.fromEntries([...ids].map((id) => [id, false]));

  return {
    ...state,
    completed: applyBoolRecordPatch(state.completed, boolPatch),
    catriaReviewed: applyBoolRecordPatch(state.catriaReviewed, boolPatch),
    catriaApproved: applyBoolRecordPatch(state.catriaApproved, boolPatch),
    itemNotes: pruneKeys(state.itemNotes, ids),
    submissionTasks: applyBoolRecordPatch(state.submissionTasks, boolPatch),
    submissionTaskReviewed: applyBoolRecordPatch(state.submissionTaskReviewed, boolPatch),
    submissionTaskApproved: applyBoolRecordPatch(state.submissionTaskApproved, boolPatch),
    submissionTaskNotes: pruneKeys(state.submissionTaskNotes, ids),
    carrierTaskDone: applyBoolRecordPatch(state.carrierTaskDone, boolPatch),
    carrierTaskReviewed: applyBoolRecordPatch(state.carrierTaskReviewed, boolPatch),
    carrierTaskApproved: applyBoolRecordPatch(state.carrierTaskApproved, boolPatch),
    carrierTaskNotes: pruneKeys(state.carrierTaskNotes, ids),
    itemStatuses: pruneKeys(state.itemStatuses, ids),
    personStatuses: pruneKeys(state.personStatuses, ids),
  };
}

function applyBulkCarrierAssignee(
  state: SubmissionChecklistState,
  ids: ReadonlySet<string>,
  assignee: ChecklistOwner,
): SubmissionChecklistState {
  const carrierIds = new Set([...ids].filter((id) => state.carrierTasks.some((t) => t.id === id)));
  if (carrierIds.size === 0) return state;

  return {
    ...state,
    carrierTasks: state.carrierTasks.map((task) =>
      carrierIds.has(task.id) ? { ...task, assignee } : task,
    ),
  };
}

/** Admin bulk edit — assign, status, or clear selected checklist rows. */
export function applyBulkChecklistEdit(
  state: SubmissionChecklistState,
  itemIds: Iterable<string>,
  patch: BulkChecklistEditPatch,
): SubmissionChecklistState {
  const ids = new Set(itemIds);
  if (ids.size === 0) return state;
  if (patch.remove) return clearChecklistItemsProgress(state, ids);

  let next = state;

  if (patch.assignee) {
    const assigneeEntries = Object.fromEntries([...ids].map((id) => [id, patch.assignee!]));
    next = {
      ...next,
      itemAssignees: { ...next.itemAssignees, ...assigneeEntries },
      submissionTaskAssignees: { ...next.submissionTaskAssignees, ...assigneeEntries },
    };
    next = applyBulkCarrierAssignee(next, ids, patch.assignee);
  }

  if (patch.status && isChecklistItemStatus(patch.status)) {
    const statusEntries = Object.fromEntries([...ids].map((id) => [id, patch.status!]));
    next = {
      ...next,
      itemStatuses: { ...next.itemStatuses, ...statusEntries },
    };
  }

  return next;
}

/** @deprecated Prefer syncItemProgressFromCheckboxes for dual-owner rows. */
export function withCheckboxStatusSync(
  state: SubmissionChecklistState,
  itemId: string,
  checked: boolean,
): SubmissionChecklistState {
  return {
    ...state,
    itemStatuses: {
      ...state.itemStatuses,
      [itemId]: statusFromCheckboxChecked(checked),
    },
  };
}

export function setChecklistItemStatus(
  state: SubmissionChecklistState,
  itemId: string,
  status: ChecklistItemStatus,
): SubmissionChecklistState {
  return {
    ...state,
    itemStatuses: { ...state.itemStatuses, [itemId]: status },
  };
}

/** Per-person dropdown — updates stored status and syncs checkboxes for done / not_started. */
export function setItemPersonStatus(
  state: SubmissionChecklistState,
  itemId: string,
  person: ChecklistPerson,
  status: ChecklistItemStatus,
  flags: CatriaTaskFlags,
  showPrep: boolean,
): SubmissionChecklistState {
  let next: SubmissionChecklistState = {
    ...state,
    personStatuses: {
      ...state.personStatuses,
      [itemId]: { ...state.personStatuses[itemId], [person]: status },
    },
  };

  if (person === "prep") {
    if (status === "done") {
      next = {
        ...next,
        completed: applyBoolRecordPatch(next.completed, { [itemId]: true }),
      };
    } else if (status === "not_started") {
      next = {
        ...next,
        completed: applyBoolRecordPatch(next.completed, { [itemId]: false }),
      };
    }
  } else if (person === "review") {
    if (status === "done") {
      if (flags.review) {
        next = {
          ...next,
          catriaReviewed: applyBoolRecordPatch(next.catriaReviewed, { [itemId]: true }),
        };
      }
      if (flags.approve) {
        next = {
          ...next,
          catriaApproved: applyBoolRecordPatch(next.catriaApproved, { [itemId]: true }),
        };
      }
    } else if (status === "not_started") {
      next = {
        ...next,
        ...(flags.review
          ? { catriaReviewed: applyBoolRecordPatch(next.catriaReviewed, { [itemId]: false }) }
          : {}),
        ...(flags.approve
          ? { catriaApproved: applyBoolRecordPatch(next.catriaApproved, { [itemId]: false }) }
          : {}),
      };
    } else if (status === "in_progress" && flags.review) {
      next = {
        ...next,
        catriaReviewed: applyBoolRecordPatch(next.catriaReviewed, { [itemId]: true }),
        ...(flags.approve
          ? { catriaApproved: applyBoolRecordPatch(next.catriaApproved, { [itemId]: false }) }
          : {}),
      };
    }
  }

  const prepDone = !!next.completed[itemId];
  const catriaReviewed = !!next.catriaReviewed[itemId];
  const catriaApproved = !!next.catriaApproved[itemId];
  const showCatria = flags.review || flags.approve;

  return syncItemProgressFromCheckboxes(next, itemId, {
    flags,
    showPrep,
    showCatria,
    prepDone,
    catriaReviewed,
    catriaApproved,
  });
}

function clearPersonStatusSlot(
  personStatuses: Record<string, ItemPersonStatuses>,
  itemId: string,
  person: ChecklistPerson,
): Record<string, ItemPersonStatuses> {
  const slot = { ...(personStatuses[itemId] ?? {}) };
  delete slot[person];
  if (Object.keys(slot).length === 0) {
    const next = { ...personStatuses };
    delete next[itemId];
    return next;
  }
  return { ...personStatuses, [itemId]: slot };
}

/** Evelyn-only — remove prep or review person from a main checklist item. */
export function removePersonFromMainChecklistItem(
  state: SubmissionChecklistState,
  itemId: string,
  person: ChecklistPerson,
  currentAssignee: ChecklistOwner,
): SubmissionChecklistState {
  const patch = buildRemoveChecklistPersonPatch(currentAssignee, person);
  let next: SubmissionChecklistState = {
    ...state,
    itemAssignees: { ...state.itemAssignees, [itemId]: patch.assignee },
    personStatuses: clearPersonStatusSlot(state.personStatuses, itemId, person),
  };
  if (patch.catriaTaskFlags) {
    next = {
      ...next,
      catriaTaskFlags: {
        ...next.catriaTaskFlags,
        [itemId]: { ...next.catriaTaskFlags[itemId], ...patch.catriaTaskFlags },
      },
    };
  }
  if (patch.clearPrep) {
    next = {
      ...next,
      completed: applyBoolRecordPatch(next.completed, { [itemId]: false }),
    };
  }
  if (patch.clearReview) {
    next = {
      ...next,
      catriaReviewed: applyBoolRecordPatch(next.catriaReviewed, { [itemId]: false }),
    };
  }
  if (patch.clearApprove) {
    next = {
      ...next,
      catriaApproved: applyBoolRecordPatch(next.catriaApproved, { [itemId]: false }),
    };
  }
  return next;
}

/** Evelyn-only — remove prep or review person from a submission / carrier task. */
export function removePersonFromSubmissionTask(
  state: SubmissionChecklistState,
  itemId: string,
  person: ChecklistPerson,
  currentAssignee: ChecklistOwner,
  taskKind: "submission" | "carrier",
): SubmissionChecklistState {
  const patch = buildRemoveChecklistPersonPatch(currentAssignee, person);

  let next: SubmissionChecklistState = {
    ...state,
    submissionTaskAssignees: {
      ...state.submissionTaskAssignees,
      [itemId]: patch.assignee,
    },
    personStatuses: clearPersonStatusSlot(state.personStatuses, itemId, person),
  };

  if (taskKind === "carrier") {
    next = {
      ...next,
      carrierTasks: next.carrierTasks.map((task) =>
        task.id === itemId ? { ...task, assignee: patch.assignee } : task,
      ),
    };
  }

  const flagsKey =
    taskKind === "carrier" ? "carrierCatriaTaskFlags" : "submissionCatriaTaskFlags";
  if (patch.catriaTaskFlags) {
    next = {
      ...next,
      [flagsKey]: {
        ...next[flagsKey],
        [itemId]: { ...next[flagsKey][itemId], ...patch.catriaTaskFlags },
      },
    };
  }

  if (patch.clearPrep) {
    const doneKey = taskKind === "carrier" ? "carrierTaskDone" : "submissionTasks";
    next = {
      ...next,
      [doneKey]: applyBoolRecordPatch(next[doneKey], { [itemId]: false }),
    };
  }
  if (patch.clearReview) {
    const reviewKey = taskKind === "carrier" ? "carrierTaskReviewed" : "submissionTaskReviewed";
    next = {
      ...next,
      [reviewKey]: applyBoolRecordPatch(next[reviewKey], { [itemId]: false }),
    };
  }
  if (patch.clearApprove) {
    const approveKey = taskKind === "carrier" ? "carrierTaskApproved" : "submissionTaskApproved";
    next = {
      ...next,
      [approveKey]: applyBoolRecordPatch(next[approveKey], { [itemId]: false }),
    };
  }

  return next;
}

type TaskAssigneeShape = { id: string; assignee: ChecklistOwner };

function syncCarrierOrSubmissionTaskProgress(
  state: SubmissionChecklistState,
  task: TaskAssigneeShape,
  catriaTaskFlagsKey: "submissionCatriaTaskFlags" | "carrierCatriaTaskFlags",
  doneKey: "submissionTasks" | "carrierTaskDone",
  reviewedKey: "submissionTaskReviewed" | "carrierTaskReviewed",
  approvedKey: "submissionTaskApproved" | "carrierTaskApproved",
): SubmissionChecklistState {
  const assignee = getSubmissionTaskAssignee(task, state.submissionTaskAssignees);
  const flags = getCatriaTaskFlags(task.id, state[catriaTaskFlagsKey]);
  return syncItemProgressFromCheckboxes(state, task.id, {
    flags,
    showPrep: submissionTaskShowsPrep(task, assignee),
    showCatria: submissionTaskShowsCatria(task, assignee, state[catriaTaskFlagsKey]),
    prepDone: !!state[doneKey][task.id],
    catriaReviewed: !!state[reviewedKey][task.id],
    catriaApproved: !!state[approvedKey][task.id],
  });
}

/** Checkbox toggle on a submission-task row — syncs person + overall status. */
export function syncSubmissionTaskCheckboxProgress(
  state: SubmissionChecklistState,
  task: TaskAssigneeShape,
  patch: { done?: boolean; reviewed?: boolean; approved?: boolean },
): SubmissionChecklistState {
  let next: SubmissionChecklistState = { ...state };
  if (patch.done !== undefined) {
    next = { ...next, submissionTasks: { ...next.submissionTasks, [task.id]: patch.done } };
  }
  if (patch.reviewed !== undefined) {
    next = {
      ...next,
      submissionTaskReviewed: { ...next.submissionTaskReviewed, [task.id]: patch.reviewed },
    };
  }
  if (patch.approved !== undefined) {
    next = {
      ...next,
      submissionTaskApproved: { ...next.submissionTaskApproved, [task.id]: patch.approved },
    };
  }
  return syncCarrierOrSubmissionTaskProgress(
    next,
    task,
    "submissionCatriaTaskFlags",
    "submissionTasks",
    "submissionTaskReviewed",
    "submissionTaskApproved",
  );
}

/** Checkbox toggle on a carrier-task row — syncs person + overall status. */
export function syncCarrierTaskCheckboxProgress(
  state: SubmissionChecklistState,
  task: TaskAssigneeShape,
  patch: { done?: boolean; reviewed?: boolean; approved?: boolean },
): SubmissionChecklistState {
  let next: SubmissionChecklistState = { ...state };
  if (patch.done !== undefined) {
    next = { ...next, carrierTaskDone: { ...next.carrierTaskDone, [task.id]: patch.done } };
  }
  if (patch.reviewed !== undefined) {
    next = {
      ...next,
      carrierTaskReviewed: { ...next.carrierTaskReviewed, [task.id]: patch.reviewed },
    };
  }
  if (patch.approved !== undefined) {
    next = {
      ...next,
      carrierTaskApproved: { ...next.carrierTaskApproved, [task.id]: patch.approved },
    };
  }
  return syncCarrierOrSubmissionTaskProgress(
    next,
    task,
    "carrierCatriaTaskFlags",
    "carrierTaskDone",
    "carrierTaskReviewed",
    "carrierTaskApproved",
  );
}

function applyReviewPersonStatusToTaskMaps(
  state: SubmissionChecklistState,
  itemId: string,
  status: ChecklistItemStatus,
  flags: CatriaTaskFlags,
  maps: {
    reviewed: "submissionTaskReviewed" | "carrierTaskReviewed";
    approved: "submissionTaskApproved" | "carrierTaskApproved";
  },
): SubmissionChecklistState {
  let next = state;
  if (status === "done") {
    if (flags.review) {
      next = {
        ...next,
        [maps.reviewed]: { ...next[maps.reviewed], [itemId]: true },
      };
    }
    if (flags.approve) {
      next = {
        ...next,
        [maps.approved]: { ...next[maps.approved], [itemId]: true },
      };
    }
  } else if (status === "not_started") {
    if (flags.review) {
      next = {
        ...next,
        [maps.reviewed]: { ...next[maps.reviewed], [itemId]: false },
      };
    }
    if (flags.approve) {
      next = {
        ...next,
        [maps.approved]: { ...next[maps.approved], [itemId]: false },
      };
    }
  } else if (status === "in_progress" && flags.review) {
    next = {
      ...next,
      [maps.reviewed]: { ...next[maps.reviewed], [itemId]: true },
      ...(flags.approve
        ? { [maps.approved]: { ...next[maps.approved], [itemId]: false } }
        : {}),
    };
  }
  return next;
}

/** Per-person dropdown on a submission or carrier task row. */
export function setTaskRowPersonStatus(
  state: SubmissionChecklistState,
  task: TaskAssigneeShape,
  person: ChecklistPerson,
  status: ChecklistItemStatus,
  taskKind: "submission" | "carrier",
): SubmissionChecklistState {
  const catriaTaskFlagsKey =
    taskKind === "carrier" ? "carrierCatriaTaskFlags" : "submissionCatriaTaskFlags";
  const doneKey = taskKind === "carrier" ? "carrierTaskDone" : "submissionTasks";
  const reviewedKey =
    taskKind === "carrier" ? "carrierTaskReviewed" : "submissionTaskReviewed";
  const approvedKey =
    taskKind === "carrier" ? "carrierTaskApproved" : "submissionTaskApproved";
  const flags = getCatriaTaskFlags(task.id, state[catriaTaskFlagsKey]);

  let next: SubmissionChecklistState = {
    ...state,
    personStatuses: {
      ...state.personStatuses,
      [task.id]: { ...state.personStatuses[task.id], [person]: status },
    },
  };

  if (person === "prep") {
    if (status === "done" || status === "not_started") {
      next = { ...next, [doneKey]: { ...next[doneKey], [task.id]: status === "done" } };
    }
  } else {
    next = applyReviewPersonStatusToTaskMaps(next, task.id, status, flags, {
      reviewed: reviewedKey,
      approved: approvedKey,
    });
  }

  return syncCarrierOrSubmissionTaskProgress(next, task, catriaTaskFlagsKey, doneKey, reviewedKey, approvedKey);
}
