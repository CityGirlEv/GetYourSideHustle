import { describe, expect, it } from "vitest";
import { PINNED_GUIDE_NUMBERS } from "../guide-number-registry";
import { formatGuideNumber } from "../guide-numbers";
import { hustleById, SIDE_HUSTLES } from "../side-hustle-catalog";
import { adultGuideMinTier } from "../guide-access";
import { countFreeGuideLibrary } from "../guide-library-pool";
import { parseGuideStepDesc } from "../guide-step-checklist";
import { defaultStatusForGuide } from "../guide-catalog-state";
import { guideMarkedPendingAfterPrepBackfill } from "../guide-marketing-plan";
import { buildLaunchGuidePdfModel } from "../launch-guide-pdf";
import {
  AIRBNB_COHOST_DETAILED_STEPS,
  AIRBNB_COHOST_NOTES_WORKSHEET,
  AIRBNB_COHOST_PRICING,
  AIRBNB_COHOST_REALITY_CHECK,
  AIRBNB_COHOST_SUPPLIES,
  AIRBNB_COHOST_TOOLS,
  airbnbCohostToolsDisclaimer,
  computeAirbnbCohostProfit,
} from "../airbnb-cohost-guide";

const GUIDE_ID = "airbnb-cohost";

describe("Guide #030 Airbnb Co-Host", () => {
  it("keeps a single #030 id, exact title, Elite, 6 - 20 hrs/week, and Unique Unique Free at 20", () => {
    const matches = SIDE_HUSTLES.filter((h) => h.id === GUIDE_ID);
    expect(matches).toHaveLength(1);
    expect(formatGuideNumber(GUIDE_ID)).toBe("030");
    expect(PINNED_GUIDE_NUMBERS[GUIDE_ID]).toBe("030");
    const idsFor030 = Object.entries(PINNED_GUIDE_NUMBERS)
      .filter(([, n]) => n === "030")
      .map(([id]) => id);
    expect(idsFor030).toEqual([GUIDE_ID]);

    const h = hustleById(GUIDE_ID)!;
    expect(h.name).toBe("Airbnb Co-Host");
    expect(h.name).not.toMatch(/guide upgrade|airbnb hosting|property manager|co-host network|elite guide|member guide/i);
    expect(h.timeReq).toMatch(/6\s*-\s*20 hrs\/week/i);
    expect(h.potentialIncome).toMatch(/booking revenue/i);
    expect(h.potentialIncome).toMatch(/examples/i);
    expect(h.minTier).toBe("elite");
    expect(h.freeWizardEligible).toBe(false);
    expect(adultGuideMinTier(GUIDE_ID)).toBe("elite");
    expect(countFreeGuideLibrary()).toBe(20);
    expect(guideMarkedPendingAfterPrepBackfill(GUIDE_ID)).toBe(false);
    expect(defaultStatusForGuide(GUIDE_ID)).toBe("active");
  });

  it("ships COMPLETE kit data: reality check, notes, pricing, supplies, beginner stack", () => {
    expect(AIRBNB_COHOST_REALITY_CHECK.title).toMatch(/co-host agreement/i);
    expect(AIRBNB_COHOST_NOTES_WORKSHEET).toMatch(/INCIDENT LOG/i);
    expect(AIRBNB_COHOST_NOTES_WORKSHEET).not.toMatch(/GUIDE UPGRADE/i);
    expect(AIRBNB_COHOST_PRICING.intro).toMatch(/booking revenue/i);
    expect(AIRBNB_COHOST_PRICING.intro).toMatch(/standard co-host operations/i);
    expect(AIRBNB_COHOST_PRICING.intro).not.toMatch(/GUIDE UPGRADE/i);
    expect(AIRBNB_COHOST_SUPPLIES.items.some((i) => /house manual|turnover|agreement/i.test(i.name))).toBe(true);
    expect(AIRBNB_COHOST_TOOLS.some((t) => /beginner tool stack/i.test(t.name))).toBe(true);
    expect(airbnbCohostToolsDisclaimer()).toMatch(/written agreement/i);
    expect(airbnbCohostToolsDisclaimer()).toMatch(/minimum permissions/i);
  });

  it("includes exactly 11 authored core steps with marketing as steps 4–6", () => {
    const core = AIRBNB_COHOST_DETAILED_STEPS;
    expect(core).toHaveLength(11);
    expect(core.map((s) => s.title)).toEqual([
      "Choose Co-Host Services & Research Local Requirements",
      "Build the Package, Percentage Base, and Agreement",
      "Create the Operations System",
      "Choose Your Marketing Channels",
      "Make Your Marketing Materials",
      "Carry Out Your Marketing Plan",
      "Qualify the Owner and Property",
      "Walk Through, Document, and Test",
      "Accept Access and Launch a Limited Pilot",
      "Operate, Escalate, and Report",
      "Reconcile, Invoice, and Improve",
    ]);
    expect(core[3]?.desc).toMatch(/pick only 2 or 3/i);
    expect(core[4]?.desc).toMatch(/do not claim co-host network status/i);
    expect(core[5]?.desc).toMatch(/authority matrix/i);
    for (const step of core) {
      expect(step.desc).not.toMatch(/✓/);
      const checks = parseGuideStepDesc(step.desc).filter((s) => s.kind === "check");
      for (const c of checks) {
        expect(c.checkedMarker, `${step.title}: ${c.label}`).toBe(false);
      }
    }
    expect(core.filter((s) => /choose your marketing channels/i.test(s.title))).toHaveLength(1);
    expect(core.filter((s) => /make your marketing materials/i.test(s.title))).toHaveLength(1);
    expect(core.filter((s) => /carry out your marketing plan/i.test(s.title))).toHaveLength(1);
  });

  it("uses monthly calculator: $900 revenue, $150 expenses, $750 profit, $21.43/hr", () => {
    const example = computeAirbnbCohostProfit({
      acDefinedBookingRevenue: 5000,
      acCoHostPercent: 15,
      acFixedRetainer: 0,
      acSetupAddOnRevenue: 150,
      acOtherRevenue: 0,
      acTravelMileage: 40,
      acPhoneSoftware: 25,
      acSuppliesNotReimbursed: 20,
      acContractorsBackup: 0,
      acInsuranceProfessional: 40,
      acPaymentFeesOther: 25,
      acGuestCommHours: 15,
      acTurnoverVendorHours: 12,
      acOwnerReportAdminHours: 6,
      acEmergencyAfterHours: 2,
      acReservationsSupported: 12,
      acTurnoversCompleted: 12,
    });
    expect(example.percentageFee).toBe(750);
    expect(example.totalCollectedRevenue).toBe(900);
    expect(example.totalExpenses).toBe(150);
    expect(example.estimatedProfit).toBe(750);
    expect(example.totalHours).toBe(35);
    expect(example.profitPerHour).toBeCloseTo(21.43, 2);
  });

  it("Download PDF model matches the upgraded on-screen kit title", () => {
    const pdf = buildLaunchGuidePdfModel(GUIDE_ID);
    expect(pdf.title).toBe("Airbnb Co-Host");
    expect(AIRBNB_COHOST_DETAILED_STEPS.some((s) => /operations system/i.test(s.title))).toBe(true);
  });
});
