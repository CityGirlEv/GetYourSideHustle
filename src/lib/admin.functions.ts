import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { z } from "zod";
import {
  notifyAdminInboxes,
  publicSiteUrl,
  sendTransactionalTemplates,
} from "@/lib/send-transactional-template.server";
import type { AgentAssignmentGroup } from "@/lib/email-templates/scenario-assignment-admin";
import { sendAssignmentEmailOnUserEnable } from "@/lib/qa-test-assignment.functions";
import { listAllAuthUsers } from "@/lib/supabase-auth-users.server";
import { compareStaffByDisplayName, compareStaffByFullName } from "@/lib/staff-name-sort";
import { ACCOUNT_STATUS_ACTIVE, ACCOUNT_STATUS_ADMIN_DISABLED } from "@/lib/auth-sign-in.server";
import { forgotPasswordEntryUrl } from "@/lib/auth-recovery";
import {
  fetchPasswordConfirmedAt,
  generateBrandedRecoveryLink,
  markPasswordConfirmed,
  userNeedsPasswordSetup,
} from "@/lib/password-status.server";
import { canManageLeadsAdminRole, LEADS_ADMIN_ROLE } from "@/lib/leads-admin";
import { verifyStaffAdmin } from "@/lib/staff-admin.server";
import {
  resolveAgentDisplayName,
  syncLeadCertificatesAgentForScenario,
} from "@/lib/lead-certificate.server";

const ROLE_VALUES = ["admin", "qa", "agent", "editor", "client", "viewer", "advisor"] as const;
const STAFF_ROLE_VALUES = [...ROLE_VALUES, LEADS_ADMIN_ROLE] as const;
const roleSchema = z.enum(STAFF_ROLE_VALUES);

const IN_QUERY_CHUNK_SIZE = 80;

function chunkArray<T>(items: T[], size = IN_QUERY_CHUNK_SIZE): T[][] {
  if (items.length === 0) return [];
  const chunks: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    chunks.push(items.slice(i, i + size));
  }
  return chunks;
}

async function fetchRowsInChunks<T>(
  userIds: string[],
  fetchChunk: (chunk: string[]) => PromiseLike<{ data: T[] | null; error: { message: string } | null }>,
): Promise<T[]> {
  const rows: T[] = [];
  for (const chunk of chunkArray(userIds)) {
    const { data, error } = await fetchChunk(chunk);
    if (error) throw new Error(error.message);
    rows.push(...(data ?? []));
  }
  return rows;
}

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

const APP_URL = publicSiteUrl().replace(/\/$/, "");

async function notifyAdminsAccountEnabled(opts: {
  userId: string;
  fullName: string;
  email: string;
  role: string;
  enabledBy: string;
}) {
  await notifyAdminInboxes({
    templateName: "account-enabled-admin",
    idempotencyPrefix: `account-enabled-${opts.userId}`,
    templateData: {
      fullName: opts.fullName,
      email: opts.email,
      role: opts.role,
      enabledBy: opts.enabledBy,
    },
  });
}

async function sendAccountApprovedEmail(userId: string, toEmail: string, fullName: string) {
  if (!toEmail) {
    console.warn("[admin] approval email skipped — missing recipient");
    return;
  }
  const passwordConfirmedAt = await fetchPasswordConfirmedAt(userId);
  const needsPasswordSetup = userNeedsPasswordSetup(passwordConfirmedAt);
  const resetPasswordUrl = needsPasswordSetup
    ? ((await generateBrandedRecoveryLink(toEmail)) ?? forgotPasswordEntryUrl())
    : undefined;

  await sendTransactionalTemplates({
    templateName: "welcome",
    recipientEmail: toEmail,
    templateData: {
      recipientName: fullName || undefined,
      signInUrl: `${APP_URL}/auth?tab=sign-in`,
      forgotPasswordUrl: forgotPasswordEntryUrl(),
      resetPasswordUrl,
      needsPasswordSetup,
    },
    idempotencyKey: `welcome-${userId}`,
  });
}

async function verifyAdmin(userId: string) {
  await verifyStaffAdmin(userId);
}

