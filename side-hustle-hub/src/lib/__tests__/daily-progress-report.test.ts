import { describe, expect, it } from "vitest";
import {
  activityPersonMatchesPeople,
  assigneeMatchesPeople,
  buildDailyProgressReport,
  normalizeProgressAssignee,
  progressPersonFromTimeEntry,
  resolveTaskActivityPerson,
  timeEntryMatchesPeople,
} from "../daily-progress-report";
import type { TimeEntry } from "../gysh-time-entries";
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
    updatedBy: over.updatedBy,
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

  it("still treats Both assignee as owned by Tina/Evelyn for open-count filters", () => {
    expect(assigneeMatchesPeople("Both", ["Tina"])).toBe(true);
    expect(assigneeMatchesPeople("Both", ["Evelyn"])).toBe(true);
  });
});

describe("activityPersonMatchesPeople", () => {
  it("does not attribute Both-assigned work to Tina or Evelyn without a touch", () => {
    expect(activityPersonMatchesPeople("Both", ["Tina"])).toBe(false);
    expect(activityPersonMatchesPeople("Both", ["Evelyn"])).toBe(false);
    expect(activityPersonMatchesPeople("Evelyn", ["Evelyn"])).toBe(true);
    expect(activityPersonMatchesPeople("Evelyn", ["Tina"])).toBe(false);
    expect(activityPersonMatchesPeople("Cursor", ["Tina"])).toBe(false);
  });
});

describe("timesheet person matching", () => {
  function sampleEntry(over: Partial<TimeEntry>): TimeEntry {
    return {
      id: over.id ?? "te-1",
      userId: over.userId ?? "u1",
      userEmail: over.userEmail ?? "",
      userName: over.userName ?? "",
      source: over.source ?? "task",
      sourceId: over.sourceId ?? "T-1",
      sourceLabel: over.sourceLabel ?? "T-1",
      status: over.status ?? "stopped",
      startedAt: over.startedAt ?? "2026-07-28T15:00:00.000Z",
      endedAt: over.endedAt ?? "2026-07-28T16:00:00.000Z",
      accumulatedMs: over.accumulatedMs ?? 3_600_000,
      runningSince: over.runningSince ?? null,
      workDate: over.workDate ?? "2026-07-28",
      elapsedMs: over.elapsedMs ?? 3_600_000,
      createdAt: over.createdAt ?? "2026-07-28T15:00:00.000Z",
      updatedAt: over.updatedAt ?? "2026-07-28T16:00:00.000Z",
    };
  }

  it("maps Evelyn by email even when display name omits Evelyn", () => {
    const entry = sampleEntry({
      userName: "Muntie Ev",
      userEmail: "evelyn3@cox.net",
    });
    expect(progressPersonFromTimeEntry(entry)).toBe("Evelyn");
    expect(timeEntryMatchesPeople(entry, ["Evelyn"])).toBe(true);
    expect(timeEntryMatchesPeople(entry, ["Tina"])).toBe(false);
  });

  it("keeps Evelyn hours in a week range when filtered to Evelyn", () => {
    const entries = [
      sampleEntry({
        id: "te-e",
        userName: "Muntie Ev",
        userEmail: "evelyn3@cox.net",
        workDate: "2026-07-28",
        accumulatedMs: 7_200_000,
        elapsedMs: 7_200_000,
      }),
      sampleEntry({
        id: "te-t",
        userName: "Tina Marie Barham",
        userEmail: "tinamariebarham@gmail.com",
        workDate: "2026-07-29",
        accumulatedMs: 3_600_000,
        elapsedMs: 3_600_000,
      }),
    ];
    const week = buildDailyProgressReport({
      from: "2026-07-26",
      to: "2026-08-01",
      tasks: [],
      testPayload: emptyPayload(),
      timeEntries: entries,
      people: ["Evelyn"],
    });
    expect(week.timeMs).toBe(7_200_000);
    expect(week.timeByPerson).toEqual([{ name: "Evelyn", ms: 7_200_000, label: "2.00h" }]);
  });

  it("merges duplicate Evelyn and Tina login identities into one timesheet row each", () => {
    const entries = [
      sampleEntry({
        id: "te-e1",
        userId: "auth-ev-1",
        userName: "Evelyn Irving",
        userEmail: "evelyn3@cox.net",
        workDate: "2026-07-28",
        accumulatedMs: 3_600_000,
        elapsedMs: 3_600_000,
      }),
      sampleEntry({
        id: "te-e2",
        userId: "u-ev",
        userName: "Muntie Ev",
        userEmail: "evelyn3@cox.net",
        workDate: "2026-07-28",
        accumulatedMs: 1_800_000,
        elapsedMs: 1_800_000,
      }),
      sampleEntry({
        id: "te-t1",
        userId: "auth-tina-1",
        userName: "Tina Marie Barham",
        userEmail: "tinamariebarham@gmail.com",
        workDate: "2026-07-28",
        accumulatedMs: 2_400_000,
        elapsedMs: 2_400_000,
      }),
      sampleEntry({
        id: "te-t2",
        userId: "u-tina",
        userName: "Tina",
        userEmail: "tinamariebarham@gmail.com",
        workDate: "2026-07-28",
        accumulatedMs: 600_000,
        elapsedMs: 600_000,
      }),
    ];
    const day = buildDailyProgressReport({
      from: "2026-07-28",
      to: "2026-07-28",
      tasks: [],
      testPayload: emptyPayload(),
      timeEntries: entries,
    });
    expect(day.timeByPerson.map((p) => p.name).sort()).toEqual(["Evelyn", "Tina"]);
    expect(day.timeByPerson.find((p) => p.name === "Evelyn")?.ms).toBe(5_400_000);
    expect(day.timeByPerson.find((p) => p.name === "Tina")?.ms).toBe(3_000_000);
  });
});

