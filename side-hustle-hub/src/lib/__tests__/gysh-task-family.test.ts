import { describe, expect, it } from "vitest";
import {
  isPersonalWorkTask,
  isTaskCountHead,
  orderTasksWithSubtasks,
  rollupParentFromChildren,
  syncNotesAcrossFamily,
  taskFamilyIds,
} from "../gysh-task-family";
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
    sprint: over.sprint ?? 2,
    attachments: over.attachments ?? [],
    tinaDone: over.tinaDone ?? false,
    evelynDone: over.evelynDone ?? false,
    parentId: over.parentId,
    updatedAt: over.updatedAt ?? "",
    updatedBy: over.updatedBy ?? "",
  };
}

describe("task family", () => {
  const family = [
    task({ id: "T-041", assignedTo: "Tina", status: "in_progress" }),
    task({ id: "T-041T", parentId: "T-041", assignedTo: "Tina", status: "in_progress" }),
    task({ id: "T-041E", parentId: "T-041", assignedTo: "Evelyn", status: "done" }),
    task({ id: "T-042", assignedTo: "Tina" }),
  ];

  it("counts only heads", () => {
    expect(isTaskCountHead(family[0]!)).toBe(true);
    expect(isTaskCountHead(family[1]!)).toBe(false);
    expect(isTaskCountHead(family[2]!)).toBe(false);
  });

  it("personal work skips umbrella parents", () => {
    expect(isPersonalWorkTask(family[0]!, family)).toBe(false);
    expect(isPersonalWorkTask(family[1]!, family)).toBe(true);
    expect(isPersonalWorkTask(family[2]!, family)).toBe(true);
    expect(isPersonalWorkTask(family[3]!, family)).toBe(true);
  });

  it("nests subtasks under parent", () => {
    const ordered = orderTasksWithSubtasks(family);
    expect(ordered.map((t) => t.id)).toEqual(["T-041", "T-041E", "T-041T", "T-042"]);
  });

  it("syncs notes across the family", () => {
    const synced = syncNotesAcrossFamily(family, "T-041E", "shared");
    expect(synced.filter((t) => t.id.startsWith("T-041")).every((t) => t.notes === "shared")).toBe(
      true,
    );
    expect(synced.find((t) => t.id === "T-042")!.notes).toBe("");
  });

  it("family ids include parent + children", () => {
    expect(taskFamilyIds(family, "T-041T")).toEqual(["T-041", "T-041E", "T-041T"]);
  });

  it("rolls parent to done when all children done", () => {
    const bothDone = family.map((t) =>
      t.parentId === "T-041" ? { ...t, status: "done" as const } : t,
    );
    const rolled = rollupParentFromChildren(bothDone, "T-041");
    expect(rolled.find((t) => t.id === "T-041")!.status).toBe("done");
  });
});
