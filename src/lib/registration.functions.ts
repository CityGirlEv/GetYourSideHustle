import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { getEnvVariable } from "@/lib/env";
import { z } from "zod";
import { buildNdaPdf, NDA_VERSION } from "./nda";
import {
  notifyAdminInboxes,
  publicSiteUrl,
  sendTransactionalTemplates,
} from "@/lib/send-transactional-template.server";
import {
  mergeQaDevices,
  registrationRoleLabel,
  roleAlreadyRegistered,
  type BetaRegistrationRole,
} from "@/lib/registration.server";
import { ACCOUNT_STATUS_PENDING } from "@/lib/auth-sign-in.server";
import { markPasswordConfirmed } from "@/lib/password-status.server";

export { DEFAULT_ADMIN_NOTIFICATION_EMAILS } from "@/lib/admin-notification-emails";

function assertNewUserPassword(password: string, passwordConfirm: string) {
  if (!password || password.length < 12) {
    throw new Error("Password must be at least 12 characters.");
  }
  if (password !== passwordConfirm) {
    throw new Error("Passwords do not match.");
  }
}

async function sendRegistrationNotification(opts: {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  requestedRole: string;
  qaDevices?: string[];
  additionalRole?: boolean;
  existingRoles?: string[];
}) {
  if (!getEnvVariable("SUPABASE_SERVICE_ROLE_KEY")) {
    console.warn("[registration] notification skipped — missing service role key");
    return;
  }
  const result = await notifyAdminInboxes({
    templateName: "new-registration-admin",
    idempotencyPrefix: opts.additionalRole
      ? `new-registration-${opts.userId}-${opts.requestedRole}`
      : `new-registration-${opts.userId}`,
    templateData: {
      firstName: opts.firstName,
      lastName: opts.lastName,
      email: opts.email,
      phone: opts.phone,
      requestedRole: opts.requestedRole,
      qaDevices: opts.qaDevices ?? [],
      additionalRole: opts.additionalRole ?? false,
      existingRoles: opts.existingRoles ?? [],
    },
  });
  console.log("[registration] admin notification emails", result);
}

async function sendQaRegistrationConfirmation(opts: {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  qaDevices?: string[];
}) {
  if (!getEnvVariable("SUPABASE_SERVICE_ROLE_KEY")) {
    console.warn("[registration] QA confirmation email skipped — missing service role key");
    return;
  }
  const siteUrl = publicSiteUrl().replace(/\/$/, "");
  const result = await sendTransactionalTemplates({
    templateName: "qa-registration-confirmation",
    recipientEmail: opts.email,
    templateData: {
      firstName: opts.firstName,
      lastName: opts.lastName,
      email: opts.email,
      qaDevices: opts.qaDevices ?? [],
      signInUrl: `${siteUrl}/auth?tab=sign-in`,
      qaManualUrl: `${siteUrl}/qa-manual`,
      testingUrl: `${siteUrl}/testing`,
    },
    idempotencyKey: `qa-registration-confirmation-${opts.userId}`,
  });
  console.log("[registration] QA confirmation email", result);
}

async function sendAgentRegistrationConfirmation(opts: {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
}) {
  if (!getEnvVariable("SUPABASE_SERVICE_ROLE_KEY")) {
    console.warn("[registration] agent confirmation email skipped — missing service role key");
    return;
  }
  const siteUrl = publicSiteUrl().replace(/\/$/, "");
  const result = await sendTransactionalTemplates({
    templateName: "agent-registration-confirmation",
    recipientEmail: opts.email,
    templateData: {
      firstName: opts.firstName,
      lastName: opts.lastName,
      email: opts.email,
      signInUrl: `${siteUrl}/auth?tab=sign-in`,
    },
    idempotencyKey: `agent-registration-confirmation-${opts.userId}`,
  });
  console.log("[registration] agent confirmation email", result);
}

async function ensureBucketExists(bucketName: string, isPublic = false) {
  try {
    const { data: buckets, error: listError } = await supabaseAdmin.storage.listBuckets();
    if (listError) {
      console.error(`[Storage] Failed to list buckets: ${listError.message}`);
      return;
    }
    const exists = buckets.some((b) => b.id === bucketName);
    if (!exists) {
      console.log(`[Storage] Creating bucket "${bucketName}"...`);
      const { error: createError } = await supabaseAdmin.storage.createBucket(bucketName, {
        public: isPublic,
        allowedMimeTypes: bucketName === "nda-signatures" ? ["application/pdf"] : undefined,
      });
      if (createError) {
        console.error(`[Storage] Failed to create bucket "${bucketName}": ${createError.message}`);
      } else {
        console.log(`[Storage] Bucket "${bucketName}" created successfully.`);
      }
    }
  } catch (err) {
    console.error(`[Storage] Error ensuring bucket "${bucketName}" exists:`, err);
  }
}