async function getCallerEmail(userId: string): Promise<string> {
  const { data } = await supabaseAdmin.auth.admin.getUserById(userId);
  return data?.user?.email ?? "";
}

async function assertLeadsAdminRoleChange(actorId: string, targetUserId: string, role: string) {
  if (role !== LEADS_ADMIN_ROLE) return;
  const actorEmail = await getCallerEmail(actorId);
  if (!canManageLeadsAdminRole(actorEmail, targetUserId, actorId)) {
    throw new Error(
      "Only the platform owner can assign or remove the Leads Admin role on their own account",
    );
  }
}

export const listStaff = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await verifyAdmin(context.userId);

    const users = await listAllAuthUsers();
    const userIds = users.map((u) => u.id);
    if (userIds.length === 0) return [];

    const [profiles, rolesRows, creditsRows] = await Promise.all([
      fetchRowsInChunks(userIds, (chunk) =>
        supabaseAdmin
          .from("profiles")
          .select("id, full_name, npn_number, qa_devices")
          .in("id", chunk),
      ),
      fetchRowsInChunks(userIds, (chunk) =>
        supabaseAdmin.from("user_roles").select("user_id, role").in("user_id", chunk),
      ),
      fetchRowsInChunks(userIds, (chunk) =>
        supabaseAdmin.from("advisor_credits").select("advisor_id, balance").in("advisor_id", chunk),
      ),
    ]);

    const profileMap = new Map(profiles.map((p) => [p.id, p]));
    const rolesMap = new Map<string, string[]>();
    for (const r of rolesRows) {
      const arr = rolesMap.get(r.user_id) ?? [];
      arr.push(r.role);
      rolesMap.set(r.user_id, arr);
    }
    const creditMap = new Map(creditsRows.map((c) => [c.advisor_id, c.balance]));

    const staff = users.map((u) => ({
      id: u.id,
      email: u.email ?? "",
      full_name: profileMap.get(u.id)?.full_name ?? "",
      npn_number: profileMap.get(u.id)?.npn_number ?? "",
      qa_devices: (profileMap.get(u.id)?.qa_devices ?? []) as string[],
      role: (rolesMap.get(u.id) ?? ["advisor"])[0],
      roles: rolesMap.get(u.id) ?? ["advisor"],
      credits: creditMap.get(u.id) ?? 0,
      disabled: !!(u as unknown as { banned_until?: string | null }).banned_until,
      email_confirmed: !!(u as unknown as { email_confirmed_at?: string | null })
        .email_confirmed_at,
      email_confirmed_at:
        (u as unknown as { email_confirmed_at?: string | null }).email_confirmed_at ?? null,
      created_at: u.created_at,
      last_sign_in_at: u.last_sign_in_at ?? null,
    }));
    staff.sort(compareStaffByFullName);
    return staff;
  });

export const updateUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        user_id: z.string().uuid(),
        full_name: z.string().max(255).optional(),
        npn_number: z.string().max(64).optional().nullable(),
        email: z.string().email().optional(),
        password: z.string().min(8).max(128).optional(),
        qa_devices: z.array(z.string().trim().min(1).max(80)).max(20).optional().nullable(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await verifyAdmin(context.userId);
    if (data.email || data.password) {
      const updates: { email?: string; password?: string } = {};
      if (data.email) updates.email = data.email;
      if (data.password) updates.password = data.password;
      const { error } = await supabaseAdmin.auth.admin.updateUserById(data.user_id, updates);
      if (error) throw new Error(error.message);
      if (data.password) {
        await markPasswordConfirmed(data.user_id);
      }
    }
    if (
      data.full_name !== undefined ||
      data.npn_number !== undefined ||
      data.qa_devices !== undefined
    ) {
      const patch: {
        id: string;
        full_name?: string;
        npn_number?: string | null;
        qa_devices?: string[] | null;
      } = { id: data.user_id };
      if (data.full_name !== undefined) patch.full_name = data.full_name;
      if (data.npn_number !== undefined) patch.npn_number = data.npn_number;
      if (data.qa_devices !== undefined) patch.qa_devices = data.qa_devices;
      const { error } = await supabaseAdmin.from("profiles").upsert(patch);
      if (error) throw new Error(error.message);
    }
    return { ok: true };
  });

