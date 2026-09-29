import { describe, expect, it } from "vitest";
import { guideKitForId } from "../guide-tools";
import { detailedStepsForGuide } from "../guide-detailed-steps";
import { PINNED_GUIDE_NUMBERS } from "../guide-number-registry";
import { formatGuideNumber } from "../guide-numbers";
import { hustleById, SIDE_HUSTLES } from "../side-hustle-catalog";
import { parseGuideStepDesc } from "../guide-step-checklist";
import { defaultStatusForGuide } from "../guide-catalog-state";
import { guideMarkedPendingAfterPrepBackfill } from "../guide-marketing-plan";
import { countFreeGuideLibrary } from "../guide-library-pool";
import { guideCalcProfileForId, computeGuideCalc } from "../guide-revenue-calc";
import { buildLaunchGuidePdfModel } from "../launch-guide-pdf";
import {
  PET_SITTING_DETAILED_STEPS,
  PET_SITTING_NOTES_WORKSHEET,
  PET_SITTING_PRICING,
  PET_SITTING_REALITY_CHECK,
  PET_SITTING_SUPPLIES,
  PET_SITTING_TOOLS,
  computePetSittingProfit,
  petSittingToolsDisclaimer,
} from "../pet-sitting-guide";

const GUIDE_ID = "pet-sitting";

describe("Guide #093 Pet Sitting & Dog Walking", () => {
  it("keeps a single #093 id, exact title, time, and Unique Unique Free at 20", () => {
    const matches = SIDE_HUSTLES.filter((h) => h.id === GUIDE_ID);
    expect(matches).toHaveLength(1);
    expect(formatGuideNumber(GUIDE_ID)).toBe("093");
    expect(PINNED_GUIDE_NUMBERS[GUIDE_ID]).toBe("093");
    const h = hustleById(GUIDE_ID)!;
    expect(h.name).toBe("Pet Sitting & Dog Walking");
    expect(h.name).not.toMatch(/guide upgrade|pet sitting guide|elite guide|member guide/i);
    expect(h.timeReq).toMatch(/4\s*-\s*14 hrs\/week/i);
    expect(h.potentialIncome).toMatch(/\$25/);
    expect(h.potentialIncome).toMatch(/\$75/);
    expect(h.potentialIncome).toMatch(/examples only/i);
    expect(countFreeGuideLibrary()).toBe(20);
    expect(guideMarkedPendingAfterPrepBackfill(GUIDE_ID)).toBe(false);
    expect(defaultStatusForGuide(GUIDE_ID)).toBe("active");
  });

  it("replaces pricing and distinguishes revenue from profit", () => {
    const kit = guideKitForId(GUIDE_ID);
    const intro = String(kit.suggestedPricing?.intro ?? PET_SITTING_PRICING.intro);
    expect(intro).toMatch(/Dog Walk Revenue/i);
    expect(intro).toMatch(/\$15–\$30/);
    expect(intro).not.toMatch(/GUIDE UPGRADE/i);
    expect(kit.supplies?.items.some((i) => /backup leash/i.test(i.name))).toBe(true);
    expect(PET_SITTING_SUPPLIES.items.some((i) => /waste bags/i.test(i.name))).toBe(true);
    expect(PET_SITTING_TOOLS.some((t) => /beginner tool stack/i.test(t.name))).toBe(true);
    expect(petSittingToolsDisclaimer()).toMatch(/google calendar/i);
    expect(PET_SITTING_REALITY_CHECK.body).toMatch(/do not invent/i);
    expect(PET_SITTING_NOTES_WORKSHEET).toMatch(/Medication \(written only\)/i);
  });

  it("includes exactly 11 authored core steps with marketing as steps 6–8", () => {
    const core = PET_SITTING_DETAILED_STEPS;
    expect(core).toHaveLength(11);
    expect(core.map((s) => s.title)).toEqual([
      "Define Services, Boundaries, and Pricing",
      "Create Pet Intake and Do a Meet-and-Greet",
      "Collect Routines, Emergency Contacts, and Access",
      "Schedule Visits and Prepare Your Kit",
      "Deliver Care, Updates, and Secure Homes",
      "Choose Your Marketing Channels",
      "Make Your Marketing Materials",
      "Carry Out Your Marketing Plan",
      "Handle Emergencies, Weather, and Behavior Safely",
      "Collect Payment and Close the Job",
      "Track Profit, Repeat Bookings, and Referrals",
    ]);
    expect(core[5]?.desc).toMatch(/pick only 2 or 3/i);
    expect(core[8]?.desc).toMatch(/veterinar/i);
    for (const step of core) {
      expect(step.desc).not.toMatch(/✓/);
      const checks = parseGuideStepDesc(step.desc).filter((s) => s.kind === "check");
      for (const c of checks) {
        expect(c.checkedMarker, `${step.title}: ${c.label}`).toBe(false);
      }
    }
    const titles = (detailedStepsForGuide(GUIDE_ID) ?? []).map((s) => s.title);
    expect(titles.filter((t) => /choose your marketing channels/i.test(t))).toHaveLength(1);
  });

  it("uses pet-care calculator: $450 revenue, $80 expenses, $370 profit", () => {
    const profile = guideCalcProfileForId(GUIDE_ID, "Pet Sitting & Dog Walking");
    expect(profile.title).toMatch(/pet sitting/i);
    expect(Object.prototype.hasOwnProperty.call(profile.defaults, "dogWalkVisits")).toBe(true);

    const helper = computePetSittingProfit({
      dogWalkVisits: 8,
      walkPrice: 20,
      dropInVisits: 6,
      dropInPrice: 25,
      overnightNights: 2,
      overnightPrice: 55,
      addOnRevenue: 30,
      mileageTravel: 25,
      supplies: 10,
      paymentPlatformFees: 8,
      insuranceAllocation: 15,
      advertising: 10,
      otherExpenses: 12,
      laborHours: 20,
      totalVisits: 16,
      clientsServed: 3,
    });
    expect(helper.grossRevenue).toBe(450);
    expect(helper.totalExpenses).toBe(80);
    expect(helper.estimatedProfit).toBe(370);

    const result = computeGuideCalc(
      profile.mode,
      {
        dogWalkVisits: 8,
        walkPrice: 20,
        dropInVisits: 6,
        dropInPrice: 25,
        overnightNights: 2,
        overnightPrice: 55,
        addOnRevenue: 30,
        mileageTravel: 25,
        supplies: 10,
        paymentPlatformFees: 8,
        insuranceAllocation: 15,
        advertising: 10,
        otherExpenses: 12,
        laborHours: 20,
        totalVisits: 16,
        clientsServed: 3,
      },
      [],
    );
    expect(result.revenue).toBe(450);
    expect(result.expenses).toBe(80);
    expect(result.net).toBe(370);
  });

  it("Download PDF model matches the upgraded on-screen kit", () => {
    const pdf = buildLaunchGuidePdfModel(GUIDE_ID);
    expect(pdf.title).toBe("Pet Sitting & Dog Walking");
    expect(pdf.steps.some((s) => /define services, boundaries, and pricing/i.test(s.title))).toBe(true);
  });
});
