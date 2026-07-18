import { useMemo, useState } from "react";
import { Check, Sparkles, TrendingUp, Users } from "lucide-react";
import { AddToCartButton } from "@/components/AddToCartButton";
import { AgentTierComparisonTable } from "@/components/AgentTierComparisonTable";
import { BenchmarkReportCollapsible } from "@/components/BenchmarkReportCollapsible";
import { BenchmarkReportTabBar } from "@/components/BenchmarkReportSectionNav";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import {
  AGENT_ADD_ONS,
  AGENT_TIER_ORDER,
  AGENT_TIERS,
  availableAddOnsForTier,
  formatAgentMinimumTerm,
  formatAgentTierTabMeta,
  formatAgentUsd,
  type AgentAddOnId,
  type AgentTierId,
} from "@/lib/agent-pricing-tiers";
import { BENCHMARK_REPORT_LINK_CLASS } from "@/lib/benchmark-report-ui";
import {
  LEAD_GENERATION_FEATURES,
  LEAD_GENERATION_PER_LEAD,
  formatUsd,
} from "@/lib/lead-generation-pricing";
import { cn } from "@/lib/utils";
import { MOBILE_BREAKPOINT } from "@/hooks/use-mobile";

const AGENT_TIER_TAB_SECTIONS = AGENT_TIER_ORDER.map((tierId, index) => ({
  id: tierId,
  label: AGENT_TIERS[tierId].name,
  meta: formatAgentTierTabMeta(tierId),
  number: index + 1,
}));

const compareToggleClass = cn(
  "inline-flex shrink-0 cursor-pointer items-center rounded-full border border-primary/40 bg-background px-3 py-1 text-xs font-medium text-primary transition-colors hover:bg-primary/5 whitespace-nowrap",
  BENCHMARK_REPORT_LINK_CLASS,
);

type AgentPricingTiersProps = {
  showActions?: boolean;
  activeTier?: AgentTierId;
  onTierChange?: (tierId: AgentTierId) => void;
};

function TierDetailPanel({ tierId }: { tierId: AgentTierId }) {
  const tier = AGENT_TIERS[tierId];

  return (
    <Card className="glass p-6 space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-display text-2xl font-bold">{tier.name}</h3>
            {tierId === "gold" ? (
              <Badge className="bg-primary text-primary-foreground">Popular</Badge>
            ) : null}
          </div>
          <p className="text-sm text-muted-foreground">{tier.tagline}</p>
        </div>
        <div className="flex items-baseline gap-1 shrink-0">
          <span className="font-display text-4xl font-bold tabular-nums">
            {formatAgentUsd(tier.monthlyPrice)}
          </span>
          <span className="text-sm text-muted-foreground">/mo</span>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">{formatAgentMinimumTerm(tierId)}</p>

      <div className="rounded-lg border border-primary/15 bg-primary/5 px-4 py-3 space-y-1">
        <div className="flex items-center gap-1.5 text-sm font-semibold text-foreground">
          <Users className="h-4 w-4 shrink-0 text-primary" aria-hidden />
          <span>{tier.leadAllocation.summary}</span>
        </div>
        <p className="text-xs text-muted-foreground leading-snug">{tier.leadAllocation.detail}</p>
        <p className="text-xs text-muted-foreground">
          Overage: {formatUsd(tier.leadAllocation.overagePerLead)}/lead
        </p>
      </div>

      <div className="space-y-2">
        <h4 className="text-sm font-semibold">Platform features</h4>
        <ul className="text-sm space-y-2 text-muted-foreground">
          {tier.features.map((feature) => (
            <li key={feature.id} className="flex items-start gap-2">
              <Check className="h-4 w-4 shrink-0 text-primary mt-0.5" aria-hidden />
              <span>{feature.label}</span>
            </li>
          ))}
        </ul>
      </div>

      <AddToCartButton payload={{ kind: "agent-tier", tierId }} className="w-full sm:w-auto" />
    </Card>
  );
}

