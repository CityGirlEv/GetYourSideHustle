import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { useApp } from "@/lib/app-store";
import { userHasAdminRole } from "@/lib/user-roles";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { AdminContentPublishingLinks } from "@/components/AdminContentPublishingLinks";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ScrollText,
  Settings2,
  Search,
  Mail,
  Layers,
  GitBranch,
  CalendarDays,
  DollarSign,
  ListChecks,
  Send,
  Loader2,
  ClipboardCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { GUIDELINES } from "@/lib/medicare-math";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { TaskSheetContent } from "@/components/TaskSheet";
import { CatalogExplorer } from "@/components/CatalogExplorer";
import { ImplementationTab, SprintsTab } from "@/routes/testing";
import {
  BUDGET_LINES,
  computeBudgetTotals,
  totalsByCategory,
  fmtUSD,
  type BudgetCategory,
} from "@/lib/budget";
export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Console — Part B Optimizer Benchmark Tool" },
      {
        name: "description",
        content: "Admin tools for managing scenarios, users, agents, and operations.",
      },
      { property: "og:title", content: "Admin Console — Part B Optimizer Benchmark Tool" },
      { property: "og:description", content: "Internal admin tools for The Part B Optimizer Benchmark Tool." },
      { property: "og:url", content: "https://themedicareoptimizer.lovable.app/admin" },
      { name: "robots", content: "noindex,nofollow" },
    ],
    links: [{ rel: "canonical", href: "https://themedicareoptimizer.lovable.app/admin" }],
  }),
  validateSearch: (search: Record<string, unknown>): { tab?: string } => ({
    tab: typeof search.tab === "string" ? (search.tab as string) : undefined,
  }),
  component: AdminPortal,
});

