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

import { syncGuideReviewTasks, healPersonalAmplifyTasks, type GyshTask } from "../gysh-tasks";

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

describe("healPersonalAmplifyTasks", () => {
  it("resets status, sprint, and cadence due dates without touching other tasks", () => {
    const other = task({ id: "T-001", description: "Keep me", status: "done", sprint: 2 });
    const amplify = task({
      id: "T-SL-S3-PERSONAL-AMPLIFY-WRAP-TINA",
      description: "Personal amplify — Soft launch week wrap",
      category: "launch_marketing",
      status: "done",
      sprint: 5,
      dueDate: "09/02/26",
      dateCompleted: "09/02/26",
      tinaDone: true,
      evelynDone: true,
      notes: "CF notes stay",
    });
    const { tasks: next, healed } = healPersonalAmplifyTasks(
      [other, amplify],
      [{ id: amplify.id, dueDate: "09/14/26", sprint: 6 }],
    );
    expect(healed).toHaveLength(1);
    expect(next[0]).toEqual(other);
    expect(next[1]!.status).toBe("not_started");
    expect(next[1]!.sprint).toBe(6);
    expect(next[1]!.dueDate).toBe("09/14/26");
    expect(next[1]!.category).toBe("personal_amplify");
    expect(next[1]!.dateCompleted).toBe("");
    expect(next[1]!.tinaDone).toBe(false);
    expect(next[1]!.evelynDone).toBe(false);
    expect(next[1]!.notes).toBe("CF notes stay");
  });

  it("no-ops when amplify rows already match the cadence", () => {
    const amplify = task({
      id: "T-SL-S3-PERSONAL-AMPLIFY-WHY-EVELYN",
      description: "Personal amplify — Why GYSH",
      category: "personal_amplify",
      status: "not_started",
      sprint: 6,
      dueDate: "09/08/26",
    });
    const { healed } = healPersonalAmplifyTasks(
      [amplify],
      [{ id: amplify.id, dueDate: "09/08/26", sprint: 6 }],
    );
    expect(healed).toHaveLength(0);
  });

  it("moves unmapped amplify dues onto next week when no seed matches", () => {
    const amplify = task({
      id: "T-SL-S3-PERSONAL-AMPLIFY-LEGACY",
      description: "Personal amplify leftover",
      category: "personal_amplify",
      status: "in_progress",
      sprint: 5,
      dueDate: "09/02/26",
    });
    const { healed } = healPersonalAmplifyTasks([amplify], []);
    expect(healed[0]!.status).toBe("not_started");
    expect(healed[0]!.sprint).toBe(6);
    expect(healed[0]!.dueDate).toBe("09/08/26");
  });

  it("scatters unmapped amplify rows across next week and keeps partner pairs together", () => {
    const rows = ["0804", "0805", "0806"].flatMap((day) => [
      task({
        id: `T-SL-S3-PERSONAL-AMPLIFY-${day}-TINA`,
        description: "Personal amplify leftover",
        category: "personal_amplify",
        status: "done",
        sprint: 5,
        dueDate: "09/02/26",
      }),
      task({
        id: `T-SL-S3-PERSONAL-AMPLIFY-${day}-EVELYN`,
        description: "Personal amplify leftover",
        category: "personal_amplify",
        status: "done",
        sprint: 5,
        dueDate: "09/02/26",
      }),
    ]);
    const { healed } = healPersonalAmplifyTasks(rows, []);
    expect(healed).toHaveLength(6);
    expect(healed.every((t) => t.status === "not_started" && t.sprint === 6)).toBe(true);
    const byDay = new Map<string, string>();
    for (const t of healed) {
      const key = t.id.replace(/-(TINA|EVELYN)$/i, "");
      if (!byDay.has(key)) byDay.set(key, t.dueDate);
      expect(t.dueDate).toBe(byDay.get(key));
    }
    expect([...new Set(healed.map((t) => t.dueDate))].sort()).toEqual([
      "09/08/26",
      "09/09/26",
      "09/10/26",
    ]);
  });
});
