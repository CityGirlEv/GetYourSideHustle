import { describe, expect, it } from "vitest";
import {
  cmsReferenceItemCount,
  numberedCmsOfficialLinks,
  numberedCmsRequirements,
  CMS_OFFICIAL_LINKS,
  CMS_REQUIREMENTS,
} from "@/lib/cms-requirements-reference";
import {
  allSubmissionChecklistItems,
  checklistItemNumberById,
  submissionTaskNumberById,
  SUBMISSION_TASK_ITEMS,
} from "@/lib/submission-checklist-data";
import {
  mergeSubmissionChecklistStates,
  submissionChecklistNeedsServerSync,
  type SubmissionChecklistState,
} from "@/lib/submission-checklist-storage";

import { emptySubmissionChecklistTestState } from "@/lib/__tests__/submission-checklist-test-helpers";

function emptyChecklistState(overrides: Partial<SubmissionChecklistState> = {}): SubmissionChecklistState {
  return emptySubmissionChecklistTestState(overrides);
}

describe("cms-requirements-reference numbering", () => {
  it("numbers requirements and links continuously", () => {
    expect(cmsReferenceItemCount()).toBe(CMS_REQUIREMENTS.length + CMS_OFFICIAL_LINKS.length);
    const reqs = numberedCmsRequirements();
    const links = numberedCmsOfficialLinks();
    expect(reqs[0]?.number).toBe(1);
    expect(links[0]?.number).toBe(CMS_REQUIREMENTS.length + 1);
    expect(links[links.length - 1]?.number).toBe(cmsReferenceItemCount());
  });
});

describe("submission checklist numbering", () => {
  it("assigns global numbers to checklist and submission tasks", () => {
    const checklistNumbers = checklistItemNumberById();
    const all = allSubmissionChecklistItems();
    expect(checklistNumbers.get(all[0]!.id)).toBe(1);
    expect(checklistNumbers.size).toBe(all.length);

    const taskNumbers = submissionTaskNumberById();
    expect(taskNumbers.get(SUBMISSION_TASK_ITEMS[0]!.id)).toBe(1);
    expect(taskNumbers.size).toBe(SUBMISSION_TASK_ITEMS.length);
  });
});

describe("submission checklist state merge", () => {
  it("unions completed flags from server and local", () => {
    const server = emptyChecklistState({
      completed: { "fb-business-manager": true },
    });
    const local = emptyChecklistState({
      completed: { "fb-copy-review": true },
      updatedAt: "2026-07-02T00:00:00.000Z",
    });
    const merged = mergeSubmissionChecklistStates(server, local);
    expect(merged.completed["fb-business-manager"]).toBe(true);
    expect(merged.completed["fb-copy-review"]).toBe(true);
  });

  it("unions item notes from server and local", () => {
    const server = emptyChecklistState({
      itemNotes: { "fb-business-manager": "Meta case 123" },
    });
    const local = emptyChecklistState({
      itemNotes: { "fb-copy-review": "SMID pending" },
      updatedAt: "2026-07-02T00:00:00.000Z",
    });
    const merged = mergeSubmissionChecklistStates(server, local);
    expect(merged.itemNotes["fb-business-manager"]).toBe("Meta case 123");
    expect(merged.itemNotes["fb-copy-review"]).toBe("SMID pending");
  });

  it("detects when local-only progress should sync to server", () => {
    const server = emptyChecklistState({
      completed: { "fb-business-manager": true },
    });
    const local = emptyChecklistState({
      completed: { "fb-business-manager": true, "fb-copy-review": true },
      itemNotes: { "fb-copy-review": "ready for review" },
    });
    expect(submissionChecklistNeedsServerSync(server, local)).toBe(true);
  });

  it("skips sync when merged state matches server", () => {
    const server = emptyChecklistState({
      completed: { "fb-business-manager": true, "fb-copy-review": true },
      itemNotes: { "fb-copy-review": "ready for review" },
    });
    const local = emptyChecklistState({
      completed: { "fb-business-manager": true },
    });
    expect(submissionChecklistNeedsServerSync(server, local)).toBe(false);
  });

  it("syncs when server row is missing", () => {
    const local = emptyChecklistState({
      completed: { "fb-business-manager": true },
      itemNotes: { "fb-business-manager": "done" },
    });
    expect(submissionChecklistNeedsServerSync(null, local)).toBe(true);
  });
});
