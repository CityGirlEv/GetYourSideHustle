import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { getEnvVariable } from "@/lib/env";
import { getTransactionalFromAddress } from "@/lib/send-transactional-email";
import { z } from "zod";
import { DEFAULT_ADMIN_NOTIFICATION_EMAILS } from "@/lib/registration.functions";

const ROLE_VALUES = ["admin", "qa", "agent", "editor", "viewer", "advisor"] as const;
const roleSchema = z.enum(ROLE_VALUES);

/**
 * Append an audit_logs row. Best-effort: a failure to log must never block
 * the underlying admin action, but the error is surfaced to server logs so
 * we notice if the trail goes silent.
 */
async function logAdminAudit(
  actorId: string,
  action: string,
  targetUserId: string,
  metadata: Record<string, unknown> = {},
) {
  const { error } = await supabaseAdmin.from("audit_logs").insert({
    user_id: actorId,
    action,
    entity_type: "user",
    entity_id: targetUserId,
    // Cast to satisfy Supabase's generated Json type (Record<string, unknown> is structurally compatible).
    metadata: metadata as never,
  });
  if (error) console.error("[admin] audit log insert failed", action, error.message);
}

const APP_URL = "https://themedicareoptimizer.lovable.app";

function adminNotificationRecipients(): string[] {
  const raw = getEnvVariable('ADMIN_NOTIFICATION_EMAILS');
  const configured = raw
    ? raw.split(",").map((s) => s.trim()).filter(Boolean)
    : DEFAULT_ADMIN_NOTIFICATION_EMAILS;
  return Array.from(new Set(configured));
}

function siteOrigin(): string {
  return (
    getEnvVariable('SITE_ORIGIN') ||
    getEnvVariable('PUBLIC_SITE_URL') ||
    "https://mypartb.lovable.app"
  );
}

