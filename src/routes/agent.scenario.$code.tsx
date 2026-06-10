import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AppShell } from "@/components/AppShell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useApp } from "@/lib/app-store";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ArrowLeft, Save, Mail, Phone, MessageSquare } from "lucide-react";
import { ScenarioConversationDialog } from "@/components/ScenarioConversationDialog";

interface ScenarioRow {
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
  agent_notes: string | null;
  wants_contact: boolean;
  created_at: string;
  assigned_agent_id: string | null;
}

interface ContactRow {
  id: string;
  email: string;
  phone: string;
  created_at: string;
}

export const Route = createFileRoute("/agent/scenario/$code")({
  component: AgentScenario,
});

function AgentScenario() {
  const { code } = Route.useParams();
  const { user, authLoading } = useApp();
  const router = useRouter();
  const [s, setS] = useState<ScenarioRow | null>(null);
  const [contacts, setContacts] = useState<ContactRow[]>([]);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.navigate({ to: "/auth" }); return; }
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from("scenarios")
        .select("*")
        .eq("scenario_code", code)
        .maybeSingle();
      if (cancelled) return;
      if (error) { toast.error(error.message); setLoading(false); return; }
      if (!data) { toast.error("Scenario not found or you do not have access"); setLoading(false); return; }
      const row = data as ScenarioRow;
      setS(row);
      setNotes(row.agent_notes ?? "");
      const { data: cRows } = await supabase
        .from("expert_contact_requests")
        .select("id, email, phone, created_at")
        .eq("scenario_code", code)
        .order("created_at", { ascending: false });
      if (!cancelled) setContacts((cRows ?? []) as ContactRow[]);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [code, user, router]);

  const save = async () => {
    if (!s) return;
    setSaving(true);
    const { error } = await supabase.rpc("agent_update_notes", { p_scenario: s.id, p_notes: notes });
    setSaving(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Notes saved");
    setS({ ...s, agent_notes: notes });
  };

  if (!user) return null;

  return (
    <AppShell title="Scenario detail" subtitle={code}>
      <div className="mb-4">
        <Link to="/agent"><Button variant="ghost" size="sm"><ArrowLeft className="h-4 w-4 mr-1" />Back to assignments</Button></Link>
      </div>
      {loading && <Card className="glass p-6">Loading…</Card>}
      {!loading && !s && (
        <Card className="glass p-6">
          You do not have access to this scenario. An administrator must assign it to you.
        </Card>
      )}
      {s && (
        <div className="space-y-4">
          <Card className="glass p-4 space-y-2">
            <h3 className="font-display font-bold">Profile</h3>
            <div className="grid md:grid-cols-3 gap-3 text-sm">
              <div><span className="text-muted-foreground">Scenario ID:</span> <span className="font-mono">{s.scenario_code}</span></div>
              <div><span className="text-muted-foreground">Birth year:</span> {s.birth_year}</div>
              <div><span className="text-muted-foreground">ZIP3:</span> {s.zip3}xx</div>
              <div><span className="text-muted-foreground">Gender:</span> {s.gender ?? "—"}</div>
              <div><span className="text-muted-foreground">Tobacco:</span> {s.tobacco ? "Yes" : "No"}</div>
              <div><span className="text-muted-foreground">Income:</span> {s.income_band ?? "—"}</div>
              <div><span className="text-muted-foreground">Priority:</span> {s.cost_preference === "predictability" ? "Predictability" : "Min monthly"}</div>
              <div><span className="text-muted-foreground">Medications:</span> {Array.isArray(s.medications) ? s.medications.length : 0}</div>
              <div><span className="text-muted-foreground">Conditions:</span> {Array.isArray(s.conditions) ? s.conditions.length : 0}</div>
            </div>
          </Card>

          {contacts.length > 0 && (
            <Card className="glass p-4 space-y-2">
              <h3 className="font-display font-bold">Contact information</h3>
              <div className="space-y-2">
                {contacts.map((c) => (
                  <div key={c.id} className="rounded-md bg-emerald/5 border border-emerald/30 px-3 py-2 text-sm">
                    <div className="flex items-center gap-2"><Mail className="h-3 w-3" /><a href={`mailto:${c.email}`} className="underline">{c.email}</a></div>
                    <div className="flex items-center gap-2"><Phone className="h-3 w-3" /><a href={`tel:${c.phone}`} className="underline">{c.phone}</a></div>
                    <div className="text-xs text-muted-foreground">Submitted {new Date(c.created_at).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            </Card>
          )}

          <Card className="glass p-4 space-y-3">
            <div className="flex justify-between items-center">
              <h3 className="font-display font-bold">Agent notes</h3>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setNotesDialogOpen(true)}
                className="cursor-pointer"
              >
                <MessageSquare className="h-3.5 w-3.5 mr-1 text-primary" />
                View thread
              </Button>
            </div>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={10}
              maxLength={10000}
              placeholder="Record your notes, plan recommendations, and next steps…"
            />
            <div className="flex justify-end">
              <Button onClick={save} disabled={saving}>
                <Save className="h-4 w-4 mr-1" />{saving ? "Saving…" : "Save notes"}
              </Button>
            </div>
          </Card>
        </div>
      )}
      {s && (
        <ScenarioConversationDialog
          open={notesDialogOpen}
          onOpenChange={setNotesDialogOpen}
          scenarioId={s.id}
          scenarioCode={s.scenario_code}
          currentUserId={user?.id ?? null}
          canAddNotes={user?.role === "admin" || s.assigned_agent_id === user?.id}
        />
      )}
    </AppShell>
  );
}