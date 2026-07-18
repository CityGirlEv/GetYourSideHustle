import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Inbox, UserCheck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { AdminAccessGate } from "@/components/AdminAccessGate";
import { AdminScenariosTable } from "@/components/AdminScenariosTable";
import { GlassCollapsibleCard } from "@/components/GlassCollapsibleCard";
import { ScenarioConversationDialog } from "@/components/ScenarioConversationDialog";
import { Button } from "@/components/ui/button";
import { listAgents, assignAgent } from "@/lib/admin.functions";
import type { AdminScenarioRow } from "@/lib/admin-scenario-table";
import { compareStaffByFullName } from "@/lib/staff-name-sort";
import { useApp } from "@/lib/app-store";
import { supabase } from "@/integrations/supabase/client";
import type { LeadCertificateAuditRow } from "@/components/LeadCertificateAuditTable";

export const Route = createFileRoute("/admin_/pbo-scenarios")({
  head: () => ({
    meta: [
      { title: "PBO Benchmark Tool Scenarios — Admin" },
      {
        name: "description",
        content:
          "Admin view of PBO Benchmark Tool scenarios, agent assignments, and unlinked contact requests.",
      },
      { name: "robots", content: "noindex,nofollow" },
    ],
  }),
  component: PboScenariosAdminPage,
});

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
  ip_address: string | null;
  source_url: string | null;
  submitted_at: string | null;
  created_at: string;
}

interface AgentOption {
  id: string;
  full_name: string;
  email: string;
}

function PboScenariosAdminPage() {
  const { user } = useApp();
  const [scenarios, setScenarios] = useState<AdminScenarioRow[]>([]);
  const [contacts, setContacts] = useState<AdminContactRow[]>([]);
  const [leadCertificates, setLeadCertificates] = useState<LeadCertificateAuditRow[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [selectedScenarioForNotes, setSelectedScenarioForNotes] = useState<AdminScenarioRow | null>(
    null,
  );
  const [agents, setAgents] = useState<AgentOption[]>([]);

  const fetchAgents = useServerFn(listAgents);
  const doAssignAgent = useServerFn(assignAgent);

  useEffect(() => {
    if (!user) return;
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
      setLeadCertificates((certRes.data ?? []) as LeadCertificateAuditRow[]);
      setLoadingData(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [user]);

  useEffect(() => {
    if (!user) return;
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
    if (certRes.data) setLeadCertificates(certRes.data as LeadCertificateAuditRow[]);
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
    const m = new Map<string, LeadCertificateAuditRow>();
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

  return (
    <AdminAccessGate>
      <AppShell
        title="PBO Benchmark Tool Scenarios"
        subtitle="Scenario inventory, agent assignments, and unlinked contact requests."
      >
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <Link to="/admin">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Admin
              </Button>
            </Link>
            <Link to="/admin/lead-certificates">
              <Button variant="outline" size="sm">
                Lead certificates
              </Button>
            </Link>
          </div>

          <GlassCollapsibleCard
            title="PBO Benchmark Tool Scenarios"
            subtitle={`${scenarios.length} entered · most recent 500 shown`}
            icon={<Inbox className="h-5 w-5 text-primary" />}
            defaultOpen
            headerExtra={
              loadingData ? (
                <span className="text-xs text-muted-foreground">Loading…</span>
              ) : null
            }
            contentClassName="pt-3"
          >
            <AdminScenariosTable
              scenarios={scenarios}
              loadingData={loadingData}
              agents={agents}
              contactsByCode={contactsByCode}
              certificatesByRequestId={certificatesByRequestId}
              onAssignAgent={handleAssignAgent}
              onManageNotes={setSelectedScenarioForNotes}
            />
          </GlassCollapsibleCard>

          <GlassCollapsibleCard
            title="Agent scenario assignments"
            subtitle="Assign any scenario to a licensed agent below. The agent and all admin inboxes receive email when you assign."
            icon={<UserCheck className="h-5 w-5 text-primary" />}
            className="border-primary/20"
            defaultOpen
          >
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
          </GlassCollapsibleCard>

          {orphanedContacts.length > 0 && (
            <GlassCollapsibleCard
              title="Unlinked contact requests"
              subtitle="Submitted without a scenario reference."
              defaultOpen={false}
              contentClassName="pt-3"
            >
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
            </GlassCollapsibleCard>
          )}
        </div>

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
    </AdminAccessGate>
  );
}
