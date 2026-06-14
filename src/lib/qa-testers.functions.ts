import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

export type QaTesterProfile = {
  userId: string;
  firstName: string;
  fullName: string;
  email: string;
  qa_devices: string[];
};

async function verifyAdmin(userId: string) {
  const { data: callerRoles } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  const isAdmin = (callerRoles ?? []).some((r) => r.role === "admin");
  if (!isAdmin) throw new Error("Admin access required");
}

/**
 * Admin-only roster of enabled QA testers with the devices they registered.
 * firstName matches test_results.assignee labels used in the Testing Portal.
 */
export const listQaTestersWithDevices = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }): Promise<QaTesterProfile[]> => {
    await verifyAdmin(context.userId);

    const { data: roleRows, error: roleErr } = await supabaseAdmin
      .from("user_roles")
      .select("user_id")
      .eq("role", "qa");
    if (roleErr) throw new Error(roleErr.message);
    const ids = (roleRows ?? []).map((r) => r.user_id);
    if (ids.length === 0) return [];

    const [{ data: profiles }, authList] = await Promise.all([
      supabaseAdmin.from("profiles").select("id, full_name, qa_devices").in("id", ids),
      supabaseAdmin.auth.admin.listUsers(),
    ]);

    const profileMap = new Map(
      (profiles ?? []).map((p) => [
        p.id,
        {
          full_name: p.full_name ?? "",
          qa_devices: (p.qa_devices ?? []) as string[],
        },
      ]),
    );

    const testers: QaTesterProfile[] = [];
    for (const u of authList.data?.users ?? []) {
      if (!ids.includes(u.id)) continue;
      const bannedUntil = (u as unknown as { banned_until?: string | null }).banned_until;
      if (bannedUntil && new Date(bannedUntil).getTime() > Date.now()) continue;

      const profile = profileMap.get(u.id);
      const full = (
        profile?.full_name ||
        (u.user_metadata?.full_name as string) ||
        u.email ||
        ""
      ).trim();
      if (!full) continue;
      const firstName = full.split(/\s+/)[0];
      if (!firstName) continue;

      testers.push({
        userId: u.id,
        firstName,
        fullName: full,
        email: u.email ?? "",
        qa_devices: profile?.qa_devices ?? [],
      });
    }

    return testers.sort((a, b) => a.firstName.localeCompare(b.firstName));
  });
