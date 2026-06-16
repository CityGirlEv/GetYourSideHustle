import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useApp } from "@/lib/app-store";
import { userHasAdminRole } from "@/lib/user-roles";
import {
  formatUsd,
  LEAD_PAY_AS_YOU_GO,
  LEAD_PRICING_FEATURES,
  LEAD_SUBSCRIPTION_PRICING,
} from "@/lib/lead-pricing";
import {
  ArrowLeft,
  Check,
  MapPin,
  Sparkles,
  Database,
  Mail,
  Waypoints,
  Users,
  Star,
  Shield,
} from "lucide-react";

export const Route = createFileRoute("/admin_/pricing")({
  head: () => ({
    meta: [
      { title: "Lead Pricing — Admin" },
      {
        name: "description",
        content: "Internal lead pricing for Subscription + Leads and pay-as-you-go options.",
      },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: AdminPricingPage,
});

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

function AdminPricingPage() {
  const { user, authLoading } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.navigate({ to: "/auth" });
      return;
    }
    if (!userHasAdminRole(user)) {
      router.navigate({ to: "/" });
    }
  }, [user, authLoading, router]);

  if (authLoading || !user || !userHasAdminRole(user)) return null;

  const sub = LEAD_SUBSCRIPTION_PRICING;

  return (
    <AppShell
      title="Lead Pricing"
      subtitle="Option 2 — Subscription + Leads (admin reference only)"
    >
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Shield className="h-4 w-4" />
            Admin-only — not shown to agents or the public
          </div>
          <Link to="/admin">
            <Button size="sm" variant="outline">
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              Admin dashboard
            </Button>
          </Link>
        </div>

        <Card className="glass p-6 space-y-4 border-primary/20">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="bg-primary text-primary-foreground">Recommended</Badge>
                <StarRating count={sub.rating} />
              </div>
              <h2 className="font-display text-2xl font-bold">{sub.label}</h2>
              <p className="text-sm text-muted-foreground max-w-2xl">
                Monthly subscription with up to {sub.includedLeadsPerMonth} exclusive Medicare
                leads, platform tools, and priority routing. Introductory pricing available for new
                partners.
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-border bg-secondary/20 p-5 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Introductory (40% off)
              </p>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-4xl font-bold tabular-nums">
                  {formatUsd(sub.introductory.monthlyFee)}
                </span>
                <span className="text-muted-foreground">/ month</span>
              </div>
              <p className="text-sm text-emerald font-medium">
                {formatUsd(sub.introductory.effectivePerLead)} per lead (up to{" "}
                {sub.includedLeadsPerMonth} leads)
              </p>
              <p className="text-xs text-muted-foreground">
                {sub.introductory.discountPercent}% off regular platform fee
              </p>
            </div>

            <div className="rounded-lg border border-border p-5 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Regular pricing
              </p>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-4xl font-bold tabular-nums">
                  {formatUsd(sub.regular.monthlyFee)}
                </span>
                <span className="text-muted-foreground">/ month</span>
              </div>
              <p className="text-sm text-muted-foreground">
                {formatUsd(sub.regular.effectivePerLead)} per lead (up to{" "}
                {sub.includedLeadsPerMonth} leads)
              </p>
            </div>
          </div>

          <ul className="text-sm space-y-2 border-t border-border pt-4">
            <li>
              <b>Included:</b> Up to {sub.includedLeadsPerMonth} leads per month
            </li>
            <li>
              <b>Additional leads:</b> {formatUsd(sub.additionalLeadPrice)} each
            </li>
            <li>
              <b>Minimum term:</b> {sub.minimumTermMonths} months
            </li>
          </ul>
        </Card>

        <Card className="glass p-6 space-y-4">
          <h3 className="font-display text-lg font-bold">Non-subscription (pay as you go)</h3>
          <p className="text-sm text-muted-foreground">
            One-time lead bundles without a monthly platform fee. Same lead quality and features
            where noted below; no recurring commitment.
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            {LEAD_PAY_AS_YOU_GO.map((tier) => (
              <div
                key={tier.leads}
                className="rounded-lg border border-border bg-secondary/10 p-4 text-center space-y-1"
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
              </div>
            ))}
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

        <Card className="glass p-5 space-y-2">
          <h3 className="font-display text-base font-bold">Quick comparison</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">Plan</th>
                  <th className="px-3 py-2 text-right">Price</th>
                  <th className="px-3 py-2 text-right">Leads</th>
                  <th className="px-3 py-2 text-right">Effective / lead</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-border">
                  <td className="px-3 py-2">Subscription (intro)</td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {formatUsd(sub.introductory.monthlyFee)}/mo
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">Up to {sub.includedLeadsPerMonth}</td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {formatUsd(sub.introductory.effectivePerLead)}
                  </td>
                </tr>
                <tr className="border-t border-border">
                  <td className="px-3 py-2">Subscription (regular)</td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {formatUsd(sub.regular.monthlyFee)}/mo
                  </td>
                  <td className="px-3 py-2 text-right tabular-nums">Up to {sub.includedLeadsPerMonth}</td>
                  <td className="px-3 py-2 text-right tabular-nums">
                    {formatUsd(sub.regular.effectivePerLead)}
                  </td>
                </tr>
                {LEAD_PAY_AS_YOU_GO.map((tier) => (
                  <tr key={tier.leads} className="border-t border-border">
                    <td className="px-3 py-2">Pay-as-you-go</td>
                    <td className="px-3 py-2 text-right tabular-nums">{formatUsd(tier.price)}</td>
                    <td className="px-3 py-2 text-right tabular-nums">{tier.leads}</td>
                    <td className="px-3 py-2 text-right tabular-nums">
                      {formatUsd(tier.price / tier.leads)}
                    </td>
                  </tr>
                ))}
                <tr className="border-t border-border bg-secondary/20">
                  <td className="px-3 py-2" colSpan={4}>
                    Additional subscription leads beyond {sub.includedLeadsPerMonth}:{" "}
                    <b>{formatUsd(sub.additionalLeadPrice)}</b> each · Minimum term:{" "}
                    <b>{sub.minimumTermMonths} months</b>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
