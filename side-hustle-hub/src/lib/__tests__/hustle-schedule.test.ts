import { describe, expect, it } from "vitest";
import {
  canAccessPnl,
  canAccessScheduleSuite,
  collectOverdueScheduleItems,
  createSchedulePlan,
  familyMemberOptions,
  filterSchedulesByOwner,
  scheduleEligibleFamilyChildren,
  scheduleSaveEnabled,
  activateSchedule,
  activeScheduleAfterOwnerFilter,
  hustleOptionsForOwner,
  isScheduleBlockHoursValid,
  normalizeHustleScheduleStore,
  normalizeScheduleBlockStatus,
  planBlocksMissingHours,
  planHasRequiredHours,
  promoteBlocksFromDueDate,
  promoteBlocksFromStartDate,
  schedulePlanId,
  schedulesForOwnerHustle,
  scheduleTabLabel,
  distinctSchedulePlanId,
  scheduleProgressPercent,
  scheduleTaskCountLabel,
  scheduleTaskCounts,
  setScheduleBlockHours,
  setScheduleBlockStatus,
  scheduleStatusFromCheckboxChecked,
  applyScheduleBlockCheckbox,
  toggleScheduleBlockDone,
  updateBlockDueDate,
  updatePlanDueDate,
  updatePlanStartDate,
  upsertSchedule,
  applyScheduleWeekGrade,
  gradeScheduleWeek,
  getWeekRoundup,
  patchBlueprintGoals,
  upsertWeekRoundup,
  gradeMarkFromScore,
  SCHEDULE_GRADE_D_MIN,
  celebrationFromMark,
  pepTalkForMark,
  blueprintProfitUsd,
  formatEstimateMinutes,
  collectScheduleValidationErrors,
  ensureHoursFromEstimates,
  scheduleStatsBarShowsGradeMe,
  suiteViewAfterGradeMe,
  scheduleGradeMeButtonLabel,
  liveScheduleWeekGrade,
  withRefreshedWeekGrade,
  SCHEDULE_EMAIL_SECTION_ID,
  SCHEDULE_SUITE_DASHBOARD_HREF,
  SCHEDULE_SUITE_DEFAULT_VIEW,
  SCHEDULE_SUITE_VIEW_TABS,
  scheduleSuiteTabsForAccess,
  addScheduleActionItem,
  removeScheduleActionItem,
  normalizeWeekRoundup,
  emptyWeekRoundup,
  formatScheduleActionItemStamp,
  roundupHasActionItems,
  setBlockNotes,
  scheduleCollapsePreview,
  isScheduleSuiteDashboardHash,
} from "../hustle-schedule";
import { playbookStepsForSchedule } from "../schedule-guide-plan";

/** Keep date/status tests on the 7-day weekly template. */
function weeklyPlan(
  input: Omit<Parameters<typeof createSchedulePlan>[0], "guideSteps">,
) {
  return createSchedulePlan({ ...input, guideSteps: [] });
}