type RegistrationPayload = {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  signature_name: string;
  requested_role: BetaRegistrationRole;
  user_agent?: string | null;
  qa_devices?: string[] | null;
};

function isAuthUserDisabled(user: { banned_until?: string | null } | null | undefined): boolean {
  return !!user?.banned_until;
}

async function findUserByEmail(email: string) {
  const { data: existing } = await supabaseAdmin.auth.admin.listUsers();
  return (
    (existing?.users ?? []).find((u) => u.email?.toLowerCase() === email.toLowerCase()) ?? null
  );
}

async function persistNdaSignature(userId: string, data: RegistrationPayload) {
  const signedAt = new Date();
  const pdf = buildNdaPdf({
    fullName: data.signature_name.trim(),
    email: data.email,
    signedAt,
    agreementVersion: NDA_VERSION,
    userAgent: data.user_agent ?? null,
  });
  const arrayBuf = pdf.output("arraybuffer");
  const bytes = new Uint8Array(arrayBuf);
  const path = `${userId}/${NDA_VERSION}-${signedAt.getTime()}.pdf`;

  await ensureBucketExists("nda-signatures", false);
  await ensureBucketExists("test-evidence", false);

  const up = await supabaseAdmin.storage
    .from("nda-signatures")
    .upload(path, bytes, { contentType: "application/pdf", upsert: false });
  if (up.error) throw up.error;

  const ins = await supabaseAdmin.from("nda_signatures").insert({
    user_id: userId,
    full_name: data.signature_name.trim(),
    email: data.email,
    agreement_version: NDA_VERSION,
    pdf_path: path,
    user_agent: data.user_agent ?? null,
  });
  if (ins.error) throw ins.error;
}

async function upsertRegistrationProfile(
  userId: string,
  data: RegistrationPayload,
  fullName: string,
  existingQaDevices?: string[] | null,
) {
  const profilePatch: {
    id: string;
    full_name: string;
    phone: string;
    qa_devices?: string[] | null;
  } = {
    id: userId,
    full_name: fullName,
    phone: data.phone,
  };

  if (data.requested_role === "qa") {
    profilePatch.qa_devices = mergeQaDevices(existingQaDevices, data.qa_devices ?? []);
  } else if (existingQaDevices === undefined) {
    profilePatch.qa_devices = null;
  }

  const { error } = await supabaseAdmin.from("profiles").upsert(profilePatch);
  if (error) throw error;
}

async function addRoleToExistingUser(
  userId: string,
  data: RegistrationPayload,
  fullName: string,
  existingRoles: string[],
) {
  if (roleAlreadyRegistered(existingRoles, data.requested_role)) {
    throw new Error(
      `You already registered as ${registrationRoleLabel(data.requested_role)} with this email. Sign in to your account.`,
    );
  }

  const { data: profile } = await supabaseAdmin
    .from("profiles")
    .select("qa_devices")
    .eq("id", userId)
    .maybeSingle();

  await upsertRegistrationProfile(userId, data, fullName, (profile?.qa_devices ?? []) as string[]);

  const { error: roleErr } = await supabaseAdmin
    .from("user_roles")
    .upsert({ user_id: userId, role: data.requested_role }, { onConflict: "user_id,role" });
  if (roleErr) throw roleErr;

  await persistNdaSignature(userId, data);
}

async function createNewRegistrationUser(
  data: RegistrationPayload,
  fullName: string,
  password: string,
) {
  const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
    email: data.email,
    password,
    email_confirm: true,
    user_metadata: { full_name: fullName, phone: data.phone },
    app_metadata: { account_status: ACCOUNT_STATUS_PENDING },
    ban_duration: "876000h",
  } as unknown as {
    email: string;
    password: string;
    email_confirm: boolean;
    user_metadata: Record<string, string>;
    app_metadata: Record<string, string>;
    ban_duration: string;
  });
  if (createErr || !created.user) {
    throw new Error(createErr?.message ?? "Failed to create account");
  }

  const userId = created.user.id;

  try {
    await upsertRegistrationProfile(userId, data, fullName, undefined);
    await markPasswordConfirmed(userId);
    const { error: roleErr } = await supabaseAdmin
      .from("user_roles")
      .insert({ user_id: userId, role: data.requested_role });
    if (roleErr) throw roleErr;
    await persistNdaSignature(userId, data);
  } catch (e) {
    await supabaseAdmin.auth.admin.deleteUser(userId).catch(() => {});
    throw e instanceof Error ? e : new Error("Registration failed");
  }

  return userId;
}

