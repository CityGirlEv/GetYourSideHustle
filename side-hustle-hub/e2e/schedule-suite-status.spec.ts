import { test, expect } from "@playwright/test";
import {
  applyScheduleBlockCheckbox,
  createSchedulePlan,
  filterSchedulesByOwner,
  isScheduleBlockHoursValid,
  planHasRequiredHours,
  scheduleStatusFromCheckboxChecked,
  setScheduleBlockHours,
} from "../src/lib/hustle-schedule";
import { buildWeeklyPlanHtml } from "../src/lib/hustle-schedule-export";

/**
 * Checkbox ↔ status: checked = Done, unchecked = Not Started.
 * Hours mandatory; weekly plan is download-only (no Weekly plan tab).
 */
test.describe("Schedule Suite checkbox, hours, exports", () => {
  test("checked maps to Done and unchecked to Not Started (helper + DOM)", async ({
    page,
  }) => {
    expect(scheduleStatusFromCheckboxChecked(true)).toBe("done");
    expect(scheduleStatusFromCheckboxChecked(false)).toBe("not_started");

    let plan = createSchedulePlan({
      ownerId: "self",
      ownerLabel: "Me",
      hustleId: "airbnb",
      hustleLabel: "Airbnb",
      ageGroup: "adult",
      blueprintId: null,
      dueDate: "2026-08-23",
    });
    plan = applyScheduleBlockCheckbox(plan, "mon", true);
    expect(plan.blocks.find((b) => b.id === "mon")?.status).toBe("done");
    plan = applyScheduleBlockCheckbox(plan, "mon", false);
    expect(plan.blocks.find((b) => b.id === "mon")?.status).toBe("not_started");

    await page.exposeFunction(
      "gyshStatusFromCheckbox",
      (checked: boolean) => scheduleStatusFromCheckboxChecked(checked),
    );
    await page.setContent(`
      <label>
        <input type="checkbox" data-testid="schedule-block-check-mon" />
        Mon
      </label>
      <select data-testid="schedule-block-status-mon">
        <option value="not_started">Not Started</option>
        <option value="in_progress">In Progress</option>
        <option value="done">Done</option>
        <option value="blocked">Blocked</option>
      </select>
      <script>
        const check = document.querySelector('[data-testid="schedule-block-check-mon"]');
        const status = document.querySelector('[data-testid="schedule-block-status-mon"]');
        check.addEventListener('change', async () => {
          status.value = await window.gyshStatusFromCheckbox(check.checked);
        });
      </script>
    `);

    const checkbox = page.getByTestId("schedule-block-check-mon");
    const status = page.getByTestId("schedule-block-status-mon");

    await checkbox.check();
    await expect(status).toHaveValue("done");

    await checkbox.uncheck();
    await expect(status).toHaveValue("not_started");
  });

  test("hours are mandatory and family filter + weekly HTML export work", () => {
    expect(isScheduleBlockHoursValid(0)).toBe(false);
    expect(isScheduleBlockHoursValid(1)).toBe(true);

    const selfPlan = createSchedulePlan({
      ownerId: "self",
      ownerLabel: "Me",
      hustleId: "airbnb",
      hustleLabel: "Airbnb",
      ageGroup: "adult",
      blueprintId: null,
      dueDate: "2026-08-23",
    });
    const kidPlan = createSchedulePlan({
      ownerId: "c1",
      ownerLabel: "Kai",
      hustleId: "dog",
      hustleLabel: "Dog walking",
      ageGroup: "kids",
      blueprintId: null,
      dueDate: "2026-08-23",
    });
    expect(planHasRequiredHours(selfPlan)).toBe(true);
    expect(planHasRequiredHours(setScheduleBlockHours(selfPlan, "fri", 0))).toBe(false);
    expect(filterSchedulesByOwner([selfPlan, kidPlan], "all")).toHaveLength(2);
    expect(filterSchedulesByOwner([selfPlan, kidPlan], "c1")).toHaveLength(1);

    const html = buildWeeklyPlanHtml(selfPlan);
    expect(html).toContain("Weekly Plan");
    expect(html).toContain("Airbnb");
  });

  test("Join page still advertises Schedule Suite for Pro+", async ({ page }) => {
    await page.goto("/");
    await page.getByTestId("nav-join").click();
    await expect(page.getByTestId("membership-schedule-suite")).toBeVisible();
  });
});
