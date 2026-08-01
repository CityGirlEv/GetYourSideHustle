import { describe, expect, it } from "vitest";
import {
  queryLooksLikeTaskId,
  taskMatchesIdQuery,
  taskMatchesSearch,
} from "../gysh-task-search";
import type { GyshTask } from "../gysh-tasks";

function task(over: Partial<GyshTask> & Pick<GyshTask, "id">): GyshTask {
  return {
    id: over.id,
    description: over.description ?? "",
    notes: over.notes ?? "",
    category: over.category ?? "admin_ops",
    assignedTo: over.assignedTo ?? "Tina",
    assignBy: over.assignBy ?? "Tina",
    status: over.status ?? "not_started",
    priority: over.priority ?? "P2",
    dueDate: over.dueDate ?? "",
    dateAssigned: over.dateAssigned ?? "",
    dateCompleted: over.dateCompleted ?? "",
    sprint: over.sprint ?? 1,
    attachments: over.attachments ?? [],
    tinaDone: over.tinaDone ?? false,
    evelynDone: over.evelynDone ?? false,
    parentId: over.parentId,
    updatedAt: over.updatedAt ?? "",
    updatedBy: over.updatedBy ?? "",
    sortOrder: over.sortOrder ?? 0,
  };
}

describe("task id search", () => {
  it("treats bare numbers and T-### as task-id queries", () => {
    expect(queryLooksLikeTaskId("29")).toBe(true);
    expect(queryLooksLikeTaskId("029")).toBe(true);
    expect(queryLooksLikeTaskId("#29")).toBe(true);
    expect(queryLooksLikeTaskId("T-029")).toBe(true);
    expect(queryLooksLikeTaskId("about")).toBe(false);
  });

  it("matches T-029 for 29 / 029 / T-029, not T-024", () => {
    const t29 = task({ id: "T-029", dueDate: "07/29/26" });
    const t24 = task({ id: "T-024", dueDate: "07/29/26", description: "due the 29th" });
    for (const q of ["29", "029", "#29", "T-029", "t-029"]) {
      expect(taskMatchesIdQuery(t29, q)).toBe(true);
      expect(taskMatchesSearch(t29, q)).toBe(true);
      expect(taskMatchesIdQuery(t24, q)).toBe(false);
      expect(taskMatchesSearch(t24, q)).toBe(false);
    }
  });

  it("does not match slug tasks on digits alone", () => {
    const slug = task({ id: "T-LG-airbnb" });
    expect(taskMatchesSearch(slug, "29")).toBe(false);
    expect(taskMatchesSearch(slug, "T-LG-airbnb")).toBe(true);
  });

  it("matches letter subtasks under the same number", () => {
    const parent = task({ id: "T-041" });
    const tina = task({ id: "T-041T", parentId: "T-041" });
    const evelyn = task({ id: "T-041E", parentId: "T-041" });
    for (const q of ["41", "041", "T-041", "t-041"]) {
      expect(taskMatchesIdQuery(parent, q)).toBe(true);
      expect(taskMatchesIdQuery(tina, q)).toBe(true);
      expect(taskMatchesIdQuery(evelyn, q)).toBe(true);
    }
    expect(taskMatchesIdQuery(tina, "T-041T")).toBe(true);
    expect(taskMatchesIdQuery(evelyn, "T-041T")).toBe(false);
  });

  it("still allows text search in description", () => {
    const t = task({ id: "T-024", description: "Parent safety checklist" });
    expect(taskMatchesSearch(t, "safety")).toBe(true);
    expect(taskMatchesSearch(t, "29")).toBe(false);
  });
});
