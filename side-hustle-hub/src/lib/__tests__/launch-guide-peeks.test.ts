import { describe, expect, it } from "vitest";
import {
  getLaunchGuidePeekSections,
  sneakPeekText,
} from "../launch-guide-peeks";
import { LAUNCH_GUIDES, sortGuidesFreeFirst } from "../launch-guides";
import { adultGuideMinTier, kidsGuideMinTier } from "../guide-access";
import { guidesForAudience } from "../kids-guides";

describe("launch guide peeks", () => {
  it("organizes Kids, Teens (junior id), Senior, and Adult sections from real data", () => {
    const sections = getLaunchGuidePeekSections();
    expect(sections.map((s) => s.id)).toEqual(["kids", "junior", "senior", "adult"]);

    const kids = sections.find((s) => s.id === "kids")!;
    const junior = sections.find((s) => s.id === "junior")!;
    const senior = sections.find((s) => s.id === "senior")!;
    const adult = sections.find((s) => s.id === "adult")!;

    expect(kids.guides.map((g) => g.id)).toEqual(
      sortGuidesFreeFirst(
        guidesForAudience("kids").map((g) => ({ id: g.id, name: g.title })),
        (id) => kidsGuideMinTier(id),
      ).map((g) => g.id),
    );
    expect(junior.guides.map((g) => g.id)).toEqual(
      sortGuidesFreeFirst(
        guidesForAudience("junior").map((g) => ({ id: g.id, name: g.title })),
        (id) => kidsGuideMinTier(id),
      ).map((g) => g.id),
    );
    expect(senior.guides[0]?.minTier).toBeDefined();
    expect(adult.guides.map((g) => g.id)).toEqual(LAUNCH_GUIDES.map((g) => g.id));
    expect(adult.guides[0]?.minTier).toBe("free");
    expect(adultGuideMinTier(LAUNCH_GUIDES[0].id)).toBe("free");

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

  it("marks free launch guides so peek buttons can show a Free badge", () => {
    const sections = getLaunchGuidePeekSections();
    const adult = sections.find((s) => s.id === "adult")!;
    const plantWatering = adult.guides.find((g) => g.id === "plant-watering")!;
    const handyman = adult.guides.find((g) => g.id === "handyman")!;
    const rideshare = adult.guides.find((g) => g.id === "rideshare")!;
    const airbnb = adult.guides.find((g) => g.id === "airbnb")!;
    expect(plantWatering.minTier).toBe("free");
    expect(handyman.minTier).toBe("free");
    expect(rideshare.minTier).toBe("free");
    expect(airbnb.minTier).toBe("starter");

    const kids = sections.find((s) => s.id === "kids")!;
    expect(kids.guides.some((g) => g.minTier === "free")).toBe(true);
    expect(kids.guides.some((g) => g.minTier !== "free")).toBe(true);
  });

  it("shortens long blurbs to a sneak peek", () => {
    const long =
      "Name something you want, pick a simple price, and count how many little jobs it might take — with a parent helping. Extra detail that should be trimmed when needed.";
    const peek = sneakPeekText(long, 80);
    expect(peek.length).toBeLessThanOrEqual(80);
    expect(peek.startsWith("Name something")).toBe(true);
  });
});