export const setUserEmailConfirmed = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        user_id: z.string().uuid(),
        confirmed: z.boolean(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await verifyAdmin(context.userId);
    const { data: confirmedAt, error } = await supabaseAdmin.rpc("admin_set_email_confirmed" as any, {
      p_user_id: data.user_id,
      p_confirmed: data.confirmed,
    });
    if (error) throw new Error(error.message);
    await logAdminAudit(context.userId, "ADMIN_SET_EMAIL_CONFIRMED", data.user_id, {
      confirmed: data.confirmed,
      email_confirmed_at: confirmedAt ?? null,
    });
    return {
      ok: true,
      email_confirmed: data.confirmed,
      email_confirmed_at: (confirmedAt as string | null) ?? null,
    };
  });

async function signOutUserGloballyByEmail(email: string) {
  const { data: linkData, error: linkErr } = await supabaseAdmin.auth.admin.generateLink({
    type: "magiclink",
    email,
  });
  if (linkErr) throw new Error(linkErr.message);

  const tokenHash = linkData.properties?.hashed_token;
  if (!tokenHash) throw new Error("generateLink did not return hashed_token");

  const { data: sessionData, error: verifyErr } = await supabaseAdmin.auth.verifyOtp({
    type: "magiclink",
    token_hash: tokenHash,
  });
  if (verifyErr) throw new Error(verifyErr.message);

  const accessToken = sessionData.session?.access_token;
  if (!accessToken) throw new Error("verifyOtp did not return access_token");

  const { error: signOutErr } = await supabaseAdmin.auth.admin.signOut(accessToken, "global");
  if (signOutErr) throw new Error(signOutErr.message);
}

async function signOutUserGlobally(user: {
  id: string;
  email?: string | null;
  banned_until?: string | null;
  app_metadata?: Record<string, unknown> | null;
}) {
  const email = user.email?.trim();
  if (!email) throw new Error("User has no email");

  const appMeta = (user.app_metadata ?? {}) as Record<string, unknown>;
  const { error: stampErr } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
    app_metadata: { ...appMeta, force_logout_at: new Date().toISOString() },
  });
  if (stampErr) throw new Error(stampErr.message);

  const wasBanned = !!user.banned_until;
  if (wasBanned) {
    const { error: unbanErr } = await supabaseAdmin.auth.admin.updateUserById(user.id, {
      ban_duration: "none",
    });
    if (unbanErr) throw new Error(unbanErr.message);
  }

  try {
    await signOutUserGloballyByEmail(email);
  } finally {
    if (wasBanned) {
      await supabaseAdmin.auth.admin.updateUserById(user.id, {
        ban_duration: "876000h",
      });
    }
  }
}

export const signOutAllUsers = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await verifyAdmin(context.userId);

    let signedOut = 0;
    const errors: { user_id: string; message: string }[] = [];

    for (let page = 1; page <= 100; page++) {
      const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 200 });
      if (error) throw new Error(error.message);
      const users = data.users ?? [];
      if (users.length === 0) break;

      for (const user of users) {
        try {
          await signOutUserGlobally({
            id: user.id,
            email: user.email,
            banned_until: (user as { banned_until?: string | null }).banned_until ?? null,
            app_metadata:
              (user as { app_metadata?: Record<string, unknown> | null }).app_metadata ?? null,
          });
          signedOut++;
        } catch (err) {
          errors.push({
            user_id: user.id,
            message: err instanceof Error ? err.message : String(err),
          });
        }
      }

      if (users.length < 200) break;
    }

    await logAdminAudit(context.userId, "ADMIN_SIGN_OUT_ALL_USERS", context.userId, {
      signed_out: signedOut,
      failed: errors.length,
      errors,
    });

    return { signed_out: signedOut, failed: errors.length, errors };
  });

async function ensureUserEmailConfirmed(userId: string): Promise<void> {
  const { error } = await supabaseAdmin.rpc("admin_set_email_confirmed" as any, {
    p_user_id: userId,
    p_confirmed: true,
  });
  if (error) {
    console.warn("[admin] ensureUserEmailConfirmed failed", userId, error.message);
  }
}

