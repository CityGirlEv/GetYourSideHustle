import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { useApp } from "@/lib/app-store";
import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Search, Receipt, Plus, Sparkles, CreditCard, Lock } from "lucide-react";
import { toast } from "sonner";
import { NdaStatusCard } from "@/components/NdaStatusCard";
import { AgentMarketing } from "@/components/AgentMarketing";
import {
  createStripeCustomerPortalSession,
  getBillingStatus,
} from "@/lib/stripe.functions";
import { userHasAdminRole } from "@/lib/user-roles";

export const Route = createFileRoute("/agent")({
  head: () => ({
    meta: [
      { title: "Agent Command Center — Part B Optimizer" },
      {
        name: "description",
        content: "Look up Medicare scenarios by ID and manage your agent caseload. No PII stored.",
      },
      { property: "og:title", content: "Agent Command Center — Part B Optimizer" },
      { property: "og:description", content: "Agent caseload and scenario lookup." },
      { property: "og:url", content: "https://themedicareoptimizer.lovable.app/agent" },
      { name: "robots", content: "noindex,nofollow" },
    ],
    links: [{ rel: "canonical", href: "https://themedicareoptimizer.lovable.app/agent" }],
  }),
  component: AgentPortal,
});

function AgentPortal() {
  const { user, authLoading, scenarios, creditTxns, lookupScenario } = useApp();
  const router = useRouter();
  const fetchBilling = useServerFn(getBillingStatus);
  const openPortal = useServerFn(createStripeCustomerPortalSession);
  const [tab, setTab] = useState("lookup");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [billingLoading, setBillingLoading] = useState(true);
  const [billing, setBilling] = useState<Awaited<ReturnType<typeof fetchBilling>> | null>(null);
  const [portalBusy, setPortalBusy] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) router.navigate({ to: "/auth" });
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user) return;
    setBillingLoading(true);
    fetchBilling()
      .then(setBilling)
      .catch(() => setBilling(null))
      .finally(() => setBillingLoading(false));
  }, [user, fetchBilling]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("checkout") === "success") {
      toast.success("Payment received — your subscription is being activated.");
      params.delete("checkout");
      params.delete("session_id");
      const next = `${window.location.pathname}${params.toString() ? `?${params}` : ""}`;
      window.history.replaceState({}, "", next);
    }
    if (params.get("tab") === "billing") setTab("billing");
  }, []);

  if (!user) return null;

  const isStaffAdmin = userHasAdminRole(user);
  const hasAccess = isStaffAdmin || billing?.agentDashboardAccess;

  const openBillingPortal = async () => {
    setPortalBusy(true);
    try {
      const { url } = await openPortal();
      window.location.href = url;
    } catch (e) {
      toast.error((e as Error).message ?? "Could not open billing portal");
    } finally {
      setPortalBusy(false);
    }
  };

  if (!billingLoading && !hasAccess) {
    return (
      <AppShell title="Agent command center" subtitle="Subscription required">
        <Card className="glass p-8 max-w-xl mx-auto text-center space-y-4">
          <Lock className="h-10 w-10 mx-auto text-muted-foreground" />
          <h2 className="font-display text-xl font-bold">Subscribe to unlock the agent dashboard</h2>
          <p className="text-sm text-muted-foreground">
            An active or trialing subscription is required to access scenario lookup, your caseload,
            and billing tools.
          </p>
          {billing?.subscription?.status && (
            <p className="text-sm">
              Current subscription status:{" "}
              <b className="capitalize">{billing.subscription.status.replace(/_/g, " ")}</b>
            </p>
          )}
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {isStaffAdmin ? (
              <Link to="/pricing">
                <Button className="grad-indigo">View plans & subscribe</Button>
              </Link>
            ) : (
              <p className="text-sm text-muted-foreground w-full">
                Contact your administrator to activate a subscription.
              </p>
            )}
            <Button variant="outline" onClick={() => router.navigate({ to: "/" })}>
              Return home
            </Button>
          </div>
        </Card>
      </AppShell>
    );
  }

  const submitLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;
    setBusy(true);
    try {
      const s = await lookupScenario(code);
      toast.success(`Loaded scenario ${s.scenario_code}`);
      router.navigate({ to: "/agent/scenario/$code", params: { code: s.scenario_code } });
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <AppShell
      title="Agent command center"
      subtitle="Look up scenarios by ID — no personal information stored"
    >
      <div className="mb-4">
        <NdaStatusCard />
      </div>
      <Tabs value={tab} onValueChange={setTab} className="space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <TabsList className="glass">
            <TabsTrigger value="lookup">
              <Search className="h-4 w-4 mr-1.5" />
              Look up scenario
            </TabsTrigger>
            <TabsTrigger value="roster">
              <Users className="h-4 w-4 mr-1.5" />
              My scenarios ({scenarios.length})
            </TabsTrigger>
            <TabsTrigger value="billing">
              <Receipt className="h-4 w-4 mr-1.5" />
              Billing
            </TabsTrigger>
            <TabsTrigger value="marketing">
              <Sparkles className="h-4 w-4 mr-1.5" />
              AI Marketing & Growth
            </TabsTrigger>
          </TabsList>
          <Link to="/scenario/new">
            <Button size="sm" className="grad-indigo">
              <Plus className="h-4 w-4 mr-1.5" />
              Create new scenario
            </Button>
          </Link>
        </div>

        <TabsContent value="lookup">
          <Card className="glass p-8 max-w-2xl mx-auto space-y-5">
            <div className="text-center space-y-1">
              <h2 className="font-display text-xl font-bold">Enter a Scenario ID</h2>
              <p className="text-sm text-muted-foreground">
                The consumer received this ID after building their scenario. The first agent to look
                it up claims it.
              </p>
            </div>
            <form onSubmit={submitLookup} className="space-y-3">
              <Input
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="SCN-2026-XXXX-XXXX"
                className="font-mono text-center text-lg h-12 tracking-wider"
                autoFocus
              />
              <Button type="submit" disabled={busy || !code} className="grad-indigo w-full h-11">
                {busy ? "Looking up…" : "Look up scenario"}
              </Button>
            </form>
            <p className="text-xs text-muted-foreground text-center">
              Rate-limited: 10 failed attempts per minute.
            </p>
          </Card>
        </TabsContent>

        <TabsContent value="roster" className="space-y-4">
          {scenarios.length === 0 ? (
            <Card className="glass p-6 text-center text-sm text-muted-foreground">
              No scenarios claimed or assigned yet. Use <strong>Look up scenario</strong> to
              retrieve one by ID.
            </Card>
          ) : (
            <Card className="glass overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3">Scenario ID</th>
                    <th className="px-4 py-3">Profile</th>
                    <th className="px-4 py-3">Meds</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Claimed/Created</th>
                    <th className="px-4 py-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {scenarios.map((s) => {
                    const isClaimed = s.claimed_by === user.id;
                    const isAssigned = s.assigned_agent_id === user.id;
                    const typeLabel = isClaimed ? "Claimed" : isAssigned ? "Assigned" : "Created";
                    const badgeColor = isClaimed
                      ? "bg-indigo/10 text-indigo border-indigo/20"
                      : isAssigned
                        ? "bg-emerald/10 text-emerald border-emerald/20"
                        : "bg-muted text-muted-foreground border-border";

                    return (
                      <tr
                        key={s.id}
                        className="border-t border-border hover:bg-secondary/30 transition"
                      >
                        <td className="px-4 py-3 font-mono text-xs">
                          <Link
                            to="/agent/scenario/$code"
                            params={{ code: s.scenario_code }}
                            className="hover:underline text-primary"
                          >
                            {s.scenario_code}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          b. {s.birth_year} · ZIP {s.zip3}xx · {s.gender ?? "—"}
                        </td>
                        <td className="px-4 py-3">{s.medications.length}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${badgeColor}`}
                          >
                            {typeLabel}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-muted-foreground">
                          {s.claimed_at
                            ? new Date(s.claimed_at).toLocaleDateString()
                            : new Date(s.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <Link to="/agent/scenario/$code" params={{ code: s.scenario_code }}>
                            <Button size="sm" variant="ghost">
                              View summary →
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="billing" className="space-y-4">
          <Card className="glass p-5 space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="font-display font-bold">Subscription & billing</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage payment methods, invoices, and plan changes in Stripe.
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                disabled={portalBusy || !billing?.hasStripeCustomer}
                onClick={openBillingPortal}
              >
                <CreditCard className="h-4 w-4 mr-1.5" />
                {portalBusy ? "Opening…" : "Manage billing"}
              </Button>
            </div>
            <dl className="grid gap-2 sm:grid-cols-2 text-sm">
              <div>
                <dt className="text-muted-foreground">Subscription status</dt>
                <dd className="font-medium capitalize">
                  {billing?.subscription?.status?.replace(/_/g, " ") ?? "None"}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Plan</dt>
                <dd className="font-medium">{billing?.subscription?.planKey ?? "—"}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Lead credits</dt>
                <dd className="font-medium tabular-nums">
                  {billing?.leadCredits?.balance ?? 0}
                  {billing?.leadCredits?.monthly_allowance
                    ? ` / ${billing.leadCredits.monthly_allowance} monthly`
                    : ""}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Renews / period end</dt>
                <dd className="font-medium">
                  {billing?.subscription?.currentPeriodEnd
                    ? new Date(billing.subscription.currentPeriodEnd).toLocaleDateString()
                    : "—"}
                </dd>
              </div>
            </dl>
            {!billing?.hasStripeCustomer && isStaffAdmin && (
              <Link to="/pricing">
                <Button size="sm" className="grad-indigo">
                  Subscribe to a plan
                </Button>
              </Link>
            )}
          </Card>

          <Card className="glass p-5">
            <h3 className="font-display font-bold mb-3">Scenario credit ledger</h3>
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground border-b border-border">
                <tr>
                  <th className="py-2">When</th>
                  <th className="py-2">Description</th>
                  <th className="py-2 text-right">Δ</th>
                </tr>
              </thead>
              <tbody>
                {creditTxns.map((t) => (
                  <tr key={t.id} className="border-b border-border/60">
                    <td className="py-2 text-muted-foreground">
                      {new Date(t.created_at).toLocaleString()}
                    </td>
                    <td className="py-2">{t.description}</td>
                    <td
                      className={`py-2 text-right tabular-nums font-semibold ${t.amount > 0 ? "text-emerald" : "text-warning"}`}
                    >
                      {t.amount > 0 ? `+${t.amount}` : t.amount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </TabsContent>

        <TabsContent value="marketing">
          <AgentMarketing />
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
