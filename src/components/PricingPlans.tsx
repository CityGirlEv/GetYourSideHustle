import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  formatUsd,
  LEAD_PAY_AS_YOU_GO,
  LEAD_PRICING_FEATURES,
  LEAD_SUBSCRIPTION_PRICING,
} from "@/lib/lead-pricing";
import {
  Check,
  MapPin,
  Sparkles,
  Database,
  Mail,
  Waypoints,
  Users,
  Star,
} from "lucide-react";
import type { StripePlanKey } from "@/lib/stripe-products";

const FEATURE_ICONS = [MapPin, Sparkles, Database, Mail, Waypoints, Users] as const;

function StarRating({ count }: { count: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${count} out of 5 stars`}>
      {Array.from({ length: count }, (_, i) => (
        <Star key={i} className="h-4 w-4 fill-amber text-amber" />
      ))}
    </span>
  );
}

type PricingPlansProps = {
  onSelectPlan?: (planKey: StripePlanKey) => void;
  selectedPlanKey?: StripePlanKey | null;
  configuredPlans?: Record<string, boolean>;
  showActions?: boolean;
};

export function PricingPlans({
  onSelectPlan,
  selectedPlanKey,
  configuredPlans = {},
  showActions = true,
}: PricingPlansProps) {
  const sub = LEAD_SUBSCRIPTION_PRICING;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        {(
          [
            {
              key: "subscription_intro" as StripePlanKey,
              badge: "Best value",
              title: "Introductory plan",
              fee: sub.introductory.monthlyFee,
              perLead: sub.introductory.effectivePerLead,
              note: `${sub.introductory.discountPercent}% off regular pricing`,
              featured: true,
            },
            {
              key: "subscription_regular" as StripePlanKey,
              badge: "Standard",
              title: "Regular plan",
              fee: sub.regular.monthlyFee,
              perLead: sub.regular.effectivePerLead,
              note: "Full platform access",
              featured: false,
            },
          ] as const
        ).map((plan) => {
          const configured = configuredPlans[plan.key] !== false;
          const selected = selectedPlanKey === plan.key;
          return (
            <Card
              key={plan.key}
              className={`glass p-6 space-y-4 ${plan.featured ? "border-primary/30 ring-1 ring-primary/20" : ""} ${selected ? "ring-2 ring-primary" : ""}`}
            >
              <div className="flex flex-wrap items-center gap-2">
                <Badge className={plan.featured ? "bg-primary text-primary-foreground" : ""}>
                  {plan.badge}
                </Badge>
                <StarRating count={sub.rating} />
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold">{sub.label}</h2>
                <p className="text-sm text-muted-foreground">{plan.title}</p>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-4xl font-bold tabular-nums">
                  {formatUsd(plan.fee)}
                </span>
                <span className="text-muted-foreground">
                  / month ({sub.minimumTermMonths} month minimum)
                </span>
              </div>
              <p className="text-sm">
                {formatUsd(plan.perLead)} per lead · up to {sub.includedLeadsPerMonth} leads/month
              </p>
              <p className="text-xs text-muted-foreground">{plan.note}</p>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>Minimum term: {sub.minimumTermMonths} months</li>
                <li>Additional leads: {formatUsd(sub.additionalLeadPrice)} each</li>
              </ul>
              {showActions && onSelectPlan && (
                <Button
                  className="w-full grad-indigo"
                  disabled={!configured}
                  onClick={() => onSelectPlan(plan.key)}
                >
                  {configured ? "Subscribe" : "Coming soon"}
                </Button>
              )}
            </Card>
          );
        })}
      </div>

      <Card className="glass p-6 space-y-4">
        <h3 className="font-display text-lg font-bold">Pay as you go</h3>
        <p className="text-sm text-muted-foreground">
          One-time lead bundles — no monthly platform fee.
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          {LEAD_PAY_AS_YOU_GO.map((tier) => {
            const planKey = `payg_${tier.leads}` as StripePlanKey;
            const configured = configuredPlans[planKey] !== false;
            const selected = selectedPlanKey === planKey;
            return (
              <div
                key={tier.leads}
                className={`rounded-lg border p-4 text-center space-y-2 ${selected ? "border-primary ring-2 ring-primary/30" : "border-border bg-secondary/10"}`}
              >
                <div className="text-sm text-muted-foreground">
                  {tier.leads} lead{tier.leads === 1 ? "" : "s"}
                </div>
                <div className="font-display text-3xl font-bold tabular-nums">
                  {formatUsd(tier.price)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatUsd(tier.price / tier.leads)} / lead
                </div>
                {showActions && onSelectPlan && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    disabled={!configured}
                    onClick={() => onSelectPlan(planKey)}
                  >
                    Buy now
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      <Card className="glass p-6 space-y-4">
        <h3 className="font-display text-lg font-bold">What&apos;s included</h3>
        <ul className="grid gap-3 sm:grid-cols-2">
          {LEAD_PRICING_FEATURES.map((feature, i) => {
            const Icon = FEATURE_ICONS[i] ?? Check;
            return (
              <li key={feature} className="flex items-start gap-3 text-sm">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
                  <Icon className="h-4 w-4 text-primary" />
                </span>
                <span>{feature}</span>
              </li>
            );
          })}
        </ul>
      </Card>
    </div>
  );
}
