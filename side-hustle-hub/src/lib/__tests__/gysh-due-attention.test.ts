import { describe, expect, it } from "vitest";
import { dueAttentionTests, isTestOverdue } from "../gysh-due-attention";
import type { TestStatusesPayload } from "../gysh-test-plan";

function emptyPayload(partial: Partial<TestStatusesPayload> = {}): TestStatusesPayload {
  return {
    statuses: {},
    notes: {},
    assignees: {},
    sprints: {},
    dueDates: {},
    checkedSteps: {},
    failedStepIndex: {},
    assignedBy: {},
    dateAssigned: {},
    updatedAt: {},
    updatedBy: {},
    attachments: {},
    generatedCases: [],
    ...partial,
  };
}

describe("gysh-due-attention", () => {
  it("treats due dates before today as overdue for open statuses only", () => {
    const today = new Date(2026, 6, 20);
    expect(isTestOverdue("07/19/26", "not_run", today)).toBe(true);
    expect(isTestOverdue("07/20/26", "not_run", today)).toBe(false);
    expect(isTestOverdue("07/19/26", "pass", today)).toBe(false);
  });

  it("scopes overdue tests to the partner assignee", () => {
    const payload = emptyPayload({
      statuses: { "GEN-OVERDUE-E": "not_run", "GEN-OVERDUE-T": "not_run" },
      assignees: { "GEN-OVERDUE-E": "evelyn", "GEN-OVERDUE-T": "tina" },
      dueDates: { "GEN-OVERDUE-E": "07/01/26", "GEN-OVERDUE-T": "07/01/26" },
      generatedCases: [
        {
          id: "GEN-OVERDUE-E",
          area: "Test",
          title: "Evelyn overdue case",
          priority: "P1",
          suite: "manual",
          steps: ["step"],
          expected: "ok",
          failureDetail: "",
          fixSteps: [],
          severity: "P1",
          sourceFile: "test",
        },
        {
          id: "GEN-OVERDUE-T",
          area: "Test",
          title: "Tina overdue case",
          priority: "P1",
          suite: "manual",
          steps: ["step"],
          expected: "ok",
          failureDetail: "",
          fixSteps: [],
          severity: "P1",
          sourceFile: "test",
        },
      ],
    });

    const evelynIds = dueAttentionTests(payload, "Evelyn").overdue.map((t) => t.id);
    const tinaIds = dueAttentionTests(payload, "Tina").overdue.map((t) => t.id);

    expect(evelynIds).toContain("GEN-OVERDUE-E");
    expect(evelynIds).not.toContain("GEN-OVERDUE-T");
    expect(tinaIds).toContain("GEN-OVERDUE-T");
    expect(tinaIds).not.toContain("GEN-OVERDUE-E");
  });
});