describe("hustle schedule suite", () => {
  it("unlocks only for Pro and Elite (or admin)", () => {
    expect(canAccessScheduleSuite("free")).toBe(false);
    expect(canAccessScheduleSuite("starter")).toBe(false);
    expect(canAccessScheduleSuite("pro")).toBe(true);
    expect(canAccessScheduleSuite("elite")).toBe(true);
    expect(canAccessScheduleSuite("free", { isAdmin: true })).toBe(true);
  });

  it("keeps P&L Elite-only (off Free, Starter, and Pro)", () => {
    expect(canAccessPnl("free")).toBe(false);
    expect(canAccessPnl("starter")).toBe(false);
    expect(canAccessPnl("pro")).toBe(false);
    expect(canAccessPnl("elite")).toBe(true);
    expect(canAccessPnl("starter", { isAdmin: true })).toBe(true);
    expect(scheduleSuiteTabsForAccess({ pnlUnlocked: false }).map((t) => t.id)).not.toContain("pnl");
    expect(scheduleSuiteTabsForAccess({ pnlUnlocked: true }).map((t) => t.id)).toContain("pnl");
  });

  it("builds reminder period keys and send windows", async () => {
    const { reminderPeriodKey, shouldSendReminderToday } = await import("../hustle-schedule");
    const monday = new Date("2026-08-17T15:00:00Z"); // Mon
    expect(shouldSendReminderToday("daily", monday)).toBe(true);
    expect(shouldSendReminderToday("weekly", monday)).toBe(true);
    expect(shouldSendReminderToday("weekly", new Date("2026-08-18T15:00:00Z"))).toBe(false);
    expect(reminderPeriodKey("monthly", new Date("2026-08-03T12:00:00Z"))).toBe("2026-08");
    expect(reminderPeriodKey("daily", monday)?.length).toBe(10);
  });

  it("lists Me plus family children as owners", () => {
    const opts = familyMemberOptions("Evelyn", [
      { id: "c1", displayName: "Kai", ageBand: "kids" },
    ]);
    expect(opts[0]).toEqual({ id: "self", label: "Evelyn" });
    expect(opts[1]?.id).toBe("c1");
  });

  it("lists hustles for self vs child from blueprints", () => {
    const bps = [
      {
        id: "bp-self",
        ageGroup: "adult" as const,
        resultIds: ["airbnb", "pod"],
        topResultId: "airbnb",
        childProfileId: null,
      },
      {
        id: "bp-kid",
        ageGroup: "kids" as const,
        resultIds: ["dog-walk"],
        topResultId: "dog-walk",
        childProfileId: "c1",
      },
    ];
    expect(hustleOptionsForOwner("self", bps).map((h) => h.hustleId)).toEqual([
      "airbnb",
      "pod",
    ]);
    expect(hustleOptionsForOwner("c1", bps).map((h) => h.hustleId)).toEqual(["dog-walk"]);
  });

  it("promotes weekly plan from due date with per-day dues", () => {
    const { weekStart, blocks, dueDate } = promoteBlocksFromDueDate(
      "Airbnb",
      "2026-08-23", // Sunday
    );
    expect(dueDate).toBe("2026-08-23");
    expect(weekStart).toBe("2026-08-17");
    expect(blocks).toHaveLength(7);
    expect(blocks[0]!.dueDate).toBe("2026-08-17");
    expect(blocks[6]!.dueDate).toBe("2026-08-23");
    expect(blocks[0]!.status).toBe("not_started");
    expect(blocks[0]!.done).toBe(false);
  });

  it("promotes weekly plan from a start date", () => {
    const { weekStart, blocks, dueDate } = promoteBlocksFromStartDate(
      "Airbnb",
      "2026-08-19",
    );
    expect(weekStart).toBe("2026-08-19");
    expect(dueDate).toBe("2026-08-25");
    expect(blocks[0]!.dueDate).toBe("2026-08-19");
    expect(blocks[0]!.dayLabel).toBe("Wed");
    expect(blocks[6]!.dueDate).toBe("2026-08-25");
    expect(blocks[6]!.dayLabel).toBe("Tue");
  });

  it("updating plan due date rebuilds week and keeps status", () => {
    const plan = weeklyPlan({
      ownerId: "self",
      ownerLabel: "Me",
      hustleId: "airbnb",
      hustleLabel: "Airbnb Hosting",
      ageGroup: "adult",
      blueprintId: "bp",
      dueDate: "2026-08-23",
    });
    const withStatus = setScheduleBlockStatus(plan, "mon", "done");
    const next = updatePlanDueDate(withStatus, "2026-08-30");
    expect(next.dueDate).toBe("2026-08-30");
    expect(next.weekStart).toBe("2026-08-24");
    expect(next.blocks[0]!.status).toBe("done");
    expect(next.blocks[0]!.done).toBe(true);
    expect(next.blocks[0]!.dueDate).toBe("2026-08-24");
  });

  it("updating start date shifts every block due date", () => {
    const plan = weeklyPlan({
      ownerId: "self",
      ownerLabel: "Me",
      hustleId: "airbnb",
      hustleLabel: "Airbnb Hosting",
      ageGroup: "adult",
      blueprintId: "bp",
      startDate: "2026-08-17",
    });
    const withCustom = updateBlockDueDate(
      setScheduleBlockStatus(plan, "fri", "in_progress"),
      "fri",
      "2026-08-22",
    );
    const next = updatePlanStartDate(withCustom, "2026-08-24");
    expect(next.weekStart).toBe("2026-08-24");
    expect(next.blocks[0]!.dueDate).toBe("2026-08-24");
    expect(next.blocks[0]!.dayLabel).toBe("Mon");
    expect(next.blocks.find((b) => b.id === "fri")?.dueDate).toBe("2026-08-29");
    expect(next.blocks.find((b) => b.id === "fri")?.status).toBe("in_progress");
    expect(next.dueDate).toBe("2026-08-30");
  });

  it("block due edits promote plan due to the latest day", () => {
    const plan = weeklyPlan({
      ownerId: "self",
      ownerLabel: "Me",
      hustleId: "pod",
      hustleLabel: "POD",
      ageGroup: "adult",
      blueprintId: "bp",
      dueDate: "2026-08-23",
    });
    const next = updateBlockDueDate(plan, "fri", "2026-09-01");
    expect(next.dueDate).toBe("2026-09-01");
    expect(next.blocks.find((b) => b.id === "fri")?.dueDate).toBe("2026-09-01");
  });

  it("normalizes legacy done boolean into status", () => {
    expect(normalizeScheduleBlockStatus(undefined, true)).toBe("done");
    expect(normalizeScheduleBlockStatus("In Progress")).toBe("in_progress");
    expect(normalizeScheduleBlockStatus("blocked")).toBe("blocked");
    const store = normalizeHustleScheduleStore({
      version: 3,
      schedules: [
        {
          id: "self__airbnb",
          ownerId: "self",
          ownerLabel: "Me",
          hustleId: "airbnb",
          hustleLabel: "Airbnb",
          ageGroup: "adult",
          blueprintId: null,
          dueDate: "2026-08-23",
          weekStart: "2026-08-17",
          blocks: [
            {
              id: "mon",
              dayLabel: "Mon",
              focus: "Listing",
              minutes: 60,
              done: true,
              hoursLogged: 1,
              dueDate: "2026-08-17",
            },
          ],
          reminderCadence: "none",
          updatedAt: "2026-08-01T00:00:00.000Z",
        },
      ],
      deleted: [],
      activeScheduleId: "self__airbnb",
      updatedAt: "2026-08-01T00:00:00.000Z",
    });
    const gs1 = store.schedules[0]!.blocks.find((b) => b.id === "gs-1");
    expect(gs1?.status).toBe("done");
    expect(gs1?.done).toBe(true);
    expect(gs1?.focus).toBe(playbookStepsForSchedule("airbnb")[0]?.title);
  });

  it("checkbox checked sets Done; unchecked sets Not Started", () => {
    expect(scheduleStatusFromCheckboxChecked(true)).toBe("done");
    expect(scheduleStatusFromCheckboxChecked(false)).toBe("not_started");

    let plan = weeklyPlan({
      ownerId: "self",
      ownerLabel: "Me",
      hustleId: "pod",
      hustleLabel: "POD",
      ageGroup: "adult",
      blueprintId: "bp",
      dueDate: "2026-08-23",
    });
    plan = setScheduleBlockStatus(plan, "mon", "in_progress");
    plan = applyScheduleBlockCheckbox(plan, "mon", true);
    expect(plan.blocks.find((b) => b.id === "mon")).toMatchObject({
      status: "done",
      done: true,
    });
    plan = applyScheduleBlockCheckbox(plan, "mon", false);
    expect(plan.blocks.find((b) => b.id === "mon")).toMatchObject({
      status: "not_started",
      done: false,
    });
    // Blocked + uncheck still lands on Not Started; check forces Done
    plan = setScheduleBlockStatus(plan, "tue", "blocked");
    plan = applyScheduleBlockCheckbox(plan, "tue", true);
    expect(plan.blocks.find((b) => b.id === "tue")?.status).toBe("done");
    plan = applyScheduleBlockCheckbox(plan, "tue", false);
    expect(plan.blocks.find((b) => b.id === "tue")?.status).toBe("not_started");
  });

  it("sets statuses, toggles done, and colors progress from Done only", () => {
    let plan = weeklyPlan({
      ownerId: "self",
      ownerLabel: "Me",
      hustleId: "pod",
      hustleLabel: "POD",
      ageGroup: "adult",
      blueprintId: "bp",
      dueDate: "2026-08-23",
    });
    plan = setScheduleBlockStatus(plan, "mon", "in_progress");
    plan = setScheduleBlockStatus(plan, "tue", "blocked");
    plan = setScheduleBlockStatus(plan, "wed", "done");
    expect(plan.blocks.find((b) => b.id === "mon")?.status).toBe("in_progress");
    expect(plan.blocks.find((b) => b.id === "tue")?.done).toBe(false);
    expect(plan.blocks.find((b) => b.id === "wed")?.done).toBe(true);
    expect(scheduleProgressPercent(plan.blocks)).toBe(Math.round((1 / 7) * 100));
    plan = toggleScheduleBlockDone(plan, "wed");
    expect(plan.blocks.find((b) => b.id === "wed")?.status).toBe("not_started");
    plan = toggleScheduleBlockDone(plan, "wed");
    expect(plan.blocks.find((b) => b.id === "wed")?.status).toBe("done");
  });

  it("stores notes on a plan tracker block", () => {
    const plan = weeklyPlan({
      ownerId: "self",
      ownerLabel: "Me",
      hustleId: "pod",
      hustleLabel: "POD",
      ageGroup: "adult",
      blueprintId: "bp",
      dueDate: "2026-08-23",
    });
    const next = setBlockNotes(plan, "mon", "Called three listings");
    expect(next.blocks.find((b) => b.id === "mon")?.notes).toBe("Called three listings");
  });

  it("previews collapsed roundup text", () => {
    expect(scheduleCollapsePreview("")).toBe("Tap to add");
    expect(scheduleCollapsePreview("  listed  ")).toBe("listed");
    expect(scheduleCollapsePreview("a".repeat(90))).toBe(`${"a".repeat(79)}…`);
  });

  it("labels Blueprint plan tasks complete and remaining from day blocks", () => {
    let plan = weeklyPlan({
      ownerId: "self",
      ownerLabel: "Me",
      hustleId: "pod",
      hustleLabel: "POD",
      ageGroup: "adult",
      blueprintId: "bp",
      dueDate: "2026-08-23",
    });
    expect(scheduleTaskCounts(plan.blocks)).toEqual({
      complete: 0,
      remaining: 7,
      total: 7,
    });
    expect(scheduleTaskCountLabel(scheduleTaskCounts(plan.blocks))).toBe(
      "0 tasks complete · 7 tasks remaining",
    );
    plan = setScheduleBlockStatus(plan, "mon", "done");
    expect(scheduleTaskCountLabel(scheduleTaskCounts(plan.blocks))).toBe(
      "1 task complete · 6 tasks remaining",
    );
    for (const id of ["tue", "wed", "thu"] as const) {
      plan = setScheduleBlockStatus(plan, id, "done");
    }
    expect(scheduleTaskCounts(plan.blocks)).toEqual({
      complete: 4,
      remaining: 3,
      total: 7,
    });
    expect(scheduleTaskCountLabel(scheduleTaskCounts(plan.blocks))).toBe(
      "4 tasks complete · 3 tasks remaining",
    );
  });

  it("stores multiple schedules and migrates legacy single plan", () => {
    const a = weeklyPlan({
      ownerId: "self",
      ownerLabel: "Me",
      hustleId: "airbnb",
      hustleLabel: "Airbnb",
      ageGroup: "adult",
      blueprintId: "bp",
      dueDate: "2026-08-23",
    });
    const b = weeklyPlan({
      ownerId: "c1",
      ownerLabel: "Kai",
      hustleId: "dog-walk",
      hustleLabel: "Dog walking",
      ageGroup: "kids",
      blueprintId: "bp-k",
      dueDate: "2026-08-23",
    });
    let store = upsertSchedule(normalizeHustleScheduleStore({}), a);
    store = upsertSchedule(store, b);
    expect(store.schedules).toHaveLength(2);
    expect(schedulePlanId("self", "airbnb")).toBe(a.id);

    const legacy = normalizeHustleScheduleStore({
      hustleId: "airbnb",
      hustleLabel: "Airbnb",
      ageGroup: "adult",
      dueDate: "2026-08-23",
      blocks: a.blocks,
    });
    expect(legacy.schedules).toHaveLength(1);
    expect(legacy.schedules[0]!.ownerId).toBe("self");
  });

  it("can Make new schedule for the same member + hustle without replacing the first", () => {
    const first = weeklyPlan({
      ownerId: "self",
      ownerLabel: "Me",
      hustleId: "airbnb",
      hustleLabel: "Airbnb Hosting",
      ageGroup: "adult",
      blueprintId: "bp",
      dueDate: "2026-08-23",
      ref: new Date(2026, 7, 18),
    });
    const second = weeklyPlan({
      ownerId: "self",
      ownerLabel: "Me",
      hustleId: "airbnb",
      hustleLabel: "Airbnb Hosting",
      ageGroup: "adult",
      blueprintId: "bp",
      dueDate: "2026-08-30",
      ref: new Date(2026, 7, 25),
      distinct: true,
    });
    expect(first.id).toBe(schedulePlanId("self", "airbnb"));
    expect(second.id).toBe(distinctSchedulePlanId("self", "airbnb", new Date(2026, 7, 25)));
    expect(second.id).not.toBe(first.id);

    let store = upsertSchedule(normalizeHustleScheduleStore({}), first);
    store = upsertSchedule(store, second);
    expect(store.schedules).toHaveLength(2);
    expect(schedulesForOwnerHustle(store, "self", "airbnb")).toHaveLength(2);
    expect(scheduleTabLabel(first)).toMatch(/Me · Airbnb Hosting · /);
  });

  it("collects overdue plan and incomplete blocks but skips Done", () => {
    const plan = weeklyPlan({
      ownerId: "self",
      ownerLabel: "Me",
      hustleId: "airbnb",
      hustleLabel: "Airbnb",
      ageGroup: "adult",
      blueprintId: "bp",
      dueDate: "2026-08-01",
    });
    plan.blocks[0]!.dueDate = "2026-08-01";
    plan.blocks[0]!.status = "not_started";
    plan.blocks[0]!.done = false;
    plan.blocks[1]!.dueDate = "2026-08-01";
    plan.blocks[1] = {
      ...plan.blocks[1]!,
      status: "done",
      done: true,
    };
    plan.blocks[2]!.dueDate = "2026-08-20";
    plan.blocks[2]!.done = false;
    const store = upsertSchedule(normalizeHustleScheduleStore({}), plan);
    const overdue = collectOverdueScheduleItems(store, "2026-08-10");
    expect(overdue.some((o) => o.kind === "plan")).toBe(true);
    expect(overdue.some((o) => o.kind === "block" && o.blockId === "mon")).toBe(true);
    expect(overdue.some((o) => o.blockId === "tue")).toBe(false);
    expect(overdue.some((o) => o.blockId === "wed")).toBe(false);
  });

  it("requires hours > 0 on every day block before save", () => {
    expect(isScheduleBlockHoursValid(0)).toBe(false);
    expect(isScheduleBlockHoursValid(0.5)).toBe(true);
    const plan = weeklyPlan({
      ownerId: "self",
      ownerLabel: "Me",
      hustleId: "pod",
      hustleLabel: "POD",
      ageGroup: "adult",
      blueprintId: "bp",
      dueDate: "2026-08-23",
    });
    expect(planHasRequiredHours(plan)).toBe(true);
    expect(plan.blocks.every((b) => b.hoursLogged > 0)).toBe(true);
    let cleared = setScheduleBlockHours(plan, "mon", 0);
    cleared = {
      ...cleared,
      blocks: cleared.blocks.map((b) =>
        b.id === "mon" ? { ...b, hoursLogged: 0, minutes: 0 } : b,
      ),
    };
    expect(planHasRequiredHours(cleared)).toBe(false);
    expect(planBlocksMissingHours(cleared)).toEqual(["mon"]);
  });

  it("filters saved schedules by family member or All", () => {
    const a = weeklyPlan({
      ownerId: "self",
      ownerLabel: "Me",
      hustleId: "airbnb",
      hustleLabel: "Airbnb",
      ageGroup: "adult",
      blueprintId: "bp",
      dueDate: "2026-08-23",
    });
    const b = weeklyPlan({
      ownerId: "c1",
      ownerLabel: "Kai",
      hustleId: "dog-walk",
      hustleLabel: "Dog walking",
      ageGroup: "kids",
      blueprintId: "bp-k",
      dueDate: "2026-08-23",
    });
    const schedules = [a, b];
    expect(filterSchedulesByOwner(schedules, "all")).toHaveLength(2);
    expect(filterSchedulesByOwner(schedules, "self").map((s) => s.id)).toEqual([a.id]);
    expect(filterSchedulesByOwner(schedules, "c1").map((s) => s.id)).toEqual([b.id]);
  });

  it("opens a saved schedule without treating it as an unsaved edit", () => {
    const a = weeklyPlan({
      ownerId: "self",
      ownerLabel: "Me",
      hustleId: "airbnb",
      hustleLabel: "Airbnb",
      ageGroup: "adult",
      blueprintId: "bp",
      dueDate: "2026-08-23",
    });
    const b = weeklyPlan({
      ownerId: "c1",
      ownerLabel: "Kai",
      hustleId: "dog-walk",
      hustleLabel: "Dog walking",
      ageGroup: "kids",
      blueprintId: "bp-k",
      dueDate: "2026-08-23",
    });
    let store = upsertSchedule(normalizeHustleScheduleStore({}), a);
    store = upsertSchedule(store, b);
    const stamped = store.updatedAt;
    const opened = activateSchedule(store, a.id);
    expect(opened.activeScheduleId).toBe(a.id);
    expect(opened.updatedAt).toBe(stamped);
    expect(scheduleSaveEnabled(false)).toBe(false);
    expect(scheduleSaveEnabled(true)).toBe(true);
    expect(scheduleSaveEnabled(true, true)).toBe(false);
  });

  it("clicking a family member shows their schedules without auto-opening someone else", () => {
    const a = weeklyPlan({
      ownerId: "self",
      ownerLabel: "Me",
      hustleId: "airbnb",
      hustleLabel: "Airbnb",
      ageGroup: "adult",
      blueprintId: "bp",
      dueDate: "2026-08-23",
    });
    const b = weeklyPlan({
      ownerId: "c1",
      ownerLabel: "Kai",
      hustleId: "dog-walk",
      hustleLabel: "Dog walking",
      ageGroup: "kids",
      blueprintId: "bp-k",
      dueDate: "2026-08-23",
    });
    const schedules = [a, b];
    expect(activeScheduleAfterOwnerFilter(schedules, "c1", a.id)).toBeNull();
    expect(activeScheduleAfterOwnerFilter(schedules, "c1", b.id)).toBe(b.id);
    expect(activeScheduleAfterOwnerFilter(schedules, "all", a.id)).toBe(a.id);
  });

  it("hides unregistered Register-My-Kid rows from the schedule member list", () => {
    const kids = [
      { id: "c1", displayName: "Ruthie", ageBand: "kids" as const, source: "profile" as const },
      {
        id: "c2",
        displayName: "Register",
        ageBand: "kids" as const,
        source: "signup" as const,
        needsRegistration: true,
      },
    ];
    expect(scheduleEligibleFamilyChildren(kids).map((c) => c.displayName)).toEqual(["Ruthie"]);
    expect(
      familyMemberOptions("Evelyn", scheduleEligibleFamilyChildren(kids)).map((m) => m.label),
    ).toEqual(["Evelyn", "Ruthie"]);
  });

  it("creates blueprint goals and migrates missing fields on normalize", () => {
    const plan = weeklyPlan({
      ownerId: "self",
      ownerLabel: "Me",
      hustleId: "pod",
      hustleLabel: "POD Shop",
      ageGroup: "adult",
      blueprintId: "bp",
      dueDate: "2026-08-23",
    });
    expect(plan.blueprintGoals.marketingPlan).toContain("POD Shop");
    expect(plan.blueprintGoals.targetSalesUsd).toBe(0);
    expect(plan.roundups).toEqual([]);

    const migrated = normalizeHustleScheduleStore({
      version: 3,
      schedules: [
        {
          id: plan.id,
          ownerId: "self",
          ownerLabel: "Me",
          hustleId: "pod",
          hustleLabel: "POD Shop",
          ageGroup: "adult",
          blueprintId: "bp",
          dueDate: "2026-08-23",
          weekStart: plan.weekStart,
          blocks: plan.blocks,
          reminderCadence: "none",
          updatedAt: plan.updatedAt,
        },
      ],
      deleted: [],
      activeScheduleId: plan.id,
      updatedAt: plan.updatedAt,
    });
    expect(migrated.schedules[0]!.blueprintGoals.marketingPlan.length).toBeGreaterThan(0);
    expect(migrated.schedules[0]!.roundups).toEqual([]);
  });

  it("grades the week from % of day blocks complete", () => {
    let plan = weeklyPlan({
      ownerId: "self",
      ownerLabel: "Me",
      hustleId: "pod",
      hustleLabel: "POD",
      ageGroup: "adult",
      blueprintId: "bp",
      dueDate: "2026-08-23",
    });
    for (const b of plan.blocks) {
      plan = setScheduleBlockStatus(plan, b.id, "done");
    }

    const grade = gradeScheduleWeek(plan);
    expect(grade.score).toBe(100);
    expect(grade.letter).toBe("A");
    expect(grade.mark === "A" || grade.mark === "A+").toBe(true);
    expect(grade.celebration).toBe("a_pop");
    expect(grade.pepTalk.length).toBeGreaterThan(10);
    expect(grade.breakdown.completionPct).toBe(100);

    const graded = applyScheduleWeekGrade(plan, plan.weekStart, "2026-08-21T12:00:00.000Z");
    expect(getWeekRoundup(graded).grade?.letter).toBe("A");
    expect(getWeekRoundup(graded).grade?.score).toBe(100);
    expect(getWeekRoundup(graded).gradedAt).toBe("2026-08-21T12:00:00.000Z");

    const weak = gradeScheduleWeek(
      weeklyPlan({
        ownerId: "self",
        ownerLabel: "Me",
        hustleId: "x",
        hustleLabel: "X",
        ageGroup: "adult",
        blueprintId: null,
        dueDate: "2026-08-23",
      }),
    );
    expect(weak.letter).toBe("F");
    expect(weak.score).toBe(0);
    expect(weak.celebration).toBe("none");
    expect(weak.pepTalk.length).toBeGreaterThan(10);
  });

  it("maps B+ to congrats celebration and A to a_pop", () => {
    expect(gradeMarkFromScore(87)).toBe("B+");
    expect(celebrationFromMark("B+")).toBe("congrats");
    expect(celebrationFromMark("A")).toBe("a_pop");
    expect(celebrationFromMark("A+")).toBe("a_pop");
    expect(pepTalkForMark("B+", 87)).toMatch(/B\+/);
  });

  it("SCHED-GRADE-001: 7-day Done counts include D (4/7 ≈ 57%)", () => {
    expect(SCHEDULE_GRADE_D_MIN).toBe(50);
    expect(gradeMarkFromScore(49)).toBe("F");
    expect(gradeMarkFromScore(50)).toBe("D");
    expect(gradeMarkFromScore(57)).toBe("D");
    expect(gradeMarkFromScore(69)).toBe("D");
    expect(gradeMarkFromScore(70)).toBe("C");

    const marksForDone = (doneCount: number) => {
      let plan = weeklyPlan({
        ownerId: "self",
        ownerLabel: "Me",
        hustleId: "pod",
        hustleLabel: "POD",
        ageGroup: "adult",
        blueprintId: "bp",
        dueDate: "2026-08-23",
      });
      for (const b of plan.blocks.slice(0, doneCount)) {
        plan = setScheduleBlockStatus(plan, b.id, "done");
      }
      return gradeScheduleWeek(plan);
    };

    expect(marksForDone(0).mark).toBe("F");
    expect(marksForDone(3).mark).toBe("F");
    expect(marksForDone(3).score).toBe(43);
    const dGrade = marksForDone(4);
    expect(dGrade.letter).toBe("D");
    expect(dGrade.mark).toBe("D");
    expect(dGrade.score).toBe(57);
    expect(marksForDone(5).mark).toBe("C");
    expect(marksForDone(6).mark).toBe("B");
    expect(marksForDone(7).mark).toBe("A+");
  });

  it("computes blueprint P&L profit and formats estimates", () => {
    expect(blueprintProfitUsd({ marketingPlan: "", targetSalesUsd: 0, actualSalesUsd: 120, expensesUsd: 40 })).toBe(80);
    expect(blueprintProfitUsd({ marketingPlan: "", targetSalesUsd: 0, actualSalesUsd: 20, expensesUsd: 50 })).toBe(-30);
    expect(formatEstimateMinutes(45)).toBe("45 min");
    expect(formatEstimateMinutes(90)).toBe("1h 30m");
    expect(formatEstimateMinutes(120)).toBe("2h");
  });

  it("lists validation errors when hours are missing", () => {
    let plan = weeklyPlan({
      ownerId: "self",
      ownerLabel: "Me",
      hustleId: "pod",
      hustleLabel: "POD",
      ageGroup: "adult",
      blueprintId: "bp",
      dueDate: "2026-08-23",
    });
    plan = {
      ...plan,
      blocks: plan.blocks.map((b) => ({ ...b, hoursLogged: 0, minutes: 0 })),
    };
    const errors = collectScheduleValidationErrors({ schedules: [plan] });
    expect(errors.length).toBe(1);
    expect(errors[0]).toMatch(/Hrs logged|Est/i);
  });

  it("treats estimate minutes as satisfying hours and can backfill", () => {
    let plan = weeklyPlan({
      ownerId: "self",
      ownerLabel: "Me",
      hustleId: "pod",
      hustleLabel: "POD",
      ageGroup: "adult",
      blueprintId: "bp",
      dueDate: "2026-08-23",
    });
    plan = {
      ...plan,
      blocks: plan.blocks.map((b) => ({ ...b, hoursLogged: 0, minutes: 60 })),
    };
    expect(planHasRequiredHours(plan)).toBe(true);
    const filled = ensureHoursFromEstimates(plan);
    expect(filled.blocks.every((b) => b.hoursLogged === 1)).toBe(true);
  });

  it("Grade me stays on the current tab and shows the letter in the button", () => {
    expect(suiteViewAfterGradeMe("tracker")).toBe("tracker");
    expect(suiteViewAfterGradeMe("blueprint")).toBe("blueprint");
    expect(suiteViewAfterGradeMe("roundup")).toBe("roundup");
    expect(scheduleStatsBarShowsGradeMe("tracker")).toBe(true);
    expect(scheduleStatsBarShowsGradeMe("blueprint")).toBe(true);
    expect(scheduleStatsBarShowsGradeMe("pnl")).toBe(true);
    expect(scheduleStatsBarShowsGradeMe("progress")).toBe(true);
    expect(scheduleStatsBarShowsGradeMe("roundup")).toBe(true);
    expect(scheduleGradeMeButtonLabel(null)).toBe("Grade me");
    expect(scheduleGradeMeButtonLabel({ letter: "D", mark: "D", score: 57 })).toBe(
      "Current Grade: D (57%)",
    );
    expect(scheduleGradeMeButtonLabel({ letter: "A", mark: "A+", score: 100 })).toBe(
      "Current Grade: A+ (100%)",
    );
  });

  it("updates Current Grade live as Plan tracker Done counts change", () => {
    let plan = weeklyPlan({
      ownerId: "self",
      ownerLabel: "Me",
      hustleId: "pod",
      hustleLabel: "POD",
      ageGroup: "adult",
      blueprintId: "bp",
      dueDate: "2026-08-23",
    });
    expect(liveScheduleWeekGrade(plan, getWeekRoundup(plan).grade)).toBeNull();
    expect(withRefreshedWeekGrade(plan)).toBe(plan);

    for (const id of ["mon", "tue", "wed", "thu"] as const) {
      plan = setScheduleBlockStatus(plan, id, "done");
    }
    plan = applyScheduleWeekGrade(plan, plan.weekStart);
    expect(liveScheduleWeekGrade(plan, getWeekRoundup(plan).grade)?.mark).toBe("D");

    plan = setScheduleBlockStatus(plan, "fri", "done");
    const live = liveScheduleWeekGrade(plan, getWeekRoundup(plan).grade);
    expect(live?.mark).toBe("C");
    expect(live?.score).toBe(71);
    expect(getWeekRoundup(plan).grade?.mark).toBe("D");

    plan = withRefreshedWeekGrade(plan);
    expect(getWeekRoundup(plan).grade?.mark).toBe("C");
    expect(scheduleGradeMeButtonLabel(getWeekRoundup(plan).grade)).toBe("Current Grade: C (71%)");
  });

  it("orders Schedule Suite views Blueprint, Plan tracker, Weekly roundup, then P&L", () => {
    expect(SCHEDULE_SUITE_VIEW_TABS.map((t) => t.id)).toEqual([
      "blueprint",
      "tracker",
      "roundup",
      "pnl",
      "progress",
    ]);
    expect(SCHEDULE_SUITE_VIEW_TABS.map((t) => t.label)).toEqual([
      "Blueprint plan",
      "Plan tracker",
      "Weekly roundup",
      "P&L calculator",
      "Progress",
    ]);
    expect(SCHEDULE_SUITE_DEFAULT_VIEW).toBe("blueprint");
  });

  it("points Schedule Suite dashboard links at My Dashboard with a schedule hash", () => {
    expect(SCHEDULE_SUITE_DASHBOARD_HREF).toBe("/my-dashboard#schedule");
    expect(isScheduleSuiteDashboardHash("#schedule")).toBe(true);
    expect(isScheduleSuiteDashboardHash("schedule")).toBe(true);
    expect(isScheduleSuiteDashboardHash("#blueprint")).toBe(false);
  });

  it("Email Me targets the Email reminders section id", () => {
    expect(SCHEDULE_EMAIL_SECTION_ID).toBe("schedule-email-section");
  });

  it("Grade me from tracker still grades into the week roundup", () => {
    let plan = weeklyPlan({
      ownerId: "self",
      ownerLabel: "Me",
      hustleId: "pod",
      hustleLabel: "POD",
      ageGroup: "adult",
      blueprintId: "bp",
      dueDate: "2026-08-23",
    });
    for (const b of plan.blocks) {
      plan = setScheduleBlockStatus(plan, b.id, "done");
    }
    const graded = applyScheduleWeekGrade(plan, plan.weekStart);
    expect(suiteViewAfterGradeMe("tracker")).toBe("tracker");
    expect(scheduleGradeMeButtonLabel(getWeekRoundup(graded).grade)).toBe("Current Grade: A+ (100%)");
    expect(getWeekRoundup(graded).grade?.score).toBe(100);
    expect(getWeekRoundup(graded).grade?.letter).toBe("A");
  });

  it("stores roundup action items as a stamped list and migrates legacy text", () => {
    const legacy = normalizeWeekRoundup(
      {
        weekStart: "2026-08-17",
        killedIt: "",
        needsImprovement: "",
        actionItems: "Call vendor\nShip samples",
        grade: null,
        gradedAt: null,
      },
      "2026-08-17",
    );
    expect(legacy?.actionItemEntries).toHaveLength(2);
    expect(legacy?.actionItemEntries[0]?.text).toBe("Call vendor");
    expect(legacy?.actionItemEntries[0]?.createdAt).toBe("");
    expect(legacy?.actionItems).toBe("Call vendor\nShip samples");

    let roundup = emptyWeekRoundup("2026-08-17");
    const stampedAt = new Date("2026-08-21T15:30:00.000Z");
    roundup = addScheduleActionItem(roundup, "Follow up leads", stampedAt);
    expect(roundup.actionItemEntries).toHaveLength(1);
    expect(roundup.actionItemEntries[0]?.text).toBe("Follow up leads");
    expect(roundup.actionItemEntries[0]?.createdAt).toBe(stampedAt.toISOString());
    expect(roundup.actionItems).toBe("Follow up leads");
    expect(roundupHasActionItems(roundup)).toBe(true);
    expect(formatScheduleActionItemStamp(stampedAt.toISOString()).length).toBeGreaterThan(5);

    const removed = removeScheduleActionItem(roundup, roundup.actionItemEntries[0]!.id);
    expect(removed.actionItemEntries).toEqual([]);
    expect(removed.actionItems).toBe("");
    expect(roundupHasActionItems(removed)).toBe(false);

    let plan = weeklyPlan({
      ownerId: "self",
      ownerLabel: "Me",
      hustleId: "pod",
      hustleLabel: "POD",
      ageGroup: "adult",
      blueprintId: "bp",
      dueDate: "2026-08-23",
    });
    plan = upsertWeekRoundup(plan, addScheduleActionItem(getWeekRoundup(plan), "Book ads", stampedAt));
    expect(getWeekRoundup(plan).actionItemEntries[0]?.text).toBe("Book ads");
    expect(getWeekRoundup(plan).actionItems).toBe("Book ads");
  });
});
