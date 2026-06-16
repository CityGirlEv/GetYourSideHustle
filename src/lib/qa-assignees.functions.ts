import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { buildQaAssigneeEntries, buildQaRosterUsers } from "@/lib/qa-assignees.server";
import { listAllAuthUsers } from "@/lib/supabase-auth-users.server";

export type QaAssigneeEntry = {
  name: string;
  /** Always true — all QA-role users are assignable (enabled status handled separately). */
  active: boolean;
};

/**
 * Returns every QA user's display name for owner/assignee dropdowns.
 * All QA-role users appear and are selectable, including disabled or unconfirmed accounts.
 */
export const listQaAssignees = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async () => {
    const { data: roleRows, error: roleErr } = await supabaseAdmin
      .from("user_roles")
      .select("user_id")
      .eq("role", "qa");
    if (roleErr) throw new Error(roleErr.message);
    const ids = (roleRows ?? []).map((r) => r.user_id);
    if (ids.length === 0) return [] as QaAssigneeEntry[];

    const [{ data: profiles }, authUsers] = await Promise.all([
      supabaseAdmin.from("profiles").select("id, full_name").in("id", ids),
      listAllAuthUsers(),
    ]);

    const profileMap = new Map((profiles ?? []).map((p) => [p.id, p]));
    const authById = new Map(
      authUsers.map((u) => [
        u.id,
        {
          user_metadata: u.user_metadata as Record<string, unknown> | undefined,
          email: u.email,
          banned_until: (u as unknown as { banned_until?: string | null }).banned_until ?? null,
        },
      ]),
    );

    return buildQaAssigneeEntries(buildQaRosterUsers(ids, profileMap, authById));
  });
