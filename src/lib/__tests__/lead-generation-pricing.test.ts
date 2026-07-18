import { describe, expect, it } from "vitest";
import {
  LEAD_GENERATION_PER_LEAD,
} from "@/lib/lead-generation-pricing";
import { LEAD_PAY_AS_YOU_GO, LEAD_SUBSCRIPTION_PRICING } from "@/lib/lead-pricing";

describe("lead-generation-pricing", () => {
  it("defines per-lead pricing from the legacy lead-pricing catalog", () => {
    expect(LEAD_GENERATION_PER_LEAD.singleLead).toBe(LEAD_PAY_AS_YOU_GO[0].price);
    expect(LEAD_GENERATION_PER_LEAD.singleLead).toBe(40);
    expect(LEAD_GENERATION_PER_LEAD.volumeFloor).toBe(
      LEAD_SUBSCRIPTION_PRICING.regular.effectivePerLead,
    );
  });
});
