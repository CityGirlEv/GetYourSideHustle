import { describe, expect, it } from "vitest";
import { guideKitForId } from "../guide-tools";
import { detailedStepsForGuide } from "../guide-detailed-steps";
import { PINNED_GUIDE_NUMBERS } from "../guide-number-registry";
import { formatGuideNumber } from "../guide-numbers";
import { hustleById, SIDE_HUSTLES } from "../side-hustle-catalog";
import { adultGuideMinTier } from "../guide-access";
import {
  guideCalcModeForId,
  guideCalcProfileForId,
  computeGuideCalc,
} from "../guide-revenue-calc";
import { buildLaunchGuidePdfModel } from "../launch-guide-pdf";
import {
  APPOINTMENT_SETTER_DETAILED_STEPS,
  APPOINTMENT_SETTER_NOTES_WORKSHEET,
  APPOINTMENT_SETTER_REALITY_CHECK,
  computeAppointmentBookingRate,
  computeAppointmentSetterProfit,
} from "../appointment-setter-guide";

const GUIDE_ID = "appointment-setter";

describe("Guide #034 Appointment Setter", () => {
  it("keeps a single #034 id, title, Starter tier, and 3–10 hrs/week", () => {
    const matches = SIDE_HUSTLES.filter((h) => h.id === GUIDE_ID);
    expect(matches).toHaveLength(1);
    expect(formatGuideNumber(GUIDE_ID)).toBe("034");
    expect(PINNED_GUIDE_NUMBERS[GUIDE_ID]).toBe("034");
    const idsFor034 = Object.entries(PINNED_GUIDE_NUMBERS)
      .filter(([, n]) => n === "034")
      .map(([id]) => id);
    expect(idsFor034).toEqual([GUIDE_ID]);

    const h = hustleById(GUIDE_ID)!;
    expect(h.name).toBe("Appointment Setter");
    expect(h.audiences).toEqual(expect.arrayContaining(["junior", "adult", "senior"]));
    expect(h.timeReq).toMatch(/3\s*-\s*10 hrs\/week/i);
    expect(h.potentialIncome).toMatch(/\$15/);
    expect(h.potentialIncome).toMatch(/\$50/);
    expect(h.minTier).toBe("starter");
    expect(h.freeWizardEligible).toBe(false);
    expect(adultGuideMinTier(GUIDE_ID)).toBe("starter");
    expect(h.category).toMatch(/Virtual Assistance|Scheduling/i);
  });

  it("ships all prep tabs: prereqs, pricing, supplies, tools, notes content", () => {
    const kit = guideKitForId(GUIDE_ID);
    expect(
      kit.prerequisites.some((p) => /overview|need|privacy|client must/i.test(p.label)),
    ).toBe(true);
    expect(kit.suggestedPricing?.items.some((i) => /\$15/i.test(i.price))).toBe(true);
    expect(kit.suggestedPricing?.intro).toMatch(/\$15–\$50\/project/i);
    expect(kit.supplies?.items.some((i) => /calendar|script|tracker/i.test(i.name))).toBe(true);
    expect(kit.tools.some((t) => /google calendar|sheets|docs/i.test(t.name))).toBe(true);
    expect(kit.tools.some((t) => /beginner tool stack/i.test(t.name))).toBe(true);
    expect(APPOINTMENT_SETTER_REALITY_CHECK.title).toMatch(/calendar/i);
    expect(APPOINTMENT_SETTER_NOTES_WORKSHEET).toMatch(/APPOINTMENT SETTING BUSINESS/i);
  });

  it("includes exactly 11 authored core steps with marketing as steps 3–5", () => {
    const core = APPOINTMENT_SETTER_DETAILED_STEPS;
    expect(core).toHaveLength(11);
    expect(core[2]?.title).toMatch(/choose your marketing channels/i);
    expect(core[3]?.title).toMatch(/make your marketing materials/i);
    expect(core[4]?.title).toMatch(/carry out your marketing plan/i);

    const steps = detailedStepsForGuide(GUIDE_ID) ?? [];
    const titles = steps.map((s) => s.title);
    expect(titles.filter((t) => /choose your marketing channels/i.test(t))).toHaveLength(1);
    expect(titles.filter((t) => /make your marketing materials/i.test(t))).toHaveLength(1);
    expect(titles.filter((t) => /carry out your marketing plan/i.test(t))).toHaveLength(1);
    expect(titles.filter((t) => /create your marketing campaign/i.test(t))).toHaveLength(0);
    expect(titles.filter((t) => /execute your marketing campaign/i.test(t))).toHaveLength(0);

    expect(titles).toEqual(
      expect.arrayContaining([
        "Choose Who You Help",
        "Create Your Starter Offer",
        "Choose Your Marketing Channels",
        "Make Your Marketing Materials",
        "Carry Out Your Marketing Plan",
        "Learn the Client's Booking Rules",
        "Create Your Approved Scripts",
        "Work the Inquiries",
        "Book, Confirm & Remind",
        "Handle Changes & Track Results",
        "Report & Get Rebooked",
      ]),
    );

    const kitSteps = guideKitForId(GUIDE_ID).steps ?? [];
    expect(kitSteps[0]?.title).toMatch(/parent|partner|friend|someone close/i);
    expect(kitSteps.some((s) => /book, confirm/i.test(s.title))).toBe(true);
    expect(kitSteps.some((s) => /report & get rebooked/i.test(s.title))).toBe(true);
  });

  it("uses Appointment Setter Profit Calculator with effective hourly rate", () => {
    expect(guideCalcModeForId(GUIDE_ID)).toBe("service");
    const profile = guideCalcProfileForId(GUIDE_ID, "Appointment Setter");
    expect(profile.title).toMatch(/appointment setter profit/i);
    expect(profile.defaults).toHaveProperty("recurringClientRevenue");
    expect(profile.budget.some((b) => /software|phone/i.test(b.label))).toBe(true);

    const result = computeGuideCalc(
      "service",
      {
        jobsPerMonth: 3,
        avgTicket: 35,
        recurringClientRevenue: 50,
        hoursPerClient: 8,
      },
      [
        { id: "software", label: "Software / phone", amount: 10 },
        { id: "other", label: "Other", amount: 0 },
      ],
    );
    expect(result.revenue).toBe(155);
    expect(result.expenses).toBe(10);
    expect(result.net).toBe(145);
    expect(result.metrics?.netPerHour).toBeCloseTo(18.125, 3);
    expect(result.notes.some((n) => /monthly profit/i.test(n))).toBe(true);

    const pure = computeAppointmentSetterProfit({
      projectPrice: 35,
      projectsPerWeek: 3,
      recurringClientRevenue: 50,
      hoursWorked: 8,
      softwarePhoneExpense: 10,
      otherExpenses: 0,
    });
    expect(pure.weeklyProfit).toBe(145);
    expect(pure.monthlyProfitEstimate).toBeCloseTo(145 * 4.33, 5);
    expect(pure.effectiveHourlyRate).toBeCloseTo(18.125, 3);

    expect(computeAppointmentBookingRate(8, 20)).toBe(40);
    expect(computeAppointmentBookingRate(1, 0)).toBeNull();
  });

  it("Download PDF model matches the upgraded on-screen kit", () => {
    const kit = guideKitForId(GUIDE_ID);
    const pdf = buildLaunchGuidePdfModel(GUIDE_ID);
    expect(pdf.title).toBe("Appointment Setter");
    expect(pdf.prerequisites.some((p) => /calendar|script|privacy|appointment/i.test(p))).toBe(
      true,
    );
    expect(pdf.pricing?.some((p) => /\$15|\$25|\$50/i.test(p))).toBe(true);
    expect(pdf.supplies.some((s) => /calendar|script|tracker/i.test(s.name))).toBe(true);
    expect(pdf.tools.some((t) => /calendar|sheets|script/i.test(t))).toBe(true);
    expect(kit.steps?.length).toBeGreaterThan(11);
  });
});
