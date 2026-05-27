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
  TEST_SEVERITY_KEY,
  loadStatus,
  saveStatus,
  loadAllStatuses,
  loadQaNote,
  saveQaNote,
  loadDevNote,
  saveDevNote,
  loadSeverity,
  saveSeverity,
  PRIORITY_LABELS,
  PRIORITY_SHORT,
  FAIL_SEVERITY_LABELS,
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
  it("loadAllStatuses returns an entry per TEST_CASES id", () => {
    const m = loadAllStatuses();
    expect(Object.keys(m).length).toBe(TEST_CASES.length);
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
});

describe("severity", () => {
  it("round-trips and clears", () => {
    saveSeverity("Z-1", "high");
    expect(loadSeverity("Z-1")).toBe("high");
    saveSeverity("Z-1", "");
    expect(loadSeverity("Z-1")).toBe("");
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