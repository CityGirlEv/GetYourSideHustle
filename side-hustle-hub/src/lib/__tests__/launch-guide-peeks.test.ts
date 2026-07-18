import { describe, expect, it } from "vitest";
import {
  getLaunchGuidePeekSections,
  sneakPeekText,
} from "../launch-guide-peeks";
import { LAUNCH_GUIDES } from "../launch-guides";
import { guidesForAudience } from "../kids-guides";
import { SENIOR_GUIDE_TEASERS } from "../seniors-content";

describe("launch guide peeks", () => {
  it("organizes Kids, Junior, Senior, and Adult sections from real data", () => {
    const sections = getLaunchGuidePeekSections();
    expect(sections.map((s) => s.id)).toEqual(["kids", "junior", "senior", "adult"]);

    const kids = sections.find((s) => s.id === "kids")!;
    const junior = sections.find((s) => s.id === "junior")!;
    const senior = sections.find((s) => s.id === "senior")!;
    const adult = sections.find((s) => s.id === "adult")!;

    expect(kids.guides.map((g) => g.id)).toEqual(guidesForAudience("kids").map((g) => g.id));
    expect(junior.guides.map((g) => g.id)).toEqual(guidesForAudience("junior").map((g) => g.id));
    expect(senior.guides.map((g) => g.id)).toEqual(SENIOR_GUIDE_TEASERS.map((g) => g.id));
    expect(adult.guides.map((g) => g.id)).toEqual(LAUNCH_GUIDES.map((g) => g.id));

    for (const section of sections) {
      for (const guide of section.guides) {
        expect(guide.title.length).toBeGreaterThan(4);
        expect(guide.peek.length).toBeGreaterThan(12);
      }
    }
  });

  it("routes adult peeks to Launch Guides and audience peeks to their hubs", () => {
    const sections = getLaunchGuidePeekSections();
    expect(sections.find((s) => s.id === "adult")!.guides[0].nav).toEqual({
      view: "guides",
      hustleId: LAUNCH_GUIDES[0].id,
    });
    expect(sections.find((s) => s.id === "kids")!.guides[0].nav).toEqual({
      view: "kids",
      mode: "kids",
    });
    expect(sections.find((s) => s.id === "junior")!.guides[0].nav).toEqual({
      view: "kids",
      mode: "junior",
    });
    expect(sections.find((s) => s.id === "senior")!.guides[0].nav).toEqual({
      view: "seniors",
    });
  });

  it("shortens long blurbs to a sneak peek", () => {
    const long =
      "Name something you want, pick a simple price, and count how many little jobs it might take — with a parent helping. Extra detail that should be trimmed when needed.";
    const peek = sneakPeekText(long, 80);
    expect(peek.length).toBeLessThanOrEqual(80);
    expect(peek.startsWith("Name something")).toBe(true);
  });
});
