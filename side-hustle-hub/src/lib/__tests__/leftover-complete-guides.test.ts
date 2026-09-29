import { describe, expect, it } from "vitest";
import { guideKitForId } from "../guide-tools";
import { detailedStepsForGuide } from "../guide-detailed-steps";
import { PINNED_GUIDE_NUMBERS } from "../guide-number-registry";
import { formatGuideNumber } from "../guide-numbers";
import { FREE_WIZARD_HUSTLE_IDS, hustleById } from "../side-hustle-catalog";
import { countFreeGuideLibrary } from "../guide-library-pool";
import { guideMarkedPendingAfterPrepBackfill } from "../guide-marketing-plan";
import { guideCalcProfileForId, computeGuideCalc } from "../guide-revenue-calc";
import { LEAF_BLOWING_BLOWER_DRAWING_COPY } from "../guide-library-promo";
import { FRIENDSHIP_BRACELET_DETAILED_STEPS } from "../friendship-bracelet-maker-guide";
import { LEAF_RAKING_DETAILED_STEPS, LEAF_BLOWING_DRAWING } from "../leaf-raking-guide";
import { LEMONADE_STAND_DETAILED_STEPS } from "../lemonade-stand-guide";
import { AIRBNB_HOSTING_DETAILED_STEPS } from "../airbnb-hosting-guide";
import { DIGITAL_COOKBOOK_DETAILED_STEPS } from "../digital-cookbook-creator-guide";
import { FAMILY_PHOTO_SLIDESHOW_DETAILED_STEPS } from "../family-photo-slideshow-guide";
import { LOCAL_RESOURCE_LIST_DETAILED_STEPS } from "../local-resource-list-creator-guide";
import { RECYCLING_HELPER_DETAILED_STEPS } from "../recycling-helper-guide";
import { PROOFREADER_DETAILED_STEPS } from "../proofreader-guide";
import { TOY_ORGANIZER_DETAILED_STEPS } from "../toy-organizer-guide";
import { TRASH_CAN_SERVICE_DETAILED_STEPS } from "../trash-can-service-guide";
import { HOMEWORK_HELPER_DETAILED_STEPS } from "../homework-helper-guide";

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

