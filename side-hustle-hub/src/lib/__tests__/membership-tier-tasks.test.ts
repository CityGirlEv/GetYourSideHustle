import { describe, expect, it } from "vitest";
import {
  ensureMembershipTierReviewTasks,
  ensureMilitaryVeteranCalloutTask,
  membershipTierReviewTaskId,
  MILITARY_VETERAN_CALLOUT_TASK_ID,
  MILITARY_MEMBERSHIP_DISCOUNT_SPRINT,
} from "../gysh-tasks";
import { MEMBERSHIP_TIERS } from "../membership";
import { dueDateForSprint } from "../gysh-sprints";

describe("ensureMembershipTierReviewTasks", () => {
  it("creates one Tina-assigned review task per membership tier when empty", () => {
    const { tasks, created } = ensureMembershipTierReviewTasks([]);
    expect(created).toHaveLength(MEMBERSHIP_TIERS.length);
    expect(tasks).toHaveLength(MEMBERSHIP_TIERS.length);
    for (const tier of MEMBERSHIP_TIERS) {
      const t = created.find((x) => x.id === membershipTierReviewTaskId(tier.id));
      expect(t).toBeTruthy();
      expect(t!.assignedTo).toBe("Tina");
      expect(t!.assignBy).toBe("Evelyn");
      expect(t!.status).toBe("not_started");
      expect(t!.category).toBe("website");
      expect(t!.priority).toBe("P1");
      expect(t!.description).toContain(tier.name);
      expect(t!.notes).toContain(`membership-tier-review:${tier.id}`);
      expect(t!.notes).toMatch(/Fail|Blocked|revision/i);
      expect(t!.notes).toContain("/join");
    }
  });

  it("is idempotent on re-run", () => {
    const first = ensureMembershipTierReviewTasks([]);
    const second = ensureMembershipTierReviewTasks(first.tasks);
    expect(second.created).toHaveLength(0);
    expect(second.tasks).toHaveLength(MEMBERSHIP_TIERS.length);
  });

  it("skips tiers that already have a matching description", () => {
    const existing = [
      {
        id: "T-999",
        description:
          "Review Membership level: Free — pricing, perks, audience lanes; note issues or Fail & send for revisions",
        category: "website" as const,
        priority: "P1" as const,
        status: "not_started" as const,
        assignBy: "Evelyn",
        assignedTo: "Tina",
        dateAssigned: "08/21/26",
        dueDate: "",
        dateCompleted: "",
        notes: "",
        attachments: [],
      },
    ];
    const { created } = ensureMembershipTierReviewTasks(existing);
    expect(created.find((t) => t.id === membershipTierReviewTaskId("free"))).toBeUndefined();
    expect(created).toHaveLength(MEMBERSHIP_TIERS.length - 1);
  });
});

describe("ensureMilitaryVeteranCalloutTask", () => {
  it("schedules Military Membership discount on Sprint 6", () => {
    const { created } = ensureMilitaryVeteranCalloutTask([]);
    expect(created).toHaveLength(1);
    expect(created[0]!.id).toBe(MILITARY_VETERAN_CALLOUT_TASK_ID);
    expect(created[0]!.sprint).toBe(MILITARY_MEMBERSHIP_DISCOUNT_SPRINT);
    expect(created[0]!.sprint).toBe(6);
    expect(created[0]!.description).toMatch(/Military Membership discount/i);
    expect(created[0]!.notes).toContain("SHOW_MILITARY_VETERAN_CALLOUT");
    expect(created[0]!.notes).toContain("discount-sprint-6");
    expect(created[0]!.notes).toContain("/join");
    expect(created[0]!.assignedTo).toBe("Both");
    expect(created[0]!.dueDate).toBe(dueDateForSprint(6));
  });

  it("heals an existing row onto Sprint 6", () => {
    const stale = ensureMilitaryVeteranCalloutTask([]).created[0]!;
    const misplaced = { ...stale, sprint: 5, dueDate: "09/03/26", description: "old" };
    const healed = ensureMilitaryVeteranCalloutTask([misplaced]);
    expect(healed.created).toHaveLength(1);
    expect(healed.created[0]!.sprint).toBe(6);
    expect(healed.created[0]!.description).toMatch(/Military Membership discount/i);
  });

  it("is idempotent once on Sprint 6", () => {
    const first = ensureMilitaryVeteranCalloutTask([]);
    const second = ensureMilitaryVeteranCalloutTask(first.tasks);
    expect(second.created).toHaveLength(0);
  });
});
