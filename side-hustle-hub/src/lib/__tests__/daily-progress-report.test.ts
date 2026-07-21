import { describe, expect, it } from "vitest";
import {
  assigneeMatchesPeople,
  buildDailyProgressReport,
  normalizeProgressAssignee,
} from "../daily-progress-report";
import { BACKLOG_SPRINT } from "../gysh-sprints";
import type { GyshTask } from "../gysh-tasks";
import type { TestStatusesPayload } from "../gysh-test-plan";

function sampleTask(over: Partial<GyshTask> & Pick<GyshTask, "id">): GyshTask {
  return {
    id: over.id,
    description: over.description ?? over.id,
    category: over.category ?? "website",
    priority: over.priority ?? "P2",
    status: over.status ?? "in_progress",
    assignBy: over.assignBy ?? "Tina",
    assignedTo: over.assignedTo ?? "Tina",
    dateAssigned: over.dateAssigned ?? "07/20/26",
    dueDate: over.dueDate ?? "",
    dateCompleted: over.dateCompleted ?? "",
    notes: over.notes ?? "",
    sprint: over.sprint ?? 0,
    tinaDone: over.tinaDone ?? false,
    evelynDone: over.evelynDone ?? false,
    updatedAt: over.updatedAt ?? "2026-07-20T12:00:00.000Z",
    attachments: over.attachments ?? [],
  };
}

function emptyPayload(over: Partial<TestStatusesPayload> = {}): TestStatusesPayload {
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
    ...over,
  };
}

describe("normalizeProgressAssignee", () => {
  it("maps Testing Portal owner ids to partner display names", () => {
    expect(normalizeProgressAssignee("tina")).toBe("Tina");
    expect(normalizeProgressAssignee("evelyn")).toBe("Evelyn");
    expect(normalizeProgressAssignee("lyriq")).toBe("Lyriq");
  });

  it("keeps task-style labels", () => {
    expect(normalizeProgressAssignee("Tina")).toBe("Tina");
    expect(normalizeProgressAssignee("Both")).toBe("Both");
    expect(normalizeProgressAssignee("")).toBe("Unassigned");
  });
});

describe("assigneeMatchesPeople with test owners", () => {
  it("matches lowercase test assignees to individual filters", () => {
    expect(assigneeMatchesPeople("tina", ["Tina"])).toBe(true);
    expect(assigneeMatchesPeople("evelyn", ["Evelyn"])).toBe(true);
    expect(assigneeMatchesPeople("lyriq", ["Lyriq"])).toBe(true);
    expect(assigneeMatchesPeople("tina", ["Evelyn"])).toBe(false);
  });
});

describe("buildDailyProgressReport tests touched", () => {
  it("counts tests touched for an individual when assignee is stored as tina", () => {
    const today = "2026-07-20";
    const tasks: GyshTask[] = [];
    const testPayload = emptyPayload({
      statuses: { "QA-1": "pass", "QA-2": "in_progress" },
      assignees: { "QA-1": "tina", "QA-2": "evelyn" },
      updatedAt: {
        "QA-1": `${today}T15:00:00.000Z`,
        "QA-2": `${today}T16:00:00.000Z`,
      },
    });

    const tina = buildDailyProgressReport({
      from: today,
      to: today,
      tasks,
      testPayload,
      timeEntries: [],
      people: ["Tina"],
    });
    expect(tina.tests).toHaveLength(1);
    expect(tina.tests[0]?.id).toBe("QA-1");
    expect(tina.tests[0]?.assignee).toBe("Tina");
    expect(tina.testBuckets.some((b) => b.status === "pass" && b.count === 1)).toBe(true);

    const evelyn = buildDailyProgressReport({
      from: today,
      to: today,
      tasks,
      testPayload,
      timeEntries: [],
      people: ["Evelyn"],
    });
    expect(evelyn.tests).toHaveLength(1);
    expect(evelyn.tests[0]?.id).toBe("QA-2");
  });
});

describe("buildDailyProgressReport sprint / status / sort", () => {
  const today = "2026-07-20";

  it("filters tasks and tests by sprint", () => {
    const tasks = [
      sampleTask({ id: "T-001", sprint: 0, status: "in_progress" }),
      sampleTask({ id: "T-002", sprint: 1, status: "blocked" }),
      sampleTask({ id: "T-003", sprint: BACKLOG_SPRINT, status: "not_started" }),
    ];
    const testPayload = emptyPayload({
      statuses: { "QA-1": "pass", "QA-2": "fail" },
      sprints: { "QA-1": 0, "QA-2": BACKLOG_SPRINT },
      assignees: { "QA-1": "tina", "QA-2": "evelyn" },
      updatedAt: {
        "QA-1": `${today}T15:00:00.000Z`,
        "QA-2": `${today}T16:00:00.000Z`,
      },
    });

    const sprint0 = buildDailyProgressReport({
      from: today,
      to: today,
      tasks,
      testPayload,
      timeEntries: [],
      sprints: [0],
    });
    expect(sprint0.tasks.map((t) => t.id)).toEqual(["T-001"]);
    expect(sprint0.tests.map((t) => t.id)).toEqual(["QA-1"]);
    expect(sprint0.viewLabel).toContain("Sprint 0");

    const backlog = buildDailyProgressReport({
      from: today,
      to: today,
      tasks,
      testPayload,
      timeEntries: [],
      sprints: ["backlog"],
    });
    expect(backlog.tasks.map((t) => t.id)).toEqual(["T-003"]);
    expect(backlog.tests.map((t) => t.id)).toEqual(["QA-2"]);
  });

  it("filters by unified status and sorts by sprint / status", () => {
    const tasks = [
      sampleTask({ id: "T-010", sprint: 1, status: "done" }),
      sampleTask({ id: "T-002", sprint: 0, status: "in_progress" }),
      sampleTask({ id: "T-003", sprint: 0, status: "blocked" }),
    ];
    const testPayload = emptyPayload({
      statuses: { "QA-9": "pass", "QA-1": "in_progress", "QA-2": "fail" },
      sprints: { "QA-9": 1, "QA-1": 0, "QA-2": 0 },
      updatedAt: {
        "QA-9": `${today}T10:00:00.000Z`,
        "QA-1": `${today}T11:00:00.000Z`,
        "QA-2": `${today}T12:00:00.000Z`,
      },
    });

    const inProgress = buildDailyProgressReport({
      from: today,
      to: today,
      tasks,
      testPayload,
      timeEntries: [],
      statuses: ["in_progress"],
    });
    expect(inProgress.tasks.map((t) => t.id)).toEqual(["T-002"]);
    expect(inProgress.tests.map((t) => t.id)).toEqual(["QA-1"]);

    const bySprint = buildDailyProgressReport({
      from: today,
      to: today,
      tasks,
      testPayload,
      timeEntries: [],
      sortBy: "sprint",
    });
    expect(bySprint.tasks.map((t) => t.id)).toEqual(["T-002", "T-003", "T-010"]);
    expect(bySprint.tests.map((t) => t.id)).toEqual(["QA-1", "QA-2", "QA-9"]);

    const byStatus = buildDailyProgressReport({
      from: today,
      to: today,
      tasks,
      testPayload,
      timeEntries: [],
      sortBy: "status",
    });
    expect(byStatus.tasks.map((t) => t.id)).toEqual(["T-002", "T-003", "T-010"]);
    expect(byStatus.tests.map((t) => t.id)).toEqual(["QA-1", "QA-2", "QA-9"]);
  });
});