describe("resolveTaskActivityPerson / task activity filters", () => {
  it("attributes Both-assigned tasks to the person who updated them", () => {
    const today = "2026-07-20";
    const tasks = [
      sampleTask({
        id: "T-BOTH",
        assignedTo: "Both",
        updatedBy: "Evelyn",
        updatedAt: `${today}T14:00:00.000Z`,
      }),
      sampleTask({
        id: "T-TINA",
        assignedTo: "Both",
        updatedBy: "Tina",
        updatedAt: `${today}T15:00:00.000Z`,
      }),
    ];

    expect(resolveTaskActivityPerson(tasks[0]!)).toBe("Evelyn");

    const evelyn = buildDailyProgressReport({
      from: today,
      to: today,
      tasks,
      testPayload: emptyPayload(),
      timeEntries: [],
      people: ["Evelyn"],
    });
    expect(evelyn.tasks.map((t) => t.id)).toEqual(["T-BOTH"]);
    expect(evelyn.tasks[0]?.assignee).toBe("Evelyn → Both");

    const tina = buildDailyProgressReport({
      from: today,
      to: today,
      tasks,
      testPayload: emptyPayload(),
      timeEntries: [],
      people: ["Tina"],
    });
    expect(tina.tasks.map((t) => t.id)).toEqual(["T-TINA"]);
  });

  it("does not guess Both-assigned legacy tasks with no updated_by", () => {
    const today = "2026-07-20";
    const tasks = [
      sampleTask({
        id: "T-LEGACY",
        assignedTo: "Both",
        updatedAt: `${today}T14:00:00.000Z`,
        updatedBy: undefined,
      }),
    ];
    expect(resolveTaskActivityPerson(tasks[0]!)).toBe("Unassigned");

    const evelyn = buildDailyProgressReport({
      from: today,
      to: today,
      tasks,
      testPayload: emptyPayload(),
      timeEntries: [],
      people: ["Evelyn"],
    });
    expect(evelyn.tasks).toHaveLength(0);
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
      updatedBy: {
        "QA-1": "Tina",
        "QA-2": "Evelyn",
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

  it("attributes tests to updated_by, not Cursor reassignment to Lyriq", () => {
    const today = "2026-07-26";
    const testPayload = emptyPayload({
      statuses: {
        "PROOF-046-LYRIQ": "fixed_cursor",
        "PROOF-001": "pass",
      },
      assignees: {
        "PROOF-046-LYRIQ": "lyriq",
        "PROOF-001": "lyriq",
      },
      updatedAt: {
        "PROOF-046-LYRIQ": `${today}T12:00:00.000Z`,
        "PROOF-001": `${today}T13:00:00.000Z`,
      },
      updatedBy: {
        "PROOF-046-LYRIQ": "Cursor",
        "PROOF-001": "Lyriq",
      },
    });

    const lyriq = buildDailyProgressReport({
      from: today,
      to: today,
      tasks: [],
      testPayload,
      timeEntries: [],
      people: ["Lyriq"],
    });
    expect(lyriq.tests.map((t) => t.id)).toEqual(["PROOF-001"]);
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
