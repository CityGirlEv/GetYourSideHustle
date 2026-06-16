import { describe, it, expect, beforeEach } from "vitest";
import {
  loadTaskRows,
  saveTaskRows,
  resetTaskRows,
  nextTaskId,
  todayMMDDYY,
  SEED_TASK_ROWS,
  TASKS_STORAGE_KEY,
} from "@/lib/tasks-sheet";

beforeEach(() => {
  localStorage.clear();
});

describe("tasks-sheet storage + helpers", () => {
  it("loadTaskRows returns seed when no localStorage entry", () => {
    expect(loadTaskRows().length).toBe(SEED_TASK_ROWS.length);
  });

  it("loadTaskRows normalizes legacy owner names (Me→Evelyn, Design/Dev→Eng)", () => {
    const rows = [{ ...SEED_TASK_ROWS[0], assignedTo: "Me", assignBy: "Design" }];
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(rows));
    const loaded = loadTaskRows();
    expect(loaded[0].assignedTo).toBe("Evelyn");
    expect(loaded[0].assignBy).toBe("Eng");
  });

  it("loadTaskRows falls back to seed when JSON is corrupt", () => {
    localStorage.setItem(TASKS_STORAGE_KEY, "{not json");
    expect(loadTaskRows().length).toBe(SEED_TASK_ROWS.length);
  });

  it("loadTaskRows falls back to seed when payload is not an array", () => {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify({ foo: 1 }));
    expect(loadTaskRows().length).toBe(SEED_TASK_ROWS.length);
  });

  it("saveTaskRows + loadTaskRows round-trips edits", () => {
    const edited = [{ ...SEED_TASK_ROWS[0], description: "edited" }];
    saveTaskRows(edited);
    expect(loadTaskRows()[0].description).toBe("edited");
  });

  it("resetTaskRows clears localStorage and returns the seed", () => {
    saveTaskRows([{ ...SEED_TASK_ROWS[0], description: "x" }]);
    expect(localStorage.getItem(TASKS_STORAGE_KEY)).toBeTruthy();
    const fresh = resetTaskRows();
    expect(localStorage.getItem(TASKS_STORAGE_KEY)).toBeNull();
    expect(fresh.length).toBe(SEED_TASK_ROWS.length);
  });

  it("nextTaskId picks the next sequential id", () => {
    expect(nextTaskId([])).toBe("T-001");
    expect(nextTaskId([{ id: "T-001" } as never, { id: "T-099" } as never])).toBe("T-100");
    // ignores non-numeric ids
    expect(nextTaskId([{ id: "T-S0-1" } as never])).toBe("T-002"); // S0-1 -> 01
  });

  it("todayMMDDYY returns MM/DD/YY format", () => {
    expect(todayMMDDYY()).toMatch(/^\d{2}\/\d{2}\/\d{2}$/);
  });
});
