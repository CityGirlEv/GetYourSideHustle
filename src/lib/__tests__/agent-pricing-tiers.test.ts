import { describe, it, expect } from "vitest";
import {
  AGENT_ADD_ONS,
  AGENT_TIERS,
  agentTierComparisonAttributeRows,
  availableAddOnsForTier,
  computeAgentPackagePrice,
  formatAgentPackageLabel,
  formatAgentTierTabMeta,
  packageIncludesFeature,
  tierIncludesFeature,
} from "../agent-pricing-tiers";

describe("formatAgentTierTabMeta", () => {
  it("formats monthly price for tier tabs", () => {
    expect(formatAgentTierTabMeta("bronze")).toBe("$59/mo");
    expect(formatAgentTierTabMeta("silver")).toBe("$99/mo");
    expect(formatAgentTierTabMeta("gold")).toBe("$149/mo");
    expect(formatAgentTierTabMeta("platinum")).toBe("$249/mo");
  });
});

describe("agentTierComparisonAttributeRows", () => {
  it("includes price, lead, and feature rows for all tiers", () => {
    const rows = agentTierComparisonAttributeRows();
    const labels = rows.map((row) => row.label);
    expect(labels).toContain("Monthly price");
    expect(labels).toContain("Included leads");
    expect(labels).toContain("Minimum term");
    expect(labels).toContain("Overage per lead");
    expect(labels).toContain("Lead allocation");
    expect(labels).toContain("All Plans national CMS catalog");
    expect(rows.find((row) => row.id === "monthly-price")?.getTextValue?.("gold")).toBe("$149");
    expect(rows.find((row) => row.id === "included-leads")?.getTextValue?.("bronze")).toBe("2/mo");
    expect(rows.find((row) => row.id === "included-leads")?.getTextValue?.("silver")).toBe("4/mo");
    expect(rows.find((row) => row.id === "included-leads")?.getTextValue?.("gold")).toBe("6/mo");
    expect(rows.find((row) => row.id === "included-leads")?.getTextValue?.("platinum")).toBe("8/mo");
    expect(rows.find((row) => row.id === "minimum-term")?.getTextValue?.("bronze")).toBe("2 months");
  });
});

describe("formatAgentPackageLabel", () => {
  it("returns tier name alone when no add-ons", () => {
    expect(formatAgentPackageLabel("bronze", [])).toBe("Bronze");
  });

  it("appends plus signs for add-ons (Level ++)", () => {
    expect(formatAgentPackageLabel("bronze", ["part-d-only"])).toBe("Bronze +");
    expect(formatAgentPackageLabel("silver", ["part-d-only", "saved-reports-pack"])).toBe("Silver ++");
  });
});

describe("availableAddOnsForTier", () => {
  it("hides add-ons already included in Gold", () => {
    const addOns = availableAddOnsForTier("gold");
    expect(addOns.some((a) => a.id === "all-plans-catalog")).toBe(false);
    expect(addOns.some((a) => a.id === "county-report-zip3")).toBe(false);
    expect(addOns.some((a) => a.id === "county-report-zip5")).toBe(false);
    expect(addOns.some((a) => a.id === "part-d-only")).toBe(true);
  });

  it("shows county report add-ons for Bronze", () => {
    const addOns = availableAddOnsForTier("bronze");
    expect(addOns.some((a) => a.id === "all-plans-catalog")).toBe(true);
    expect(addOns.some((a) => a.id === "county-report-zip3")).toBe(true);
    expect(addOns.some((a) => a.id === "county-report-zip5")).toBe(true);
    expect(addOns.some((a) => a.id === "ma-catalog")).toBe(true);
    expect(addOns.some((a) => a.id === "i-snp-catalog")).toBe(true);
  });
});

describe("packageIncludesFeature", () => {
  it("unlocks i-snp catalog via à la carte add-on", () => {
    expect(packageIncludesFeature("bronze", ["i-snp-catalog"], "i-snp-catalog")).toBe(true);
    expect(packageIncludesFeature("bronze", [], "i-snp-catalog")).toBe(false);
  });

  it("unlocks county report modes separately on Bronze", () => {
    expect(packageIncludesFeature("bronze", [], "county-report-zip3")).toBe(false);
    expect(packageIncludesFeature("bronze", ["county-report-zip3"], "county-report-zip3")).toBe(
      true,
    );
    expect(packageIncludesFeature("bronze", ["county-report-zip3"], "county-report-zip5")).toBe(
      false,
    );
    expect(packageIncludesFeature("bronze", ["county-report-zip5"], "county-report-zip5")).toBe(
      true,
    );
  });
});