async function notifyAdminsAccountEnabled(opts: {
  userId: string;
  fullName: string;
  email: string;
  role: string;
  enabledBy: string;
}) {
  const serviceKey = getEnvVariable('SUPABASE_SERVICE_ROLE_KEY');
  if (!serviceKey) {
    console.warn("[admin] account-enabled notification skipped — missing service role key");
    return;
  }
  const admins = adminNotificationRecipients();
  if (!admins.length) return;
  const origin = siteOrigin();
  await Promise.all(
    admins.map(async (recipient) => {
      try {
        const res = await fetch(`${origin}/lovable/email/transactional/send`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${serviceKey}`,
          },
          body: JSON.stringify({
            templateName: "account-enabled-admin",
            recipientEmail: recipient,
            idempotencyKey: `account-enabled-${opts.userId}-${recipient.toLowerCase()}`,
            templateData: {
              fullName: opts.fullName,
              email: opts.email,
              role: opts.role,
              enabledBy: opts.enabledBy,
            },
          }),
        });
        if (!res.ok) {
          console.error("[admin] account-enabled send failed", res.status, await res.text());
        }
      } catch (e) {
        console.error("[admin] account-enabled send threw", e);
      }
    }),
  );
}

async function sendAccountApprovedEmail(toEmail: string, fullName: string, role: string) {
  const LOVABLE_API_KEY = getEnvVariable('LOVABLE_API_KEY');
  const RESEND_API_KEY = getEnvVariable('RESEND_API_KEY');
  if (!LOVABLE_API_KEY || !RESEND_API_KEY || !toEmail) {
    console.warn("[admin] approval email skipped — missing keys or recipient");
    return;
  }
  const isQa = role === "qa";
  const html = `
    <div style="font-family:Arial,sans-serif;line-height:1.5;max-width:560px">
      <h2 style="margin:0 0 8px">Your Medicare Optimizer account is active</h2>
      <p>Hi ${fullName || "there"},</p>
      <p>Good news — an administrator just approved your beta account. You can now sign in.</p>
      <p style="margin:18px 0">
        <a href="${APP_URL}/auth" style="background:#4f46e5;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;font-weight:600">Sign in</a>
      </p>
      ${isQa ? `<p>Once you're in, head to the <b>Testing Portal</b> and open the <a href="${APP_URL}/qa-manual">QA Manual</a> — it covers filters, statuses, bulk edits, and the bug pipeline.</p>` : ""}
      <p style="color:#666;font-size:12px;margin-top:24px">If you didn't request this account, please ignore this email.</p>
    </div>`;
  try {
    const res = await fetch("https://connector-gateway.lovable.dev/resend/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": RESEND_API_KEY,
      },
      body: JSON.stringify({
        from: getTransactionalFromAddress(),
        to: [toEmail],
        subject: "Your Medicare Optimizer account is approved",
        html,
      }),
    });
    if (!res.ok) console.error("[admin] approval email failed", res.status, await res.text());
  } catch (e) {
    console.error("[admin] approval email threw", e);
  }
}

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
      supabaseAdmin.from("profiles").select("id, full_name, npn_number, qa_devices").in("id", userIds),
      supabaseAdmin.from("user_roles").select("user_id, role").in("user_id", userIds),
      supabaseAdmin.from("advisor_credits").select("advisor_id, balance").in("advisor_id", userIds),
    ]);

    const profileMap = new Map((profilesRes.data ?? []).map((p) => [p.id, p]));
    const rolesMap = new Map<string, string[]>();
    for (const r of rolesRes.data ?? []) {
      const arr = rolesMap.get(r.user_id) ?? [];
      arr.push(r.role);
      rolesMap.set(r.user_id, arr);
    }
    const creditMap = new Map((creditsRes.data ?? []).map((c) => [c.advisor_id, c.balance]));

    return users.map((u) => ({
      id: u.id,
      email: u.email ?? "",
      full_name: profileMap.get(u.id)?.full_name ?? "",
      npn_number: profileMap.get(u.id)?.npn_number ?? "",
      qa_devices: (profileMap.get(u.id)?.qa_devices ?? []) as string[],
      role: (rolesMap.get(u.id) ?? ["advisor"])[0],
      roles: rolesMap.get(u.id) ?? ["advisor"],
      credits: creditMap.get(u.id) ?? 0,
      disabled: !!(u as unknown as { banned_until?: string | null }).banned_until,
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at ?? null,
    }));
  });

export const updateUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      user_id: z.string().uuid(),
      full_name: z.string().max(255).optional(),
      npn_number: z.string().max(64).optional().nullable(),
      email: z.string().email().optional(),
      password: z.string().min(8).max(128).optional(),
      qa_devices: z.array(z.string().trim().min(1).max(80)).max(20).optional().nullable(),
    }).parse(input)
  )
  .handler(async ({ data, context }) => {
    await verifyAdmin(context.userId);
    if (data.email || data.password) {
      const updates: { email?: string; password?: string } = {};
      if (data.email) updates.email = data.email;
      if (data.password) updates.password = data.password;
      const { error } = await supabaseAdmin.auth.admin.updateUserById(data.user_id, updates);
      if (error) throw new Error(error.message);
    }
    if (data.full_name !== undefined || data.npn_number !== undefined || data.qa_devices !== undefined) {
      const patch: { id: string; full_name?: string; npn_number?: string | null; qa_devices?: string[] | null } = { id: data.user_id };
      if (data.full_name !== undefined) patch.full_name = data.full_name;
      if (data.npn_number !== undefined) patch.npn_number = data.npn_number;
      if (data.qa_devices !== undefined) patch.qa_devices = data.qa_devices;
      const { error } = await supabaseAdmin.from("profiles").upsert(patch);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const setUserDisabled = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      user_id: z.string().uuid(),
      disabled: z.boolean(),
    }).parse(input)
  )
  .handler(async ({ data, context }) => {
    await verifyAdmin(context.userId);
    if (data.user_id === context.userId) throw new Error("You cannot disable your own account");
    // Detect transition from disabled -> enabled so we only email on approval.
    let wasDisabled = false;
    let recipientEmail = "";
    let recipientName = "";
    let recipientRole = "viewer";
    if (!data.disabled) {
      const { data: existing } = await supabaseAdmin.auth.admin.getUserById(data.user_id);
      wasDisabled = !!(existing?.user as unknown as { banned_until?: string | null } | undefined)?.banned_until;
      recipientEmail = existing?.user?.email ?? "";
      const { data: prof } = await supabaseAdmin.from("profiles").select("full_name").eq("id", data.user_id).maybeSingle();
      recipientName = prof?.full_name ?? "";
      const { data: roleRow } = await supabaseAdmin.from("user_roles").select("role").eq("user_id", data.user_id).maybeSingle();
      recipientRole = roleRow?.role ?? "viewer";
    }
    const { error } = await supabaseAdmin.auth.admin.updateUserById(data.user_id, {
      ban_duration: data.disabled ? "876000h" : "none",
    } as unknown as { ban_duration: string });
    if (error) throw new Error(error.message);
    if (!data.disabled && wasDisabled && recipientEmail) {
      await sendAccountApprovedEmail(recipientEmail, recipientName, recipientRole);
      try {
        const { data: actor } = await supabaseAdmin.auth.admin.getUserById(context.userId);
        await notifyAdminsAccountEnabled({
          userId: data.user_id,
          fullName: recipientName,
          email: recipientEmail,
          role: recipientRole,
          enabledBy: actor?.user?.email ?? context.userId,
        });
      } catch (e) {
        console.error("[admin] notifyAdminsAccountEnabled failed", e);
      }
    }
    return { ok: true };
  });

export const deleteUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ user_id: z.string().uuid() }).parse(input)
  )
  .handler(async ({ data, context }) => {
    await verifyAdmin(context.userId);
    if (data.user_id === context.userId) throw new Error("You cannot delete your own account");
    const { error } = await supabaseAdmin.auth.admin.deleteUser(data.user_id);
    if (error) throw new Error(error.message);
    await logAdminAudit(context.userId, "ADMIN_DELETE_USER", data.user_id);
    return { ok: true };
  });

export const createAdvisor = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      email: z.string().email(),
      password: z.string().min(12).max(128),
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

    await logAdminAudit(context.userId, "ADMIN_CREATE_USER", newUserId, {
      email: data.email,
      role: assignedRole,
    });
    await logAdminAudit(context.userId, "ADD_USER_ROLE", newUserId, {
      role: assignedRole,
      source: "admin_create_user",
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

export const addUserRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      user_id: z.string().uuid(),
      role: roleSchema,
    }).parse(input)
  )
  .handler(async ({ data, context }) => {
    await verifyAdmin(context.userId);
    const { error } = await supabaseAdmin
      .from("user_roles")
      .upsert({ user_id: data.user_id, role: data.role }, { onConflict: "user_id,role" });
    if (error) throw new Error(error.message);
    await logAdminAudit(context.userId, "ADD_USER_ROLE", data.user_id, {
      role: data.role,
    });
    return { ok: true };
  });

export const removeUserRole = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({
      user_id: z.string().uuid(),
      role: roleSchema,
    }).parse(input)
  )
  .handler(async ({ data, context }) => {
    await verifyAdmin(context.userId);
    if (data.user_id === context.userId && data.role === "admin") {
      throw new Error("You cannot remove your own admin role");
    }
    const { error } = await supabaseAdmin
      .from("user_roles")
      .delete()
      .eq("user_id", data.user_id)
      .eq("role", data.role);
    if (error) throw new Error(error.message);
    await logAdminAudit(context.userId, "REMOVE_USER_ROLE", data.user_id, {
      role: data.role,
    });
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
      p_agent: data.agent_id as unknown as string,
    });
    if (error) throw new Error(error.message);
    return { ok: true };
  });
