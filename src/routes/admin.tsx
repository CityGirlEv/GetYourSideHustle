import { createFileRoute, useRouter, Link } from "@tanstack/react-router";
import { useApp } from "@/lib/app-store";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollText, Users, Settings2, Search, Plus, Minus, Inbox, Phone, Mail, UserPlus, Loader2, Eye, EyeOff, Pencil, Trash2, Ban, CheckCircle2, Layers, GitBranch, CalendarDays, DollarSign, ListChecks, Send, Database, ExternalLink, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { GUIDELINES } from "@/lib/medicare-math";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { TaskSheetContent } from "@/components/TaskSheet";
import { useServerFn } from "@tanstack/react-start";
import { createAdvisor, listStaff, setUserRole, listAgents, assignAgent, updateUser, setUserDisabled, deleteUser } from "@/lib/admin.functions";
import { refreshAssigneeOptions } from "@/lib/use-assignee-options";
import { CatalogExplorer } from "@/components/CatalogExplorer";
import { ImplementationTab, SprintsTab } from "@/routes/testing";
import { BUDGET_LINES, computeBudgetTotals, totalsByCategory, fmtUSD, type BudgetCategory } from "@/lib/budget";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin Console — The Medicare Optimizer" },
      { name: "description", content: "Admin tools for managing scenarios, users, agents, and operations." },
      { property: "og:title", content: "Admin Console — The Medicare Optimizer" },
      { property: "og:description", content: "Internal admin tools for The Medicare Optimizer." },
      { property: "og:url", content: "https://themedicareoptimizer.lovable.app/admin" },
      { name: "robots", content: "noindex,nofollow" },
    ],
    links: [
      { rel: "canonical", href: "https://themedicareoptimizer.lovable.app/admin" },
    ],
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
  email: string;
  phone: string;
  scenario_code: string | null;
  scenario_snapshot: Record<string, unknown> | null;
  created_at: string;
}


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
        <p className="text-xs text-muted-foreground">Every shipped or planned function tied to a dollar amount. Source: <span className="font-mono">src/lib/budget.ts</span>.</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-md border bg-secondary/40 p-3">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Build (one-time)</div>
          <div className="font-display font-bold text-xl">{fmtUSD(totals.oneTime)}</div>
        </div>
        <div className="rounded-md border bg-secondary/40 p-3">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Recurring / month</div>
          <div className="font-display font-bold text-xl">{fmtUSD(totals.monthly)}</div>
        </div>
        <div className="rounded-md border bg-secondary/40 p-3">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Annual run-rate</div>
          <div className="font-display font-bold text-xl">{fmtUSD(totals.annual)}</div>
        </div>
        <div className="rounded-md border bg-primary/10 p-3">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground">Year 1 total</div>
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
                      <td className="px-3 py-2 text-xs text-muted-foreground">{l.basis}{l.links?.length ? ` · ${l.links.join(", ")}` : ""}</td>
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
        Engineering blended at $150/hr unless noted. Infra at vendor list price.
        Annual = (Monthly × 12) + Annual-only lines. Year 1 = One-time + Annual.
      </p>
    </Card>
  );
}

interface StaffMember {
  id: string;
  email: string;
  full_name: string;
  npn_number: string;
  role: string;
  credits: number;
  disabled?: boolean;
  last_sign_in_at?: string | null;
}

const ASSIGNABLE_ROLES = ["viewer", "editor", "qa", "agent", "admin"] as const;
type AssignableRole = (typeof ASSIGNABLE_ROLES)[number];

interface AgentOption { id: string; full_name: string; email: string; }