describe("computeAgentPackagePrice", () => {
  it("sums tier base and purchasable add-ons", () => {
    const partDPrice = AGENT_ADD_ONS.find((a) => a.id === "part-d-only")!.monthlyPrice;
    expect(computeAgentPackagePrice("bronze", ["part-d-only"])).toBe(
      AGENT_TIERS.bronze.monthlyPrice + partDPrice,
    );
  });

  it("sums both county report add-ons on Bronze", () => {
    const zip3 = AGENT_ADD_ONS.find((a) => a.id === "county-report-zip3")!.monthlyPrice;
    const zip5 = AGENT_ADD_ONS.find((a) => a.id === "county-report-zip5")!.monthlyPrice;
    expect(
      computeAgentPackagePrice("bronze", ["county-report-zip3", "county-report-zip5"]),
    ).toBe(AGENT_TIERS.bronze.monthlyPrice + zip3 + zip5);
  });

  it("ignores add-ons already included in tier", () => {
    expect(
      computeAgentPackagePrice("gold", [
        "all-plans-catalog",
        "county-report-zip3",
        "county-report-zip5",
      ]),
    ).toBe(AGENT_TIERS.gold.monthlyPrice);
  });
});

describe("tierIncludesFeature", () => {
  it("Gold includes all-plans and both county report modes", () => {
    expect(tierIncludesFeature("gold", "all-plans-catalog")).toBe(true);
    expect(tierIncludesFeature("gold", "county-report-zip3")).toBe(true);
    expect(tierIncludesFeature("gold", "county-report-zip5")).toBe(true);
    expect(tierIncludesFeature("bronze", "all-plans-catalog")).toBe(false);
    expect(tierIncludesFeature("bronze", "county-report-zip3")).toBe(false);
  });
});

describe("parseFeaturesAgentTierTab", () => {
  it("returns valid tier ids and defaults to silver", async () => {
    const { parseFeaturesAgentTierTab } = await import("../features-pricing-tabs");
    expect(parseFeaturesAgentTierTab("bronze")).toBe("bronze");
    expect(parseFeaturesAgentTierTab("platinum")).toBe("platinum");
    expect(parseFeaturesAgentTierTab("invalid")).toBe("silver");
    expect(parseFeaturesAgentTierTab(undefined)).toBe("silver");
  });
});

describe("leadAllocation", () => {
  it("bundles included leads at every subscription tier", () => {
    expect(AGENT_TIERS.bronze.leadAllocation.includedLeads).toBe(2);
    expect(AGENT_TIERS.bronze.monthlyPrice).toBe(59);
    expect(AGENT_TIERS.bronze.leadAllocation.summary).toBe("2 leads/mo included");
    expect(AGENT_TIERS.bronze.leadAllocation.detail).toContain("$29.50/lead effective");
    expect(AGENT_TIERS.silver.leadAllocation.includedLeads).toBe(4);
    expect(AGENT_TIERS.silver.leadAllocation.summary).toBe("4 leads/mo included");
    expect(AGENT_TIERS.silver.leadAllocation.detail).toContain("$24.75/lead effective");
    expect(AGENT_TIERS.gold.leadAllocation.includedLeads).toBe(6);
    expect(AGENT_TIERS.gold.leadAllocation.summary).toBe("6 leads/mo included");
    expect(AGENT_TIERS.gold.leadAllocation.detail).toContain("$24.83/lead effective");
    expect(AGENT_TIERS.platinum.leadAllocation.includedLeads).toBe(8);
    expect(AGENT_TIERS.platinum.leadAllocation.detail).toContain("$31.13/lead effective");
    expect(AGENT_TIERS.platinum.leadAllocation.summary).toContain("priority routing");
    expect(AGENT_TIERS.platinum.leadAllocation.summary).not.toContain("territory");
  });

  it("requires a 2-month minimum on all tiers", () => {
    for (const tierId of ["bronze", "silver", "gold", "platinum"] as const) {
      expect(AGENT_TIERS[tierId].minimumTermMonths).toBe(2);
    }
  });
});
