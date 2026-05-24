import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const ROLE_PRIORITY = ["admin", "qa", "agent", "editor", "viewer", "advisor"] as const;

function pickRole(roles: string[]) {
  for (const role of ROLE_PRIORITY) {
    if (roles.includes(role)) return role;
  }
  return "viewer";
}

export const getCurrentUserProfile = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const [{ data: profile }, { data: roles }, { data: authUser }] = await Promise.all([
      supabaseAdmin
        .from("profiles")
        .select("full_name, npn_number")
        .eq("id", context.userId)
        .maybeSingle(),
      supabaseAdmin
        .from("user_roles")
        .select("role")
        .eq("user_id", context.userId),
      supabaseAdmin.auth.admin.getUserById(context.userId),
    ]);

    const role = pickRole((roles ?? []).map((r) => r.role));

    return {
      id: context.userId,
      email: authUser.user?.email ?? "",
      full_name: profile?.full_name ?? "",
      npn_number: profile?.npn_number ?? undefined,
      role,
    };
  });