import { useEffect, useState } from "react";
import { Link, useRouter } from "@tanstack/react-router";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PurchaseCartPanel } from "@/components/PurchaseCartPanel";
import { ActiveProspectCertificationBlurb } from "@/components/ActiveProspectCertificationBlurb";
import { AgentPricingTiers } from "@/components/AgentPricingTiers";
import { useApp } from "@/lib/app-store";
import { userHasAdminRole } from "@/lib/user-roles";
import { parseFeaturesAgentTierTab } from "@/lib/features-pricing-tabs";
import { AGENT_SUBSCRIPTION_LABEL } from "@/lib/agent-pricing-tiers";
import type { AgentTierId } from "@/lib/agent-pricing-tiers";
import { Info } from "lucide-react";

type FeaturesPricingTabsProps = {
  checkoutStatus?: string;
  agentTierTab?: string;
};

export function FeaturesPricingTabs({ checkoutStatus, agentTierTab }: FeaturesPricingTabsProps) {
  const router = useRouter();
  const { user } = useApp();
  const [checkoutNoticeShown, setCheckoutNoticeShown] = useState(false);
  const activeAgentTier = parseFeaturesAgentTierTab(agentTierTab);

  useEffect(() => {
    if (checkoutStatus !== "canceled" || checkoutNoticeShown) return;
    setCheckoutNoticeShown(true);
  }, [checkoutStatus, checkoutNoticeShown]);

  const canCheckoutStripe = Boolean(user && userHasAdminRole(user));
  const stripeCheckoutDisabledReason =
    "Stripe checkout is available to approved admin accounts.";

  const handleAgentTierChange = (tierId: AgentTierId) => {
    void router.navigate({
      to: "/features",
      search: (prev) => ({
        ...prev,
        tab: "agents",
        agentTab: tierId,
      }),
      hash: "agent-pricing",
      replace: true,
    });
  };

  return (
    <>
      <section className="space-y-4" aria-labelledby="agents-subscription-section">
        <div id="agents-subscription-section" className="scroll-mt-24 space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0 space-y-2">
              <h2 className="font-display text-xl font-bold">{AGENT_SUBSCRIPTION_LABEL}</h2>
              <p className="text-sm text-muted-foreground max-w-2xl">
                Bronze through Platinum — select a tier tab to compare platform tools, lead
                allocation, and à la carte add-ons. Every tier includes bundled leads and a{" "}
                <strong className="text-foreground">2-month minimum</strong> subscription. Add tiers
                or per-lead items to your cart, then checkout when ready.
              </p>
            </div>
            <div className="flex gap-2 shrink-0">
              {user ? (
                <Link to="/agent">
                  <Button variant="outline" size="sm">
                    Agent dashboard
                  </Button>
                </Link>
              ) : (
                <Link to="/auth" search={{ tab: "sign-in" }}>
                  <Button variant="outline" size="sm">
                    Sign in
                  </Button>
                </Link>
              )}
            </div>
          </div>

          <Card className="glass p-4 border-primary/15 bg-primary/5">
            <div className="flex gap-3">
              <Info className="h-5 w-5 shrink-0 text-primary mt-0.5" aria-hidden />
              <div className="space-y-2 text-sm text-muted-foreground">
                <p className="font-semibold text-foreground">Before you purchase leads</p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>
                    Agents must be <strong className="text-foreground">registered</strong> before
                    purchasing leads.
                  </li>
                  <li>
                    Once registered, each lead&apos;s <strong className="text-foreground">ZIP code
                    is matched</strong> to a licensed agent covering that area.
                  </li>
                  <li>
                    The consumer signs a <strong className="text-foreground">1:1 consent form</strong>{" "}
                    for that matched agent before contact.
                  </li>
                </ul>
                <p className="text-xs leading-snug">
                  Automated lead routing in the platform is coming soon — today, registration and
                  ZIP-based matching set expectations for how leads will be delivered.
                </p>
              </div>
            </div>
          </Card>

          <ActiveProspectCertificationBlurb />
        </div>

        <PurchaseCartPanel
          canCheckoutStripe={canCheckoutStripe}
          stripeCheckoutDisabledReason={stripeCheckoutDisabledReason}
        />

        <AgentPricingTiers
          activeTier={activeAgentTier}
          onTierChange={handleAgentTierChange}
        />
      </section>
    </>
  );
}
