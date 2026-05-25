import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useApp } from "@/lib/app-store";
import { supabase } from "@/integrations/supabase/client";
import { TEST_CASES, type TestStatus } from "@/lib/test-plan";
import { ClipboardCheck, FlaskConical, ListChecks, Mail, FileText, LayoutDashboard, FileSignature, Download } from "lucide-react";
import { TestPlanTab } from "@/routes/testing";
import { NdaStatusCard } from "@/components/NdaStatusCard";

export const Route = createFileRoute("/qa")({
  component: QADashboard,
});

interface ScenarioRow {
  id: string;
  scenario_code: string;
  birth_year: number;
  zip3: string;
  created_at: string;
  wants_contact: boolean;
  claimed_by: string | null;
  assigned_agent_id: string | null;
}

interface ContactRow {
  id: string;
  email: string;
  phone: string;
  scenario_code: string | null;
  created_at: string;
}

interface NdaRow {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  signed_at: string;
  pdf_path: string;
  agreement_version: string;
}

function readStatus(id: string): TestStatus {
  if (typeof window === "undefined") return "not_run";
  return (localStorage.getItem(`test-status:${id}`) as TestStatus) || "not_run";
}

function QADashboard() {
  const { user } = useApp();
  const router = useRouter();
  const [scenarios, setScenarios] = useState<ScenarioRow[]>([]);
  const [contacts, setContacts] = useState<ContactRow[]>([]);
  const [ndas, setNdas] = useState<NdaRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { router.navigate({ to: "/auth" }); return; }
    if (user.role !== "qa" && user.role !== "admin") return;
    let cancelled = false;
    (async () => {
      const [s, c, n] = await Promise.all([
        supabase
          .from("scenarios")
          .select("id, scenario_code, birth_year, zip3, created_at, wants_contact, claimed_by, assigned_agent_id")
          .order("created_at", { ascending: false })
          .limit(50),
        supabase
          .from("expert_contact_requests")
          .select("id, email, phone, scenario_code, created_at")
          .order("created_at", { ascending: false })
          .limit(20),
        supabase
          .from("nda_signatures")
          .select("id, user_id, full_name, email, signed_at, pdf_path, agreement_version")
          .order("signed_at", { ascending: false }),
      ]);
      if (cancelled) return;
      if (s.error) console.error(s.error);
      if (c.error) console.error(c.error);
      if (n.error) console.error(n.error);
      setScenarios((s.data ?? []) as ScenarioRow[]);
      setContacts((c.data ?? []) as ContactRow[]);
      setNdas((n.data ?? []) as NdaRow[]);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [user, router]);

  const testStats = useMemo(() => {
    const counts = { pass: 0, fail: 0, blocked: 0, not_run: 0 };
    for (const t of TEST_CASES) counts[readStatus(t.id)]++;
    return counts;
  }, [loading]);

  const byArea = useMemo(() => {
    const map = new Map<string, { total: number; pass: number; fail: number }>();
    for (const t of TEST_CASES) {
      const a = map.get(t.area) ?? { total: 0, pass: 0, fail: 0 };
      a.total++;
      const st = readStatus(t.id);
      if (st === "pass") a.pass++;
      if (st === "fail") a.fail++;
      map.set(t.area, a);
    }
    return Array.from(map.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [loading]);

  if (!user) return null;
  if (user.role !== "qa" && user.role !== "admin") {
    return (
      <AppShell title="QA dashboard">
        <Card className="glass p-6">
          This area is for users with the QA role. Ask an administrator to grant you the
          <span className="font-mono px-1">qa</span> role from the Users portal.
        </Card>
      </AppShell>
    );
  }

  const total = TEST_CASES.length;
  const coverage = total ? Math.round((testStats.pass / total) * 100) : 0;

  return (
    <AppShell title="QA dashboard" subtitle="Quality assurance: test coverage, scenarios, and contact requests">
      <div className="mb-4"><NdaStatusCard /></div>
      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList className="glass">
          <TabsTrigger value="dashboard"><LayoutDashboard className="h-4 w-4 mr-1.5" />QA Dashboard</TabsTrigger>
          <TabsTrigger value="tests"><ListChecks className="h-4 w-4 mr-1.5" />Test Cases</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="glass p-4">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground"><ClipboardCheck className="h-3 w-3" />Test coverage</div>
          <div className="font-display text-3xl mt-1 tabular-nums">{coverage}%</div>
          <div className="text-xs text-muted-foreground">{testStats.pass} of {total} passing</div>
        </Card>
        <Card className="glass p-4">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground"><FlaskConical className="h-3 w-3" />Failures</div>
          <div className="font-display text-3xl mt-1 tabular-nums text-destructive">{testStats.fail}</div>
          <div className="text-xs text-muted-foreground">{testStats.blocked} blocked · {testStats.not_run} not run</div>
        </Card>
        <Card className="glass p-4">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground"><FileText className="h-3 w-3" />Scenarios (recent 50)</div>
          <div className="font-display text-3xl mt-1 tabular-nums">{scenarios.length}</div>
          <div className="text-xs text-muted-foreground">{scenarios.filter(s => s.wants_contact).length} want contact</div>
        </Card>
        <Card className="glass p-4">
          <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground"><Mail className="h-3 w-3" />Contact requests</div>
          <div className="font-display text-3xl mt-1 tabular-nums">{contacts.length}</div>
          <div className="text-xs text-muted-foreground">Most recent 20</div>
        </Card>
      </div>

      <Card className="glass p-4">
        <div className="flex items-center gap-2 mb-3">
          <FileSignature className="h-4 w-4" />
          <h3 className="font-display font-bold">Signed NDAs</h3>
          <span className="text-xs text-muted-foreground">{ndas.length} on file</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-3 py-2">Signed</th>
                <th className="px-3 py-2">Name</th>
                <th className="px-3 py-2">Email</th>
                <th className="px-3 py-2">Version</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {ndas.map((n) => (
                <NdaTableRow key={n.id} row={n} />
              ))}
              {!ndas.length && !loading && (
                <tr><td colSpan={5} className="px-3 py-6 text-center text-muted-foreground">No NDAs signed yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Card className="glass p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ListChecks className="h-4 w-4" />
            <h3 className="font-display font-bold">Coverage by area</h3>
          </div>
          <Link to="/testing"><Button size="sm" variant="outline">Open full test portal</Button></Link>
        </div>
        <div className="grid gap-2 md:grid-cols-2">
          {byArea.map(([area, s]) => {
            const pct = s.total ? Math.round((s.pass / s.total) * 100) : 0;
            return (
              <div key={area} className="flex items-center gap-3 text-sm">
                <div className="w-40 truncate">{area}</div>
                <div className="flex-1 h-2 bg-secondary/60 rounded">
                  <div className="h-2 bg-primary rounded" style={{ width: `${pct}%` }} />
                </div>
                <div className="tabular-nums text-xs text-muted-foreground w-24 text-right">
                  {s.pass}/{s.total} {s.fail > 0 && <span className="text-destructive">· {s.fail} fail</span>}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="glass p-4">
          <h3 className="font-display font-bold mb-3">Recent scenarios</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">Code</th>
                  <th className="px-3 py-2">Created</th>
                  <th className="px-3 py-2">ZIP3</th>
                  <th className="px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {scenarios.map((s) => (
                  <tr key={s.id} className="border-t border-border">
                    <td className="px-3 py-2 font-mono text-xs">{s.scenario_code}</td>
                    <td className="px-3 py-2 text-xs text-muted-foreground whitespace-nowrap">{new Date(s.created_at).toLocaleString()}</td>
                    <td className="px-3 py-2">{s.zip3}xx</td>
                    <td className="px-3 py-2 text-xs">
                      {s.assigned_agent_id ? "assigned" : s.claimed_by ? "claimed" : "open"}
                      {s.wants_contact && <span className="ml-1 text-primary">· contact</span>}
                    </td>
                  </tr>
                ))}
                {!scenarios.length && !loading && (
                  <tr><td colSpan={4} className="px-3 py-6 text-center text-muted-foreground">No scenarios yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="glass p-4">
          <h3 className="font-display font-bold mb-3">Expert contact requests</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                <tr>
                  <th className="px-3 py-2">When</th>
                  <th className="px-3 py-2">Email</th>
                  <th className="px-3 py-2">Phone</th>
                  <th className="px-3 py-2">Scenario</th>
                </tr>
              </thead>
              <tbody>
                {contacts.map((c) => (
                  <tr key={c.id} className="border-t border-border">
                    <td className="px-3 py-2 text-xs text-muted-foreground whitespace-nowrap">{new Date(c.created_at).toLocaleString()}</td>
                    <td className="px-3 py-2 text-xs">{c.email}</td>
                    <td className="px-3 py-2 text-xs">{c.phone}</td>
                    <td className="px-3 py-2 font-mono text-xs">{c.scenario_code ?? "—"}</td>
                  </tr>
                ))}
                {!contacts.length && !loading && (
                  <tr><td colSpan={4} className="px-3 py-6 text-center text-muted-foreground">No contact requests.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
        </TabsContent>

        <TabsContent value="tests">
          <TestPlanTab />
        </TabsContent>
      </Tabs>
    </AppShell>
  );
}