import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { Sparkles } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { BenchmarkReportTabBar } from "@/components/BenchmarkReportSectionNav";
import { ConsumerFeaturesGrid } from "@/components/ConsumerFeaturesGrid";
import { FeaturesPricingTabs } from "@/components/FeaturesPricingTabs";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { buttonVariants } from "@/components/ui/button";
import { SITE_BRAND_NAME } from "@/lib/site-brand";
import { canonicalUrl } from "@/lib/site-url";
import { BENCHMARK_TOOL_CTA, BENCHMARK_TOOL_NAME } from "@/lib/plan-comparison-copy";
import { parseFeaturesMainTab, type FeaturesMainTab } from "@/lib/features-pricing-tabs";
import { AGENT_SUBSCRIPTION_LABEL } from "@/lib/agent-pricing-tiers";
import { cn } from "@/lib/utils";

const PAGE_URL = canonicalUrl("/features");

const MAIN_TAB_SECTIONS = [
  { id: "consumer", label: "Consumers (Free)", number: 1 },
  { id: "agents", label: "Agents", number: 2 },
] as const;

type FeaturesSearch = {
  tab?: string;
  agentTab?: string;
  checkout?: string;
};

export const Route = createFileRoute("/features")({
  validateSearch: (search: Record<string, unknown>): FeaturesSearch => ({
    tab: typeof search.tab === "string" ? search.tab : undefined,
    agentTab: typeof search.agentTab === "string" ? search.agentTab : undefined,
    checkout: typeof search.checkout === "string" ? search.checkout : undefined,
  }),
  head: () => ({
    meta: [
      { title: `What We Offer - ${AGENT_SUBSCRIPTION_LABEL} — ${SITE_BRAND_NAME}` },
      {
        name: "description",
        content:
          "Explore the Part B Optimizer Benchmark Tool: de-identified plan comparison, educational reports, workbook, agent platform tiers, and pricing.",
      },
      {
        property: "og:title",
        content: `What We Offer - ${AGENT_SUBSCRIPTION_LABEL} — ${SITE_BRAND_NAME}`,
      },
      {
        property: "og:description",
        content:
          "Free consumer benchmark tools, licensed-agent platform tiers, and agent pricing for the Part B Optimizer Benchmark Tool.",
      },
      { property: "og:url", content: PAGE_URL },
    ],
    links: [{ rel: "canonical", href: PAGE_URL }],
  }),
  component: FeaturesPage,
});

function FeaturesPage() {
  const router = useRouter();
  const search = Route.useSearch();
  const activeMainTab = parseFeaturesMainTab(search.tab);

  const navigateFeatures = (next: { tab: FeaturesMainTab }) => {
    void router.navigate({
      to: "/features",
      search: {
        tab: next.tab,
        ...(search.checkout && next.tab === "agents" ? { checkout: search.checkout } : {}),
      },
      hash: next.tab === "agents" ? "agent-pricing" : undefined,
      replace: true,
    });
  };

  return (
    <AppShell
      title={AGENT_SUBSCRIPTION_LABEL}
      subtitle={`${BENCHMARK_TOOL_NAME} — educational comparisons for consumers and platform tools for licensed agents.`}
    >
      <div className="max-w-5xl mx-auto space-y-10">
        <Tabs
          value={activeMainTab}
          onValueChange={(value) => navigateFeatures({ tab: value as FeaturesMainTab })}
          className="w-full"
        >
          <BenchmarkReportTabBar sections={[...MAIN_TAB_SECTIONS]} />

          <TabsContent value="consumer" className="mt-6 space-y-4">
            <div className="space-y-1">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">
                For everyone
              </p>
              <p className="text-sm text-muted-foreground">
                Free educational tools to understand plan types, costs, and trade-offs before you
                talk to a licensed professional.
              </p>
            </div>
            <ConsumerFeaturesGrid />
          </TabsContent>

          <TabsContent
            value="agents"
            id="agent-pricing"
            className="scroll-mt-24 mt-6 space-y-4"
          >
            <FeaturesPricingTabs checkoutStatus={search.checkout} agentTierTab={search.agentTab} />
          </TabsContent>
        </Tabs>

        <Card className="glass p-6 flex flex-wrap items-center justify-between gap-4 border-primary/15">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" aria-hidden />
              <h2 className="font-display text-lg font-bold">Ready to benchmark?</h2>
            </div>
            <p className="text-sm text-muted-foreground max-w-xl">
              Run a de-identified comparison in minutes, or explore agent tiers when you are ready
              to grow your practice.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 shrink-0">
            <Link to="/scenario/new" className={cn(buttonVariants(), "compare-plans-cta")}>
              {BENCHMARK_TOOL_CTA}
            </Link>
            <Link
              to="/features"
              search={{ tab: "agents" }}
              hash="agent-pricing"
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              Agent pricing
            </Link>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
