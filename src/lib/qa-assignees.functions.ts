import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

/**
 * Returns the list of enabled (non-banned) QA users' display names.
 * Used to populate assignee dropdowns on the Tasks and Test sheets so that
 * newly-approved QA testers automatically show up everywhere.
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
    if (ids.length === 0) return [] as string[];

    const [{ data: profiles }, authList] = await Promise.all([
      supabaseAdmin.from("profiles").select("id, full_name").in("id", ids),
      supabaseAdmin.auth.admin.listUsers(),
    ]);

    const profileMap = new Map((profiles ?? []).map((p) => [p.id, p.full_name ?? ""]));

    const names: string[] = [];
    for (const u of authList.data?.users ?? []) {
      if (!ids.includes(u.id)) continue;
      // Skip banned/disabled accounts
      const bannedUntil = (u as unknown as { banned_until?: string | null }).banned_until;
      if (bannedUntil && new Date(bannedUntil).getTime() > Date.now()) continue;

      const full = (profileMap.get(u.id) || (u.user_metadata?.full_name as string) || u.email || "").trim();
      if (!full) continue;
      const first = full.split(/\s+/)[0];
      if (first) names.push(first);
    }
    // De-dupe + sort for stable UI
    return Array.from(new Set(names)).sort((a, b) => a.localeCompare(b));
  });