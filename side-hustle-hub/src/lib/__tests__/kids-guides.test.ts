import { describe, expect, it, beforeEach } from "vitest";
import { KIDS_GUIDES, guidesForAudience } from "../kids-guides";
import {
  getTeamJoinCopy,
  isKidsCornerMember,
  readTeamMembership,
  writeTeamMembership,
} from "../kids-team";

describe("kids team join copy", () => {
  it("covers give-back, savings, and reinvest for both audiences", () => {
    for (const audience of ["kids", "junior"] as const) {
      const copy = getTeamJoinCopy(audience);
      const valueTitles = copy.values.map((v) => v.title.toLowerCase());
      expect(valueTitles.some((t) => t.includes("giving") || t.includes("give"))).toBe(true);
      expect(valueTitles.some((t) => t.includes("saving"))).toBe(true);
      expect(valueTitles.some((t) => t.includes("invest"))).toBe(true);
      expect(copy.perks.length).toBeGreaterThanOrEqual(4);
    }
  });

  it("treats logged-in users as members", () => {
    expect(isKidsCornerMember("kids", true)).toBe(true);
    expect(isKidsCornerMember("junior", true)).toBe(true);
  });
});

describe("kids team membership storage", () => {
  const store = new Map<string, string>();

  beforeEach(() => {
    store.clear();
    const localStorageMock = {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, value: string) => {
        store.set(key, value);
      },
      removeItem: (key: string) => {
        store.delete(key);
      },
    };
    Object.defineProperty(globalThis, "localStorage", {
      value: localStorageMock,
      configurable: true,
    });
  });

  it("writes and reads kids/junior join flags", () => {
    expect(readTeamMembership("kids")).toBe(false);
    writeTeamMembership("kids", true);
    expect(readTeamMembership("kids")).toBe(true);
    expect(isKidsCornerMember("kids", false)).toBe(true);

    writeTeamMembership("junior", true);
    expect(readTeamMembership("junior")).toBe(true);
    expect(isKidsCornerMember("junior", false)).toBe(true);

    writeTeamMembership("kids", false);
    expect(readTeamMembership("kids")).toBe(false);
  });
});

describe("kids guides gating data", () => {
  it("has free and member guides for kids and juniors", () => {
    const kids = guidesForAudience("kids");
    const junior = guidesForAudience("junior");
    expect(kids.some((g) => g.free)).toBe(true);
    expect(kids.some((g) => !g.free)).toBe(true);
    expect(junior.some((g) => g.free)).toBe(true);
    expect(junior.some((g) => !g.free)).toBe(true);
  });

  it("member guides expose at least previewCount + 1 steps", () => {
    for (const g of KIDS_GUIDES.filter((x) => !x.free)) {
      expect(g.steps.length).toBeGreaterThan(g.previewCount);
      expect(g.previewCount).toBeGreaterThanOrEqual(1);
    }
  });

  it("covers games-ai, savings, give-back, and reinvest themes", () => {
    const themes = new Set(KIDS_GUIDES.map((g) => g.theme));
    expect(themes.has("games-ai")).toBe(true);
    expect(themes.has("savings")).toBe(true);
    expect(themes.has("give-back")).toBe(true);
    expect(themes.has("reinvest")).toBe(true);
  });
});
