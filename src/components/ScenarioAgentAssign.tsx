import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { UserCheck } from "lucide-react";
import { toast } from "sonner";
import { listAgents, assignAgent } from "@/lib/admin.functions";
import { supabase } from "@/integrations/supabase/client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

type AgentOption = { id: string; full_name: string; email: string };

export function ScenarioAgentAssign({ scenarioCode }: { scenarioCode: string }) {
  const [scenarioId, setScenarioId] = useState<string | null>(null);
  const [assignedAgentId, setAssignedAgentId] = useState<string | null>(null);
  const [agents, setAgents] = useState<AgentOption[]>([]);
  const [loading, setLoading] = useState(true);
  const fetchAgents = useServerFn(listAgents);
  const doAssign = useServerFn(assignAgent);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      try {
        const normalized = scenarioCode.trim().toUpperCase();
        const [{ data: row }, agentData] = await Promise.all([
          supabase
            .from("scenarios")
            .select("id, assigned_agent_id")
            .eq("scenario_code", normalized)
            .maybeSingle(),
          fetchAgents(),
        ]);
        if (cancelled) return;
        if (!row) {
          setScenarioId(null);
          return;
        }
        setScenarioId(row.id);
        setAssignedAgentId(row.assigned_agent_id);
        setAgents(agentData as AgentOption[]);
      } catch (e) {
        console.error("[ScenarioAgentAssign] load failed", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [scenarioCode, fetchAgents]);

  const handleAssign = async (value: string) => {
    if (!scenarioId) return;
    const agentId = value === "__none" ? null : value;
    try {
      await doAssign({ data: { scenario_id: scenarioId, agent_id: agentId } });
      setAssignedAgentId(agentId);
      if (agentId) {
        toast.success("Agent assigned — notification emails queued");
      } else {
        toast.success("Agent assignment cleared");
      }
    } catch (e) {
      toast.error((e as Error)?.message ?? "Failed to assign agent");
    }
  };

  if (loading || !scenarioId) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <UserCheck className="h-4 w-4 text-primary shrink-0" aria-hidden />
      <Label htmlFor="scenario-agent-assign" className="text-xs font-medium shrink-0">
        Assign to agent
      </Label>
      <Select value={assignedAgentId ?? "__none"} onValueChange={(v) => void handleAssign(v)}>
        <SelectTrigger id="scenario-agent-assign" className="h-8 text-xs min-w-[180px]">
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
    </div>
  );
}
