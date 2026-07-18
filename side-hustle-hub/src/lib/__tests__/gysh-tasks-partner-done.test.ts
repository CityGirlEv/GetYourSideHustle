import { describe, expect, it } from "vitest";
import { applyPartnerDone, type GyshTask } from "../gysh-tasks";

function base(partial: Partial<GyshTask> = {}): GyshTask {
  return {
    id: "T-001",
    description: "Test",
    category: "admin_ops",
    priority: "P2",
    status: "not_started",
    assignBy: "Evelyn",
    assignedTo: "Both",
    dateAssigned: "07/16/26",
    dueDate: "07/20/26",
    dateCompleted: "",
    notes: "",
    sprint: 0,
    tinaDone: false,
    evelynDone: false,
    attachments: [],
    ...partial,
  };
}

describe("applyPartnerDone", () => {
  it("keeps Both tasks incomplete until both partners mark done", () => {
    const afterTina = applyPartnerDone(base(), { tinaDone: true });
    expect(afterTina.tinaDone).toBe(true);
    expect(afterTina.status).toBe("in_progress");
    expect(afterTina.dateCompleted).toBe("");

    const afterBoth = applyPartnerDone(afterTina, { evelynDone: true });
    expect(afterBoth.status).toBe("done");
    expect(afterBoth.dateCompleted).toMatch(/\d{2}\/\d{2}\/\d{2}/);
  });

  it("blocks forcing Done on Both without both partner checks", () => {
    const forced = applyPartnerDone(base({ tinaDone: true }), { status: "done" });
    expect(forced.status).toBe("in_progress");
  });

  it("lets a single assignee mark done via status", () => {
    const tinaOnly = applyPartnerDone(base({ assignedTo: "Tina" }), { status: "done" });
    expect(tinaOnly.tinaDone).toBe(true);
    expect(tinaOnly.evelynDone).toBe(false);
    expect(tinaOnly.status).toBe("done");
  });
});
