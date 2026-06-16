import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { LEADS_ADMIN_ROLE } from "@/lib/leads-admin";

export async function callerHasStaffAdminRole(userId: string): Promise<boolean> {
  const { data: callerRoles } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  return (callerRoles ?? []).some((r) => r.role === "admin" || r.role === LEADS_ADMIN_ROLE);
}

export async function verifyStaffAdmin(userId: string) {
  if (!(await callerHasStaffAdminRole(userId))) {
    throw new Error("Admin access required");
  }
}

export async function callerHasLeadsAdminRole(userId: string): Promise<boolean> {
  const { data: callerRoles } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  return (callerRoles ?? []).some((r) => r.role === LEADS_ADMIN_ROLE);
}
