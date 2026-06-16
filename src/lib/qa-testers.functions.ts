import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { buildQaRosterUsers } from "@/lib/qa-assignees.server";
import { compareStaffByDisplayName } from "@/lib/staff-name-sort";
import { listAllAuthUsers } from "@/lib/supabase-auth-users.server";

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
 * Admin-only roster of every QA-role user with the devices they registered.
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

    const [{ data: profiles }, authUsers] = await Promise.all([
      supabaseAdmin.from("profiles").select("id, full_name, qa_devices").in("id", ids),
      listAllAuthUsers(),
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

    const testers: QaTesterProfile[] = [];
    for (const row of buildQaRosterUsers(ids, profileMap, authById)) {
      const profile = profileMap.get(row.id);
      const auth = authById.get(row.id);
      const full = row.fullName.trim();
      if (!full) continue;
      const firstName = full.split(/\s+/)[0];
      if (!firstName) continue;

      testers.push({
        userId: row.id,
        firstName,
        fullName: full,
        email: auth?.email ?? "",
        qa_devices: profile?.qa_devices ?? [],
      });
    }

    return testers.sort((a, b) => compareStaffByDisplayName(a.fullName, b.fullName));
  });
