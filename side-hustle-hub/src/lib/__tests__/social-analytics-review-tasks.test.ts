import { describe, expect, it } from "vitest";
import {
  SOCIAL_ANALYTICS_CHANNELS,
  ensureSocialAnalyticsReviewTasks,
  nextSocialAnalyticsDueDate,
  socialAnalyticsReviewNotes,
} from "../social-analytics-review-tasks";

describe("social analytics review tasks", () => {
  it("defines one task per GYSH channel + Kevina FB/YT + both personal pages", () => {
    const ids = SOCIAL_ANALYTICS_CHANNELS.map((c) => c.id).sort();
    expect(ids).toEqual(
      [
        "facebook_gysh",
        "facebook_kevina",
        "instagram_gysh",
        "personal_evelyn",
        "personal_tina",
        "tiktok_gysh",
        "youtube_gysh",
        "youtube_kevina",
      ].sort(),
    );
  });

  it("assigns Tina the FB + her personal page; Evelyn the rest", () => {
    const byAssignee = Object.fromEntries(
      SOCIAL_ANALYTICS_CHANNELS.map((c) => [c.id, c.assignedTo]),
    );
    expect(byAssignee.facebook_gysh).toBe("Tina");
    expect(byAssignee.facebook_kevina).toBe("Tina");
    expect(byAssignee.personal_tina).toBe("Tina");
    expect(byAssignee.instagram_gysh).toBe("Evelyn");
    expect(byAssignee.tiktok_gysh).toBe("Evelyn");
    expect(byAssignee.youtube_gysh).toBe("Evelyn");
    expect(byAssignee.youtube_kevina).toBe("Evelyn");
    expect(byAssignee.personal_evelyn).toBe("Evelyn");
  });

  it("includes paste-ready pull instructions in notes", () => {
    const fb = SOCIAL_ANALYTICS_CHANNELS.find((c) => c.id === "facebook_gysh")!;
    const notes = socialAnalyticsReviewNotes(fb);
    expect(notes).toContain("social-analytics-review:facebook_gysh");
    expect(notes).toContain("----- PASTE ANALYTICS BELOW -----");
    expect(notes).toContain("Top 3 posts");
    expect(notes).toContain("Every other day");
  });

  it("anchors every-other-day dues on Sep 11 2026", () => {
    expect(nextSocialAnalyticsDueDate(new Date(2026, 8, 10))).toBe("09/11/26");
    expect(nextSocialAnalyticsDueDate(new Date(2026, 8, 11))).toBe("09/11/26");
    expect(nextSocialAnalyticsDueDate(new Date(2026, 8, 12))).toBe("09/13/26");
    expect(nextSocialAnalyticsDueDate(new Date(2026, 8, 13))).toBe("09/13/26");
  });

  it("creates all eight tasks due on the next cadence day (tomorrow from Sep 10)", () => {
    const first = ensureSocialAnalyticsReviewTasks([]);
    expect(first.created).toHaveLength(8);
    const expectedDue = nextSocialAnalyticsDueDate();
    for (const t of first.created) {
      expect(t.dueDate).toBe(expectedDue);
    }
    const second = ensureSocialAnalyticsReviewTasks(first.tasks);
    expect(second.created).toHaveLength(0);
    expect(second.tasks).toHaveLength(8);
  });
});
