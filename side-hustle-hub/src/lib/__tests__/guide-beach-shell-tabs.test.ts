import { describe, expect, it } from "vitest";
import { guideKitForId } from "../guide-tools";
import { uniqueGuideLibraryEntries } from "../guide-library-pool";
import {
  GUIDE_PREP_REVIEW_TAB_LABELS,
  guidePrepSectionIds,
} from "../guide-prep-visibility";
import {
  ensureMarketingPlanSteps,
  guideMarkedPendingAfterPrepBackfill,
} from "../guide-marketing-plan";
import { defaultStatusForGuide } from "../guide-catalog-state";

const SEVEN_TAB_IDS = [
  "all",
  "prereqs",
  "pricing",
  "supplies",
  "tools",
  "steps",
  "calculator",
] as const;

describe("Beach Shell Jewelry template — all guides", () => {
  it("Beach Shell Jewelry has marketing materials, carry-out, and all prep tabs", () => {
    const kit = guideKitForId("beach-shell-jewelry");
    const titles = (kit.steps ?? []).map((s) => s.title).join(" | ");
    expect(titles).toMatch(/Make your marketing materials/i);
    expect(titles).toMatch(/Carry out the marketing plan/i);
    const tabs = guidePrepSectionIds({
      kit,
      includeSteps: true,
      includeCalculator: true,
    });
    expect(GUIDE_PREP_REVIEW_TAB_LABELS).toHaveLength(7);
    for (const id of SEVEN_TAB_IDS) {
      expect(tabs, id).toContain(id);
    }
  });

  it("every library guide has Make your marketing materials + Carry out the marketing plan", async () => {
    const { stepsIncludeMarketingMaterials, stepsIncludeCarryOutMarketing } = await import(
      "../guide-marketing-plan"
    );
    const { guideUsesNonLaunchPlaybook, guideUsesPlatformMarketplacePlaybook } = await import(
      "../guide-detailed-steps"
    );
    for (const e of uniqueGuideLibraryEntries()) {
      if (guideUsesNonLaunchPlaybook(e.id) || guideUsesPlatformMarketplacePlaybook(e.id)) continue;
      const kit = guideKitForId(e.id);
      const steps = (kit.steps ?? []).map((s) => ({ title: s.title, desc: s.desc }));
      expect(stepsIncludeMarketingMaterials(steps), e.id).toBe(true);
      expect(stepsIncludeCarryOutMarketing(steps), e.id).toBe(true);
    }
  });

  it("every library guide shows the seven prep tabs (Show All + prereqs/pricing/supplies/tools/steps/calculator)", () => {
    for (const e of uniqueGuideLibraryEntries()) {
      const kit = guideKitForId(e.id);
      expect(kit.prerequisites?.length, e.id).toBeGreaterThan(0);
      expect(kit.tools?.length, e.id).toBeGreaterThan(0);
      expect(kit.suggestedPricing?.items.length, e.id).toBeGreaterThan(0);
      expect(kit.supplies?.items.length, e.id).toBeGreaterThan(0);
      expect(kit.steps?.length, e.id).toBeGreaterThan(0);
      const tabs = guidePrepSectionIds({
        kit,
        includeSteps: true,
        includeCalculator: true,
      });
      for (const id of SEVEN_TAB_IDS) {
        expect(tabs, `${e.id} missing ${id}`).toContain(id);
      }
    }
  });

  it("ensureMarketingPlanSteps is idempotent", () => {
    const once = ensureMarketingPlanSteps(
      [{ title: "Do the work", desc: "Deliver." }],
      "handyman",
    );
    const twice = ensureMarketingPlanSteps(once, "handyman");
    expect(twice.filter((s) => /make your marketing materials/i.test(s.title))).toHaveLength(1);
    expect(twice.filter((s) => /carry out the marketing plan/i.test(s.title))).toHaveLength(1);
  });

  it("backfilled guides default to Pending / Needs Further Review", () => {
    expect(guideMarkedPendingAfterPrepBackfill("rideshare")).toBe(true);
    expect(defaultStatusForGuide("rideshare")).toBe("pending");
    expect(guideMarkedPendingAfterPrepBackfill("beach-shell-jewelry")).toBe(false);
    expect(defaultStatusForGuide("beach-shell-jewelry")).toBe("active");
  });
});
