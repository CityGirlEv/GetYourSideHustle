import { describe, expect, it } from "vitest";
import { guideKitForId } from "../guide-tools";
import { detailedStepsForGuide } from "../guide-detailed-steps";
import { PINNED_GUIDE_NUMBERS } from "../guide-number-registry";
import { formatGuideNumber } from "../guide-numbers";
import { hustleById, SIDE_HUSTLES } from "../side-hustle-catalog";
import {
  guideCalcModeForId,
  guideCalcProfileForId,
  computeGuideCalc,
} from "../guide-revenue-calc";
import {
  LEAD_FOLLOWUP_DETAILED_STEPS,
  LEAD_FOLLOWUP_NOTES_WORKSHEET,
  LEAD_FOLLOWUP_REALITY_CHECK,
} from "../lead-followup-assistant-guide";

const GUIDE_ID = "lead-followup-assistant";

describe("Guide #079 Lead Follow-Up Assistant", () => {
  it("keeps a single #079 id and title", () => {
    const matches = SIDE_HUSTLES.filter((h) => h.id === GUIDE_ID);
    expect(matches).toHaveLength(1);
    expect(formatGuideNumber(GUIDE_ID)).toBe("079");
    expect(PINNED_GUIDE_NUMBERS[GUIDE_ID]).toBe("079");
    const idsFor079 = Object.entries(PINNED_GUIDE_NUMBERS)
      .filter(([, n]) => n === "079")
      .map(([id]) => id);
    expect(idsFor079).toEqual([GUIDE_ID]);

    const h = hustleById(GUIDE_ID)!;
    expect(h.name).toBe("Lead Follow-Up Assistant");
    expect(h.audiences).toEqual(expect.arrayContaining(["adult", "senior"]));
    expect(h.audiences).not.toContain("junior");
    expect(h.category).toMatch(/Virtual Assistance|Sales Support/i);
    expect(h.description).toMatch(/warm leads|follow-up/i);
  });

  it("ships all prep tabs: prereqs, pricing, supplies, tools, notes content", () => {
    const kit = guideKitForId(GUIDE_ID);
    expect(
      kit.prerequisites.some((p) => /not.*salesperson|requirements|privacy|typical clients/i.test(p.label)),
    ).toBe(true);
    expect(kit.suggestedPricing?.tabLabel).toMatch(/simple follow-up packages/i);
    expect(kit.suggestedPricing?.intro).toMatch(/pricing formula/i);
    expect(kit.supplies?.items.some((i) => /computer|laptop/i.test(i.name))).toBe(true);
    expect(kit.tools.some((t) => /google sheets|excel/i.test(t.name))).toBe(true);
    expect(kit.tools.some((t) => /gmail|outlook/i.test(t.name))).toBe(true);
    expect(kit.tools.some((t) => /crm/i.test(t.name))).toBe(true);
    expect(kit.tools.some((t) => /beginner tool stack/i.test(t.name))).toBe(true);
    expect(LEAD_FOLLOWUP_REALITY_CHECK.title).toMatch(/not cold calling/i);
    expect(LEAD_FOLLOWUP_NOTES_WORKSHEET).toMatch(/Lead Follow-Up Client Planner/i);
    expect(LEAD_FOLLOWUP_NOTES_WORKSHEET).toMatch(/FIRST FOLLOW-UP/i);
  });

  it("includes exactly 11 authored core steps plus marketing titles", () => {
    const core = LEAD_FOLLOWUP_DETAILED_STEPS.filter(
      (s) =>
        !/pick how you will tell|make your marketing|carry out the marketing/i.test(s.title),
    );
    expect(core).toHaveLength(11);
    const steps = detailedStepsForGuide(GUIDE_ID) ?? [];
    const titles = steps.map((s) => s.title);
    expect(titles).toEqual(
      expect.arrayContaining([
        "Choose the types of businesses you want to serve",
        "Create a simple Lead Follow-Up Assistant offer",
        "Decide whether to charge hourly or monthly",
        "Find potential clients who regularly receive inquiries/leads",
        "Explain the value without sounding like a salesperson",
        "Ask how leads currently arrive",
        "Agree on the follow-up process",
        "Create or use the client's lead tracker/CRM",
        "Send polite approved follow-ups and record every contact attempt",
        "Flag replies with clear lead statuses",
        "Send the client a simple weekly or monthly summary",
        "Make Your First Sale",
        "Ask for a Short Review",
      ]),
    );
  });

  it("uses Service Revenue Calculator with hours and software expenses", () => {
    expect(guideCalcModeForId(GUIDE_ID)).toBe("service");
    const profile = guideCalcProfileForId(GUIDE_ID, "Lead Follow-Up Assistant");
    expect(profile.mode).toBe("service");
    expect(profile.title).toMatch(/Service Revenue Calculator/i);
    expect(profile.disclaimerExtra).toMatch(/planning estimates only/i);
    expect(profile.budget.map((b) => b.id)).toEqual(["software", "other"]);
    expect(profile.defaults.hoursPerClient).toBe(0);

    const result = computeGuideCalc(
      "service",
      { jobsPerMonth: 4, avgTicket: 200, hoursPerClient: 5 },
      [
        { id: "software", label: "Monthly software cost", amount: 30 },
        { id: "other", label: "Other monthly expenses", amount: 20 },
      ],
    );
    expect(result.revenue).toBe(800);
    expect(result.expenses).toBe(50);
    expect(result.net).toBe(750);
    expect(result.metrics?.netPerHour).toBe(37.5);
  });
});
