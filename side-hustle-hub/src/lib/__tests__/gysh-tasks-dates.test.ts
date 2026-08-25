import { describe, expect, it } from "vitest";
import {
  ensureScheduleBlockStatusQaTasks,
  isoToMmddyy,
  mmddyyToIso,
  tomorrowMMDDYY,
  SCHEDULE_SUITE_QA_CASE_IDS,
} from "../gysh-tasks";
import { TEST_CASES } from "../gysh-test-plan";

describe("task due date calendar helpers", () => {
  it("converts MM/DD/YY to ISO for date inputs", () => {
    expect(mmddyyToIso("07/16/26")).toBe("2026-07-16");
    expect(mmddyyToIso("")).toBe("");
    expect(mmddyyToIso("bad")).toBe("");
  });

  it("converts ISO from date picker to MM/DD/YY", () => {
    expect(isoToMmddyy("2026-07-16")).toBe("07/16/26");
    expect(isoToMmddyy("")).toBe("");
    expect(isoToMmddyy("not-a-date")).toBe(null);
  });

  it("round-trips", () => {
    expect(isoToMmddyy(mmddyyToIso("12/01/26"))).toBe("12/01/26");
  });

  it("tomorrowMMDDYY advances one local calendar day", () => {
    expect(tomorrowMMDDYY(new Date(2026, 7, 21))).toBe("08/22/26");
  });
});

describe("Schedule Suite QA is Testing Portal cases (not Task List)", () => {
  it("does not create Task List rows for Schedule Suite QA", () => {
    const first = ensureScheduleBlockStatusQaTasks([]);
    expect(first.created).toHaveLength(0);
    expect(first.tasks).toHaveLength(0);
    expect(first.removeIds).toHaveLength(0);
  });

  it("removes leftover T-SCHED-* Task List rows", () => {
    const leftover = {
      id: "T-SCHED-GRADE-01",
      description: "QA leftover",
      category: "website" as const,
      priority: "P1" as const,
      status: "not_started" as const,
      assignBy: "Evelyn",
      assignedTo: "Lyriq" as const,
      dateAssigned: "08/21/26",
      dueDate: "08/22/26",
      dateCompleted: "",
      notes: "",
      sprint: 3,
      tinaDone: false,
      evelynDone: false,
      attachments: [],
    };
    const out = ensureScheduleBlockStatusQaTasks([leftover]);
    expect(out.removeIds).toEqual(["T-SCHED-GRADE-01"]);
    expect(out.tasks).toHaveLength(0);
  });

  it("catalog has Lyriq Schedule Suite tests with detailed steps and no related tasks", () => {
    expect(SCHEDULE_SUITE_QA_CASE_IDS.length).toBe(7);
    for (const id of SCHEDULE_SUITE_QA_CASE_IDS) {
      const t = TEST_CASES.find((c) => c.id === id);
      expect(t, id).toBeTruthy();
      expect(t!.assignees).toEqual(["lyriq"]);
      expect(t!.suite).toBe("manual");
      expect(t!.steps.length).toBeGreaterThanOrEqual(4);
      expect(t!.relatedTaskIds ?? []).toEqual([]);
      expect(t!.expected.length).toBeGreaterThan(20);
    }
    const grade = TEST_CASES.find((c) => c.id === "SCHED-GRADE-001");
    expect(grade?.steps.join(" ")).toMatch(/GRADING SCALE/i);
    expect(grade?.steps.join(" ")).toMatch(/A\+/);
  });
});
