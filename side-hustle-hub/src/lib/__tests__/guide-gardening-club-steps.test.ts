import { describe, expect, it } from "vitest";
import { detailedStepsForGuide } from "../guide-detailed-steps";
import { guideKitForId } from "../guide-tools";

describe("start-gardening-club (#105) meetup hosting steps", () => {
  it("includes Meetup setup, host supplies/food, and meetup objective + walk-aways", () => {
    const steps = detailedStepsForGuide("start-gardening-club", { audiences: ["senior"] }) ?? [];
    const titles = steps.map((s) => s.title);

    expect(titles.some((t) => /meetup objective|topic|walk-away|takeaway/i.test(t))).toBe(true);
    expect(titles.some((t) => /meetup\.com|set up.*meetup/i.test(t))).toBe(true);
    expect(titles.some((t) => /hosting supplies|food|drinks/i.test(t))).toBe(true);

    const objective = steps.find((s) => /meetup objective|topic|walk-away/i.test(s.title));
    expect(objective?.desc).toMatch(/objective/i);
    expect(objective?.desc).toMatch(/topic/i);
    expect(objective?.desc).toMatch(/walk-away/i);

    const meetup = steps.find((s) => /meetup\.com|set up.*meetup/i.test(s.title));
    expect(meetup?.desc).toMatch(/meetup\.com/i);
    expect(meetup?.desc).toMatch(/Start a new group|Starter/i);
    expect(meetup?.desc).toMatch(/present in person|co-host/i);

    const supplies = steps.find((s) => /hosting supplies|food|drinks/i.test(s.title));
    expect(supplies?.desc).toMatch(/name tags/i);
    expect(supplies?.desc).toMatch(/snack|food|drink|water/i);
  });

  it("exposes Meetup on the Tools tab and expands the host supply list", () => {
    const kit = guideKitForId("start-gardening-club");
    expect(kit.tools.some((t) => t.id === "meetup" && t.url?.includes("meetup.com"))).toBe(true);

    const labels = (kit.supplies?.items ?? []).map((i) => i.name).join(" ");
    expect(labels).toMatch(/name tag/i);
    expect(labels).toMatch(/snack/i);
    expect(labels).toMatch(/water|drink|tea/i);
  });
});
