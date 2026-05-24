import { createFileRoute, useRouter } from "@tanstack/react-router";
import { useApp } from "@/lib/app-store";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollText, Users, Settings2, Search, Plus, Minus, Inbox, Phone, Mail, UserPlus, Loader2, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GUIDELINES } from "@/lib/medicare-math";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useServerFn } from "@tanstack/react-start";
import { createAdvisor, listStaff } from "@/lib/admin.functions";

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

function AdminPortal() {
  const { user, auditLogs, addCredits, credits, year } = useApp();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [scenarios, setScenarios] = useState<AdminScenarioRow[]>([]);
  const [contacts, setContacts] = useState<AdminContactRow[]>([]);
  const [loadingData, setLoadingData] = useState(false);

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

        <TabsContent value="staff">
          <Card className="glass p-5 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <h3 className="font-display font-bold">Jordan Mercer · Advisor</h3>
                <p className="text-xs text-muted-foreground">NPN 9241077 · advisor@demo.health</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-sm">Balance: <span className="font-bold tabular-nums">{credits}</span></div>
                <Button size="sm" variant="outline" onClick={() => { addCredits(5, "Admin top-up +5"); toast.success("Added 5 credits"); }}><Plus className="h-4 w-4"/>5</Button>
                <Button size="sm" variant="outline" onClick={() => { addCredits(-1, "Admin deduction -1"); }}><Minus className="h-4 w-4"/>1</Button>
              </div>
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
