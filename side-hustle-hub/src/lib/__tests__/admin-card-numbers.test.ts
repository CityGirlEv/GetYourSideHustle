import { describe, expect, it } from "vitest";
import {
  cfCardNumber,
  taskCardNumber,
  testCardNumber,
  withCardNumberPrefix,
} from "../admin-card-numbers";
import { TEST_CASES } from "../gysh-test-plan";
import { AUTOMATED_PLAYWRIGHT_CASES, AUTOMATED_VITEST_CASES } from "../gysh-automated-tests";
import { GUIDE_REVIEW_CASES } from "../gysh-guide-review-cases";
import { guideIdFromGuideReviewCaseId } from "../guide-review-link";
import { SENIOR_PAGE_REVIEW_TASK_ID, MILITARY_VETERAN_CALLOUT_TASK_ID } from "../gysh-tasks";
import { SOCIAL_ANALYTICS_CHANNELS } from "../social-analytics-review-tasks";

describe("admin-card-numbers", () => {
  it("numbers GUIDE-REV tests with the pinned guide #", () => {
    expect(testCardNumber("GUIDE-REV-launch-rideshare")).toBe("#018");
    expect(testCardNumber("GUIDE-REV-launch-handyman")).toBe("#011");
  });

  it("gives every catalog test a unique non-empty number (except GUIDE-REV guide pins)", () => {
    const ids = [
      ...TEST_CASES.map((t) => t.id),
      ...GUIDE_REVIEW_CASES.map((t) => t.id),
      ...AUTOMATED_VITEST_CASES.map((t) => t.id),
      ...AUTOMATED_PLAYWRIGHT_CASES.map((t) => t.id),
    ];
    const nonGuide = [...new Set(ids)].filter((id) => !guideIdFromGuideReviewCaseId(id));
    const nums = nonGuide.map((id) => testCardNumber(id));
    expect(nums.every((n) => /^TST-\d{3,}$/.test(n))).toBe(true);
    expect(new Set(nums).size).toBe(nums.length);
    // Sibling VIDEO cases must not collide on embedded "003"
    expect(testCardNumber("VIDEO-003-EVELYN")).not.toBe(testCardNumber("VIDEO-003-TINA"));
    expect(testCardNumber("AUTH-001")).not.toBe(testCardNumber("JOIN-001"));
  });

  it("numbers numeric tasks as T-### and soft-launch via CF", () => {
    expect(taskCardNumber("T-18")).toBe("T-018");
    expect(taskCardNumber("T-LG-handyman")).toBe("#011");
    const cf = taskCardNumber("T-SL-S3-YT-FIRST-SHORT");
    expect(cf).toMatch(/^CF-\d{3}$/);
  });

  it("numbers seeded named tasks (membership / social / senior) as T-8xx", () => {
    const named = [
      SENIOR_PAGE_REVIEW_TASK_ID,
      MILITARY_VETERAN_CALLOUT_TASK_ID,
      "T-MEM-FREE",
      "T-MEM-STARTER",
      "T-MEM-PRO",
      "T-MEM-ELITE",
      ...SOCIAL_ANALYTICS_CHANNELS.map((c) => c.taskId),
    ];
    const nums = named.map((id) => taskCardNumber(id));
    expect(nums.every((n) => /^T-8\d{2}$/.test(n))).toBe(true);
    expect(new Set(nums).size).toBe(nums.length);
    expect(taskCardNumber("T-SENIOR-PAGE")).not.toBe("");
  });

  it("never leaves an unknown task or test without a number", () => {
    expect(taskCardNumber("T-CUSTOM-WIDGET")).toMatch(/^T-\d{3}$/);
    expect(testCardNumber("VT-FAIL-SOMETHING-NEW")).toMatch(/^TST-\d{3}$/);
  });

  it("numbers Content Factory items as CF-###", () => {
    expect(cfCardNumber("sl-s3-yt-first-short")).toMatch(/^CF-\d{3}$/);
  });

  it("prefixes titles without duplicating the number", () => {
    expect(withCardNumberPrefix("#018", "Rideshare")).toBe("#018 · Rideshare");
    expect(withCardNumberPrefix("#018", "#018 · Rideshare")).toBe("#018 · Rideshare");
  });
});
