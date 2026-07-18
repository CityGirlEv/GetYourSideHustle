import { describe, expect, it } from "vitest";
import { completedFacebookPostSlots } from "@/lib/content-factory/editorial-calendar-progress";
import { mergeCompletedTaskRows } from "@/lib/content-factory/editorial-calendar-progress.server";

describe("editorial-calendar-progress", () => {
  it("merges completed tasks from multiple admin rows into one team view", () => {
    const merged = mergeCompletedTaskRows([
      { completed_tasks: { "2026-06-19:article:0:produce": true } },
      { completed_tasks: { "2026-06-20:newsletter:0:launch": true } },
    ]);
    expect(merged).toEqual({
      "2026-06-19:article:0:produce": true,
      "2026-06-20:newsletter:0:launch": true,
    });
  });

  it("collects completed Facebook post slots from scoped task ids", () => {    const slots = completedFacebookPostSlots({
      "2026-06-21:facebook_post:1:launch": true,
      "2026-06-23:facebook_post:0:launch": true,
      "2026-06-24:article:1:launch": true,
    });
    expect([...slots].sort()).toEqual([0, 1]);
  });
});
