import { describe, expect, it } from "vitest";
import { guideKitForId } from "../guide-tools";
import { detailedStepsForGuide, stepsIncludeTakeBeforePhotos } from "../guide-detailed-steps";
import { PINNED_GUIDE_NUMBERS } from "../guide-number-registry";
import { formatGuideNumber } from "../guide-numbers";
import { FREE_WIZARD_HUSTLE_IDS, hustleById } from "../side-hustle-catalog";
import { countFreeGuideLibrary } from "../guide-library-pool";
import { guideMarkedPendingAfterPrepBackfill } from "../guide-marketing-plan";
import { guideCalcModeForId, guideCalcProfileForId, computeGuideCalc } from "../guide-revenue-calc";
import { CANVA_FLYER_DETAILED_STEPS } from "../canva-flyer-creator-guide";
import { CAR_INTERIOR_DETAILED_STEPS } from "../car-interior-cleanup-guide";
import { NEIGHBORHOOD_DOG_WALKER_DETAILED_STEPS } from "../neighborhood-dog-walker-guide";

function expectElevenCore(id: string, core: { title: string }[], uniqueKey: string) {
  expect(core).toHaveLength(11);
  expect(hustleById(id)?.name).not.toMatch(/guide upgrade/i);
  expect(guideMarkedPendingAfterPrepBackfill(id)).toBe(false);
  const titles = (detailedStepsForGuide(id) ?? []).map((s) => s.title);
  expect(titles.filter((t) => new RegExp(core[0].title, "i").test(t)).length).toBeGreaterThan(0);
  const profile = guideCalcProfileForId(id);
  expect(Object.prototype.hasOwnProperty.call(profile.defaults, uniqueKey)).toBe(true);
  expect(Object.values(profile.defaults).every((n) => n === 0)).toBe(true);
}

describe("COMPLETE #014 / #043 / #044 wiring", () => {
  it("keeps Unique Unique Free at 20 and does not move Neighborhood Dog Walker off Free", () => {
    expect(countFreeGuideLibrary()).toBe(20);
    expect(FREE_WIZARD_HUSTLE_IDS).toContain("dog-walk");
    expect(hustleById("dog-walk")?.minTier).toBe("free");
  });

  it("wires #014 Neighborhood Dog Walker", () => {
    expect(formatGuideNumber("dog-walk")).toBe("014");
    expect(PINNED_GUIDE_NUMBERS["dog-walk"]).toBe("014");
    expect(hustleById("dog-walk")?.name).toBe("Neighborhood Dog Walker");
    expectElevenCore("dog-walk", NEIGHBORHOOD_DOG_WALKER_DETAILED_STEPS, "neighborhoodWalks15");
    const kit = guideKitForId("dog-walk");
    expect(kit.suggestedPricing?.intro).toMatch(/per walk|15–20 min/i);
    expect(kit.tools.some((t) => t.id === "canva")).toBe(true);
    const materials = kit.steps?.find((s) => /make your marketing materials/i.test(s.title));
    expect(materials?.desc).toMatch(/Open Canva at https:\/\/www\.canva\.com\//i);
    const result = computeGuideCalc(
      "service",
      {
        neighborhoodWalks15: 4,
        price15: 12,
        walks30: 4,
        price30: 20,
        walks45: 2,
        price45: 32,
        extraDogFees: 10,
        addOnRevenue: 8,
        supplies: 8,
        travel: 10,
        paymentFees: 6,
        advertising: 4,
        insuranceBusiness: 0,
        otherExpenses: 7,
      },
      [],
    );
    expect(result.revenue).toBe(210);
    expect(result.expenses).toBe(35);
    expect(result.net).toBe(175);
  });

  it("wires #043 Canva Flyer Creator as a service calculator (not product)", () => {
    expect(formatGuideNumber("canva-flyer-creator")).toBe("043");
    expect(hustleById("canva-flyer-creator")?.name).toBe("Canva Flyer Creator");
    expect(guideCalcModeForId("canva-flyer-creator")).toBe("service");
    expectElevenCore("canva-flyer-creator", CANVA_FLYER_DETAILED_STEPS, "canvaFlyerSimpleProjects");
    const kit = guideKitForId("canva-flyer-creator");
    expect(kit.suggestedPricing?.intro).toMatch(/simple design/i);
    const materials = kit.steps?.find((s) => /make your marketing materials/i.test(s.title));
    expect(materials?.desc).toMatch(/Flyer \(US Letter\)|A4 flyer/i);
    const result = computeGuideCalc(
      "service",
      {
        canvaFlyerSimpleProjects: 2,
        simplePrice: 20,
        standardProjects: 1,
        standardPrice: 40,
        detailedProjects: 1,
        detailedPrice: 60,
        socialPackRevenue: 25,
        recurringRevenue: 50,
        addOnRevenue: 15,
        softwareAssets: 10,
        advertising: 8,
        paymentFees: 12,
        printingProofs: 10,
        contractors: 0,
        otherExpenses: 5,
      },
      [],
    );
    expect(result.revenue).toBe(230);
    expect(result.expenses).toBe(45);
    expect(result.net).toBe(185);
  });

  it("wires #044 Car Interior Cleanup Helper and keeps before photos", () => {
    expect(formatGuideNumber("car-interior-cleanup")).toBe("044");
    expect(hustleById("car-interior-cleanup")?.name).toBe("Car Interior Cleanup Helper");
    expect(hustleById("car-interior-cleanup")?.category).toBe("Local / Vehicle");
    expectElevenCore("car-interior-cleanup", CAR_INTERIOR_DETAILED_STEPS, "carInteriorQuickJobs");
    expect(stepsIncludeTakeBeforePhotos(detailedStepsForGuide("car-interior-cleanup") ?? [])).toBe(true);
    const kit = guideKitForId("car-interior-cleanup");
    expect(kit.suggestedPricing?.intro).toMatch(/no chemicals kids/i);
    const result = computeGuideCalc(
      "service",
      {
        carInteriorQuickJobs: 2,
        quickPrice: 20,
        standardJobs: 2,
        standardPrice: 35,
        largerJobs: 1,
        largerPrice: 50,
        addOnRevenue: 25,
        recurringRevenue: 40,
        supplies: 15,
        equipmentCosts: 12,
        travel: 8,
        paymentFees: 6,
        advertising: 5,
        otherExpenses: 6,
      },
      [],
    );
    expect(result.revenue).toBe(225);
    expect(result.expenses).toBe(52);
    expect(result.net).toBe(173);
  });
});