async function notifyRegistrationComplete(opts: {
  userId: string;
  data: RegistrationPayload;
  fullName: string;
  roleAdded: boolean;
  existingRoles: string[];
  accountDisabled: boolean;
}) {
  const { userId, data, fullName, roleAdded, existingRoles, accountDisabled } = opts;

  await sendRegistrationNotification({
    userId,
    firstName: data.first_name,
    lastName: data.last_name,
    email: data.email,
    phone: data.phone,
    requestedRole: data.requested_role,
    qaDevices: data.requested_role === "qa" ? (data.qa_devices ?? []) : [],
    additionalRole: roleAdded,
    existingRoles: roleAdded ? existingRoles : [],
  });

  if (data.requested_role === "qa") {
    await sendQaRegistrationConfirmation({
      userId,
      firstName: data.first_name,
      lastName: data.last_name,
      email: data.email,
      qaDevices: data.qa_devices ?? [],
    });
  } else if (data.requested_role === "agent") {
    await sendAgentRegistrationConfirmation({
      userId,
      firstName: data.first_name,
      lastName: data.last_name,
      email: data.email,
    });
  }

  try {
    const title = roleAdded
      ? `Additional beta role — ${data.first_name} ${data.last_name}`
      : `New beta registration — ${data.first_name} ${data.last_name}`;
    const body = roleAdded
      ? `${data.email} · ${data.phone} · added role: ${data.requested_role} (existing: ${existingRoles.join(", ") || "none"}).`
      : `${data.email} · ${data.phone} · requested role: ${data.requested_role}. Account is disabled until you approve it in the Admin → Staff tab.`;
    await supabaseAdmin.from("admin_notifications").insert({
      kind: "new_registration",
      title,
      body,
      metadata: {
        user_id: userId,
        email: data.email,
        phone: data.phone,
        requested_role: data.requested_role,
        full_name: fullName,
        qa_devices: data.requested_role === "qa" ? (data.qa_devices ?? []) : [],
        role_added: roleAdded,
        existing_roles: existingRoles,
        account_disabled: accountDisabled,
      },
    });
  } catch (e) {
    console.error("[registration] admin notification insert failed", e);
  }
}

export const registerWithNda = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        first_name: z.string().trim().min(1).max(100),
        last_name: z.string().trim().min(1).max(100),
        email: z.string().trim().email().max(255),
        phone: z.string().trim().min(7).max(40),
        signature_name: z.string().trim().min(3).max(255),
        accept_nda: z.literal(true),
        requested_role: z.enum(["qa", "agent"]),
        user_agent: z.string().max(1024).optional().nullable(),
        qa_devices: z.array(z.string().trim().min(1).max(80)).max(20).optional().nullable(),
        password: z.string().min(12).max(128),
        password_confirm: z.string().min(12).max(128),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const fullName = `${data.first_name} ${data.last_name}`.trim();
    const payload: RegistrationPayload = {
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      phone: data.phone,
      signature_name: data.signature_name,
      requested_role: data.requested_role,
      user_agent: data.user_agent,
      qa_devices: data.qa_devices,
    };

    const existingUser = await findUserByEmail(data.email);
    let userId: string;
    let roleAdded = false;
    let existingRoles: string[] = [];
    let accountDisabled = true;

    if (existingUser) {
      userId = existingUser.id;
      accountDisabled = isAuthUserDisabled(
        existingUser as unknown as { banned_until?: string | null },
      );

      const { data: roleRows, error: rolesErr } = await supabaseAdmin
        .from("user_roles")
        .select("role")
        .eq("user_id", userId);
      if (rolesErr) throw new Error(rolesErr.message);

      existingRoles = (roleRows ?? []).map((row) => row.role);
      await addRoleToExistingUser(userId, payload, fullName, existingRoles);
      roleAdded = true;
    } else {
      assertNewUserPassword(data.password, data.password_confirm);
      userId = await createNewRegistrationUser(payload, fullName, data.password!);
    }

    await notifyRegistrationComplete({
      userId,
      data: payload,
      fullName,
      roleAdded,
      existingRoles,
      accountDisabled,
    });

    return { ok: true, role_added: roleAdded, account_disabled: accountDisabled };
  });
