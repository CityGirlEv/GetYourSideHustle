import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { z } from "zod";

const ROLE_VALUES = ["admin", "qa", "agent", "editor", "viewer", "advisor"] as const;
const roleSchema = z.enum(ROLE_VALUES);

async function verifyAdmin(userId: string) {
  const { data: callerRoles } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  const isAdmin = (callerRoles ?? []).some((r) => r.role === "admin");
  if (!isAdmin) throw new Error("Admin access required");
}

export const listStaff = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await verifyAdmin(context.userId);

    const { data: authUsers, error: authErr } = await supabaseAdmin.auth.admin.listUsers();
    if (authErr) throw new Error(authErr.message);

    const users = authUsers?.users ?? [];
    const userIds = users.map((u) => u.id);
    if (userIds.length === 0) return [];

    const [profilesRes, rolesRes, creditsRes] = await Promise.all([
      supabaseAdmin.from("profiles").select("id, full_name, npn_number").in("id", userIds),
      supabaseAdmin.from("user_roles").select("user_id, role").in("user_id", userIds),
      supabaseAdmin.from("advisor_credits").select("advisor_id, balance").in("advisor_id", userIds),
    ]);

    const profileMap = new Map((profilesRes.data ?? []).map((p) => [p.id, p]));
    const roleMap = new Map((rolesRes.data ?? []).map((r) => [r.user_id, r.role]));
    const creditMap = new Map((creditsRes.data ?? []).map((c) => [c.advisor_id, c.balance]));

    return users.map((u) => ({
      id: u.id,
      email: u.email ?? "",
      full_name: profileMap.get(u.id)?.full_name ?? "",
      npn_number: profileMap.get(u.id)?.npn_number ?? "",
      role: roleMap.get(u.id) ?? "advisor",
      credits: creditMap.get(u.id) ?? 0,
    }));
  });

export const createAdvisor = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      email: z.string().email(),
      password: z.string().min(8).max(128),
      full_name: z.string().min(1).max(255).optional(),
      role: roleSchema.optional(),
    }).parse(input)
  )
  .handler(async ({ data, context }) => {
    await verifyAdmin(context.userId);

    // Check if user already exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const existing = (existingUsers?.users ?? []).find((u) => u.email === data.email);
    if (existing) {
      throw new Error("A user with this email already exists");
    }

    // Create the user
    const { data: createData, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
      user_metadata: {
        full_name: data.full_name ?? "",
      },
    });

    if (createError || !createData.user) {
      throw new Error(createError?.message ?? "Failed to create user");
    }

    const newUserId = createData.user.id;

    // Ensure role and credits (trigger should fire, but belt-and-suspenders)
    await supabaseAdmin.from("profiles").upsert({
      id: newUserId,
      full_name: data.full_name ?? "",
    });

    const assignedRole = data.role ?? "viewer";
    // Replace any role rows the trigger inserted with the admin's choice
    await supabaseAdmin.from("user_roles").delete().eq("user_id", newUserId);
    await supabaseAdmin.from("user_roles").insert({
      user_id: newUserId,
      role: assignedRole,
    });

    await supabaseAdmin.from("advisor_credits").upsert({
      advisor_id: newUserId,
      balance: assignedRole === "advisor" ? 10 : 0,
    });

    return {
      id: newUserId,
      email: data.email,
      full_name: data.full_name ?? "",
      role: assignedRole,
    };
  });

export const setUserRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      user_id: z.string().uuid(),
      role: roleSchema,
    }).parse(input)
  )
  .handler(async ({ data, context }) => {
    await verifyAdmin(context.userId);
    const { error } = await supabaseAdmin.rpc("admin_set_user_role", {
      p_user: data.user_id,
      p_role: data.role,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });

export const listAgents = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await verifyAdmin(context.userId);
    const { data: agentRoles, error } = await supabaseAdmin
      .from("user_roles")
      .select("user_id")
      .eq("role", "agent");
    if (error) throw new Error(error.message);
    const ids = (agentRoles ?? []).map((r) => r.user_id);
    if (ids.length === 0) return [];
    const [profilesRes, authRes] = await Promise.all([
      supabaseAdmin.from("profiles").select("id, full_name").in("id", ids),
      supabaseAdmin.auth.admin.listUsers(),
    ]);
    const profileMap = new Map((profilesRes.data ?? []).map((p) => [p.id, p]));
    const emailMap = new Map((authRes.data?.users ?? []).map((u) => [u.id, u.email ?? ""]));
    return ids.map((id) => ({
      id,
      full_name: profileMap.get(id)?.full_name ?? "",
      email: emailMap.get(id) ?? "",
    }));
  });

export const assignAgent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      scenario_id: z.string().uuid(),
      agent_id: z.string().uuid().nullable(),
    }).parse(input)
  )
  .handler(async ({ data, context }) => {
    await verifyAdmin(context.userId);
    const { error } = await supabaseAdmin.rpc("admin_assign_agent", {
      p_scenario: data.scenario_id,
      p_agent: data.agent_id,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
