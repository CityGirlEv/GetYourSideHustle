import type { SubmissionChecklistState } from "@/lib/submission-checklist-storage";

export function emptySubmissionChecklistTestState(
  overrides: Partial<SubmissionChecklistState> = {},
): SubmissionChecklistState {
  return {
    completed: {},
    catriaReviewed: {},
    catriaApproved: {},
    catriaTaskFlags: {},
    itemAssignees: {},
    submissionTaskAssignees: {},
    itemStatuses: {},
    personStatuses: {},
    itemNotes: {},
    sectionNotes: {},
    submissionTasks: {},
    submissionTaskReviewed: {},
    submissionTaskApproved: {},
    submissionCatriaTaskFlags: {},
    submissionTaskNotes: {},
    carrierTasks: [],
    carrierOriginalTasks: [],
    carrierTaskDone: {},
    carrierTaskReviewed: {},
    carrierTaskApproved: {},
    carrierCatriaTaskFlags: {},
    carrierTaskNotes: {},
    carrierUploads: [],
    metaAdConformanceRecords: [],
    updatedAt: "2026-07-01T00:00:00.000Z",
    ...overrides,
  };
}
