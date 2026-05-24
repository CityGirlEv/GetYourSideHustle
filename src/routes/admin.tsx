import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useApp } from "@/lib/app-store";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollText, Users, Settings2, Search, Plus, Minus, Inbox, Phone, Mail, UserPlus, Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GUIDELINES } from "@/lib/medicare-math";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { createAdvisor, listStaff, setUserRole, listAgents, assignAgent } from "@/lib/admin.functions";

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

export const Route = createFileRoute("/admin")({
  component: AdminPortal,
});

interface StaffMember {
  id: string;
  email: string;
  full_name: string;
  npn_number: string;
  role: string;
  credits: number;
}

const ASSIGNABLE_ROLES = ["viewer", "editor", "qa", "agent", "admin"] as const;
type AssignableRole = (typeof ASSIGNABLE_ROLES)[number];

interface AgentOption { id: string; full_name: string; email: string; }

function AdminPortal() {
  const { user, auditLogs, addCredits, credits, year } = useApp();
  const router = useRouter();
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

  useEffect(() => {
    if (!user) router.navigate({ to: "/auth" });
  }, [user, router]);

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
    if (!newEmail || !newPassword || newPassword.length < 8) {
      toast.error("Email is required and password must be at least 8 characters");
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
    <AppShell title="System administration" subtitle="Immutable audit trail · staff management · global Medicare config">
      <Tabs defaultValue="scenarios" className="space-y-6">
        <TabsList className="glass">
          <TabsTrigger value="scenarios"><Inbox className="h-4 w-4 mr-1.5"/>Scenarios &amp; contacts</TabsTrigger>
          <TabsTrigger value="audit"><ScrollText className="h-4 w-4 mr-1.5"/>Audit logs</TabsTrigger>
          <TabsTrigger value="staff"><Users className="h-4 w-4 mr-1.5"/>Staff &amp; credits</TabsTrigger>
          <TabsTrigger value="rules"><Settings2 className="h-4 w-4 mr-1.5"/>Rule adjuster</TabsTrigger>
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
                        <td className="px-3 py-2 font-mono text-xs">{s.scenario_code}</td>
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
                      </tr>
                    );
                  })}
                  {!scenarios.length && !loadingData && (
                    <tr><td colSpan={12} className="px-3 py-6 text-center text-muted-foreground">No scenarios yet.</td></tr>
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
            <h3 className="font-display font-bold flex items-center gap-2"><UserPlus className="h-5 w-5"/>Create advisor account</h3>
            <div className="grid md:grid-cols-4 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Email</label>
                <Input type="email" placeholder="advisor@example.com" value={newEmail} onChange={(e) => setNewEmail(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Full name</label>
                <Input placeholder="Jane Smith" value={newFullName} onChange={(e) => setNewFullName(e.target.value)} />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Password</label>
                <div className="relative">
                  <Input type={showPw ? "text" : "password"} placeholder="Min 8 characters" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                  <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPw ? <EyeOff className="h-4 w-4"/> : <Eye className="h-4 w-4"/>}
                  </button>
                </div>
              </div>
              <div className="flex items-end">
                <Button onClick={handleCreateUser} disabled={creating || !newEmail || newPassword.length < 8} className="w-full">
                  {creating ? <Loader2 className="h-4 w-4 animate-spin mr-2"/> : <UserPlus className="h-4 w-4 mr-2"/>}
                  Create user
                </Button>
              </div>
            </div>
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
                    <th className="px-3 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {staff.map((s) => (
                    <tr key={s.id} className="border-t border-border">
                      <td className="px-3 py-2 font-medium">{s.full_name || "—"}</td>
                      <td className="px-3 py-2 text-muted-foreground">{s.email}</td>
                      <td className="px-3 py-2"><span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary capitalize">{s.role}</span></td>
                      <td className="px-3 py-2 font-mono text-xs">{s.npn_number || "—"}</td>
                      <td className="px-3 py-2 tabular-nums font-bold">{s.credits}</td>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-1">
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
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!staff.length && !staffLoading && (
                    <tr><td colSpan={6} className="px-3 py-6 text-center text-muted-foreground">No staff users yet.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="rules">
          <Card className="glass p-5">
            <h3 className="font-display font-bold mb-3">Active {year} configuration</h3>
            <div className="grid md:grid-cols-2 gap-3 text-sm">
              {Object.entries(g).map(([k, v]) => (
                <div key={k} className="flex justify-between border border-border rounded-lg px-3 py-2">
                  <span className="text-muted-foreground">{k}</span>
                  <span className="font-semibold tabular-nums">{typeof v === "number" ? `$${v.toLocaleString()}` : v}</span>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-4">
              These values drive the side-by-side comparison engine across every client dossier.
              Toggle the year using the chip in the header to switch the entire app's calculations.
            </p>
          </Card>
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}