function tierAddOnsDefaultOpen(selectedAddOns: AgentAddOnId[]): boolean {
  if (typeof window === "undefined") return true;
  const isMobile = window.innerWidth < MOBILE_BREAKPOINT;
  return !isMobile || selectedAddOns.length > 0;
}

function TierAddOnsPanel({
  tierId,
  selectedAddOns,
  onToggleAddOn,
  showActions = true,
}: {
  tierId: AgentTierId;
  selectedAddOns: AgentAddOnId[];
  onToggleAddOn: (tierId: AgentTierId, id: AgentAddOnId) => void;
  showActions?: boolean;
}) {
  const tier = AGENT_TIERS[tierId];
  const purchasableAddOns = useMemo(() => availableAddOnsForTier(tierId), [tierId]);
  const [defaultOpen] = useState(() => tierAddOnsDefaultOpen(selectedAddOns));

  const subtitle =
    purchasableAddOns.length === 0
      ? `${tier.name} includes all available add-ons`
      : selectedAddOns.length > 0
        ? `${selectedAddOns.length} selected · ${purchasableAddOns.length} available for ${tier.name}`
        : `${purchasableAddOns.length} add-on${purchasableAddOns.length === 1 ? "" : "s"} available for ${tier.name}`;

  return (
    <div data-testid={`tier-a-la-carte-${tierId}`}>
      <BenchmarkReportCollapsible
        title="À la carte"
        subtitle={subtitle}
        defaultOpen={defaultOpen}
        prominentExpandIcon
        className="glass border-primary/15"
      >
        <div className="flex flex-wrap items-center gap-2 pb-1">
          <Sparkles className="h-4 w-4 text-primary" aria-hidden />
          <p className="text-sm text-muted-foreground">
            Select add-ons to stack on {tier.name}. Items already included in this tier are hidden.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {purchasableAddOns.map((addOn) => {
            const checked = selectedAddOns.includes(addOn.id);
            return (
              <label
                key={addOn.id}
                className={cn(
                  "flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-colors",
                  checked ? "border-primary bg-primary/5" : "border-border hover:bg-muted/30",
                )}
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={() => onToggleAddOn(tierId, addOn.id)}
                />
                <span className="space-y-0.5 min-w-0 flex-1">
                  <span className="text-sm font-medium block">{addOn.name}</span>
                  <span className="text-xs text-muted-foreground block">{addOn.description}</span>
                  <span className="text-xs font-semibold text-primary tabular-nums">
                    +{formatAgentUsd(addOn.monthlyPrice)}/mo
                  </span>
                </span>
                {showActions ? (
                  <AddToCartButton payload={{ kind: "agent-addon", addOnId: addOn.id }} />
                ) : null}
              </label>
            );
          })}
          {purchasableAddOns.length === 0 ? (
            <p className="text-sm text-muted-foreground sm:col-span-2">
              {tier.name} includes all available add-ons.
            </p>
          ) : null}
        </div>
      </BenchmarkReportCollapsible>
    </div>
  );
}

