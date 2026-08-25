import { beforeEach, describe, expect, it, vi } from "vitest";

const apiMock = vi.fn();

vi.mock("../api", () => ({
  api: (...args: unknown[]) => apiMock(...args),
  ApiError: class ApiError extends Error {
    status: number;
    constructor(message: string, status: number) {
      super(message);
      this.status = status;
    }
  },
}));

import { syncGuideReviewTasks, type GyshTask } from "../gysh-tasks";

function task(partial: Partial<GyshTask> & Pick<GyshTask, "id" | "description">): GyshTask {
  return {
    category: "ops",
    priority: "P1",
    status: "not_started",
    assignBy: "Test",
    assignedTo: "Both",
    dateAssigned: "08/03/26",
    dueDate: "",
    dateCompleted: "",
    notes: "",
    sprint: 2,
    tinaDone: false,
    evelynDone: false,
    attachments: [],
    ...partial,
  };
}

describe("syncGuideReviewTasks", () => {
  beforeEach(() => {
    apiMock.mockReset();
  });

  it("reuses an existing list and skips GET when nothing to create", async () => {
    const existing = [task({ id: "T-001", description: "Already there" })];
    // ensureGuideReviewTasks may create guide rows — if persist is called, mock PUT.
    apiMock.mockImplementation(async (path: string, opts?: { method?: string; body?: { tasks: GyshTask[] } }) => {
      if (path === "tasks" && opts?.method === "PUT") {
        return { tasks: opts.body?.tasks ?? [] };
      }
      throw new Error(`unexpected api call: ${path} ${opts?.method ?? "GET"}`);
    });

    const result = await syncGuideReviewTasks(existing);
    expect(result.tasks.length).toBeGreaterThanOrEqual(existing.length);
    // Must not GET /tasks when existing was provided.
    expect(
      apiMock.mock.calls.filter((c) => c[0] === "tasks" && (c[1]?.method ?? "GET") === "GET"),
    ).toHaveLength(0);
  });
});