async function applyUserDisabledState(actorId: string, userId: string, disabled: boolean) {
  if (userId === actorId && disabled) throw new Error("You cannot disable your own account");

  const { data: existing } = await supabaseAdmin.auth.admin.getUserById(userId);
  const existingUser = existing?.user;
  const wasDisabled = !!(existingUser as unknown as { banned_until?: string | null } | undefined)
    ?.banned_until;

  let recipientEmail = "";
  let recipientName = "";
  let recipientRole = "viewer";
  if (!disabled && wasDisabled) {
    recipientEmail = existingUser?.email ?? "";
    const { data: prof } = await supabaseAdmin
      .from("profiles")
      .select("full_name")
      .eq("id", userId)
      .maybeSingle();
    recipientName = prof?.full_name ?? "";
    const { data: roleRow } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .maybeSingle();
    recipientRole = roleRow?.role ?? "viewer";
  }

  const appMeta = (existingUser?.app_metadata ?? {}) as Record<string, unknown>;
  const accountStatus = disabled ? ACCOUNT_STATUS_ADMIN_DISABLED : ACCOUNT_STATUS_ACTIVE;

  const { error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
    ban_duration: disabled ? "876000h" : "none",
    app_metadata: { ...appMeta, account_status: accountStatus },
  } as unknown as { ban_duration: string; app_metadata: Record<string, unknown> });
  if (error) throw new Error(error.message);

  if (!disabled) {
    await ensureUserEmailConfirmed(userId);
  }

  if (!disabled && wasDisabled && recipientEmail) {
    await sendAccountApprovedEmail(userId, recipientEmail, recipientName);
    try {
      const { data: actor } = await supabaseAdmin.auth.admin.getUserById(actorId);
      await notifyAdminsAccountEnabled({
        userId,
        fullName: recipientName,
        email: recipientEmail,
        role: recipientRole,
        enabledBy: actor?.user?.email ?? actorId,
      });
    } catch (e) {
      console.error("[admin] notifyAdminsAccountEnabled failed", e);
    }
    if (recipientRole === "qa") {
      try {
        await sendAssignmentEmailOnUserEnable(userId);
      } catch (e) {
        console.error("[admin] sendAssignmentEmailOnUserEnable failed", e);
      }
    }
  }
}

export const setUserDisabled = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        user_id: z.string().uuid(),
        disabled: z.boolean(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await verifyAdmin(context.userId);
    await applyUserDisabledState(context.userId, data.user_id, data.disabled);
    return { ok: true };
  });

export const bulkUpdateUsers = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        user_ids: z.array(z.string().uuid()).min(1).max(200),
        disabled: z.boolean().optional(),
        email_confirmed: z.boolean().optional(),
        add_role: roleSchema.optional(),
        remove_role: roleSchema.optional(),
      })
      .refine(
        (d) =>
          d.disabled !== undefined ||
          d.email_confirmed !== undefined ||
          d.add_role !== undefined ||
          d.remove_role !== undefined,
        { message: "At least one bulk action is required" },
      )
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await verifyAdmin(context.userId);
    const errors: { user_id: string; message: string }[] = [];
    let applied = 0;

    for (const userId of data.user_ids) {
      try {
        if (data.disabled !== undefined) {
          await applyUserDisabledState(context.userId, userId, data.disabled);
        }
        if (data.email_confirmed !== undefined) {
          const { error } = await supabaseAdmin.rpc("admin_set_email_confirmed" as any, {
            p_user_id: userId,
            p_confirmed: data.email_confirmed,
          });
          if (error) throw new Error(error.message);
        }
        if (data.add_role) {
          await assertLeadsAdminRoleChange(context.userId, userId, data.add_role);
          const { error } = await supabaseAdmin
            .from("user_roles")
            .upsert({ user_id: userId, role: data.add_role }, { onConflict: "user_id,role" });
          if (error) throw new Error(error.message);
          await logAdminAudit(context.userId, "ADD_USER_ROLE", userId, {
            role: data.add_role,
            source: "bulk_update",
          });
        }
        if (data.remove_role) {
          await assertLeadsAdminRoleChange(context.userId, userId, data.remove_role);
          if (userId === context.userId && data.remove_role === "admin") {
            throw new Error("You cannot remove your own admin role");
          }
          const { error } = await supabaseAdmin
            .from("user_roles")
            .delete()
            .eq("user_id", userId)
            .eq("role", data.remove_role);
          if (error) throw new Error(error.message);
          await logAdminAudit(context.userId, "REMOVE_USER_ROLE", userId, {
            role: data.remove_role,
            source: "bulk_update",
          });
        }
        applied++;
      } catch (e) {
        errors.push({
          user_id: userId,
          message: e instanceof Error ? e.message : "Update failed",
        });
      }
    }

    await logAdminAudit(context.userId, "BULK_UPDATE_USERS", data.user_ids[0] ?? context.userId, {
      user_ids: data.user_ids,
      disabled: data.disabled,
      email_confirmed: data.email_confirmed,
      add_role: data.add_role,
      remove_role: data.remove_role,
      applied,
      failed: errors.length,
      errors,
    });

    return { applied, failed: errors.length, errors };
  });