export function AgentPricingTiers({
  showActions = true,
  activeTier: controlledTier,
  onTierChange,
}: AgentPricingTiersProps) {
  const [internalTier, setInternalTier] = useState<AgentTierId>("silver");
  const [compareOpen, setCompareOpen] = useState(false);
  const [selectedAddOnsByTier, setSelectedAddOnsByTier] = useState<
    Partial<Record<AgentTierId, AgentAddOnId[]>>
  >({});

  const selectedTier = controlledTier ?? internalTier;

  const setSelectedTier = (tierId: AgentTierId) => {
    if (controlledTier === undefined) {
      setInternalTier(tierId);
    }
    onTierChange?.(tierId);
  };

  const toggleAddOn = (tierId: AgentTierId, id: AgentAddOnId) => {
    setSelectedAddOnsByTier((prev) => {
      const current = prev[tierId] ?? [];
      const next = current.includes(id)
        ? current.filter((entry) => entry !== id)
        : [...current, id];
      return { ...prev, [tierId]: next };
    });
  };

  const handleTierChange = (tierId: AgentTierId) => {
    setCompareOpen(false);
    setSelectedTier(tierId);
    setSelectedAddOnsByTier((prev) => {
      const current = prev[tierId] ?? [];
      const filtered = current.filter((id) =>
        availableAddOnsForTier(tierId).some((a) => a.id === id),
      );
      if (filtered.length === current.length) return prev;
      return { ...prev, [tierId]: filtered };
    });
  };

  const compareToggle = (
    <button
      type="button"
      className={compareToggleClass}
      aria-pressed={compareOpen}
      onClick={() => setCompareOpen((open) => !open)}
    >
      {compareOpen ? "Hide comparison" : "Compare all plans"}
    </button>
  );

  return (
    <div className="space-y-6" data-testid="agent-pricing-tiers">
      <Tabs
        value={selectedTier}
        onValueChange={(value) => handleTierChange(value as AgentTierId)}
        className="w-full space-y-4"
      >
        <BenchmarkReportTabBar sections={AGENT_TIER_TAB_SECTIONS} trailing={compareToggle} />

        {compareOpen ? (
          <AgentTierComparisonTable showActions={showActions} />
        ) : (
          AGENT_TIER_ORDER.map((tierId) => (
            <TabsContent key={tierId} value={tierId} className="mt-0 space-y-4">
              <TierDetailPanel tierId={tierId} />
              <TierAddOnsPanel
                tierId={tierId}
                selectedAddOns={selectedAddOnsByTier[tierId] ?? []}
                onToggleAddOn={toggleAddOn}
                showActions={showActions}
              />
            </TabsContent>
          ))
        )}
      </Tabs>

      <Card className="glass p-6 space-y-3 border-primary/15">
        <div className="flex flex-wrap items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" aria-hidden />
          <h3 className="font-display text-lg font-bold">Per-lead add-on</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          No subscription required — ideal for pilots or overflow after your monthly included lead
          cap.
        </p>
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="font-display text-4xl font-bold tabular-nums">
            {formatUsd(LEAD_GENERATION_PER_LEAD.singleLead)}
          </span>
          <span className="text-muted-foreground">/ qualified lead</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Volume pricing from {formatUsd(LEAD_GENERATION_PER_LEAD.volumeFloor)}/lead effective on
          Gold and Platinum ({AGENT_TIERS.gold.leadAllocation.includedLeads} leads/mo included).
        </p>
        {showActions ? (
          <AddToCartButton
            payload={{ kind: "lead-generation-per-lead", quantity: 1 }}
            className="w-full sm:w-auto"
          />
        ) : null}
      </Card>

      <Card className="glass p-6 space-y-4">
        <h4 className="text-sm font-semibold">Lead delivery included with every tier</h4>
        <ul className="grid gap-3 sm:grid-cols-2">
          {LEAD_GENERATION_FEATURES.map((feature) => (
            <li key={feature} className="flex items-start gap-3 text-sm">
              <Check className="h-4 w-4 shrink-0 text-primary mt-0.5" aria-hidden />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </Card>

      <details className="glass rounded-lg border border-border/60 p-4">
        <summary className="cursor-pointer text-sm font-semibold">Add-on reference (all tiers)</summary>
        <ul className="mt-3 text-xs text-muted-foreground grid sm:grid-cols-2 gap-2">
          {AGENT_ADD_ONS.map((addOn) => (
            <li key={addOn.id}>
              {addOn.name} — {formatAgentUsd(addOn.monthlyPrice)}/mo
              {addOn.includedFromTier
                ? ` (included in ${AGENT_TIERS[addOn.includedFromTier].name}+)`
                : null}
            </li>
          ))}
        </ul>
      </details>
    </div>
  );
}
