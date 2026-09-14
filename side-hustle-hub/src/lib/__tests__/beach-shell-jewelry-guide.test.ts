import { describe, expect, it } from "vitest";
import { guideKitForId } from "../guide-tools";
import { detailedStepsForGuide } from "../guide-detailed-steps";
import { PINNED_GUIDE_NUMBERS } from "../guide-number-registry";
import { formatGuideNumber } from "../guide-numbers";
import { FREE_WIZARD_HUSTLE_IDS, hustleById, SIDE_HUSTLES } from "../side-hustle-catalog";
import { parseGuideStepDesc } from "../guide-step-checklist";
import { defaultStatusForGuide } from "../guide-catalog-state";
import { guideMarkedPendingAfterPrepBackfill } from "../guide-marketing-plan";
import { countFreeGuideLibrary } from "../guide-library-pool";
import { KIDS_FREE_GUIDE_IDS, JUNIOR_FREE_GUIDE_IDS } from "../age-library-tiers";
import { guideCalcProfileForId, computeGuideCalc } from "../guide-revenue-calc";
import { buildLaunchGuidePdfModel } from "../launch-guide-pdf";
import {
  BEACH_SHELL_JEWELRY_DETAILED_STEPS,
  BEACH_SHELL_JEWELRY_NOTES_WORKSHEET,
  BEACH_SHELL_JEWELRY_PRICING,
  BEACH_SHELL_JEWELRY_REALITY_CHECK,
  BEACH_SHELL_JEWELRY_SUPPLIES,
  BEACH_SHELL_JEWELRY_TOOLS,
  beachShellJewelryToolsDisclaimer,
  computeBeachShellJewelryProfit,
} from "../beach-shell-jewelry-guide";

const GUIDE_ID = "beach-shell-jewelry";