export const deleteUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) => z.object({ user_id: z.string().uuid() }).parse(input))
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
    z
      .object({
        email: z.string().email(),
        password: z.string().min(12).max(128),
        full_name: z.string().min(1).max(255).optional(),
        role: roleSchema.optional(),
      })
      .parse(input),
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
    await markPasswordConfirmed(newUserId);

    const assignedRole = data.role ?? "viewer";
    if (assignedRole === LEADS_ADMIN_ROLE) {
      throw new Error("Leads Admin cannot be assigned during user creation");
    }
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
    z
      .object({
        user_id: z.string().uuid(),
        role: roleSchema,
      })
      .parse(input),
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
    z
      .object({
        user_id: z.string().uuid(),
        role: roleSchema,
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await verifyAdmin(context.userId);
    await assertLeadsAdminRoleChange(context.userId, data.user_id, data.role);
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
    z
      .object({
        user_id: z.string().uuid(),
        role: roleSchema,
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await verifyAdmin(context.userId);
    await assertLeadsAdminRoleChange(context.userId, data.user_id, data.role);
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
    const agents = ids.map((id) => ({
      id,
      full_name: profileMap.get(id)?.full_name ?? "",
      email: emailMap.get(id) ?? "",
    }));
    agents.sort(compareStaffByFullName);
    return agents;
  });

async function fetchScenarioAssignmentsByAgent(): Promise<AgentAssignmentGroup[]> {
  const { data: rows, error } = await supabaseAdmin
    .from("scenarios")
    .select("scenario_code, assigned_agent_id, wants_contact")
    .not("assigned_agent_id", "is", null)
    .gt("expires_at", new Date().toISOString())
    .order("scenario_code");
  if (error) throw new Error(error.message);

  const agentIds = [
    ...new Set((rows ?? []).map((r) => r.assigned_agent_id).filter(Boolean)),
  ] as string[];
  if (!agentIds.length) return [];

  const [profilesRes, authRes] = await Promise.all([
    supabaseAdmin.from("profiles").select("id, full_name").in("id", agentIds),
    supabaseAdmin.auth.admin.listUsers(),
  ]);
  const profileMap = new Map((profilesRes.data ?? []).map((p) => [p.id, p.full_name ?? ""]));
  const emailMap = new Map((authRes.data?.users ?? []).map((u) => [u.id, u.email ?? ""]));

  const grouped = new Map<string, AgentAssignmentGroup>();
  for (const row of rows ?? []) {
    const agentId = row.assigned_agent_id;
    if (!agentId) continue;
    let group = grouped.get(agentId);
    if (!group) {
      group = {
        agentName: profileMap.get(agentId) ?? "",
        agentEmail: emailMap.get(agentId) ?? "",
        scenarios: [],
      };
      grouped.set(agentId, group);
    }
    group.scenarios.push({
      scenarioCode: row.scenario_code,
      wantsContact: !!row.wants_contact,
    });
  }

  return [...grouped.values()].sort((a, b) =>
    compareStaffByDisplayName(a.agentName || a.agentEmail || "", b.agentName || b.agentEmail || ""),
  );
}

export const assignAgent = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        scenario_id: z.string().uuid(),
        agent_id: z.string().uuid().nullable(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await verifyAdmin(context.userId);

    const { data: before, error: loadErr } = await supabaseAdmin
      .from("scenarios")
      .select("scenario_code, assigned_agent_id")
      .eq("id", data.scenario_id)
      .maybeSingle();
    if (loadErr) throw new Error(loadErr.message);
    if (!before) throw new Error("Scenario not found");

    if (data.agent_id) {
      const { data: agentRole } = await supabaseAdmin
        .from("user_roles")
        .select("role")
        .eq("user_id", data.agent_id)
        .eq("role", "agent")
        .maybeSingle();
      if (!agentRole) throw new Error("Target user is not an agent");
    }

    const { error: updateErr } = await supabaseAdmin
      .from("scenarios")
      .update({ assigned_agent_id: data.agent_id })
      .eq("id", data.scenario_id);
    if (updateErr) throw new Error(updateErr.message);

    let agentName: string | null = null;
    if (data.agent_id) {
      agentName = await resolveAgentDisplayName(data.agent_id);
    }
    if (before.scenario_code) {
      await syncLeadCertificatesAgentForScenario({
        scenarioCode: before.scenario_code,
        agentId: data.agent_id,
        agentName,
      });
    }

    const { error: auditErr } = await supabaseAdmin.from("audit_logs").insert({
      user_id: context.userId,
      action: "ASSIGN_AGENT",
      entity_type: "scenario",
      entity_id: data.scenario_id,
      metadata: { agent_id: data.agent_id, scenario_code: before.scenario_code } as never,
    });
    if (auditErr) console.error("[admin] ASSIGN_AGENT audit log failed", auditErr.message);

    if (!data.agent_id || !before.scenario_code) {
      return { ok: true as const };
    }

    const siteUrl = APP_URL;
    const scenarioCode = before.scenario_code;
    let agentEmail = "";

    try {
      const [{ data: agentAuth }, { data: profile }] = await Promise.all([
        supabaseAdmin.auth.admin.getUserById(data.agent_id),
        supabaseAdmin.from("profiles").select("full_name").eq("id", data.agent_id).maybeSingle(),
      ]);
      agentEmail = agentAuth?.user?.email ?? "";
      if (!agentName) {
        agentName = profile?.full_name ?? agentEmail;
      }

      if (agentEmail) {
        await sendTransactionalTemplates({
          templateName: "agent-assignment",
          recipientEmail: agentEmail,
          templateData: {
            agentName: agentName || agentEmail,
            scenarioCode,
            scenarioUrl: `${siteUrl}/agent/scenario/${encodeURIComponent(scenarioCode)}`,
          },
          idempotencyKey: `agent-assignment-${data.scenario_id}-${data.agent_id}-${Date.now()}`,
        });
      }
    } catch (e) {
      console.error("[admin] agent-assignment email failed", e);
    }

    try {
      const [{ data: actorProfile }, assignmentsByAgent] = await Promise.all([
        supabaseAdmin.from("profiles").select("full_name").eq("id", context.userId).maybeSingle(),
        fetchScenarioAssignmentsByAgent(),
      ]);
      const { data: actorAuth } = await supabaseAdmin.auth.admin.getUserById(context.userId);
      const assignedBy = actorProfile?.full_name || actorAuth?.user?.email || "Administrator";

      await notifyAdminInboxes({
        templateName: "scenario-assignment-admin",
        idempotencyPrefix: `scenario-assignment-admin-${data.scenario_id}-${data.agent_id}`,
        templateData: {
          scenarioCode,
          agentName: agentName || agentEmail || "Assigned agent",
          agentEmail,
          assignedBy,
          adminUrl: `${siteUrl}/admin`,
          assignmentsByAgent,
        },
      });
    } catch (e) {
      console.error("[admin] scenario-assignment-admin email failed", e);
    }

    return { ok: true as const };
  });

export const getUserReportData = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    await verifyAdmin(context.userId);

    const users = await listAllAuthUsers();
    const userIds = users.map((u) => u.id);
    if (userIds.length === 0) return [];

    const [profiles, rolesRows, creditsRows, emailLogsRes, testResultsRes] = await Promise.all([
      fetchRowsInChunks(userIds, (chunk) =>
        supabaseAdmin
          .from("profiles")
          .select("id, full_name, npn_number, qa_devices")
          .in("id", chunk),
      ),
      fetchRowsInChunks(userIds, (chunk) =>
        supabaseAdmin.from("user_roles").select("user_id, role").in("user_id", chunk),
      ),
      fetchRowsInChunks(userIds, (chunk) =>
        supabaseAdmin.from("advisor_credits").select("advisor_id, balance").in("advisor_id", chunk),
      ),
      supabaseAdmin
        .from("email_send_log")
        .select("recipient_email, template_name, status, error_message, created_at")
        .order("created_at", { ascending: false }),
      supabaseAdmin
        .from("test_results")
        .select("test_id, status, assignee"),
    ]);

    const profileMap = new Map(profiles.map((p) => [p.id, p]));
    const rolesMap = new Map<string, string[]>();
    for (const r of rolesRows) {
      const arr = rolesMap.get(r.user_id) ?? [];
      arr.push(r.role);
      rolesMap.set(r.user_id, arr);
    }
    const creditMap = new Map(creditsRows.map((c) => [c.advisor_id, c.balance]));

    const emailLogsMap = new Map<string, Array<{ template_name: string; status: string; created_at: string; error_message: string | null }>>();
    for (const log of emailLogsRes.data ?? []) {
      const email = (log.recipient_email ?? "").trim().toLowerCase();
      if (!email) continue;
      const list = emailLogsMap.get(email) ?? [];
      list.push({
        template_name: log.template_name,
        status: log.status,
        created_at: log.created_at,
        error_message: log.error_message,
      });
      emailLogsMap.set(email, list);
    }

    function assigneeMatches(label: string | null | undefined, name: string): boolean {
      if (!label?.trim()) return false;
      const first = label.trim().split(/\s+/)[0] || label;
      return first.toLowerCase() === name.split(/\s+/)[0]?.toLowerCase();
    }

    const reportData = [];
    for (const u of users) {
      const email = (u.email ?? "").trim().toLowerCase();
      const p = profileMap.get(u.id);
      const fullName = p?.full_name ?? "";
      const roles = rolesMap.get(u.id) ?? ["advisor"];
      const isQA = roles.includes("qa");
      const assigneeLabel = fullName.split(/\s+/)[0] || "";

      let assignedTests: Array<{ id: string; status: string; title: string }> = [];
      if (isQA && assigneeLabel) {
        const { TEST_CASES } = await import("@/lib/test-plan");
        const byId = new Map<string, string>();
        for (const row of testResultsRes.data ?? []) {
          if (assigneeMatches(row.assignee, assigneeLabel)) {
            byId.set(row.test_id, row.status ?? "not_run");
          }
        }
        for (const t of TEST_CASES) {
          if (t.assignee && assigneeMatches(t.assignee, assigneeLabel) && !byId.has(t.id)) {
            byId.set(t.id, "not_run");
          }
        }
        assignedTests = [...byId.entries()].map(([id, status]) => {
          const match = TEST_CASES.find((tc) => tc.id === id);
          return {
            id,
            status,
            title: match?.title ?? id,
          };
        }).sort((a, b) => a.id.localeCompare(b.id));
      }

      reportData.push({
        id: u.id,
        email: u.email ?? "",
        full_name: fullName,
        npn_number: p?.npn_number ?? "",
        qa_devices: (p?.qa_devices ?? []) as string[],
        role: roles[0] || "advisor",
        roles,
        credits: creditMap.get(u.id) ?? 0,
        disabled: !!(u as unknown as { banned_until?: string | null }).banned_until,
        email_confirmed: !!(u as unknown as { email_confirmed_at?: string | null }).email_confirmed_at,
        created_at: u.created_at,
        last_sign_in_at: u.last_sign_in_at ?? null,
        emailLogs: emailLogsMap.get(email) ?? [],
        assignedTests,
      });
    }

    reportData.sort(compareStaffByFullName);
    return reportData;
  });
