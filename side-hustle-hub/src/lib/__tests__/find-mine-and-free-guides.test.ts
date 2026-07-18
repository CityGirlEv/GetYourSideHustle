import { describe, expect, it } from "vitest";
import {
  FIND_MINE_FAMILY_LEAD,
  FIND_MINE_WIZARD_GROUPS,
} from "../../components/FindMineWizardSelector";
import { LAUNCH_GUIDES } from "../launch-guides";
import { guidesForAudience } from "../kids-guides";
import { SENIOR_GUIDE_TEASERS } from "../seniors-content";

describe("GYSH Match Wizard age selector", () => {
  it("lists GYSH Kids/Teens/Adults/Seniors Match Wizard titles", () => {
    expect(FIND_MINE_WIZARD_GROUPS.map((g) => g.id)).toEqual(["kids", "junior", "adult", "senior"]);
    expect(FIND_MINE_WIZARD_GROUPS.map((g) => g.title)).toEqual([
      "GYSH Kids Match Wizard",
      "GYSH Teens Match Wizard",
      "GYSH Adults Match Wizard",
      "GYSH Seniors Match Wizard",
    ]);
    expect(FIND_MINE_WIZARD_GROUPS.map((g) => g.label)).toEqual(["Kids", "Teens", "Adults", "Seniors"]);
  });

  it("calls out Kids and Teens age bands in card copy", () => {
    const kids = FIND_MINE_WIZARD_GROUPS.find((g) => g.id === "kids")!;
    const teens = FIND_MINE_WIZARD_GROUPS.find((g) => g.id === "junior")!;
    expect(kids.bands).toMatch(/4–8/);
    expect(kids.bands).toMatch(/9–12/);
    expect(kids.copy).toMatch(/GYSH Coaches/);
    expect(kids.copy).toMatch(/consent/i);
    expect(teens.bands).toMatch(/13–14/);
    expect(teens.bands).toMatch(/15–17/);
  });

  it("keeps the family lead readable", () => {
    expect(FIND_MINE_FAMILY_LEAD).toMatch(/Kids/);
    expect(FIND_MINE_FAMILY_LEAD).toMatch(/Teens/);
    expect(FIND_MINE_FAMILY_LEAD).toMatch(/Adult/);
    expect(FIND_MINE_FAMILY_LEAD).toMatch(/Senior/);
    expect(FIND_MINE_FAMILY_LEAD).not.toMatch(/\n/);
  });
});

describe("Free Guides library data", () => {
  it("marks rideshare and food-delivery as free adult launch guides", () => {
    const free = LAUNCH_GUIDES.filter((g) => g.free);
    expect(free.map((g) => g.id).sort()).toEqual(["food-delivery", "rideshare"]);
  });

  it("has free kids and junior guides for the Free filter", () => {
    expect(guidesForAudience("kids").some((g) => g.free)).toBe(true);
    expect(guidesForAudience("junior").some((g) => g.free)).toBe(true);
  });

  it("treats senior preview teasers as free-filterable", () => {
    expect(SENIOR_GUIDE_TEASERS.some((g) => g.status === "preview")).toBe(true);
  });
});
