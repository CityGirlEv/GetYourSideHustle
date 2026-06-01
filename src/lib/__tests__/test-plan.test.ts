import { describe, it, expect, beforeEach, vi } from "vitest";

vi.mock("@/lib/cloud-sync", () => ({
  cloudPushTest: vi.fn().mockResolvedValue(undefined),
  cloudAppendNote: vi.fn().mockResolvedValue(undefined),
}));

import {
  TEST_CASES,
  TEST_OWNERS,
  TEST_STATUS_KEY,
  TEST_QA_NOTE_KEY,
  TEST_DEV_NOTE_KEY,
  TEST_QA_NOTE_AUTHOR_KEY,
  TEST_DEV_NOTE_AUTHOR_KEY,
  TEST_SEVERITY_KEY,
  loadStatus,
  saveStatus,
  loadAllStatuses,
  loadQaNote,
  loadAllQaNotes,
  saveQaNote,
  loadDevNote,
  loadAllDevNotes,
  saveDevNote,
  loadSeverity,
  loadAllSeverities,
  saveSeverity,
  loadAllAssigneeOverrides,
  saveAssigneeOverride,
  PRIORITY_LABELS,
  PRIORITY_SHORT,
  FAIL_SEVERITY_LABELS,
  getTestSprintId,
  BACKLOG_SPRINT_ID,
  ACTIVE_SPRINT_ID,
  SPRINTS,
  saveSprintOverride,
  loadQaNoteAuthor,
  saveQaNoteAuthor,
  loadDevNoteAuthor,
  saveDevNoteAuthor,
  loadAllQaNoteAuthors,
  loadAllDevNoteAuthors,
} from "../test-plan";

beforeEach(() => {
  localStorage.clear();
});

describe("storage keys", () => {
  it("format ids predictably", () => {
    expect(TEST_STATUS_KEY("T-1")).toBe("test-status:T-1");
    expect(TEST_QA_NOTE_KEY("T-1")).toBe("test-qa-note:T-1");
    expect(TEST_DEV_NOTE_KEY("T-1")).toBe("test-dev-note:T-1");
    expect(TEST_SEVERITY_KEY("T-1")).toBe("test-severity:T-1");
  });
});

describe("status persistence", () => {
  it("defaults to not_run", () => {
    expect(loadStatus("Z-999")).toBe("not_run");
  });
  it("round-trips through localStorage", () => {
    saveStatus("Z-1", "pass");
    expect(loadStatus("Z-1")).toBe("pass");
  });
  it("supports the in_progress status", () => {
    saveStatus("Z-2", "in_progress");
    expect(loadStatus("Z-2")).toBe("in_progress");
  });
  it("loadAllStatuses returns an entry per TEST_CASES id", () => {
    const m = loadAllStatuses();
    expect(Object.keys(m).length).toBe(TEST_CASES.length);
  });
  it("loadAllStatuses includes platform variant ids restored from cloud/localStorage", () => {
    saveStatus("AUTH-001-COMP", "pass", { syncCloud: false });
    expect(loadAllStatuses()["AUTH-001-COMP"]).toBe("pass");
  });
});

describe("QA + dev notes", () => {
  it("round-trips QA notes and removes empty values", () => {
    saveQaNote("Z-1", "bad button");
    expect(loadQaNote("Z-1")).toBe("bad button");
    saveQaNote("Z-1", "");
    expect(loadQaNote("Z-1")).toBe("");
    expect(localStorage.getItem(TEST_QA_NOTE_KEY("Z-1"))).toBeNull();
  });
  it("round-trips dev notes", () => {
    saveDevNote("Z-1", "retested");
    expect(loadDevNote("Z-1")).toBe("retested");
  });
  it("bulk note loaders include platform variant ids restored from cloud/localStorage", () => {
    saveQaNote("VOICE-001-IPAD", "mic issue", { syncCloud: false });
    saveDevNote("VOICE-001-IPAD", "patched", { syncCloud: false });
    expect(loadAllQaNotes()["VOICE-001-IPAD"]).toBe("mic issue");
    expect(loadAllDevNotes()["VOICE-001-IPAD"]).toBe("patched");
  });
});

describe("severity", () => {
  it("round-trips and clears", () => {
    saveSeverity("Z-1", "high");
    expect(loadSeverity("Z-1")).toBe("high");
    saveSeverity("Z-1", "");
    expect(loadSeverity("Z-1")).toBe("");
  });
  it("loadAllSeverities includes platform variant ids restored from cloud/localStorage", () => {
    saveSeverity("INTAKE-001-IOS", "medium", { syncCloud: false });
    expect(loadAllSeverities()["INTAKE-001-IOS"]).toBe("medium");
  });
});

describe("assignee overrides", () => {
  it("loads platform-variant assignee overrides from localStorage", () => {
    saveAssigneeOverride("AUTH-004-IOS", "Evelyn");
    expect(loadAllAssigneeOverrides()["AUTH-004-IOS"]).toBe("Evelyn");
  });
});

describe("constants", () => {
  it("TEST_OWNERS is non-empty", () => {
    expect(TEST_OWNERS.length).toBeGreaterThan(0);
  });
  it("priority labels cover all priorities", () => {
    for (const p of ["P0", "P1", "P2", "P3"] as const) {
      expect(PRIORITY_LABELS[p]).toBeTruthy();
      expect(PRIORITY_SHORT[p]).toBeTruthy();
    }
  });
  it("fail severity labels cover all severities", () => {
    for (const s of ["high", "medium", "low"] as const) {
      expect(FAIL_SEVERITY_LABELS[s]).toBeTruthy();
    }
  });
  it("TEST_CASES have unique ids", () => {
    const ids = TEST_CASES.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("sprint routing", () => {
  it("SPRINTS includes a Backlog entry", () => {
    expect(SPRINTS.some((s) => s.id === BACKLOG_SPRINT_ID)).toBe(true);
  });
  it("Unassigned tests with no explicit sprint default to Backlog", () => {
    const t = { id: "X-1", area: "X", title: "x", priority: "P2", steps: [], expected: "", assignee: "Unassigned" } as any;
    expect(getTestSprintId(t)).toBe(BACKLOG_SPRINT_ID);
  });
  it("owned tests default to the active sprint", () => {
    const t = { id: "X-2", area: "X", title: "x", priority: "P2", steps: [], expected: "", assignee: "Catria" } as any;
    expect(getTestSprintId(t)).toBe(ACTIVE_SPRINT_ID);
  });
  it("explicit sprintId wins over the unassigned->backlog fallback", () => {
    const t = { id: "X-3", area: "X", title: "x", priority: "P2", steps: [], expected: "", assignee: "Unassigned", sprintId: ACTIVE_SPRINT_ID } as any;
    expect(getTestSprintId(t)).toBe(ACTIVE_SPRINT_ID);
  });
  it("user override wins over everything", () => {
    const t = { id: "X-4", area: "X", title: "x", priority: "P2", steps: [], expected: "", assignee: "Unassigned" } as any;
    saveSprintOverride("X-4", ACTIVE_SPRINT_ID);
    expect(getTestSprintId(t)).toBe(ACTIVE_SPRINT_ID);
  });
  it("real unassigned test cases (NOTIF-*, EMAIL-001) route to Backlog", () => {
    const ids = ["NOTIF-001", "NOTIF-002", "NOTIF-003", "NOTIF-004", "EMAIL-001"];
    for (const id of ids) {
      const t = TEST_CASES.find((x) => x.id === id)!;
      expect(t).toBeTruthy();
      expect(getTestSprintId(t)).toBe(BACKLOG_SPRINT_ID);
    }
  });
});