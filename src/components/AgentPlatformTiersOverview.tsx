import { Check, Sparkles, Users } from "lucide-react";
import { AddToCartButton } from "@/components/AddToCartButton";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import {
  AGENT_ADD_ONS,
  AGENT_SUBSCRIPTION_LABEL,
  AGENT_TIER_ORDER,
  AGENT_TIERS,
  formatAgentMinimumTerm,
  formatAgentUsd,
} from "@/lib/agent-pricing-tiers";
import { formatUsd } from "@/lib/lead-generation-pricing";
import { cn } from "@/lib/utils";

export function AgentPlatformTiersOverview() {
  return (
    <div className="space-y-6" data-testid="agent-platform-tiers-overview">
      <Card className="glass p-5 space-y-2 border-primary/15">
        <p className="text-sm text-muted-foreground leading-relaxed">
          Licensed Medicare agents subscribe to <strong className="text-foreground">{AGENT_SUBSCRIPTION_LABEL}</strong>{" "}
          — Bronze, Silver, Gold, and Platinum tiers that bundle platform tools with included qualified
          leads. All tiers require a 2-month minimum commitment. Stack à la carte add-ons on any base
          tier.
        </p>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {AGENT_TIER_ORDER.map((tierId) => {
          const tier = AGENT_TIERS[tierId];
          return (
            <Card
              key={tierId}
              className={cn(
                "glass p-5 space-y-3 border-border/60",
                tierId === "gold" && "border-primary/25 bg-primary/5",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-display text-xl font-bold">{tier.name}</h3>
                {tierId === "gold" ? (
                  <Badge className="bg-primary text-primary-foreground">Popular</Badge>
                ) : null}
              </div>
              <p className="text-xs text-muted-foreground min-h-[2.5rem]">{tier.tagline}</p>
              <div className="flex items-baseline gap-1">
                <span className="font-display text-3xl font-bold tabular-nums">
                  {formatAgentUsd(tier.monthlyPrice)}
                </span>
                <span className="text-sm text-muted-foreground">/mo</span>
              </div>
              <p className="text-[11px] text-muted-foreground">{formatAgentMinimumTerm(tierId)}</p>
              <div className="rounded-lg border border-primary/15 bg-primary/5 px-3 py-2 space-y-0.5">
                <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                  <Users className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
                  <span>{tier.leadAllocation.summary}</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug">
                  {tier.leadAllocation.detail}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Overage: {formatUsd(tier.leadAllocation.overagePerLead)}/lead
                </p>
              </div>
              <ul className="text-xs space-y-1.5 text-muted-foreground">
                {tier.features.map((feature) => (
                  <li key={feature.id} className="flex items-start gap-2">
                    <Check className="h-3.5 w-3.5 shrink-0 text-primary mt-0.5" aria-hidden />
                    <span>{feature.label}</span>
                  </li>
                ))}
              </ul>
              <AddToCartButton
                payload={{ kind: "agent-tier", tierId }}
                className="w-full"
              />
            </Card>
          );
        })}
      </div>

      <Card className="glass p-6 space-y-4 border-border/60">
        <div className="flex flex-wrap items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" aria-hidden />
          <h3 className="font-display text-lg font-bold">À la carte add-ons</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Mix and match capabilities on any base tier. Add-ons already bundled in a higher tier are
          omitted at checkout — see pricing for your exact package.
        </p>
        <ul className="text-sm text-muted-foreground grid sm:grid-cols-2 gap-3">
          {AGENT_ADD_ONS.map((addOn) => (
            <li key={addOn.id} className="rounded-lg border border-border/60 bg-background/50 p-3 space-y-2">
              <span className="font-medium text-foreground block">{addOn.name}</span>
              <span className="text-xs block mt-0.5">{addOn.description}</span>
              <span className="text-xs font-semibold text-primary tabular-nums mt-1 block">
                +{formatAgentUsd(addOn.monthlyPrice)}/mo
                {addOn.includedFromTier
                  ? ` · included in ${AGENT_TIERS[addOn.includedFromTier].name}+`
                  : null}
              </span>
              <AddToCartButton
                payload={{ kind: "agent-addon", addOnId: addOn.id }}
                className="w-full"
              />
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
