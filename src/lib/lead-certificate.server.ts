import { supabaseAdmin } from "@/integrations/supabase/client.server";

export async function resolveAgentDisplayName(agentId: string): Promise<string> {
  const [{ data: agentAuth }, { data: profile }] = await Promise.all([
    supabaseAdmin.auth.admin.getUserById(agentId),
    supabaseAdmin.from("profiles").select("full_name").eq("id", agentId).maybeSingle(),
  ]);
  const email = agentAuth?.user?.email ?? "";
  return profile?.full_name?.trim() || email || agentId;
}

/** Keep lead certificates in sync when an admin assigns or clears an agent on a scenario. */
export async function syncLeadCertificatesAgentForScenario(opts: {
  scenarioCode: string;
  agentId: string | null;
  agentName: string | null;
}): Promise<void> {
  const scenarioCode = opts.scenarioCode.trim().toUpperCase();
  if (!scenarioCode) return;

  const { error } = await supabaseAdmin
    .from("lead_certificates")
    .update({
      assigned_agent_id: opts.agentId,
      assigned_agent_name: opts.agentName,
    })
    .eq("scenario_code", scenarioCode);

  if (error) {
    console.error("[lead] sync agent on certificates failed", error.message);
  }
}
