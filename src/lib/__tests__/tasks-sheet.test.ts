import { describe, it, expect, beforeEach, vi } from "vitest";

// Stub the cloud-sync dynamic import so saveTaskRows doesn't try to hit the network.
vi.mock("@/lib/cloud-sync", () => ({
  cloudPushAllTasks: vi.fn().mockResolvedValue(undefined),
  cloudPushTest: vi.fn().mockResolvedValue(undefined),
  cloudAppendNote: vi.fn().mockResolvedValue(undefined),
}));

import {
  SEED_TASK_ROWS,
  TASKS_STORAGE_KEY,
  loadTaskRows,
  saveTaskRows,
  resetTaskRows,
  nextTaskId,
  todayMMDDYY,
  type TaskRow,
} from "../tasks-sheet";

beforeEach(() => {
  localStorage.clear();
});

describe("loadTaskRows / saveTaskRows", () => {
  it("returns seed rows when storage is empty", () => {
    const rows = loadTaskRows();
    expect(rows.length).toBe(SEED_TASK_ROWS.length);
  });
  it("round-trips through localStorage", () => {
    const trimmed = SEED_TASK_ROWS.slice(0, 1);
    saveTaskRows(trimmed);
    expect(JSON.parse(localStorage.getItem(TASKS_STORAGE_KEY)!).length).toBe(1);
  });
  it("normalizes legacy owner names on load", () => {
    const legacy: TaskRow = { ...SEED_TASK_ROWS[0], assignedTo: "Me", assignBy: "Design" };
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify([legacy]));
    const [row] = loadTaskRows();
    expect(row.assignedTo).toBe("Evelyn");
    expect(row.assignBy).toBe("Eng");
  });
  it("falls back to seed when JSON is corrupt", () => {
    localStorage.setItem(TASKS_STORAGE_KEY, "{{");
    expect(loadTaskRows().length).toBe(SEED_TASK_ROWS.length);
  });
});

describe("resetTaskRows", () => {
  it("clears storage and returns seed rows", () => {
    localStorage.setItem(TASKS_STORAGE_KEY, "[]");
    const rows = resetTaskRows();
    expect(localStorage.getItem(TASKS_STORAGE_KEY)).toBeNull();
    expect(rows.length).toBe(SEED_TASK_ROWS.length);
  });
});

describe("nextTaskId", () => {
  it("returns T-001 for an empty list", () => {
    expect(nextTaskId([])).toBe("T-001");
  });
  it("returns max+1 padded to 3 digits", () => {
    const rows = [
      { ...SEED_TASK_ROWS[0], id: "T-007" },
      { ...SEED_TASK_ROWS[0], id: "T-012" },
    ];
    expect(nextTaskId(rows)).toBe("T-013");
  });
});

describe("todayMMDDYY", () => {
  it("matches MM/DD/YY format", () => {
    expect(todayMMDDYY()).toMatch(/^\d{2}\/\d{2}\/\d{2}$/);
  });
});