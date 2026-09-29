import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import { PINNED_GUIDE_NUMBERS } from "../guide-number-registry";
import { formatGuideNumber } from "../guide-numbers";
import { hustleById, SIDE_HUSTLES } from "../side-hustle-catalog";
import { FREE_WIZARD_HUSTLE_IDS } from "../side-hustle-catalog";
import { countFreeGuideLibrary } from "../guide-library-pool";
import { CRAFTS_NOTES_WORKSHEET, CRAFTS_REALITY_CHECK } from "../crafts-guide";

const GUIDE_ID = "crafts";
const root = join(dirname(fileURLToPath(import.meta.url)), "../../..");

describe("Guide #010 Handmade Craft Sales", () => {
  it("keeps a single #010 id, Unique Unique Free, and the one-product callout", () => {
    expect(SIDE_HUSTLES.filter((h) => h.id === GUIDE_ID)).toHaveLength(1);
    expect(formatGuideNumber(GUIDE_ID)).toBe("010");
    expect(PINNED_GUIDE_NUMBERS[GUIDE_ID]).toBe("010");
    expect(hustleById(GUIDE_ID)?.name).toBe("Handmade Craft Sales");
    expect(FREE_WIZARD_HUSTLE_IDS).toContain(GUIDE_ID);
    expect(countFreeGuideLibrary()).toBe(20);
    expect(CRAFTS_REALITY_CHECK.title).toMatch(/start with one product/i);
    expect(CRAFTS_NOTES_WORKSHEET).toMatch(/MY HANDMADE CRAFT PLAN/);
  });

  it("wires the Prerequisites callout in GuidePrepSections (not just the kit file)", () => {
    const src = readFileSync(join(root, "src/components/GuidePrepSections.tsx"), "utf8");
    expect(src).toMatch(/crafts:\s*\{[\s\S]*?reality:\s*CRAFTS_REALITY_CHECK/);
  });
});