describe("Leftover COMPLETE leftover-12 wiring", () => {
  it("keeps Unique Unique Free at 20", () => {
    expect(countFreeGuideLibrary()).toBe(20);
    expect(FREE_WIZARD_HUSTLE_IDS).toContain("friendship-bracelet-maker");
    expect(FREE_WIZARD_HUSTLE_IDS).toContain("leaf-raking");
    expect(FREE_WIZARD_HUSTLE_IDS).toContain("lemonade-stand");
  });

  it("wires #006 Friendship Bracelet Maker", () => {
    expect(formatGuideNumber("friendship-bracelet-maker")).toBe("006");
    expect(PINNED_GUIDE_NUMBERS["friendship-bracelet-maker"]).toBe("006");
    expect(hustleById("friendship-bracelet-maker")?.name).toBe("Friendship Bracelet Maker");
    expectElevenCore("friendship-bracelet-maker", FRIENDSHIP_BRACELET_DETAILED_STEPS, "friendshipBraceletsSimple");
    const kit = guideKitForId("friendship-bracelet-maker");
    expect(kit.suggestedPricing?.intro).toMatch(/gift/i);
    expect(kit.tools.some((t) => /canva/i.test(t.name))).toBe(true);
    const result = computeGuideCalc(
      "service",
      {
        friendshipBraceletsSimple: 6,
        simplePrice: 4,
        patternCount: 4,
        patternPrice: 8,
        personalizedCount: 2,
        personalizedPrice: 12,
        setCount: 1,
        setPrice: 16,
        customOrderRevenue: 20,
        threadCord: 12,
        beadsFindings: 8,
        packaging: 6,
        displayEvent: 5,
        paymentFees: 4,
        advertising: 0,
        shippingPostage: 0,
        otherExpenses: 5,
      },
      [],
    );
    expect(result.revenue).toBe(116);
    expect(result.expenses).toBe(40);
    expect(result.net).toBe(76);
  });

  it("wires #012 Leaf Blowing Service and preserves drawing copy", () => {
    expect(formatGuideNumber("leaf-raking")).toBe("012");
    expect(hustleById("leaf-raking")?.name).toBe("Leaf Blowing Service");
    expect(LEAF_BLOWING_DRAWING).toBe(LEAF_BLOWING_BLOWER_DRAWING_COPY);
    expectElevenCore("leaf-raking", LEAF_RAKING_DETAILED_STEPS, "leafBlowingSmallJobs");
    expect(LEAF_RAKING_DETAILED_STEPS[4]?.title).toMatch(/choose your marketing channels/i);
    const result = computeGuideCalc(
      "service",
      {
        leafBlowingSmallJobs: 2,
        smallJobPrice: 20,
        standardJobs: 2,
        standardJobPrice: 30,
        largeJobs: 1,
        largeJobPrice: 50,
        baggingRevenue: 15,
        removalRevenue: 10,
        recurringRevenue: 25,
        fuelCharging: 10,
        bagsConsumables: 8,
        travel: 6,
        disposal: 5,
        equipmentMaintenance: 4,
        paymentFees: 3,
        advertising: 2,
        otherExpenses: 2,
      },
      [],
    );
    expect(result.revenue).toBe(200);
    expect(result.expenses).toBe(40);
    expect(result.net).toBe(160);
  });

  it("wires #013 Lemonade / Drink Stand with per-drink math", () => {
    expect(formatGuideNumber("lemonade-stand")).toBe("013");
    expect(hustleById("lemonade-stand")?.name).toBe("Lemonade / Drink Stand");
    expectElevenCore("lemonade-stand", LEMONADE_STAND_DETAILED_STEPS, "lemonadeServingsSold");
    expect(guideKitForId("lemonade-stand").suggestedPricing?.intro).toMatch(/per drink/i);
    const result = computeGuideCalc(
      "service",
      {
        lemonadeServingsSold: 40,
        averageSellingPrice: 2,
        servingsPrepared: 50,
        ingredientCost: 20,
        iceCost: 6,
        cupLidStrawCost: 8,
        otherDirectCosts: 4,
        paymentFees: 2,
        otherExpenses: 5,
      },
      [],
    );
    expect(result.revenue).toBe(80);
    expect(result.expenses).toBe(45);
    expect(result.net).toBe(35);
  });

  it("wires #031 Airbnb Hosting with dedicated nights math (not generic lodging)", () => {
    expect(formatGuideNumber("airbnb")).toBe("031");
    expect(hustleById("airbnb")?.name).toBe("Airbnb Hosting");
    expect(hustleById("airbnb")?.timeReq).toMatch(/2\s*-\s*4 weeks/i);
    expect(hustleById("airbnb")?.potentialIncome).toMatch(/examples only/i);
    expectElevenCore("airbnb", AIRBNB_HOSTING_DETAILED_STEPS, "airbnbHostBookedNights");
    const kit = guideKitForId("airbnb");
    const blob = [
      ...(kit.steps ?? []).map((s) => `${s.title} ${s.desc}`),
      ...(kit.externalLinks ?? []).map((l) => l.url),
      ...kit.tools.map((t) => t.url ?? ""),
    ].join("\n");
    expect(blob).toMatch(/https:\/\/www\.airdna\.co\//);
    const profile = guideCalcProfileForId("airbnb");
    expect(profile.defaults).not.toHaveProperty("nightlyRate");
    expect(profile.defaults).not.toHaveProperty("bookedNights");
    const result = computeGuideCalc(
      "service",
      {
        availableNights: 30,
        airbnbHostBookedNights: 18,
        avgNightlyRevenue: 150,
        otherHostRevenue: 100,
        mortgageRentAllocation: 800,
        propertyTaxAllocation: 200,
        insurance: 100,
        utilities: 150,
        internet: 80,
        cleaningPaidByHost: 250,
        laundry: 70,
        platformFees: 150,
        guestSupplies: 50,
        restocking: 40,
        maintenanceReserve: 40,
        permitsAllocation: 20,
        software: 20,
        advertising: 10,
        parkingHoa: 20,
        otherExpenses: 0,
        housingCashPayment: 1200,
      },
      [],
    );
    expect(result.revenue).toBe(2800);
    expect(result.expenses).toBe(2000);
    expect(result.net).toBe(800);
    expect(result.metrics?.monthlyCashFlow).toBe(400);
    expect(result.metrics?.occupancyPercent).toBe(60);
  });

  it("wires #058 Digital Cookbook Creator", () => {
    expect(formatGuideNumber("digital-cookbook-creator")).toBe("058");
    expect(hustleById("digital-cookbook-creator")?.name).toBe("Digital Cookbook Creator");
    expectElevenCore("digital-cookbook-creator", DIGITAL_COOKBOOK_DETAILED_STEPS, "cookbookMiniProjects");
    const result = computeGuideCalc(
      "service",
      {
        cookbookMiniProjects: 1,
        miniPrice: 50,
        smallProjects: 1,
        smallPrice: 100,
        transcriptionAddOns: 25,
        photoCleanupAddOns: 20,
        printReadyAddOn: 30,
        extraRevisionFees: 15,
        softwareAssets: 15,
        paymentFees: 10,
        testPrinting: 12,
        storageDelivery: 8,
        advertising: 5,
        otherExpenses: 5,
      },
      [],
    );
    expect(result.revenue).toBe(240);
    expect(result.expenses).toBe(55);
    expect(result.net).toBe(185);
  });

  it("wires #069 Family Photo Slideshow Creator", () => {
    expect(formatGuideNumber("family-photo-slideshow")).toBe("069");
    expect(hustleById("family-photo-slideshow")?.name).toBe("Family Photo Slideshow Creator");
    expectElevenCore("family-photo-slideshow", FAMILY_PHOTO_SLIDESHOW_DETAILED_STEPS, "slideshowBasicProjects");
    const result = computeGuideCalc(
      "service",
      {
        slideshowBasicProjects: 2,
        basicPrice: 40,
        largeProjects: 1,
        largePrice: 120,
        scanningAddOns: 25,
        rushFees: 20,
        extraRevisionRevenue: 15,
        extraVersionRevenue: 10,
        softwareAllocation: 12,
        licensedMusic: 15,
        cloudStorage: 8,
        paymentFees: 10,
        advertising: 6,
        scanningTravel: 10,
        otherExpenses: 5,
      },
      [],
    );
    expect(result.revenue).toBe(270);
    expect(result.expenses).toBe(66);
    expect(result.net).toBe(204);
  });

  it("wires #084 Local Resource List Creator", () => {
    expect(formatGuideNumber("local-resource-list-creator")).toBe("084");
    expect(hustleById("local-resource-list-creator")?.name).toBe("Local Resource List Creator");
    expectElevenCore("local-resource-list-creator", LOCAL_RESOURCE_LIST_DETAILED_STEPS, "resourceListCopiesSold");
    const result = computeGuideCalc(
      "service",
      {
        resourceListCopiesSold: 10,
        copyPrice: 10,
        customProjects: 2,
        customPrice: 50,
        updateRevenue: 25,
        addOnRevenue: 15,
        softwareDesign: 20,
        platformPaymentFees: 12,
        printing: 15,
        advertising: 10,
        travelResearch: 8,
        otherExpenses: 5,
      },
      [],
    );
    expect(result.revenue).toBe(240);
    expect(result.expenses).toBe(70);
    expect(result.net).toBe(170);
  });

  it("wires #088 Neighborhood Recycling Helper", () => {
    expect(formatGuideNumber("recycling-helper")).toBe("088");
    expect(hustleById("recycling-helper")?.name).toBe("Neighborhood Recycling Helper");
    expectElevenCore("recycling-helper", RECYCLING_HELPER_DETAILED_STEPS, "recyclingCurbOutVisits");
    const result = computeGuideCalc(
      "service",
      {
        recyclingCurbOutVisits: 8,
        curbOutPrice: 8,
        curbReturnVisits: 8,
        curbReturnPrice: 6,
        sortingVisits: 4,
        sortingPrice: 12,
        monthlyPackageRevenue: 40,
        addOnRevenue: 10,
        travel: 15,
        glovesConsumables: 10,
        paymentFees: 8,
        advertising: 7,
        otherExpenses: 10,
      },
      [],
    );
    expect(result.revenue).toBe(210);
    expect(result.expenses).toBe(50);
    expect(result.net).toBe(160);
  });

  it("wires #096 Proofreader", () => {
    expect(formatGuideNumber("proofreader")).toBe("096");
    expect(hustleById("proofreader")?.name).toBe("Proofreader");
    expectElevenCore("proofreader", PROOFREADER_DETAILED_STEPS, "proofreadingShortProjects");
    const result = computeGuideCalc(
      "service",
      {
        proofreadingShortProjects: 3,
        shortPrice: 18,
        standardProjects: 2,
        standardPrice: 35,
        longProjects: 1,
        longPrice: 60,
        hourlyHours: 3,
        hourlyRate: 30,
        rushFees: 20,
        extraRevisionFees: 10,
        softwareTools: 15,
        paymentFees: 10,
        advertising: 8,
        printing: 5,
        subcontracting: 0,
        otherExpenses: 12,
      },
      [],
    );
    expect(result.revenue).toBe(304);
    expect(result.expenses).toBe(50);
    expect(result.net).toBe(254);
  });

  it("wires #106 Toy Organizer without counting reimbursements as profit", () => {
    expect(formatGuideNumber("toy-organizer")).toBe("106");
    expect(hustleById("toy-organizer")?.name).toBe("Toy Organizer");
    expectElevenCore("toy-organizer", TOY_ORGANIZER_DETAILED_STEPS, "toyOrganizerSmallProjects");
    const result = computeGuideCalc(
      "service",
      {
        toyOrganizerSmallProjects: 2,
        smallPrice: 45,
        standardProjects: 1,
        standardPrice: 90,
        largeProjects: 1,
        largePrice: 150,
        addOnServiceRevenue: 20,
        maintenanceRevenue: 40,
        storageReimbursements: 80,
        consumableSupplies: 20,
        travel: 15,
        paymentFees: 12,
        advertising: 13,
        otherExpenses: 10,
      },
      [],
    );
    expect(result.revenue).toBe(390);
    expect(result.expenses).toBe(70);
    expect(result.net).toBe(320);
  });

  it("wires #108 Trash Can Service", () => {
    expect(formatGuideNumber("trash-can-service")).toBe("108");
    expect(hustleById("trash-can-service")?.name).toBe("Trash Can Service");
    expectElevenCore("trash-can-service", TRASH_CAN_SERVICE_DETAILED_STEPS, "trashCanCurbOutVisits");
    const result = computeGuideCalc(
      "service",
      {
        trashCanCurbOutVisits: 10,
        curbOutPrice: 7,
        curbReturnVisits: 10,
        curbReturnPrice: 6,
        monthlyPackageRevenue: 50,
        multiBinAddOnRevenue: 12,
        vacationCoverageRevenue: 24,
        extraRevenue: 8,
        travel: 16,
        glovesConsumables: 10,
        paymentFees: 8,
        advertising: 6,
        otherExpenses: 8,
      },
      [],
    );
    expect(result.revenue).toBe(224);
    expect(result.expenses).toBe(48);
    expect(result.net).toBe(176);
  });

  it("wires #110 Tutor / Homework Helper without touching homework-organizer", () => {
    expect(formatGuideNumber("homework")).toBe("110");
    expect(formatGuideNumber("homework-organizer")).toBe("076");
    expect(hustleById("homework")?.name).toBe("Tutor / Homework Helper & Reading Buddy");
    expectElevenCore("homework", HOMEWORK_HELPER_DETAILED_STEPS, "homeworkHelperSessions30");
    const result = computeGuideCalc(
      "service",
      {
        homeworkHelperSessions30: 4,
        price30: 15,
        sessions45: 4,
        price45: 20,
        sessions60: 4,
        price60: 30,
        packageRevenue: 40,
        materials: 12,
        travel: 15,
        paymentFees: 10,
        advertising: 8,
        otherExpenses: 10,
      },
      [],
    );
    expect(result.revenue).toBe(300);
    expect(result.expenses).toBe(55);
    expect(result.net).toBe(245);
  });
});
