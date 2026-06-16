import { describe, it, expect } from "vitest";
import {
  applyBulkEdit,
  bulkDelete,
  isAllSelected,
  toggleAllInSet,
  toggleInSet,
} from "@/lib/task-bulk";
import type { TaskRow } from "@/lib/tasks-sheet";

function row(id: string, overrides: Partial<TaskRow> = {}): TaskRow {
  return {
    id,
    description: `Row ${id}`,
    sprintId: "S-2026-01",
    category: "engineering",
    priority: "P2",
    status: "not_started",
    assignBy: "Evelyn",
    assignedTo: "Catria",
    dateAssigned: "01/01/26",
    dueDate: "01/15/26",
    dateCompleted: "",
    cost: 0,
    notes: "",
    path: "",
    ...overrides,
  };
}

describe("selection helpers (dropdown 'select one' / 'select all')", () => {
  it("toggleInSet adds when checked", () => {
    const out = toggleInSet(new Set(["a"]), "b", true);
    expect([...out].sort()).toEqual(["a", "b"]);
  });
  it("toggleInSet removes when unchecked", () => {
    const out = toggleInSet(new Set(["a", "b"]), "a", false);
    expect([...out]).toEqual(["b"]);
  });
  it("toggleInSet does not mutate the original set", () => {
    const original = new Set(["a"]);
    toggleInSet(original, "b", true);
    expect([...original]).toEqual(["a"]);
  });

  it("toggleAllInSet(true) selects every visible row", () => {
    expect([...toggleAllInSet(["a", "b", "c"], true)]).toEqual(["a", "b", "c"]);
  });
  it("toggleAllInSet(false) clears selection", () => {
    expect(toggleAllInSet(["a", "b"], false).size).toBe(0);
  });

  it("isAllSelected is false on an empty visible list", () => {
    expect(isAllSelected([], new Set())).toBe(false);
  });
  it("isAllSelected reflects partial selection", () => {
    expect(isAllSelected(["a", "b"], new Set(["a"]))).toBe(false);
    expect(isAllSelected(["a", "b"], new Set(["a", "b"]))).toBe(true);
  });
});

describe("applyBulkEdit", () => {
  const rows = [row("1"), row("2", { notes: "old" }), row("3")];

  it("is a no-op when nothing is selected", () => {
    expect(applyBulkEdit(rows, new Set(), { status: "done" })).toEqual(rows);
  });

  it("only modifies selected rows", () => {
    const out = applyBulkEdit(rows, new Set(["1", "3"]), { status: "in_progress" });
    expect(out[0].status).toBe("in_progress");
    expect(out[1].status).toBe("not_started"); // untouched
    expect(out[2].status).toBe("in_progress");
  });

  it("blank patch fields are no-ops (existing values preserved)", () => {
    const out = applyBulkEdit(rows, new Set(["1"]), {
      assignedTo: "   ",
      notes: "",
      cost: "",
    });
    expect(out[0]).toEqual(rows[0]);
  });

  it("marking done auto-stamps dateCompleted only when blank", () => {
    const partial = [row("1"), row("2", { dateCompleted: "12/31/25" })];
    const out = applyBulkEdit(partial, new Set(["1", "2"]), {
      status: "done",
      today: "06/01/26",
    });
    expect(out[0].dateCompleted).toBe("06/01/26");
    expect(out[1].dateCompleted).toBe("12/31/25"); // preserved
  });

  it("notes 'append' mode prepends timestamp and keeps old text", () => {
    const out = applyBulkEdit(rows, new Set(["2"]), {
      notes: "new note",
      notesMode: "append",
      today: "06/01/26",
    });
    expect(out[1].notes).toBe("old\n[06/01/26] new note");
  });

  it("notes 'replace' mode overwrites old text", () => {
    const out = applyBulkEdit(rows, new Set(["2"]), {
      notes: "new note",
      notesMode: "replace",
      today: "06/01/26",
    });
    expect(out[1].notes).toBe("[06/01/26] new note");
  });

  it("ignores cost when not a valid number", () => {
    const out = applyBulkEdit(rows, new Set(["1"]), { cost: "abc" });
    expect(out[0].cost).toBe(0);
  });

  it("applies numeric cost", () => {
    const out = applyBulkEdit(rows, new Set(["1"]), { cost: "42" });
    expect(out[0].cost).toBe(42);
  });

  it("trims assignedTo / assignBy whitespace", () => {
    const out = applyBulkEdit(rows, new Set(["1"]), {
      assignedTo: "  Alex  ",
      assignBy: "  Evelyn  ",
    });
    expect(out[0].assignedTo).toBe("Alex");
    expect(out[0].assignBy).toBe("Evelyn");
  });

  it("applies sprint, priority, and dates together", () => {
    const out = applyBulkEdit(rows, new Set(["1"]), {
      sprintId: "S-2026-02",
      priority: "P0",
      dateAssigned: "06/01/26",
      dueDate: "06/14/26",
      dateCompleted: "06/10/26",
    });
    expect(out[0]).toMatchObject({
      sprintId: "S-2026-02",
      priority: "P0",
      dateAssigned: "06/01/26",
      dueDate: "06/14/26",
      dateCompleted: "06/10/26",
    });
  });
});

describe("bulkDelete", () => {
  it("is a no-op when nothing is selected", () => {
    const rows = [row("1"), row("2")];
    expect(bulkDelete(rows, new Set())).toEqual(rows);
  });

  it("removes selected rows and keeps the rest", () => {
    const rows = [row("1"), row("2"), row("3")];
    const out = bulkDelete(rows, new Set(["1", "3"]));
    expect(out.map((r) => r.id)).toEqual(["2"]);
  });
});
