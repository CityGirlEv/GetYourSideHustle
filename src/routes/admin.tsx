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
  Inbox,
  Phone,
  Mail,
  Layers,
  GitBranch,
  CalendarDays,
  DollarSign,
  ListChecks,
  Send,
  MessageSquare,
  Loader2,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScenarioConversationDialog } from "@/components/ScenarioConversationDialog";
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
import { useServerFn } from "@tanstack/react-start";
import { listAgents, assignAgent } from "@/lib/admin.functions";
import { compareStaffByFullName } from "@/lib/staff-name-sort";
import { CatalogExplorer } from "@/components/CatalogExplorer";
import { ImplementationTab, SprintsTab } from "@/routes/testing";
import {
  BUDGET_LINES,
  computeBudgetTotals,
  totalsByCategory,
  fmtUSD,
  type BudgetCategory,
} from "@/lib/budget";
import {
  LeadCertificateAuditTable,
  type LeadCertificateAuditRow,
} from "@/components/LeadCertificateAuditTable";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Console — Part B Optimizer" },
      {
        name: "description",
        content: "Admin tools for managing scenarios, users, agents, and operations.",
      },
      { property: "og:title", content: "Admin Console — Part B Optimizer" },
      { property: "og:description", content: "Internal admin tools for The Part B Optimizer." },
      { property: "og:url", content: "https://themedicareoptimizer.lovable.app/admin" },
      { name: "robots", content: "noindex,nofollow" },
    ],
    links: [{ rel: "canonical", href: "https://themedicareoptimizer.lovable.app/admin" }],
  }),
  validateSearch: (search: Record<string, unknown>) => ({
    tab: typeof search.tab === "string" ? (search.tab as string) : undefined,
  }),
  component: AdminPortal,
});

interface AdminScenarioRow {
  id: string;
  scenario_code: string;
  birth_year: number;
  zip3: string;
  gender: string | null;
  tobacco: boolean;
  income_band: string | null;
  cost_preference: string;
  medications: unknown;
  conditions: unknown;
  claimed_by: string | null;
  claimed_at: string | null;
  created_at: string;
  expires_at: string;
  wants_contact?: boolean;
  assigned_agent_id?: string | null;
  agent_notes?: string | null;
}

interface AdminContactRow {
  id: string;
  full_name: string | null;
  email: string;
  phone: string;
  scenario_code: string | null;
  scenario_snapshot: Record<string, unknown> | null;
  marketing_opt_in: boolean;
  agency_name: string | null;
  lead_certificate_id: string | null;
  created_at: string;
}

interface AdminLeadCertificateRow extends LeadCertificateAuditRow {}

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

interface AgentOption {
  id: string;
  full_name: string;
  email: string;
}

