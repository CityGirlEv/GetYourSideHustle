import { describe, expect, it } from "vitest";
import {
  applyPartnerDone,
  healNotStartedTouchedTasks,
  shouldAutoStartTaskOnFirstTouch,
  type GyshTask,
} from "../gysh-tasks";

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

  it("auto-starts Not Started when a note is added (not on assignee-only)", () => {
    const withNote = applyPartnerDone(base(), { notes: "Looking into this" });
    expect(withNote.status).toBe("in_progress");

    const assigneeOnly = applyPartnerDone(base(), { assignedTo: "Tina" });
    expect(assigneeOnly.status).toBe("not_started");

    const statusOnly = applyPartnerDone(base(), { status: "not_started", assignedTo: "Evelyn" });
    expect(statusOnly.status).toBe("not_started");
  });
});

describe("shouldAutoStartTaskOnFirstTouch / heal", () => {
  it("only bumps on notes or partner boxes while still Not Started", () => {
    expect(
      shouldAutoStartTaskOnFirstTouch({
        prevStatus: "not_started",
        nextStatus: "not_started",
        notesChanged: true,
      }),
    ).toBe(true);
    expect(
      shouldAutoStartTaskOnFirstTouch({
        prevStatus: "not_started",
        nextStatus: "not_started",
        partnerBoxChanged: true,
      }),
    ).toBe(true);
    expect(
      shouldAutoStartTaskOnFirstTouch({
        prevStatus: "not_started",
        nextStatus: "done",
        notesChanged: true,
      }),
    ).toBe(false);
    expect(
      shouldAutoStartTaskOnFirstTouch({
        prevStatus: "not_started",
        nextStatus: "not_started",
      }),
    ).toBe(false);
  });

  it("heals NS tasks that already have notes or partner checks", () => {
    const healed = healNotStartedTouchedTasks([
      base({ id: "A", notes: "started" }),
      base({ id: "B", tinaDone: true }),
      base({ id: "C" }),
      base({ id: "D", status: "in_progress", notes: "x" }),
    ]);
    expect(healed.changed).toBe(true);
    expect(healed.changedTasks.map((t) => t.id).sort()).toEqual(["A", "B"]);
    expect(healed.tasks.find((t) => t.id === "A")!.status).toBe("in_progress");
    expect(healed.tasks.find((t) => t.id === "C")!.status).toBe("not_started");
  });

  it("does not auto-start Personal amplify from catalog notes", () => {
    const healed = healNotStartedTouchedTasks([
      base({
        id: "T-SL-S3-PERSONAL-AMPLIFY-WRAP-TINA",
        description: "Personal amplify — Soft launch week wrap",
        category: "personal_amplify",
        notes: "CF: sl-s3-personal-amplify-wrap-tina",
      }),
    ]);
    expect(healed.changed).toBe(false);
    expect(healed.tasks[0]!.status).toBe("not_started");
  });
});
