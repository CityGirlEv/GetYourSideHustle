import { Card } from "@/components/ui/card";
import { AddToCartButton } from "@/components/AddToCartButton";
import {
  LEAD_GENERATION_FEATURES,
  LEAD_GENERATION_PER_LEAD,
  formatUsd,
} from "@/lib/lead-generation-pricing";
import { Check, Megaphone, TrendingUp } from "lucide-react";

type LeadGenerationPricingProps = {
  showActions?: boolean;
};

/** Per-lead add-on pricing — subscription tiers bundle platform access + lead volume. */
export function LeadGenerationPricing({ showActions = true }: LeadGenerationPricingProps) {
  return (
    <div className="space-y-6">
      <Card className="glass p-5 space-y-2">
        <div className="flex items-start gap-3">
          <Megaphone className="h-5 w-5 shrink-0 text-primary mt-0.5" />
          <p className="text-sm text-muted-foreground">
            Pay-as-you-go qualified Medicare leads from the Part B Optimizer Benchmark Tool funnel.
            Monthly subscription tiers above include platform access and bundled lead volume.
          </p>
        </div>
      </Card>

      <Card className="glass p-6 space-y-3 border-primary/15">
        <div className="flex flex-wrap items-center gap-2">
          <TrendingUp className="h-5 w-5 text-primary" />
          <h3 className="font-display text-lg font-bold">Per-lead</h3>
        </div>
        <p className="text-sm text-muted-foreground">
          No monthly minimum — ideal for pilots or overflow after your tier cap.
        </p>
        <div className="flex flex-wrap items-baseline gap-2">
          <span className="font-display text-4xl font-bold tabular-nums">
            {formatUsd(LEAD_GENERATION_PER_LEAD.singleLead)}
          </span>
          <span className="text-muted-foreground">/ qualified lead</span>
        </div>
        <p className="text-xs text-muted-foreground">
          Volume pricing from {formatUsd(LEAD_GENERATION_PER_LEAD.volumeFloor)}/lead effective on
          Gold and Platinum tiers.
        </p>
        {showActions ? (
          <AddToCartButton
            payload={{ kind: "lead-generation-per-lead", quantity: 1 }}
            className="w-full sm:w-auto"
          />
        ) : null}
      </Card>

      <Card className="glass p-6 space-y-4">
        <h3 className="font-display text-lg font-bold">What&apos;s included</h3>
        <ul className="grid gap-3 sm:grid-cols-2">
          {LEAD_GENERATION_FEATURES.map((feature) => (
            <li key={feature} className="flex items-start gap-3 text-sm">
              <Check className="h-4 w-4 shrink-0 text-primary mt-0.5" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