describe("Guide #003 Beach Shell Jewelry", () => {
  it("keeps a single #003 id, exact title, time, and Unique Unique Free at 20", () => {
    const matches = SIDE_HUSTLES.filter((h) => h.id === GUIDE_ID);
    expect(matches).toHaveLength(1);
    expect(formatGuideNumber(GUIDE_ID)).toBe("003");
    expect(PINNED_GUIDE_NUMBERS[GUIDE_ID]).toBe("003");
    const idsFor003 = Object.entries(PINNED_GUIDE_NUMBERS)
      .filter(([, n]) => n === "003")
      .map(([id]) => id);
    expect(idsFor003).toEqual([GUIDE_ID]);

    const h = hustleById(GUIDE_ID)!;
    expect(h.name).toBe("Beach Shell Jewelry");
    expect(h.name).not.toMatch(/guide upgrade|shell jewelry guide|elite guide|member guide/i);
    expect(h.timeReq).toMatch(/3\s*-\s*10 hrs\/week/i);
    expect(h.category).toMatch(/Crafts\s*\/\s*Jewelry\s*\/\s*Product Sales/i);
    expect(h.potentialIncome).toMatch(/\$8/);
    expect(h.potentialIncome).toMatch(/\$35/);
    expect(h.potentialIncome).toMatch(/examples only/i);
    expect(FREE_WIZARD_HUSTLE_IDS).toHaveLength(20);
    expect(countFreeGuideLibrary()).toBe(20);
    expect(KIDS_FREE_GUIDE_IDS).toContain(GUIDE_ID);
    expect(JUNIOR_FREE_GUIDE_IDS).toContain(GUIDE_ID);
    expect(guideMarkedPendingAfterPrepBackfill(GUIDE_ID)).toBe(false);
    expect(defaultStatusForGuide(GUIDE_ID)).toBe("active");
  });

  it("replaces pricing with handmade jewelry formula and starter ranges", () => {
    const kit = guideKitForId(GUIDE_ID);
    const intro = Array.isArray(kit.suggestedPricing?.intro)
      ? kit.suggestedPricing.intro.join("\n")
      : String(kit.suggestedPricing?.intro ?? BEACH_SHELL_JEWELRY_PRICING.intro);
    expect(intro).toMatch(/\$8 – \$35 \/ piece/i);
    expect(intro).toMatch(/Labor Value/i);
    expect(intro).toMatch(/Desired Profit/i);
    expect(intro).toMatch(/\$8–\$18/);
    expect(intro).toMatch(/\$10–\$22/);
    expect(intro).toMatch(/\$15–\$35\+/);
    expect(intro).toMatch(/\$20–\$50\+/);
    expect(intro).toMatch(/revenue is not profit/i);
    expect(intro).not.toMatch(/GUIDE UPGRADE/i);
    expect(kit.suggestedPricing?.items.some((i) => /\$8–\$18/.test(i.price))).toBe(true);
    expect(JSON.stringify(kit.suggestedPricing?.items)).not.toMatch(/\$8–15/);
    expect(kit.supplies?.items.some((i) => /jump rings/i.test(i.name))).toBe(true);
    expect(kit.supplies?.items.some((i) => /display cards/i.test(i.name))).toBe(true);
    expect(BEACH_SHELL_JEWELRY_SUPPLIES.items.some((i) => /drill/i.test(i.name) && i.optional)).toBe(
      true,
    );
    expect(BEACH_SHELL_JEWELRY_TOOLS.some((t) => /beginner tool stack/i.test(t.name))).toBe(true);
    expect(beachShellJewelryToolsDisclaimer()).toMatch(/smartphone camera/i);
    expect(BEACH_SHELL_JEWELRY_REALITY_CHECK.body).toMatch(/do not collect live animals/i);
    expect(BEACH_SHELL_JEWELRY_NOTES_WORKSHEET).toMatch(/Piece Name:/i);
    expect(BEACH_SHELL_JEWELRY_NOTES_WORKSHEET).toMatch(/Profit Per Hour/i);
    expect(BEACH_SHELL_JEWELRY_NOTES_WORKSHEET).not.toMatch(/GUIDE UPGRADE/i);
  });

  it("includes exactly 11 authored core steps with marketing as steps 6–8", () => {
    const core = BEACH_SHELL_JEWELRY_DETAILED_STEPS;
    expect(core).toHaveLength(11);
    expect(core.map((s) => s.title)).toEqual([
      "Choose Your Jewelry Styles",
      "Collect or Purchase Shells Legally",
      "Clean and Prepare the Shells",
      "Practice Safe Assembly and Make a Starter Collection",
      "Calculate Costs and Set Your Prices",
      "Choose Your Marketing Channels",
      "Make Your Marketing Materials",
      "Carry Out Your Marketing Plan",
      "Sell and Handle Orders",
      "Package and Deliver Pieces",
      "Track Revenue, Profit, and Best Sellers",
    ]);
    expect(core[1]?.desc).toMatch(/only where collection is allowed/i);
    expect(core[4]?.desc).toMatch(/labor value/i);
    expect(core[5]?.desc).toMatch(/pick only 2 or 3/i);
    expect(core[6]?.desc).toMatch(/photograph/i);
    expect(core[10]?.desc).toMatch(/revenue is not profit/i);

    for (const step of core) {
      expect(step.desc).not.toMatch(/✓/);
      expect(step.title).not.toMatch(/GUIDE UPGRADE/i);
      const checks = parseGuideStepDesc(step.desc).filter((s) => s.kind === "check");
      for (const c of checks) {
        expect(c.checkedMarker, `${step.title}: ${c.label}`).toBe(false);
      }
    }

    const titles = (detailedStepsForGuide(GUIDE_ID) ?? []).map((s) => s.title);
    expect(titles.filter((t) => /choose your marketing channels/i.test(t))).toHaveLength(1);
    expect(titles.filter((t) => /make your marketing materials/i.test(t))).toHaveLength(1);
    expect(titles.filter((t) => /carry out your marketing plan/i.test(t))).toHaveLength(1);
    expect(titles.some((t) => /check beach collecting rules with a parent/i.test(t))).toBe(false);
  });

  it("uses jewelry calculator: $203 revenue, $80 expenses, $123 profit", () => {
    const profile = guideCalcProfileForId(GUIDE_ID, "Beach Shell Jewelry");
    expect(profile.title).toMatch(/jewelry profit calculator/i);
    expect(Object.prototype.hasOwnProperty.call(profile.defaults, "earringPairs")).toBe(true);

    const helper = computeBeachShellJewelryProfit({
      earringPairs: 5,
      earringPrice: 12,
      braceletsSold: 4,
      braceletPrice: 16,
      necklacesSold: 2,
      necklacePrice: 22,
      setsSold: 1,
      setPrice: 35,
      findingsMaterials: 30,
      packaging: 12,
      sellingFees: 10,
      shippingPaidBySeller: 8,
      advertising: 0,
      boothFees: 15,
      otherExpenses: 5,
      laborHours: 10,
    });
    expect(helper.earringRevenue).toBe(60);
    expect(helper.braceletRevenue).toBe(64);
    expect(helper.necklaceRevenue).toBe(44);
    expect(helper.setRevenue).toBe(35);
    expect(helper.grossRevenue).toBe(203);
    expect(helper.totalExpenses).toBe(80);
    expect(helper.estimatedProfit).toBe(123);
    expect(helper.totalPieces).toBe(12);
    expect(helper.estimatedProfitPerPiece).toBe(10.25);
    expect(helper.profitPerHour).toBe(12.3);

    const result = computeGuideCalc(
      profile.mode,
      {
        earringPairs: 5,
        earringPrice: 12,
        braceletsSold: 4,
        braceletPrice: 16,
        necklacesSold: 2,
        necklacePrice: 22,
        setsSold: 1,
        setPrice: 35,
        findingsMaterials: 30,
        packaging: 12,
        sellingFees: 10,
        shippingPaidBySeller: 8,
        advertising: 0,
        boothFees: 15,
        otherExpenses: 5,
        laborHours: 10,
      },
      [],
    );
    expect(result.revenue).toBe(203);
    expect(result.expenses).toBe(80);
    expect(result.net).toBe(123);
    expect(result.notes.join(" ")).toMatch(/revenue is not profit/i);
  });

  it("Download PDF model matches the upgraded on-screen kit", () => {
    const kit = guideKitForId(GUIDE_ID);
    const pdf = buildLaunchGuidePdfModel(GUIDE_ID);
    expect(pdf.title).toBe("Beach Shell Jewelry");
    expect(pdf.steps.some((s) => /choose your jewelry styles/i.test(s.title))).toBe(true);
    expect(kit.steps?.some((s) => /track revenue, profit/i.test(s.title))).toBe(true);
    expect(kit.supplies?.items.some((i) => /cord|wire/i.test(i.name))).toBe(true);
  });
});
