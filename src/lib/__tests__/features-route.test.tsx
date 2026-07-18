import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { render, screen } from "@testing-library/react";
import { AgentPlatformTiersOverview } from "@/components/AgentPlatformTiersOverview";
import { CartProvider } from "@/lib/cart-store";
import { CONSUMER_PRODUCT_FEATURES } from "@/lib/product-features";
import { AGENT_TIER_ORDER, AGENT_TIERS } from "@/lib/agent-pricing-tiers";
import { publicSiteMapXmlEntries } from "@/lib/site-map";

const featuresRouteSource = readFileSync(join(process.cwd(), "src/routes/features.tsx"), "utf8");
const featuresPricingTabsSource = readFileSync(
  join(process.cwd(), "src/components/FeaturesPricingTabs.tsx"),
  "utf8",
);
const agentPricingTiersSource = readFileSync(
  join(process.cwd(), "src/components/AgentPricingTiers.tsx"),
  "utf8",
);

describe("/features route", () => {
  it("registers createFileRoute at /features with SEO meta", () => {
    expect(featuresRouteSource).toContain('createFileRoute("/features")');
    expect(featuresRouteSource).toContain("AGENT_SUBSCRIPTION_LABEL");
    expect(featuresRouteSource).toContain("What We Offer - ${AGENT_SUBSCRIPTION_LABEL}");
    expect(featuresRouteSource).not.toContain("Compare Medicare options without giving up your privacy");
    expect(featuresRouteSource).not.toContain("Start here");
    expect(featuresRouteSource).toContain("SITE_BRAND_NAME");
    expect(featuresRouteSource).toContain("BenchmarkReportTabBar");
  });

  it("uses top-level consumer and agents tabs with unified agent pricing", () => {
    expect(featuresRouteSource).toContain("FeaturesPricingTabs");
    expect(featuresRouteSource).toContain('id="agent-pricing"');
    expect(featuresRouteSource).toContain('search={{ tab: "agents" }}');
    expect(featuresRouteSource).toContain("Consumers (Free)");
    expect(featuresRouteSource).not.toContain("For licensed agents");
    expect(featuresRouteSource).not.toContain("activeAgentTab");
    expect(featuresRouteSource).not.toContain("onAgentTabChange");
  });

  it("does not render agent quick-link bubbles above pricing tabs", () => {
    expect(featuresRouteSource).not.toContain("Agent sign in");
    expect(featuresRouteSource).not.toMatch(/>\s*Platform access\s*</);
    expect(featuresRouteSource).not.toMatch(/>\s*Lead pricing\s*</);
  });

  it("shows a single combined agent subscription section", () => {
    expect(featuresPricingTabsSource).toContain('id="agents-subscription-section"');
    expect(featuresPricingTabsSource).toContain("AGENT_SUBSCRIPTION_LABEL");
    expect(featuresPricingTabsSource).not.toContain("Subscription: Lead and Platform Access");
    expect(featuresPricingTabsSource).not.toContain("For licensed agents");
    expect(featuresPricingTabsSource).not.toContain("AgentsMainSectionHeading");
    expect(featuresPricingTabsSource).toContain("Before you purchase leads");
    expect(featuresPricingTabsSource).toContain("1:1 consent form");
    expect(featuresPricingTabsSource).toContain("<AgentPricingTiers");
    expect(featuresPricingTabsSource).toContain("activeTier={activeAgentTier}");
    expect(agentPricingTiersSource).toContain("BenchmarkReportTabBar");
    expect(agentPricingTiersSource).toContain("BenchmarkReportCollapsible");
    expect(agentPricingTiersSource).toContain("tier-a-la-carte");
    expect(agentPricingTiersSource).toContain("formatAgentTierTabMeta");
    expect(agentPricingTiersSource).toContain("AgentTierComparisonTable");
    expect(agentPricingTiersSource).toContain("Compare all plans");
    expect(agentPricingTiersSource).toContain("formatAgentMinimumTerm");
    expect(agentPricingTiersSource).not.toContain("Bronze agents");
    expect(agentPricingTiersSource).not.toContain("md:grid-cols-2 xl:grid-cols-4");
    expect(agentPricingTiersSource).not.toContain("AGENT_SUBSCRIPTION_LABEL");
    expect(featuresPricingTabsSource).toContain("2-month minimum");
    expect(featuresPricingTabsSource).not.toContain("<LeadGenerationPricing");
    expect(featuresPricingTabsSource).not.toContain("<PricingPlans");
    expect(featuresPricingTabsSource).not.toContain("agents-leads-section");
    expect(featuresPricingTabsSource).not.toContain("agents-platform-section");
    expect(featuresPricingTabsSource).not.toContain("territory");
  });

  it("is listed in the public site map", () => {
    const paths = publicSiteMapXmlEntries().map((e) => e.path);
    expect(paths).toContain("/features");
    expect(paths).not.toContain("/pricing");
  });
});

describe("product features data", () => {
  it("lists core consumer benchmark capabilities", () => {
    const ids = CONSUMER_PRODUCT_FEATURES.map((f) => f.id);
    expect(ids).toContain("benchmark-tool");
    expect(ids).toContain("benchmark-report");
    expect(ids).toContain("plan-comparison");
    expect(ids).toContain("workbook");
  });
});

describe("AgentPlatformTiersOverview", () => {
  it("renders all platform tier names and add-ons section", () => {
    render(
      <CartProvider>
        <AgentPlatformTiersOverview />
      </CartProvider>,
    );
    for (const tierId of AGENT_TIER_ORDER) {
      expect(screen.getByText(AGENT_TIERS[tierId].name)).toBeInTheDocument();
    }
    expect(screen.getByText("À la carte add-ons")).toBeInTheDocument();
    expect(screen.getByText("Priority lead routing")).toBeInTheDocument();
    expect(screen.getByText("2 leads/mo included")).toBeInTheDocument();
    expect(screen.getByText("4 leads/mo included")).toBeInTheDocument();
    expect(screen.getByText("6 leads/mo included")).toBeInTheDocument();
    expect(screen.getByText(/8 leads\/mo \+ priority routing/)).toBeInTheDocument();
    expect(screen.queryByText(/territory/i)).not.toBeInTheDocument();
    expect(screen.getByText("County report — ZIP prefix (3 digits)")).toBeInTheDocument();
    expect(screen.getByText("County report — full ZIP (5 digits)")).toBeInTheDocument();
    expect(screen.getByTestId("agent-platform-tiers-overview")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /add to cart/i }).length).toBeGreaterThan(0);
  });
});
