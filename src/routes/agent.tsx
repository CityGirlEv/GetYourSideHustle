import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/app-store";
import { supabase } from "@/integrations/supabase/client";
import { Briefcase, FileText } from "lucide-react";
import { NdaStatusCard } from "@/components/NdaStatusCard";

interface AssignedScenario {
  id: string;
  scenario_code: string;
  birth_year: number;
  zip3: string;
  gender: string | null;
  tobacco: boolean;
  income_band: string | null;
  agent_notes: string | null;
  created_at: string;
  wants_contact: boolean;
}

export const Route = createFileRoute("/agent")({
  component: AgentPortal,
});

function AgentPortal() {
  const { user, authLoading } = useApp();
  const router = useRouter();
  const [rows, setRows] = useState<AssignedScenario[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.navigate({ to: "/auth" }); return; }
    if (user.role !== "agent" && user.role !== "admin") return;
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("scenarios")
        .select("id, scenario_code, birth_year, zip3, gender, tobacco, income_band, agent_notes, created_at, wants_contact")
        .eq("assigned_agent_id", user.id)
        .order("created_at", { ascending: false });
      if (cancelled) return;
      if (error) console.error(error);
      setRows((data ?? []) as AssignedScenario[]);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [user, router]);

  if (!user) return null;
  if (user.role !== "agent" && user.role !== "admin") {
    return (
      <AppShell title="Agent portal">
        <Card className="glass p-6">This area is for users with the agent role.</Card>
      </AppShell>
    );
  }

  return (
    <AppShell title="My assignments" subtitle="Scenarios assigned to you by an administrator">
      <div className="mb-4"><NdaStatusCard /></div>
      <Card className="glass p-4">
        <div className="flex items-center gap-2 mb-3">
          <Briefcase className="h-4 w-4" />
          <h3 className="font-display font-bold">Assigned scenarios</h3>
          <span className="text-xs text-muted-foreground">{rows.length} total</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="px-3 py-2">Scenario ID</th>
                <th className="px-3 py-2">Created</th>
                <th className="px-3 py-2">ZIP3</th>
                <th className="px-3 py-2">Birth yr</th>
                <th className="px-3 py-2">Notes</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((s) => (
                <tr key={s.id} className="border-t border-border">
                  <td className="px-3 py-2 font-mono text-xs">{s.scenario_code}</td>
                  <td className="px-3 py-2 text-muted-foreground tabular-nums whitespace-nowrap">{new Date(s.created_at).toLocaleString()}</td>
                  <td className="px-3 py-2">{s.zip3}xx</td>
                  <td className="px-3 py-2 tabular-nums">{s.birth_year}</td>
                  <td className="px-3 py-2 text-xs text-muted-foreground truncate max-w-xs">{s.agent_notes ? s.agent_notes.slice(0, 80) : <span className="italic">none</span>}</td>
                  <td className="px-3 py-2">
                    <Link to="/agent/scenario/$code" params={{ code: s.scenario_code }}>
                      <Button size="sm" variant="outline"><FileText className="h-3 w-3 mr-1" />Open</Button>
                    </Link>
                  </td>
                </tr>
              ))}
              {!rows.length && !loading && (
                <tr><td colSpan={6} className="px-3 py-6 text-center text-muted-foreground">No scenarios assigned to you yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </AppShell>
  );
}