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
  saveQaNoteMeta,
  saveDevNoteMeta,
  loadQaNoteMeta,
  loadDevNoteMeta,
  loadAllQaNoteMeta,
  loadAllDevNoteMeta,
} from "../test-plan";
import { isIncomeBand, parseIncomeBandFromDemographics } from "../income-bands";

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
  it("author keys are formatted predictably", () => {
    expect(TEST_QA_NOTE_AUTHOR_KEY("T-1")).toBe("test-qa-note-author:T-1");
    expect(TEST_DEV_NOTE_AUTHOR_KEY("T-1")).toBe("test-dev-note-author:T-1");
  });
});

describe("note author tracking", () => {
  it("round-trips QA note author", () => {
    saveQaNoteAuthor("Z-1", "user-a");
    expect(loadQaNoteAuthor("Z-1")).toBe("user-a");
    saveQaNoteAuthor("Z-1", null);
    expect(loadQaNoteAuthor("Z-1")).toBeNull();
  });
  it("round-trips dev note author", () => {
    saveDevNoteAuthor("Z-1", "user-b");
    expect(loadDevNoteAuthor("Z-1")).toBe("user-b");
    saveDevNoteAuthor("Z-1", null);
    expect(loadDevNoteAuthor("Z-1")).toBeNull();
  });
  it("bulk author loaders include platform variants", () => {
    saveQaNoteAuthor("VOICE-001-IPAD", "qa-1");
    saveDevNoteAuthor("VOICE-001-IPAD", "dev-1");
    expect(loadAllQaNoteAuthors()["VOICE-001-IPAD"]).toBe("qa-1");
    expect(loadAllDevNoteAuthors()["VOICE-001-IPAD"]).toBe("dev-1");
  });
});

describe("note meta (author name + timestamp)", () => {
  const meta = { author_id: "user-a", author_name: "Jane Doe", at: "2026-06-09T20:12:00Z" };

  it("round-trips QA note meta", () => {
    saveQaNoteMeta("Z-1", meta);
    expect(loadQaNoteMeta("Z-1")).toEqual(meta);
    expect(loadQaNoteAuthor("Z-1")).toBe("user-a");
    saveQaNoteMeta("Z-1", null);
    expect(loadQaNoteMeta("Z-1")).toBeNull();
  });
  it("round-trips dev note meta", () => {
    saveDevNoteMeta("Z-1", meta);
    expect(loadDevNoteMeta("Z-1")).toEqual(meta);
    saveDevNoteMeta("Z-1", null);
    expect(loadDevNoteMeta("Z-1")).toBeNull();
  });
  it("bulk meta loaders include platform variants", () => {
    saveQaNoteMeta("VOICE-001-IPAD", meta);
    saveDevNoteMeta("VOICE-001-IPAD", { ...meta, author_id: "dev-1", author_name: "Dev User" });
    expect(loadAllQaNoteMeta()["VOICE-001-IPAD"]).toEqual(meta);
    expect(loadAllDevNoteMeta()["VOICE-001-IPAD"]?.author_name).toBe("Dev User");
  });
  it("returns legacy meta for text-only notes without author keys", () => {
    saveQaNote("Z-legacy", "old note text", { syncCloud: false });
    expect(loadQaNoteMeta("Z-legacy")).toEqual({
      author_id: "",
      author_name: "Legacy note",
      at: "",
    });
    expect(loadAllQaNoteMeta()["Z-legacy"]?.author_name).toBe("Legacy note");
    saveQaNote("Z-legacy", "", { syncCloud: false });
    expect(loadQaNoteMeta("Z-legacy")).toBeNull();
  });
  it("uses Unknown author when author id exists but name is missing", () => {
    saveQaNoteAuthor("Z-2", "user-a");
    saveQaNote("Z-2", "note body", { syncCloud: false });
    expect(loadQaNoteMeta("Z-2")?.author_name).toBe("Unknown author");
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
  it("no test step is a bare wizard step label", () => {
    const bareStepLabel = /^(?:Go to )?Step [0-9]+$/;
    for (const t of TEST_CASES) {
      for (const step of t.steps) {
        expect(step, `${t.id}: "${step}"`).not.toMatch(bareStepLabel);
      }
    }
  });
  it("SCEN-QA scenario tests use wizard-selectable income bands", () => {
    const scenTests = TEST_CASES.filter(
      (t) => t.id.startsWith("SCEN-QA-") && t.steps.some((s) => /income band =/i.test(s)),
    );
    expect(scenTests.length).toBeGreaterThan(0);
    for (const t of scenTests) {
      const demoStep = t.steps.find((s) => /income band =/i.test(s));
      expect(demoStep, `${t.id} missing income band step`).toBeTruthy();
      const band = parseIncomeBandFromDemographics(demoStep!);
      expect(band, `${t.id} could not parse income band`).toBeTruthy();
      expect(isIncomeBand(band!), `${t.id} uses invalid band: ${band}`).toBe(true);
    }
  });
});

describe("sprint routing", () => {
  it("SPRINTS includes a Backlog entry", () => {
    expect(SPRINTS.some((s) => s.id === BACKLOG_SPRINT_ID)).toBe(true);
  });
  it("Unassigned tests with no explicit sprint default to Backlog", () => {
    const t = {
      id: "X-1",
      area: "X",
      title: "x",
      priority: "P2",
      steps: [],
      expected: "",
      assignee: "Unassigned",
    } as any;
    expect(getTestSprintId(t)).toBe(BACKLOG_SPRINT_ID);
  });
  it("owned tests default to the active sprint", () => {
    const t = {
      id: "X-2",
      area: "X",
      title: "x",
      priority: "P2",
      steps: [],
      expected: "",
      assignee: "Catria",
    } as any;
    expect(getTestSprintId(t)).toBe(ACTIVE_SPRINT_ID);
  });
  it("explicit sprintId wins over the unassigned->backlog fallback", () => {
    const t = {
      id: "X-3",
      area: "X",
      title: "x",
      priority: "P2",
      steps: [],
      expected: "",
      assignee: "Unassigned",
      sprintId: ACTIVE_SPRINT_ID,
    } as any;
    expect(getTestSprintId(t)).toBe(ACTIVE_SPRINT_ID);
  });
  it("user override wins over everything", () => {
    const t = {
      id: "X-4",
      area: "X",
      title: "x",
      priority: "P2",
      steps: [],
      expected: "",
      assignee: "Unassigned",
    } as any;
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