function BudgetTab() {
  const totals = computeBudgetTotals();
  const byCat = totalsByCategory();
  const categories: BudgetCategory[] = [
    "Build · One-time",
    "Infra · Recurring",
    "Data & APIs · Recurring",
    "Compliance & Legal",
    "Ops & Support",
  ];
  return (
    <Card className="glass p-4 space-y-4">
      <div>
        <h3 className="font-display font-bold">Product Budget</h3>
        <p className="text-xs text-muted-foreground">
          Every shipped or planned function tied to a dollar amount. Source:{" "}
          <span className="font-mono">src/lib/budget.ts</span>.
        </p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-md border bg-secondary/40 p-3">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Build (one-time)
          </div>
          <div className="font-display font-bold text-xl">{fmtUSD(totals.oneTime)}</div>
        </div>
        <div className="rounded-md border bg-secondary/40 p-3">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Recurring / month
          </div>
          <div className="font-display font-bold text-xl">{fmtUSD(totals.monthly)}</div>
        </div>
        <div className="rounded-md border bg-secondary/40 p-3">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Annual run-rate
          </div>
          <div className="font-display font-bold text-xl">{fmtUSD(totals.annual)}</div>
        </div>
        <div className="rounded-md border bg-primary/10 p-3">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">
            Year 1 total
          </div>
          <div className="font-display font-bold text-xl">{fmtUSD(totals.year1)}</div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-3 py-2">Category</th>
              <th className="px-3 py-2 text-right">One-time</th>
              <th className="px-3 py-2 text-right">Monthly</th>
              <th className="px-3 py-2 text-right">Annual</th>
              <th className="px-3 py-2 text-right">Year 1</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((c) => {
              const t = byCat.get(c) ?? { oneTime: 0, monthly: 0, annual: 0, year1: 0 };
              return (
                <tr key={c} className="border-t">
                  <td className="px-3 py-2 font-medium">{c}</td>
                  <td className="px-3 py-2 text-right">{fmtUSD(t.oneTime)}</td>
                  <td className="px-3 py-2 text-right">{fmtUSD(t.monthly)}</td>
                  <td className="px-3 py-2 text-right">{fmtUSD(t.annual)}</td>
                  <td className="px-3 py-2 text-right font-semibold">{fmtUSD(t.year1)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {categories.map((c) => {
        const rows = BUDGET_LINES.filter((l) => l.category === c);
        if (!rows.length) return null;
        return (
          <div key={c} className="space-y-2">
            <h4 className="font-semibold text-sm mt-2">{c}</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2 w-20">ID</th>
                    <th className="px-3 py-2">Function</th>
                    <th className="px-3 py-2">Basis</th>
                    <th className="px-3 py-2 text-right">Amount</th>
                    <th className="px-3 py-2">Unit</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((l) => (
                    <tr key={l.id} className="border-t align-top">
                      <td className="px-3 py-2 font-mono text-xs">{l.id}</td>
                      <td className="px-3 py-2">{l.function}</td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">
                        {l.basis}
                        {l.links?.length ? ` · ${l.links.join(", ")}` : ""}
                      </td>
                      <td className="px-3 py-2 text-right font-semibold">{fmtUSD(l.amount)}</td>
                      <td className="px-3 py-2 text-xs">{l.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      })}

      <p className="text-[11px] text-muted-foreground">
        Engineering blended at $150/hr unless noted. Infra at vendor list price. Annual = (Monthly ×
        12) + Annual-only lines. Year 1 = One-time + Annual.
      </p>
    </Card>
  );
}

function AdminPortal() {
  const { user, authLoading, auditLogs, addCredits, credits, year } = useApp();
  const router = useRouter();
  const search = Route.useSearch();
  const initialTab =
    search.tab === "staff" || search.tab === "users" || search.tab === "scenarios"
      ? "audit"
      : search.tab || "audit";
  const [q, setQ] = useState("");

  const [testTemplate, setTestTemplate] = useState("welcome");
  const [testRecipient, setTestRecipient] = useState("");
  const [testData, setTestData] = useState("{}");
  const [sendingTest, setSendingTest] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) router.navigate({ to: "/auth" });
  }, [user, authLoading, router]);

  useEffect(() => {
    if (search.tab === "staff" || search.tab === "users") {
      router.navigate({ to: "/staff", replace: true });
    }
  }, [search.tab, router]);

  useEffect(() => {
    if (search.tab === "scenarios") {
      router.navigate({ to: "/admin/pbo-scenarios", replace: true });
    }
  }, [search.tab, router]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (window.location.hash !== "#lead-certificates") return;
    router.navigate({ to: "/admin/lead-certificates", hash: "lead-certificates", replace: true });
  }, [router]);

  const sendTestEmail = async () => {
    if (!testRecipient) {
      toast.error("Recipient email is required");
      return;
    }
    let parsedData: Record<string, any> = {};
    try {
      parsedData = JSON.parse(testData || "{}");
    } catch {
      toast.error("Invalid JSON in template data");
      return;
    }
    setSendingTest(true);
    try {
      const session = await supabase.auth.getSession();
      const accessToken = session.data.session?.access_token;
      if (!accessToken) {
        toast.error("Not authenticated");
        return;
      }
      const res = await fetch("/api/email/transactional/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          templateName: testTemplate,
          recipientEmail: testRecipient,
          templateData: parsedData,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        toast.error(json.error || "Failed to send test email");
      } else {
        toast.success("Test email queued successfully");
      }
    } catch (e: unknown) {
      toast.error((e as Error)?.message || "Failed to send test email");
    } finally {
      setSendingTest(false);
    }
  };

  if (!user) return null;

  const filtered = useMemo(
    () =>
      auditLogs.filter((l) =>
        [l.action, l.user_email, l.ip_address].join(" ").toLowerCase().includes(q.toLowerCase()),
      ),
    [auditLogs, q],
  );

  const g = GUIDELINES[year];

  return (
    <AppShell title="Admin" subtitle="Immutable audit trail · global Medicare config">
      {userHasAdminRole(user) ? <AdminContentPublishingLinks /> : null}
      {userHasAdminRole(user) && (
        <div className="grid gap-4 md:grid-cols-2 mb-4">
          <Card className="glass p-3 flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-primary" />
              <div>
                <div className="text-sm font-semibold">Email templates</div>
                <div className="text-xs text-muted-foreground">
                  Edit subjects &amp; HTML for every transactional and auth email.
                </div>
              </div>
            </div>
            <Button asChild>
              <Link to="/admin/email-templates">
                <Mail className="h-4 w-4 mr-1.5" />
                Manage templates
              </Link>
            </Button>
          </Card>
          <Card className="glass p-3 flex items-center justify-between gap-3 border-emerald-500/20 bg-emerald-500/5">
            <div className="flex items-center gap-2">
              <ClipboardCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <div>
                <div className="text-sm font-semibold">CMS &amp; Facebook approval</div>
                <div className="text-xs text-muted-foreground">
                  CMS requirements reference plus prep checklist for Meta ads and Medicare
                  compliance before launch.
                </div>
              </div>
            </div>
            <Button asChild variant="outline">
              <Link to="/admin/submission-checklist">
                <ClipboardCheck className="h-4 w-4 mr-1.5" />
                Compliance checklist
              </Link>
            </Button>
          </Card>
        </div>
      )}
      <Tabs defaultValue={initialTab} className="space-y-6">
        <TabsList className="glass">
          <TabsTrigger value="audit">
            <ScrollText className="h-4 w-4 mr-1.5" />
            Audit logs
          </TabsTrigger>
          <TabsTrigger value="catalog">
            <Layers className="h-4 w-4 mr-1.5" />
            Plan catalog
          </TabsTrigger>
          <TabsTrigger value="rules">
            <Settings2 className="h-4 w-4 mr-1.5" />
            Rule adjuster
          </TabsTrigger>
          {user?.role === "admin" && (
            <>
              <TabsTrigger value="tasks">
                <ListChecks className="h-4 w-4 mr-1.5" />
                Task Sheet
              </TabsTrigger>
              <TabsTrigger value="impl">
                <GitBranch className="h-4 w-4 mr-1.5" />
                Implementation Plan
              </TabsTrigger>
              <TabsTrigger value="rollout">
                <CalendarDays className="h-4 w-4 mr-1.5" />
                Rollout Schedule
              </TabsTrigger>
              <TabsTrigger value="budget">
                <DollarSign className="h-4 w-4 mr-1.5" />
                Budget
              </TabsTrigger>
              <TabsTrigger value="email">
                <Send className="h-4 w-4 mr-1.5" />
                Email test
              </TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="audit" className="space-y-3">
          <div className="relative max-w-md">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by action, user, or IP"
              className="pl-9"
            />
          </div>
          <Card className="glass overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">User</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">IP</th>
                  <th className="px-4 py-3">Details</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((l) => (
                  <tr key={l.id} className="border-t border-border">
                    <td className="px-4 py-2 text-muted-foreground tabular-nums">
                      {new Date(l.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-2">{l.user_email}</td>
                    <td className="px-4 py-2 capitalize">
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        {l.user_role}
                      </span>
                    </td>
                    <td className="px-4 py-2 font-mono text-xs">{l.action}</td>
                    <td className="px-4 py-2 font-mono text-xs text-muted-foreground">
                      {l.ip_address}
                    </td>
                    <td className="px-4 py-2 font-mono text-xs text-muted-foreground">
                      {l.details ? JSON.stringify(l.details) : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </TabsContent>

        <TabsContent value="catalog">
          <CatalogExplorer />
        </TabsContent>

        <TabsContent value="rules">
          <Card className="glass p-5">
            <h3 className="font-display font-bold mb-3">Active {year} configuration</h3>
            <div className="grid md:grid-cols-2 gap-3 text-sm">
              {Object.entries(g).map(([k, v]) => (
                <div
                  key={k}
                  className="flex justify-between border border-border rounded-lg px-3 py-2 gap-2 min-w-0"
                >
                  <span className="text-muted-foreground truncate min-w-1">{k}</span>
                  <span className="font-semibold tabular-nums shrink-0">
                    {typeof v === "number" ? `$${v.toLocaleString()}` : v}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              These values drive the side-by-side comparison engine across every client dossier.
              Toggle the year using the chip in the header to switch the entire app's calculations.
            </p>
          </Card>
        </TabsContent>

        {user?.role === "admin" && (
          <>
            <TabsContent value="impl" className="space-y-3">
              <Card className="glass p-4">
                <h3 className="font-display font-bold mb-1">Implementation Plan</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Phased delivery roadmap. Source of truth:{" "}
                  <span className="font-mono">src/lib/test-plan.ts</span>.
                </p>
                <ImplementationTab />
              </Card>
            </TabsContent>

            <TabsContent value="rollout" className="space-y-3">
              <Card className="glass p-4">
                <h3 className="font-display font-bold mb-1">Rollout Sprint Schedule</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Sprint-by-sprint rollout with goals and item-level status.
                </p>
                <SprintsTab />
              </Card>
            </TabsContent>

            <TabsContent value="budget" className="space-y-3">
              <BudgetTab />
            </TabsContent>

            <TabsContent value="tasks">
              <TaskSheetContent />
            </TabsContent>

            <TabsContent value="email" className="space-y-3">
              <Card className="glass p-4">
                <h3 className="font-display font-bold mb-1">Send test email</h3>
                <p className="text-xs text-muted-foreground mb-4">
                  Send a test transactional email to verify deliverability.
                </p>
                <div className="space-y-3 max-w-md">
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Template</label>
                    <Select value={testTemplate} onValueChange={setTestTemplate}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="welcome">Welcome</SelectItem>
                        <SelectItem value="contact-request">Contact request received</SelectItem>
                        <SelectItem value="agent-assignment">Agent assignment</SelectItem>
                        <SelectItem value="scenario-assignment-admin">
                          Scenario assignment (admin)
                        </SelectItem>
                        <SelectItem value="scenario-claimed">Scenario claimed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Recipient email</label>
                    <Input
                      type="email"
                      value={testRecipient}
                      onChange={(e) => setTestRecipient(e.target.value)}
                      placeholder="you@example.com"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Template data (JSON)</label>
                    <Textarea
                      value={testData}
                      onChange={(e) => setTestData(e.target.value)}
                      rows={4}
                      placeholder='{"recipientName":"Test User"}'
                    />
                  </div>
                  <Button onClick={sendTestEmail} disabled={sendingTest || !testRecipient}>
                    {sendingTest && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                    Send test email
                  </Button>
                </div>
              </Card>
            </TabsContent>
          </>
        )}
      </Tabs>
    </AppShell>
  );
}
