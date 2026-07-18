import { describe, expect, it } from "vitest";
import {
  buildFacebookPostScheduleBySlot,
  facebookPostImagePromptSlot,
  formatFacebookPostDateLabel,
} from "@/lib/content-factory/facebook-post-calendar";
import { DOCTOR_NETWORK_CONTENT_DATE } from "@/lib/content-factory/weekly-editorial-schedule";

describe("facebook-post-calendar", () => {
  it("maps image prompt slots to facebook post slots", () => {
    expect(facebookPostImagePromptSlot(0)).toBe(0);
    expect(facebookPostImagePromptSlot(4)).toBe(3);
    expect(facebookPostImagePromptSlot(3)).toBeNull();
  });

  it("includes launch week and doctor-network post dates", () => {
    const schedule = buildFacebookPostScheduleBySlot();
    expect(schedule.get(0)?.postDate).toBe("2026-06-23");
    expect(schedule.get(0)?.postTime).toBe("10:30 AM");
    expect(schedule.get(5)?.postDate).toBe(DOCTOR_NETWORK_CONTENT_DATE);
    expect(formatFacebookPostDateLabel("2026-06-23")).toMatch(/Jun 23, 2026/);
  });
});
