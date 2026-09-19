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
  VIRTUAL_CALL_ASSISTANT_DETAILED_STEPS,
  VIRTUAL_CALL_ASSISTANT_NOTES_WORKSHEET,
  VIRTUAL_CALL_ASSISTANT_PRICING,
  VIRTUAL_CALL_ASSISTANT_REALITY_CHECK,
  VIRTUAL_CALL_ASSISTANT_SUPPLIES,
  VIRTUAL_CALL_ASSISTANT_TOOLS,
  virtualCallAssistantToolsDisclaimer,
  computeVirtualCallAssistantProfit,
} from "../virtual-call-assistant-guide";

const GUIDE_ID = "virtual-call-assistant";

describe("Guide #041 Build a Virtual Call Assistant", () => {
  it("keeps a single #041 id, exact title, Elite, 8 - 20 hrs/week, and Unique Unique Free at 20", () => {
    const matches = SIDE_HUSTLES.filter((h) => h.id === GUIDE_ID);
    expect(matches).toHaveLength(1);
    expect(formatGuideNumber(GUIDE_ID)).toBe("041");
    expect(PINNED_GUIDE_NUMBERS[GUIDE_ID]).toBe("041");
    const idsFor041 = Object.entries(PINNED_GUIDE_NUMBERS)
      .filter(([, n]) => n === "041")
      .map(([id]) => id);
    expect(idsFor041).toEqual([GUIDE_ID]);

    const h = hustleById(GUIDE_ID)!;
    expect(h.name).toBe("Build a Virtual Call Assistant");
    expect(h.name).not.toMatch(/guide upgrade|virtual receptionist|call center|answering service|elite guide|member guide/i);
    expect(h.name).not.toBe("Virtual Receptionist");
    expect(h.timeReq).toMatch(/8\s*-\s*20 hrs\/week/i);
    expect(h.potentialIncome).toMatch(/\$20/);
    expect(h.potentialIncome).toMatch(/\$40/);
    expect(h.minTier).toBe("elite");
    expect(h.freeWizardEligible).toBe(false);
    expect(adultGuideMinTier(GUIDE_ID)).toBe("elite");
    expect(countFreeGuideLibrary()).toBe(20);
    expect(guideMarkedPendingAfterPrepBackfill(GUIDE_ID)).toBe(false);
    expect(defaultStatusForGuide(GUIDE_ID)).toBe("active");
  });

  it("ships COMPLETE kit data: reality check, notes, pricing, supplies, beginner stack", () => {
    expect(VIRTUAL_CALL_ASSISTANT_REALITY_CHECK.title).toMatch(/build capacity before you sell availability/i);
    expect(VIRTUAL_CALL_ASSISTANT_NOTES_WORKSHEET).toMatch(/CAPACITY UTILIZATION/i);
    expect(VIRTUAL_CALL_ASSISTANT_NOTES_WORKSHEET).not.toMatch(/GUIDE UPGRADE/i);
    expect(VIRTUAL_CALL_ASSISTANT_PRICING.intro).toMatch(/\$20 – \$40 \/ hour/i);
    expect(VIRTUAL_CALL_ASSISTANT_PRICING.intro).toMatch(/paid pilot/i);
    expect(VIRTUAL_CALL_ASSISTANT_PRICING.intro).not.toMatch(/GUIDE UPGRADE/i);
    expect(VIRTUAL_CALL_ASSISTANT_SUPPLIES.items.some((i) => /voip|headset|decision tree|queue/i.test(i.name))).toBe(true);
    expect(VIRTUAL_CALL_ASSISTANT_TOOLS.some((t) => /beginner tool stack/i.test(t.name))).toBe(true);
    expect(virtualCallAssistantToolsDisclaimer()).toMatch(/paid pilot/i);
    expect(virtualCallAssistantToolsDisclaimer()).toMatch(/virtual receptionist/i);
  });

  it("includes exactly 11 authored core steps with marketing as steps 6–8", () => {
    const core = VIRTUAL_CALL_ASSISTANT_DETAILED_STEPS;
    expect(core).toHaveLength(11);
    expect(core.map((s) => s.title)).toEqual([
      "Choose One Low-Risk Client Niche",
      "Design the Service and Capacity Limit",
      "Build Packages, Pricing, and Agreements",
      "Build the Repeatable Call Operating System",
      "Secure and Test the Technology",
      "Choose Your Marketing Channels",
      "Make Your Marketing Materials",
      "Carry Out Your Marketing Plan",
      "Map Calls, Run a Paid Pilot & Go Live with QA",
      "Add Backup or Operators Safely",
      "Report, Reconcile, and Scale Carefully",
    ]);
    expect(core[5]?.desc).toMatch(/pick only 2 or 3/i);
    expect(core[6]?.desc).toMatch(/do not claim 24\/7/i);
    expect(core[7]?.desc).toMatch(/readiness checklist/i);
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

  it("uses monthly calculator: $1,150 revenue, $350 expenses, $800 profit, $25/hr owner", () => {
    const example = computeVirtualCallAssistantProfit({
      vcaHourlyRevenue: 0,
      vcaRetainerRevenue: 1000,
      vcaSetupPilotRevenue: 100,
      vcaOverageAddOnRevenue: 50,
      vcaOtherRevenue: 0,
      vcaVoipCrmSoftware: 80,
      vcaEquipmentInternetBackup: 40,
      vcaOperatorPayrollContractors: 120,
      vcaInsuranceLegalCompliance: 60,
      vcaPaymentFeesMarketing: 30,
      vcaOtherExpenses: 20,
      vcaReservedCoverageHours: 40,
      vcaSetupTrainingReportingHours: 8,
      vcaOwnerAdminMarketingHours: 24,
      vcaOperatorHoursPaid: 35,
      vcaCallsAnswered: 180,
      vcaAvgHandleAfterCallMinutes: 4,
      vcaPeakConcurrentCalls: 2,
    });
    expect(example.totalCollectedRevenue).toBe(1150);
    expect(example.totalExpenses).toBe(350);
    expect(example.estimatedProfit).toBe(800);
    expect(example.ownerTotalHours).toBe(32);
    expect(example.ownerProfitPerHour).toBe(25);
    expect(example.directLaborMarginPercent).toBeCloseTo(89.57, 1);
  });

  it("Download PDF model matches the upgraded on-screen kit title", () => {
    const pdf = buildLaunchGuidePdfModel(GUIDE_ID);
    expect(pdf.title).toBe("Build a Virtual Call Assistant");
    expect(pdf.title).not.toBe("Virtual Receptionist");
    expect(VIRTUAL_CALL_ASSISTANT_DETAILED_STEPS.some((s) => /capacity limit/i.test(s.title))).toBe(true);
  });
});
