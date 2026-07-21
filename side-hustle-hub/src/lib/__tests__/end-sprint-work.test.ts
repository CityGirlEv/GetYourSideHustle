import { describe, expect, it } from "vitest";
import { listIncompleteSprintWork } from "../../components/admin/EndSprintModal";
import type { GyshTask } from "../gysh-tasks";

describe("listIncompleteSprintWork", () => {
  it("lists open tasks and tests in the ending sprint only", () => {
    const tasks: GyshTask[] = [
      {
        id: "T-001",
        description: "Done task",
        assignedTo: "Evelyn",
        status: "done",
        sprint: 0,
        dueDate: "07/19/26",
        category: "Ops",
        priority: "P1",
        notes: "",
        assignBy: "System",
        dateAssigned: "07/14/26",
        tinaDone: false,
        evelynDone: true,
        attachments: [],
      },
      {
        id: "T-002",
        description: "Open task",
        assignedTo: "Tina",
        status: "in_progress",
        sprint: 0,
        dueDate: "07/19/26",
        category: "Ops",
        priority: "P1",
        notes: "",
        assignBy: "System",
        dateAssigned: "07/14/26",
        tinaDone: false,
        evelynDone: false,
        attachments: [],
      },
      {
        id: "T-100",
        description: "Other sprint",
        assignedTo: "Tina",
        status: "todo",
        sprint: 1,
        dueDate: "07/24/26",
        category: "Ops",
        priority: "P1",
        notes: "",
        assignBy: "System",
        dateAssigned: "07/14/26",
        tinaDone: false,
        evelynDone: false,
        attachments: [],
      },
    ];

    const { tasks: openTasks, tests: openTests } = listIncompleteSprintWork({
      sprintIndex: 0,
      tasks,
      tests: [
        { id: "QA-1", title: "Pass case" },
        { id: "QA-2", title: "Open case" },
      ],
      testStatuses: { "QA-1": "pass", "QA-2": "not_run" },
      testSprints: { "QA-1": 0, "QA-2": 0 },
      testAssignees: { "QA-1": "evelyn", "QA-2": "lyriq" },
    });

    expect(openTasks.map((t) => t.sourceId)).toEqual(["T-002"]);
    expect(openTests.map((t) => t.sourceId)).toEqual(["QA-2"]);
  });
});
