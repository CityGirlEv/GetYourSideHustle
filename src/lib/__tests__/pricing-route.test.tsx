import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  parseFeaturesAgentTab,
  parseFeaturesMainTab,
  parseFeaturesPricingTab,
  pricingRedirectSearch,
  pricingRedirectTab,
} from "@/lib/features-pricing-tabs";

const pricingRouteSource = readFileSync(join(process.cwd(), "src/routes/pricing.tsx"), "utf8");

describe("/pricing route", () => {
  it("redirects to /features with agents tab search param", () => {
    expect(pricingRouteSource).toContain('createFileRoute("/pricing")');
    expect(pricingRouteSource).toContain('to: "/features"');
    expect(pricingRouteSource).toContain('hash: "agent-pricing"');
    expect(pricingRouteSource).toContain("pricingRedirectSearch");
    expect(pricingRouteSource).not.toContain("agentTab");
  });
});

describe("features tab helpers", () => {
  it("defaults main tab to consumer", () => {
    expect(parseFeaturesMainTab(undefined)).toBe("consumer");
    expect(parseFeaturesAgentTab(undefined, undefined)).toBeUndefined();
  });

  it("maps legacy top-level tab params onto agents main tab", () => {
    expect(parseFeaturesMainTab("feature-pricing")).toBe("agents");
    expect(parseFeaturesMainTab("subscription")).toBe("agents");
    expect(parseFeaturesAgentTab("feature-pricing", undefined)).toBe("platform-access");
    expect(parseFeaturesAgentTab("subscription", undefined)).toBe("lead-pricing");
    expect(parseFeaturesPricingTab("subscription")).toBe("lead-pricing");
    expect(parseFeaturesPricingTab("other")).toBeUndefined();
  });

  it("maps legacy pricing tabs onto the combined agents page", () => {
    expect(pricingRedirectSearch("platform")).toEqual({ tab: "agents" });
    expect(pricingRedirectSearch("lead-gen")).toEqual({ tab: "agents" });
    expect(pricingRedirectSearch("leads")).toEqual({ tab: "agents" });
    expect(pricingRedirectSearch(undefined)).toEqual({ tab: "agents" });
    expect(pricingRedirectTab("platform")).toBe("platform-access");
    expect(pricingRedirectTab("leads")).toBe("lead-pricing");
  });
});