function AdminPortal() {
  const { user, authLoading, auditLogs, addCredits, credits, year } = useApp();
  const router = useRouter();
  const search = Route.useSearch();
  const initialTab = search.tab || "scenarios";
  const [q, setQ] = useState("");
  const [scenarios, setScenarios] = useState<AdminScenarioRow[]>([]);
  const [contacts, setContacts] = useState<AdminContactRow[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [staffLoading, setStaffLoading] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newFullName, setNewFullName] = useState("");
  const [newRole, setNewRole] = useState<AssignableRole>("viewer");
  const [creating, setCreating] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [agents, setAgents] = useState<AgentOption[]>([]);

  const fetchStaff = useServerFn(listStaff);
  const doCreateAdvisor = useServerFn(createAdvisor);
  const doSetUserRole = useServerFn(setUserRole);
  const fetchAgents = useServerFn(listAgents);
  const doAssignAgent = useServerFn(assignAgent);
  const doUpdateUser = useServerFn(updateUser);
  const doSetDisabled = useServerFn(setUserDisabled);
  const doDeleteUser = useServerFn(deleteUser);

  const [editing, setEditing] = useState<StaffMember | null>(null);
  const [editName, setEditName] = useState("");
  const [editNpn, setEditNpn] = useState("");
  const [editPassword, setEditPassword] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<StaffMember | null>(null);

  const [testTemplate, setTestTemplate] = useState("welcome");
  const [testRecipient, setTestRecipient] = useState("");
  const [testData, setTestData] = useState("{}");
  const [sendingTest, setSendingTest] = useState(false);

  const reloadStaff = async () => {
    const [s, a] = await Promise.all([fetchStaff(), fetchAgents()]);
    setStaff(s as StaffMember[]);
    setAgents(a as AgentOption[]);
    // A staff change may have added or removed a QA user — refresh the
    // assignee dropdowns app-wide.
    refreshAssigneeOptions();
  };

  const openEdit = (s: StaffMember) => {
    setEditing(s);
    setEditName(s.full_name);
    setEditNpn(s.npn_number);
    setEditPassword("");
  };

  const saveEdit = async () => {
    if (!editing) return;
    setSavingEdit(true);
    try {
      await doUpdateUser({ data: {
        user_id: editing.id,
        full_name: editName,
        npn_number: editNpn || null,
        ...(editPassword ? { password: editPassword } : {}),
      }});
      toast.success("User updated");
      setEditing(null);
      await reloadStaff();
    } catch (e: unknown) {
      toast.error((e as Error)?.message ?? "Failed to update user");
    } finally {
      setSavingEdit(false);
    }
  };

  const toggleDisabled = async (s: StaffMember) => {
    try {
      await doSetDisabled({ data: { user_id: s.id, disabled: !s.disabled } });
      toast.success(s.disabled ? "User enabled" : "User disabled");
      await reloadStaff();
    } catch (e: unknown) {
      toast.error((e as Error)?.message ?? "Failed");
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await doDeleteUser({ data: { user_id: deleteTarget.id } });
      toast.success(`Deleted ${deleteTarget.email}`);
      setDeleteTarget(null);
      await reloadStaff();
    } catch (e: unknown) {
      toast.error((e as Error)?.message ?? "Failed to delete user");
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!user) router.navigate({ to: "/auth" });
  }, [user, authLoading, router]);

  useEffect(() => {
    if (!user || user.role !== "admin") return;
    let cancelled = false;
    setLoadingData(true);
    (async () => {
      const [sRes, cRes] = await Promise.all([
        supabase.from("scenarios").select("*").order("created_at", { ascending: false }).limit(500),
        supabase.from("expert_contact_requests").select("*").order("created_at", { ascending: false }).limit(500),
      ]);
      if (cancelled) return;
      if (sRes.error) console.error("scenarios load", sRes.error);
      if (cRes.error) console.error("contacts load", cRes.error);
      setScenarios((sRes.data ?? []) as AdminScenarioRow[]);
      setContacts((cRes.data ?? []) as AdminContactRow[]);
      setLoadingData(false);
    })();
    return () => { cancelled = true; };
  }, [user]);

  useEffect(() => {
    if (!user || user.role !== "admin") return;
    let cancelled = false;
    setStaffLoading(true);
    (async () => {
      try {
        const [staffData, agentData] = await Promise.all([fetchStaff(), fetchAgents()]);
        if (!cancelled) {
          setStaff(staffData as StaffMember[]);
          setAgents(agentData as AgentOption[]);
        }
      } catch (e) {
        console.error("load staff", e);
        toast.error("Failed to load staff list");
      } finally {
        if (!cancelled) setStaffLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user, fetchStaff, fetchAgents]);

  const handleCreateUser = async () => {
    if (!newEmail || !newPassword || newPassword.length < 12) {
      toast.error("Email is required and password must be at least 12 characters");
      return;
    }
    setCreating(true);
    try {
      await doCreateAdvisor({ data: { email: newEmail, password: newPassword, full_name: newFullName || undefined, role: newRole } });
      toast.success(`User created with role: ${newRole}`);
      setNewEmail(""); setNewPassword(""); setNewFullName(""); setNewRole("viewer");
      const [s, a] = await Promise.all([fetchStaff(), fetchAgents()]);
      setStaff(s as StaffMember[]);
      setAgents(a as AgentOption[]);
    } catch (e: unknown) {
      toast.error((e as Error)?.message ?? "Failed to create user");
    } finally {
      setCreating(false);
    }
  };

  const handleChangeRole = async (userId: string, role: AssignableRole) => {
    try {
      await doSetUserRole({ data: { user_id: userId, role } });
      toast.success(`Role updated to ${role}`);
      const [s, a] = await Promise.all([fetchStaff(), fetchAgents()]);
      setStaff(s as StaffMember[]);
      setAgents(a as AgentOption[]);
    } catch (e: unknown) {
      toast.error((e as Error)?.message ?? "Failed to update role");
    }
  };

  const handleAssignAgent = async (scenarioId: string, agentId: string) => {
    try {
      await doAssignAgent({ data: { scenario_id: scenarioId, agent_id: agentId === "__none" ? null : agentId } });
      toast.success("Agent assignment updated");
      const sRes = await supabase.from("scenarios").select("*").order("created_at", { ascending: false }).limit(500);
      setScenarios((sRes.data ?? []) as AdminScenarioRow[]);
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
      const res = await fetch("/lovable/email/transactional/send", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
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

  const filtered = useMemo(() => auditLogs.filter((l) =>
    [l.action, l.user_email, l.ip_address].join(" ").toLowerCase().includes(q.toLowerCase())
  ), [auditLogs, q]);

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

  const g = GUIDELINES[year];

  return (
    <AppShell title="Admin" subtitle="Immutable audit trail · staff management · global Medicare config">
      {user?.role === "admin" && (
        <Card className="glass mb-4 p-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-primary" />
            <div>
              <div className="text-sm font-semibold">Email templates</div>
              <div className="text-xs text-muted-foreground">Edit subjects &amp; HTML for every transactional and auth email.</div>
            </div>
          </div>
          <Button asChild>
            <Link to="/admin/email-templates"><Mail className="h-4 w-4 mr-1.5"/>Manage templates</Link>
          </Button>
        </Card>
      )}
      {user?.role === "admin" && (
        <Card className="glass mb-4 p-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Database className="h-4 w-4 text-primary" />
            <div>
              <div className="text-sm font-semibold">Backend (Supabase)</div>
              <div className="text-xs text-muted-foreground">Open the underlying Supabase project to manage API keys, database, and auth.</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText("wrangler secret put SUPABASE_SERVICE_ROLE_KEY");
                toast.success("Command copied to clipboard");
              }}
            >
              <Copy className="h-4 w-4 mr-1.5"/>Copy wrangler cmd
            </Button>
            <Button asChild>
              <a href="https://supabase.com/dashboard/project/vulmxndmfjmoovxwurio/settings/api-keys" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-1.5"/>Open API Keys
              </a>
            </Button>
          </div>
        </Card>
      )}
      <Tabs defaultValue={initialTab} className="space-y-6">
        <TabsList className="glass">
          <TabsTrigger value="scenarios"><Inbox className="h-4 w-4 mr-1.5"/>Scenarios &amp; contacts</TabsTrigger>
          <TabsTrigger value="audit"><ScrollText className="h-4 w-4 mr-1.5"/>Audit logs</TabsTrigger>
          <TabsTrigger value="staff"><Users className="h-4 w-4 mr-1.5"/>Staff &amp; credits</TabsTrigger>
          <TabsTrigger value="catalog"><Layers className="h-4 w-4 mr-1.5"/>Plan catalog</TabsTrigger>
          <TabsTrigger value="rules"><Settings2 className="h-4 w-4 mr-1.5"/>Rule adjuster</TabsTrigger>
          {user?.role === "admin" && (
            <>
              <TabsTrigger value="tasks"><ListChecks className="h-4 w-4 mr-1.5"/>Task Sheet</TabsTrigger>
              <TabsTrigger value="impl"><GitBranch className="h-4 w-4 mr-1.5"/>Implementation Plan</TabsTrigger>
              <TabsTrigger value="rollout"><CalendarDays className="h-4 w-4 mr-1.5"/>Rollout Schedule</TabsTrigger>
              <TabsTrigger value="budget"><DollarSign className="h-4 w-4 mr-1.5"/>Budget</TabsTrigger>
              <TabsTrigger value="email"><Send className="h-4 w-4 mr-1.5"/>Email test</TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="scenarios" className="space-y-6">
          <Card className="glass p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold">All scenarios</h3>
                <p className="text-xs text-muted-foreground">{scenarios.length} entered · most recent 500 shown</p>
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
                        <td className="px-3 py-2 text-muted-foreground tabular-nums whitespace-nowrap">{new Date(s.created_at).toLocaleString()}</td>
                        <td className="px-3 py-2 font-mono text-xs">
                          <Link to="/scenario/$code" params={{ code: s.scenario_code }} className="text-primary hover:underline">
                            {s.scenario_code}
                          </Link>
                        </td>
                        <td className="px-3 py-2">{s.zip3}xx</td>
                        <td className="px-3 py-2 tabular-nums">{s.birth_year}</td>
                        <td className="px-3 py-2 capitalize">{(s.gender ?? "—").replace(/_/g, " ")}</td>
                        <td className="px-3 py-2">{s.tobacco ? "Yes" : "No"}</td>
                        <td className="px-3 py-2 text-xs">{s.income_band ?? "—"}</td>
                        <td className="px-3 py-2 text-xs">{s.cost_preference === "predictability" ? "Predictability" : "Min monthly"}</td>
                        <td className="px-3 py-2 tabular-nums">{medCount}</td>
                        <td className="px-3 py-2 tabular-nums">{condCount}</td>
                        <td className="px-3 py-2 text-xs text-muted-foreground">{s.claimed_at ? new Date(s.claimed_at).toLocaleDateString() : "—"}</td>
                        <td className="px-3 py-2 text-xs">
                          {reqs.length === 0 ? (
                            <span className="text-muted-foreground">—</span>
                          ) : (
                            <div className="space-y-1">
                              {reqs.map((r) => (
                                <div key={r.id} className="rounded-md bg-emerald/5 border border-emerald/30 px-2 py-1">
                                  <div className="flex items-center gap-1"><Mail className="h-3 w-3"/><a href={`mailto:${r.email}`} className="underline">{r.email}</a></div>
                                  <div className="flex items-center gap-1"><Phone className="h-3 w-3"/><a href={`tel:${r.phone}`} className="underline">{r.phone}</a></div>
                                  <div className="text-[10px] text-muted-foreground">{new Date(r.created_at).toLocaleString()}</div>
                                </div>
                              ))}
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-2 text-xs">
                          {(s.wants_contact || reqs.length > 0) ? (
                            <Select
                              value={s.assigned_agent_id ?? "__none"}
                              onValueChange={(v) => handleAssignAgent(s.id, v)}
                            >
                              <SelectTrigger className="h-8 text-xs min-w-[160px]"><SelectValue placeholder="Unassigned" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="__none">— Unassigned —</SelectItem>
                                {agents.map((a) => (
                                  <SelectItem key={a.id} value={a.id}>{a.full_name || a.email}</SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <span className="text-muted-foreground">No opt-in</span>
                          )}
                        </td>
                        <td className="px-3 py-2 text-xs max-w-xs">
                          {s.agent_notes ? (
                            <span className="text-muted-foreground line-clamp-3 whitespace-pre-wrap">{s.agent_notes}</span>
                          ) : (
                            <span className="text-muted-foreground italic">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                  {!scenarios.length && !loadingData && (
                    <tr><td colSpan={14} className="px-3 py-6 text-center text-muted-foreground">No scenarios yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>

          {orphanedContacts.length > 0 && (
            <Card className="glass p-4 space-y-3">
              <div>
                <h3 className="font-display font-bold">Unlinked contact requests</h3>
                <p className="text-xs text-muted-foreground">Submitted without a scenario reference.</p>
              </div>
              <table className="w-full text-sm">
                <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <tr><th className="px-3 py-2">Submitted</th><th className="px-3 py-2">Email</th><th className="px-3 py-2">Phone</th></tr>
                </thead>
                <tbody>
                  {orphanedContacts.map((c) => (
                    <tr key={c.id} className="border-t border-border">
                      <td className="px-3 py-2 text-muted-foreground tabular-nums">{new Date(c.created_at).toLocaleString()}</td>
                      <td className="px-3 py-2"><a href={`mailto:${c.email}`} className="underline">{c.email}</a></td>
                      <td className="px-3 py-2"><a href={`tel:${c.phone}`} className="underline">{c.phone}</a></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="audit" className="space-y-3">
          <div className="relative max-w-md">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"/>
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by action, user, or IP" className="pl-9"/>
          </div>
          <Card className="glass overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr><th className="px-4 py-3">Timestamp</th><th className="px-4 py-3">User</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Action</th><th className="px-4 py-3">IP</th><th className="px-4 py-3">Details</th></tr>
              </thead>
              <tbody>
                {filtered.map((l) => (
                  <tr key={l.id} className="border-t border-border">
                    <td className="px-4 py-2 text-muted-foreground tabular-nums">{new Date(l.timestamp).toLocaleString()}</td>
                    <td className="px-4 py-2">{l.user_email}</td>
                    <td className="px-4 py-2 capitalize"><span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">{l.user_role}</span></td>
                    <td className="px-4 py-2 font-mono text-xs">{l.action}</td>
                    <td className="px-4 py-2 font-mono text-xs text-muted-foreground">{l.ip_address}</td>
                    <td className="px-4 py-2 font-mono text-xs text-muted-foreground">{l.details ? JSON.stringify(l.details) : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </TabsContent>

        <TabsContent value="staff" className="space-y-6">
          <Card className="glass p-5 space-y-4">
            <h3 className="font-display font-bold flex items-center gap-2"><UserPlus className="h-5 w-5"/>Create user account</h3>
            <div className="grid md:grid-cols-5 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Email</label>
                <Input type="email" placeholder="advisor@example.com" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Full name</label>
                <Input placeholder="Jane Smith" value={newFullName} onChange={(e) => setNewFullName(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Role</label>
                <Select value={newRole} onValueChange={(v) => setNewRole(v as AssignableRole)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ASSIGNABLE_ROLES.map((r) => <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Password</label>
                <div className="relative">
                  <Input type={showPw ? "text" : "password"} placeholder="Min 12 characters" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                  <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPw ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                  </button>
                </div>
              </div>
              <div className="flex items-end">
                <Button onClick={handleCreateUser} disabled={creating || !newEmail || newPassword.length < 12} className="w-full">
                  {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2"/> : <UserPlus className="h-4 w-4 mr-2"/>}
                  Create user
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Only admins can create users. Newly-created users default to <span className="font-semibold">viewer</span> if no role is selected.</p>
          </Card>

          <Card className="glass p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-display font-bold">All staff</h3>
                <p className="text-xs text-muted-foreground">{staff.length} users · click a row to adjust credits</p>
              </div>
              {staffLoading && <span className="text-xs text-muted-foreground">Loading…</span>}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-3 py-2">Name</th>
                    <th className="px-3 py-2">Email</th>
                    <th className="px-3 py-2">Role</th>
                    <th className="px-3 py-2">NPN</th>
                    <th className="px-3 py-2">Credits</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Last sign-in</th>
                    <th className="px-3 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {staff.map((s) => (
                    <tr key={s.id} className={`border-t border-border ${s.disabled ? "opacity-60" : ""}`}>
                      <td className="px-3 py-2 font-medium">{s.full_name || "—"}</td>
                      <td className="px-3 py-2 text-muted-foreground">{s.email}</td>
                      <td className="px-3 py-2">
                        <Select value={s.role} onValueChange={(v) => handleChangeRole(s.id, v as AssignableRole)}>
                          <SelectTrigger className="h-8 text-xs min-w-[120px] capitalize"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {ASSIGNABLE_ROLES.map((r) => <SelectItem key={r} value={r} className="capitalize">{r}</SelectItem>)}
                            {s.role === "advisor" && <SelectItem value="advisor" className="capitalize">advisor (legacy)</SelectItem>}
                          </SelectContent>
                        </Select>
                      </td>
                      <td className="px-3 py-2 font-mono text-xs">{s.npn_number || "—"}</td>
                      <td className="px-3 py-2 tabular-nums font-bold">{s.credits}</td>
                      <td className="px-3 py-2 text-xs">
                        {s.disabled
                          ? <span className="px-2 py-0.5 rounded-full bg-destructive/15 text-destructive">Disabled</span>
                          : <span className="px-2 py-0.5 rounded-full bg-emerald/15 text-emerald">Active</span>}
                      </td>
                      <td className="px-3 py-2 text-xs text-muted-foreground tabular-nums whitespace-nowrap">
                        {s.last_sign_in_at ? new Date(s.last_sign_in_at).toLocaleString() : "—"}
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1 flex-wrap">
                          <Button size="sm" variant="outline" onClick={async () => {
                            const { error } = await supabase.rpc("admin_adjust_credits", { p_target: s.id, p_amount: 5, p_description: "Admin top-up +5" });
                            if (error) { toast.error(error.message); return; }
                            toast.success(`Added 5 credits to ${s.email}`);
                            const data = await fetchStaff();
                            setStaff(data as StaffMember[]);
                          }}><Plus className="h-3 w-3"/>5</Button>
                          <Button size="sm" variant="outline" onClick={async () => {
                            const { error } = await supabase.rpc("admin_adjust_credits", { p_target: s.id, p_amount: -1, p_description: "Admin deduction -1" });
                            if (error) { toast.error(error.message); return; }
                            toast.success(`Deducted 1 credit from ${s.email}`);
                            const data = await fetchStaff();
                            setStaff(data as StaffMember[]);
                          }}><Minus className="h-3 w-3"/>1</Button>
                          <Button size="sm" variant="outline" onClick={() => openEdit(s)} title="Edit">
                            <Pencil className="h-3 w-3"/>
                          </Button>
                          <Button size="sm" variant="outline" onClick={() => toggleDisabled(s)} title={s.disabled ? "Enable" : "Disable"}>
                            {s.disabled ? <CheckCircle2 className="h-3 w-3"/> : <Ban className="h-3 w-3"/>}
                          </Button>
                          <Button size="sm" variant="outline" className="text-destructive hover:text-destructive" onClick={() => setDeleteTarget(s)} title="Delete">
                            <Trash2 className="h-3 w-3"/>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!staff.length && !staffLoading && (
                    <tr><td colSpan={8} className="px-3 py-6 text-center text-muted-foreground">No staff users yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
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
                <div key={k} className="flex justify-between border border-border rounded-lg px-3 py-2 gap-2 min-w-0">
                  <span className="text-muted-foreground truncate min-w-1">{k}</span>
                  <span className="font-semibold tabular-nums shrink-0">{typeof v === "number" ? `$${v.toLocaleString()}` : v}</span>
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
                <p className="text-xs text-muted-foreground mb-4">Phased delivery roadmap. Source of truth: <span className="font-mono">src/lib/test-plan.ts</span>.</p>
                <ImplementationTab />
              </Card>
            </TabsContent>

            <TabsContent value="rollout" className="space-y-3">
              <Card className="glass p-4">
                <h3 className="font-display font-bold mb-1">Rollout Sprint Schedule</h3>
                <p className="text-xs text-muted-foreground mb-4">Sprint-by-sprint rollout with goals and item-level status.</p>
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
                <p className="text-xs text-muted-foreground mb-4">Send a test transactional email to verify deliverability.</p>
                <div className="space-y-3 max-w-md">
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Template</label>
                    <Select value={testTemplate} onValueChange={setTestTemplate}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="welcome">Welcome</SelectItem>
                        <SelectItem value="contact-request">Contact request received</SelectItem>
                        <SelectItem value="agent-assignment">Agent assignment</SelectItem>
                        <SelectItem value="scenario-claimed">Scenario claimed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Recipient email</label>
                    <Input type="email" value={testRecipient} onChange={(e) => setTestRecipient(e.target.value)} placeholder="you@example.com" />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Template data (JSON)</label>
                    <Textarea value={testData} onChange={(e) => setTestData(e.target.value)} rows={4} placeholder='{"recipientName":"Test User"}' />
                  </div>
                  <Button onClick={sendTestEmail} disabled={sendingTest || !testRecipient}>
                    {sendingTest && <Loader2 className="h-4 w-4 animate-spin mr-2"/>}
                    Send test email
                  </Button>
                </div>
              </Card>
            </TabsContent>
          </>
        )}
      </Tabs>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit user</DialogTitle>
            <DialogDescription>{editing?.email}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Full name</label>
              <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">NPN number</label>
              <Input value={editNpn} onChange={(e) => setEditNpn(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Reset password (optional, min 8 chars)</label>
              <Input type="password" value={editPassword} onChange={(e) => setEditPassword(e.target.value)} placeholder="Leave blank to keep current" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={saveEdit} disabled={savingEdit || (!!editPassword && editPassword.length < 8)}>
              {savingEdit && <Loader2 className="h-4 w-4 animate-spin mr-2"/>}Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete user?</AlertDialogTitle>
            <AlertDialogDescription>
              This permanently removes <span className="font-semibold">{deleteTarget?.email}</span> and their access. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppShell>
  );
}
