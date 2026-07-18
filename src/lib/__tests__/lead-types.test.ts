import { describe, expect, it } from "vitest";
import { isLeadType, LEAD_TYPE_LABELS, LEAD_TYPES } from "../lead-types";

describe("lead-types", () => {
  it("recognizes agent CTA click type", () => {
    expect(isLeadType(LEAD_TYPES.AGENT_CTA_CLICK)).toBe(true);
    expect(LEAD_TYPE_LABELS[LEAD_TYPES.AGENT_CTA_CLICK]).toContain("CTA");
  });

  it("rejects unknown types", () => {
    expect(isLeadType("unknown")).toBe(false);
  });
});
