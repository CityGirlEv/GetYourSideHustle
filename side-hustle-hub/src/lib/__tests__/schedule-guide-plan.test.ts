import { describe, expect, it } from "vitest";
import { DETAILED_GUIDE_STEPS } from "../guide-detailed-steps";
import { uniqueGuideLibraryIds } from "../guide-library-pool";
import {
  alignSchedulePlanWithGuideSteps,
  applyLaunchGuideChecksToPlan,
  createSchedulePlan,
  mergePlanCheckIntoLaunchGuideProgress,
  nextScheduleWorkday,
  promoteGuideStepBlocks,
  setBlockFocus,
} from "../hustle-schedule";
import { resolveLaunchGuideData } from "../resolve-launch-guide-data";
import {
  guideStepBlockId,
  launchGuideStepProgressKey,
  minutesForGuideStep,
  playbookStepsForSchedule,
} from "../schedule-guide-plan";

describe("schedule from Launch Guide steps", () => {
  it("lists every playbook step on a new Plan tracker, one per weekday", () => {
    const hustleId = "plant-watering";
    const steps = playbookStepsForSchedule(hustleId);
    expect(steps.length).toBeGreaterThanOrEqual(11);
    const plan = createSchedulePlan({
      ownerId: "self",
      ownerLabel: "Me",
      hustleId,
      hustleLabel: "Plant Watering Service",
      ageGroup: "adult",
      blueprintId: "bp",
      startDate: "2026-09-14", // Monday
    });
    expect(plan.blocks.map((b) => b.focus)).toEqual(steps.map((s) => s.title));
    expect(plan.blocks.map((b) => b.id)).toEqual(steps.map((_, i) => guideStepBlockId(i + 1)));
    expect(plan.blocks[0]!.dueDate).toBe("2026-09-14");
    expect(plan.blocks[0]!.dayLabel).toMatch(/Step 1 · Mon/);
    expect(plan.blocks[5]!.dueDate).toBe("2026-09-21");
    for (const b of plan.blocks) {
      const d = new Date(`${b.dueDate}T12:00:00`);
      expect([0, 6]).not.toContain(d.getDay());
    }
  });

  it("skips Saturday/Sunday when the start date is a weekend", () => {
    expect(nextScheduleWorkday("2026-09-12")).toBe("2026-09-14"); // Sat → Mon
    const { blocks } = promoteGuideStepBlocks(
      [
        { title: "A", desc: "" },
        { title: "B", desc: "" },
      ],
      "2026-09-12",
    );
    expect(blocks[0]!.dueDate).toBe("2026-09-14");
    expect(blocks[1]!.dueDate).toBe("2026-09-15");
  });

  it("maps every detailed Launch Guide playbook onto tracker rows", () => {
    const ids = Object.keys(DETAILED_GUIDE_STEPS);
    expect(ids.length).toBeGreaterThan(50);
    for (const id of ids) {
      const steps = playbookStepsForSchedule(id);
      expect(steps.length, id).toBeGreaterThanOrEqual(11);
      const plan = createSchedulePlan({
        ownerId: "self",
        ownerLabel: "Me",
        hustleId: id,
        hustleLabel: id,
        ageGroup: "adult",
        blueprintId: null,
        startDate: "2026-09-14",
      });
      expect(plan.blocks.map((b) => b.focus), id).toEqual(steps.map((s) => s.title));
    }
    const libraryMapped = uniqueGuideLibraryIds().filter((id) => playbookStepsForSchedule(id).length > 0);
    expect(libraryMapped.length).toBeGreaterThanOrEqual(ids.length);
  });

  it("uses lighter minutes on wrap-up steps", () => {
    expect(minutesForGuideStep("Ask for a review", true)).toBe(30);
    expect(minutesForGuideStep("Get Parent Thumbs Up", false)).toBe(20);
    expect(minutesForGuideStep("Pick a Name for Your Side Hustle", false)).toBe(45);
  });

  it("uses the same Steps-tab playbook as resolveLaunchGuideData", () => {
    const id = "plant-watering";
    const fromTab = resolveLaunchGuideData(id, []).steps.map((s) => s.title);
    expect(playbookStepsForSchedule(id).map((s) => s.title)).toEqual(fromTab);
    expect(fromTab.length).toBeGreaterThanOrEqual(11);
  });

  it("remaps a legacy 7-day week onto current guide steps and keeps Done", () => {
    const weekly = createSchedulePlan({
      ownerId: "self",
      ownerLabel: "Me",
      hustleId: "plant-watering",
      hustleLabel: "Plant Watering",
      ageGroup: "adult",
      blueprintId: null,
      startDate: "2026-09-14",
      guideSteps: [],
    });
    expect(weekly.blocks).toHaveLength(7);
    weekly.blocks[0] = { ...weekly.blocks[0]!, status: "done", done: true };
    const aligned = alignSchedulePlanWithGuideSteps(weekly);
    const steps = playbookStepsForSchedule("plant-watering");
    expect(aligned.blocks.map((b) => b.focus)).toEqual(steps.map((s) => s.title));
    expect(aligned.blocks[0]!.id).toBe("gs-1");
    expect(aligned.blocks[0]!.status).toBe("done");
    expect(aligned.blocks.length).toBe(steps.length);
  });

  it("keeps Plan tracker checks in sync with Steps-tab progress keys", () => {
    const plan = createSchedulePlan({
      ownerId: "self",
      ownerLabel: "Me",
      hustleId: "plant-watering",
      hustleLabel: "Plant Watering",
      ageGroup: "adult",
      blueprintId: null,
      startDate: "2026-09-14",
    });
    const key = launchGuideStepProgressKey("plant-watering", 0);
    const checked = applyLaunchGuideChecksToPlan(plan, { [key]: true });
    expect(checked.blocks[0]!.status).toBe("done");
    const progress = mergePlanCheckIntoLaunchGuideProgress({}, "plant-watering", "gs-2", true);
    expect(progress[launchGuideStepProgressKey("plant-watering", 1)]).toBe(true);
  });

  it("does not let Plan tracker rename a guide step", () => {
    const plan = createSchedulePlan({
      ownerId: "self",
      ownerLabel: "Me",
      hustleId: "plant-watering",
      hustleLabel: "Plant Watering",
      ageGroup: "adult",
      blueprintId: null,
      startDate: "2026-09-14",
    });
    const title = plan.blocks[0]!.focus;
    const next = setBlockFocus(plan, "gs-1", "custom label");
    expect(next).toBe(plan);
    expect(next.blocks[0]!.focus).toBe(title);
  });
});