function AdminPortal() {
  const { user, authLoading, auditLogs, addCredits, credits, year } = useApp();
  const router = useRouter();
  const search = Route.useSearch();
  const initialTab =
    search.tab === "staff" || search.tab === "users" ? "scenarios" : search.tab || "scenarios";
  const [q, setQ] = useState("");
  const [scenarios, setScenarios] = useState<AdminScenarioRow[]>([]);
  const [contacts, setContacts] = useState<AdminContactRow[]>([]);
  const [leadCertificates, setLeadCertificates] = useState<AdminLeadCertificateRow[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [selectedScenarioForNotes, setSelectedScenarioForNotes] = useState<AdminScenarioRow | null>(
    null,
  );

  const [agents, setAgents] = useState<AgentOption[]>([]);

  const fetchAgents = useServerFn(listAgents);
  const doAssignAgent = useServerFn(assignAgent);

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
    if (!userHasAdminRole(user)) return;
    let cancelled = false;
    setLoadingData(true);
    (async () => {
      const [sRes, cRes, certRes] = await Promise.all([
        supabase.from("scenarios").select("*").order("created_at", { ascending: false }).limit(500),
        supabase
          .from("expert_contact_requests")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(500),
        supabase
          .from("lead_certificates")
          .select("*")
          .order("submitted_at", { ascending: false })
          .limit(500),
      ]);
      if (cancelled) return;
      if (sRes.error) console.error("scenarios load", sRes.error);
      if (cRes.error) console.error("contacts load", cRes.error);
      if (certRes.error) console.error("lead certificates load", certRes.error);
      setScenarios((sRes.data ?? []) as AdminScenarioRow[]);
      setContacts((cRes.data ?? []) as AdminContactRow[]);
      setLeadCertificates((certRes.data ?? []) as AdminLeadCertificateRow[]);
      setLoadingData(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (!userHasAdminRole(user)) return;
    let cancelled = false;
    (async () => {
      try {
        const agentData = await fetchAgents();
        if (!cancelled) setAgents(agentData as AgentOption[]);
      } catch (e) {
        console.error("load agents", e);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, fetchAgents]);

  const refreshScenarioAndCertificateData = async () => {
    const [sRes, certRes] = await Promise.all([
      supabase.from("scenarios").select("*").order("created_at", { ascending: false }).limit(500),
      supabase
        .from("lead_certificates")
        .select("*")
        .order("submitted_at", { ascending: false })
        .limit(500),
    ]);
    if (sRes.data) setScenarios(sRes.data as AdminScenarioRow[]);
    if (certRes.data) setLeadCertificates(certRes.data as AdminLeadCertificateRow[]);
  };

  const handleAssignAgent = async (scenarioId: string, agentId: string) => {
    try {
      await doAssignAgent({
        data: { scenario_id: scenarioId, agent_id: agentId === "__none" ? null : agentId },
      });
      if (agentId === "__none") {
        toast.success("Agent assignment cleared");
      } else {
        toast.success("Agent assigned — notification emails queued");
      }
      await refreshScenarioAndCertificateData();
    } catch (e: unknown) {
      toast.error((e as Error)?.message ?? "Failed to assign agent");
    }
  };

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

  // Map contact requests by scenario_code for quick lookup
  const contactsByCode = useMemo(() => {
    const m = new Map<string, AdminContactRow[]>();
    contacts.forEach((c) => {
      if (!c.scenario_code) return;
      const arr = m.get(c.scenario_code) ?? [];
      arr.push(c);
      m.set(c.scenario_code, arr);
    });
    return m;
  }, [contacts]);

  const orphanedContacts = contacts.filter((c) => !c.scenario_code);

  const certificatesByRequestId = useMemo(() => {
    const m = new Map<string, AdminLeadCertificateRow>();
    leadCertificates.forEach((c) => {
      if (c.expert_contact_request_id) m.set(c.expert_contact_request_id, c);
    });
    return m;
  }, [leadCertificates]);

  const assignmentSummary = useMemo(() => {
    const agentMap = new Map(agents.map((a) => [a.id, a]));
    const groups = new Map<string, { agent: AgentOption; scenarios: AdminScenarioRow[] }>();
    for (const s of scenarios) {
      if (!s.assigned_agent_id) continue;
      const agent = agentMap.get(s.assigned_agent_id);
      if (!agent) continue;
      const existing = groups.get(s.assigned_agent_id);
      if (existing) existing.scenarios.push(s);
      else groups.set(s.assigned_agent_id, { agent, scenarios: [s] });
    }
    return [...groups.values()].sort((a, b) => compareStaffByFullName(a.agent, b.agent));
  }, [scenarios, agents]);

  const g = GUIDELINES[year];

  return (
    <AppShell title="Admin" subtitle="Immutable audit trail · global Medicare config">
      {userHasAdminRole(user) ? <AdminContentPublishingLinks /> : null}
      {userHasAdminRole(user) && (
        <Card className="glass mb-4 p-3 flex items-center justify-between gap-3">
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
      )}
      <Tabs defaultValue={initialTab} className="space-y-6">
        <TabsList className="glass">
          <TabsTrigger value="scenarios">
            <Inbox className="h-4 w-4 mr-1.5" />
            Scenarios &amp; contacts
          </TabsTrigger>
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

        <TabsContent value="scenarios" className="space-y-6">
          <Card className="glass p-4 space-y-3 border-primary/20">
            <div className="flex items-start gap-2">
              <UserCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h3 className="font-display font-bold">Agent scenario assignments</h3>
                <p className="text-xs text-muted-foreground">
                  Assign any scenario to a licensed agent below. The agent and all admin inboxes
                  receive email when you assign.
                </p>
              </div>
            </div>
            {assignmentSummary.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No scenarios are assigned to agents yet.
              </p>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {assignmentSummary.map(({ agent, scenarios: assigned }) => (
                  <div
                    key={agent.id}
                    className="rounded-md border border-border bg-secondary/30 p-3 space-y-2"
                  >
                    <div className="text-sm font-semibold">{agent.full_name || agent.email}</div>
                    <div className="text-[11px] text-muted-foreground">{agent.email}</div>
                    <ul className="space-y-1">
                      {assigned.map((s) => (
                        <li key={s.id} className="text-xs font-mono flex items-center gap-2">
                          <Link
                            to="/scenario/$code"
                            params={{ code: s.scenario_code }}
                            className="text-primary hover:underline"
                          >
                            {s.scenario_code}
                          </Link>
                          {(s.wants_contact ||
                            (contactsByCode.get(s.scenario_code)?.length ?? 0) > 0) && (
                            <span className="text-[10px] text-emerald font-sans normal-case">
                              opt-in
                            </span>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="glass p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold">All scenarios</h3>
                <p className="text-xs text-muted-foreground">
                  {scenarios.length} entered · most recent 500 shown
                </p>
              </div>
              {loadingData && <span className="text-xs text-muted-foreground">Loading…</span>}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2">Created</th>
                    <th className="px-3 py-2">Scenario ID</th>
                    <th className="px-3 py-2">ZIP3</th>
                    <th className="px-3 py-2">Birth yr</th>
                    <th className="px-3 py-2">Gender</th>
                    <th className="px-3 py-2">Tobacco</th>
                    <th className="px-3 py-2">Income</th>
                    <th className="px-3 py-2">Priority</th>
                    <th className="px-3 py-2">Meds</th>
                    <th className="px-3 py-2">Conditions</th>
                    <th className="px-3 py-2">Claimed</th>
                    <th className="px-3 py-2">Opt-in contact</th>
                    <th className="px-3 py-2">Assigned agent</th>
                    <th className="px-3 py-2">Agent notes</th>
                  </tr>
                </thead>
                <tbody>
                  {scenarios.map((s) => {
                    const reqs = contactsByCode.get(s.scenario_code) ?? [];
                    const medCount = Array.isArray(s.medications) ? s.medications.length : 0;
                    const condCount = Array.isArray(s.conditions) ? s.conditions.length : 0;
                    return (
                      <tr key={s.id} className="border-t border-border align-top">
                        <td className="px-3 py-2 text-muted-foreground tabular-nums whitespace-nowrap">
                          {new Date(s.created_at).toLocaleString()}
                        </td>
                        <td className="px-3 py-2 font-mono text-xs">
                          <Link
                            to="/scenario/$code"
                            params={{ code: s.scenario_code }}
                            className="text-primary hover:underline"
                          >
                            {s.scenario_code}
                          </Link>
                        </td>
                        <td className="px-3 py-2">{s.zip3}xx</td>
                        <td className="px-3 py-2 tabular-nums">{s.birth_year}</td>
                        <td className="px-3 py-2 capitalize">
                          {(s.gender ?? "—").replace(/_/g, " ")}
                        </td>
                        <td className="px-3 py-2">{s.tobacco ? "Yes" : "No"}</td>
                        <td className="px-3 py-2 text-xs">{s.income_band ?? "—"}</td>
                        <td className="px-3 py-2 text-xs">
                          {s.cost_preference === "predictability"
                            ? "Predictability"
                            : "Min monthly"}
                        </td>
                        <td className="px-3 py-2 tabular-nums">{medCount}</td>
                        <td className="px-3 py-2 tabular-nums">{condCount}</td>
                        <td className="px-3 py-2 text-xs text-muted-foreground">
                          {s.claimed_at ? new Date(s.claimed_at).toLocaleDateString() : "—"}
                        </td>
                        <td className="px-3 py-2 text-xs">
                          {reqs.length === 0 ? (
                            <span className="text-muted-foreground">—</span>
                          ) : (
                            <div className="space-y-1">
                              {reqs.map((r) => {
                                const cert = certificatesByRequestId.get(r.id);
                                return (
                                <div
                                  key={r.id}
                                  className="rounded-md bg-emerald/5 border border-emerald/30 px-2 py-1"
                                >
                                  {r.full_name && (
                                    <div className="font-medium text-[11px]">{r.full_name}</div>
                                  )}
                                  <div className="flex items-center gap-1">
                                    <Mail className="h-3 w-3" />
                                    <a href={`mailto:${r.email}`} className="underline">
                                      {r.email}
                                    </a>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Phone className="h-3 w-3" />
                                    <a href={`tel:${r.phone}`} className="underline">
                                      {r.phone}
                                    </a>
                                  </div>
                                  {cert && (
                                    <div className="text-[10px] text-muted-foreground mt-1 space-y-0.5">
                                      <div>Cert: {cert.id.slice(0, 8)}…</div>
                                      {cert.assigned_agent_name && (
                                        <div>Agent: {cert.assigned_agent_name}</div>
                                      )}
                                      <div>
                                        Privacy ✓ · Contact ✓
                                        {cert.marketing_opt_in ? " · Marketing ✓" : ""}
                                      </div>
                                    </div>
                                  )}
                                  <div className="text-[10px] text-muted-foreground">
                                    {new Date(r.created_at).toLocaleString()}
                                  </div>
                                </div>
                              );
                              })}
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-2 text-xs">
                          <Select
                            value={s.assigned_agent_id ?? "__none"}
                            onValueChange={(v) => handleAssignAgent(s.id, v)}
                          >
                            <SelectTrigger className="h-8 text-xs min-w-[160px]">
                              <SelectValue placeholder="Unassigned" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="__none">— Unassigned —</SelectItem>
                              {agents.map((a) => (
                                <SelectItem key={a.id} value={a.id}>
                                  {a.full_name || a.email}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-3 py-2 text-xs max-w-xs">
                          <div className="flex flex-col gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 px-2 text-xs justify-start w-fit cursor-pointer"
                              onClick={() => setSelectedScenarioForNotes(s)}
                            >
                              <MessageSquare className="h-3.5 w-3.5 mr-1 text-primary" />
                              Manage notes
                            </Button>
                            {s.agent_notes && (
                              <span className="text-muted-foreground line-clamp-2 whitespace-pre-wrap text-[11px] pl-2 border-l border-border">
                                {s.agent_notes}
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {!scenarios.length && !loadingData && (
                    <tr>
                      <td colSpan={14} className="px-3 py-6 text-center text-muted-foreground">
                        No scenarios yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {orphanedContacts.length > 0 && (
            <Card className="glass p-4 space-y-3">
              <div>
                <h3 className="font-display font-bold">Unlinked contact requests</h3>
                <p className="text-xs text-muted-foreground">
                  Submitted without a scenario reference.
                </p>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2">Submitted</th>
                    <th className="px-3 py-2">Name</th>
                    <th className="px-3 py-2">Email</th>
                    <th className="px-3 py-2">Phone</th>
                  </tr>
                </thead>
                <tbody>
                  {orphanedContacts.map((c) => (
                    <tr key={c.id} className="border-t border-border">
                      <td className="px-3 py-2 text-muted-foreground tabular-nums">
                        {new Date(c.created_at).toLocaleString()}
                      </td>
                      <td className="px-3 py-2">{c.full_name ?? "—"}</td>
                      <td className="px-3 py-2">
                        <a href={`mailto:${c.email}`} className="underline">
                          {c.email}
                        </a>
                      </td>
                      <td className="px-3 py-2">
                        <a href={`tel:${c.phone}`} className="underline">
                          {c.phone}
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}

          <LeadCertificateAuditTable certificates={leadCertificates} />
        </TabsContent>

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

      {selectedScenarioForNotes && (
        <ScenarioConversationDialog
          open={!!selectedScenarioForNotes}
          onOpenChange={(open) => !open && setSelectedScenarioForNotes(null)}
          scenarioId={selectedScenarioForNotes.id}
          scenarioCode={selectedScenarioForNotes.scenario_code}
          currentUserId={user?.id ?? null}
          canAddNotes={user?.role === "admin"}
        />
      )}
    </AppShell>
  );
}
