import { test, expect } from "@playwright/test";
import {
  SCHEDULE_EMAIL_SECTION_ID,
  applyScheduleWeekGrade,
  createSchedulePlan,
  getWeekRoundup,
  scheduleGradeMeButtonLabel,
  scheduleStatsBarShowsGradeMe,
  setScheduleBlockStatus,
  suiteViewAfterGradeMe,
  type ScheduleSuiteView,
} from "../src/lib/hustle-schedule";

/**
 * Grade Me → Weekly Roundup (single Grade me button) + Email Me scroll target.
 */
test.describe("Schedule Suite Grade Me + Email Me", () => {
  test("helpers: Grade me stays on the current tab; button shows Current Grade", () => {
    expect(suiteViewAfterGradeMe("tracker")).toBe("tracker");
    expect(scheduleStatsBarShowsGradeMe("tracker")).toBe(true);
    expect(scheduleStatsBarShowsGradeMe("roundup")).toBe(true);
    expect(SCHEDULE_EMAIL_SECTION_ID).toBe("schedule-email-section");
  });

  test("Grade me applies week grade for Roundup display", () => {
    let plan = createSchedulePlan({
      ownerId: "self",
      ownerLabel: "Me",
      hustleId: "airbnb",
      hustleLabel: "Airbnb",
      ageGroup: "adult",
      blueprintId: null,
      dueDate: "2026-08-23",
    });
    for (const b of plan.blocks.slice(0, 5)) {
      plan = setScheduleBlockStatus(plan, b.id, "done");
    }
    const graded = applyScheduleWeekGrade(plan, plan.weekStart);
    const grade = getWeekRoundup(graded).grade;
    expect(grade).toBeTruthy();
    expect(grade!.score).toBeGreaterThan(0);
    expect(["A", "B", "C", "D", "F"]).toContain(grade!.letter);
  });

  test("DOM: Grade me stays on the tab and shows Current Grade in the button", async ({ page }) => {
    await page.exposeFunction(
      "gyshStatsBarShowsGradeMe",
      (view: ScheduleSuiteView) => scheduleStatsBarShowsGradeMe(view),
    );
    await page.exposeFunction(
      "gyshSuiteViewAfterGradeMe",
      (view: ScheduleSuiteView) => suiteViewAfterGradeMe(view),
    );
    await page.exposeFunction("gyshGradeMeLabel", (grade: { letter: string; mark: string; score: number } | null) =>
      scheduleGradeMeButtonLabel(grade),
    );

    await page.setContent(`
      <div data-testid="schedule-suite-views">
        <button type="button" data-testid="schedule-view-tracker" data-active="1">Plan tracker</button>
        <button type="button" data-testid="schedule-view-roundup" data-active="0">Weekly roundup</button>
        <a href="#${SCHEDULE_EMAIL_SECTION_ID}" data-testid="schedule-email-me-link">Email Me</a>
      </div>
      <div data-testid="schedule-suite-stats">
        <button type="button" data-testid="schedule-grade-me-anytime">Grade me</button>
      </div>
      <div id="${SCHEDULE_EMAIL_SECTION_ID}" data-testid="schedule-email-section" style="margin-top:1200px;padding:24px;">
        Email reminders
      </div>
      <script>
        let suiteView = "tracker";
        const anytime = document.querySelector('[data-testid="schedule-grade-me-anytime"]');
        const tabTracker = document.querySelector('[data-testid="schedule-view-tracker"]');
        const tabRoundup = document.querySelector('[data-testid="schedule-view-roundup"]');

        async function render() {
          const showAnytime = await window.gyshStatsBarShowsGradeMe(suiteView);
          anytime.hidden = !showAnytime;
          tabTracker.setAttribute("data-active", suiteView === "tracker" ? "1" : "0");
          tabRoundup.setAttribute("data-active", suiteView === "roundup" ? "1" : "0");
        }

        async function runGrade() {
          suiteView = await window.gyshSuiteViewAfterGradeMe(suiteView);
          anytime.textContent = await window.gyshGradeMeLabel({ letter: "A", mark: "A+", score: 100 });
          await render();
        }

        anytime.addEventListener("click", () => void runGrade());
        document.querySelector('[data-testid="schedule-email-me-link"]').addEventListener("click", (e) => {
          e.preventDefault();
          document.getElementById("${SCHEDULE_EMAIL_SECTION_ID}")?.scrollIntoView({ behavior: "instant", block: "start" });
        });
        void render();
      </script>
    `);

    await expect(page.getByTestId("schedule-grade-me-anytime")).toBeVisible();
    await expect(page.getByTestId("schedule-grade-me-anytime")).toHaveText("Grade me");
    await expect(page.getByTestId("schedule-view-tracker")).toHaveAttribute("data-active", "1");

    await page.getByTestId("schedule-grade-me-anytime").click();

    await expect(page.getByTestId("schedule-view-tracker")).toHaveAttribute("data-active", "1");
    await expect(page.getByTestId("schedule-view-roundup")).toHaveAttribute("data-active", "0");
    await expect(page.getByTestId("schedule-grade-me-anytime")).toBeVisible();
    await expect(page.getByTestId("schedule-grade-me-anytime")).toHaveText("Current Grade: A+ (100%)");
    await expect(page.getByTestId("schedule-grade-me-anytime")).toHaveCount(1);
  });

  test("DOM: Email Me scrolls to Email reminders section", async ({ page }) => {
    await page.setContent(`
      <div style="height:800px;">
        <a href="#${SCHEDULE_EMAIL_SECTION_ID}" data-testid="schedule-email-me-link">Email Me</a>
      </div>
      <div id="${SCHEDULE_EMAIL_SECTION_ID}" data-testid="schedule-email-section" style="margin-top:1600px;padding:40px;height:200px;">
        Email reminders
        <select data-testid="schedule-suite-cadence">
          <option value="none">No email reminders</option>
          <option value="weekly">Weekly</option>
        </select>
      </div>
      <script>
        document.querySelector('[data-testid="schedule-email-me-link"]').addEventListener("click", (e) => {
          e.preventDefault();
          document.getElementById("${SCHEDULE_EMAIL_SECTION_ID}")?.scrollIntoView({ behavior: "instant", block: "start" });
        });
      </script>
    `);

    await expect(page.getByTestId("schedule-email-me-link")).toBeVisible();
    await page.getByTestId("schedule-email-me-link").click();
    await expect(page.getByTestId("schedule-email-section")).toBeInViewport();
    await expect(page.getByTestId("schedule-suite-cadence")).toBeVisible();
  });
});
