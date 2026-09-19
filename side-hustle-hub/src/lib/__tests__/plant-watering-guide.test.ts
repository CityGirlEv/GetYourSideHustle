import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { PINNED_GUIDE_NUMBERS } from "../guide-number-registry";
import { formatGuideNumber } from "../guide-numbers";
import { hustleById, SIDE_HUSTLES } from "../side-hustle-catalog";
import { FREE_WIZARD_HUSTLE_IDS } from "../side-hustle-catalog";
import { countFreeGuideLibrary } from "../guide-library-pool";
import {
  PLANT_WATERING_NOTES_WORKSHEET,
  PLANT_WATERING_REALITY_CHECK,
} from "../plant-watering-guide";

const GUIDE_ID = "plant-watering";
const root = join(dirname(fileURLToPath(import.meta.url)), "../../..");

describe("Guide #017 Plant Watering Service", () => {
  it("keeps a single #017 id, Unique Unique Free, and the plant-instructions callout", () => {
    expect(SIDE_HUSTLES.filter((h) => h.id === GUIDE_ID)).toHaveLength(1);
    expect(formatGuideNumber(GUIDE_ID)).toBe("017");
    expect(PINNED_GUIDE_NUMBERS[GUIDE_ID]).toBe("017");
    expect(hustleById(GUIDE_ID)?.name).toBe("Plant Watering Service");
    expect(FREE_WIZARD_HUSTLE_IDS).toContain(GUIDE_ID);
    expect(countFreeGuideLibrary()).toBe(20);
    expect(PLANT_WATERING_REALITY_CHECK.title).toMatch(/follow the owner's plant instructions/i);
    expect(PLANT_WATERING_NOTES_WORKSHEET).toMatch(/MY PLANT WATERING SERVICE/);
  });

  it("wires the Prerequisites callout in GuidePrepSections (not just the kit file)", () => {
    const src = readFileSync(join(root, "src/components/GuidePrepSections.tsx"), "utf8");
    expect(src).toMatch(/"plant-watering":\s*\{[\s\S]*?reality:\s*PLANT_WATERING_REALITY_CHECK/);
  });
});
