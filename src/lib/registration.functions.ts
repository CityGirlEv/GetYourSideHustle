import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { z } from "zod";
import { buildNdaPdf, NDA_VERSION } from "./nda";

function randomPassword(len = 24) {
  const alpha = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%^&*";
  let out = "";
  const arr = new Uint32Array(len);
  crypto.getRandomValues(arr);
  for (let i = 0; i < len; i++) out += alpha[arr[i] % alpha.length];
  return out;
}

async function listAdminEmails(): Promise<string[]> {
  // Get all admin user_ids
  const { data: roles, error: rolesErr } = await supabaseAdmin
    .from("user_roles")
    .select("user_id")
    .eq("role", "admin");
  if (rolesErr || !roles?.length) {
    if (rolesErr) console.error("[registration] failed to load admin roles", rolesErr);
    return [];
  }
  const adminIds = new Set(roles.map((r) => r.user_id));
  // Resolve their emails via auth admin API (paged)
  const emails: string[] = [];
  let page = 1;
  // 1000 users per page is the auth admin default cap
  for (;;) {
    const { data, error } = await supabaseAdmin.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) {
      console.error("[registration] failed to list users", error);
      break;
    }
    for (const u of data?.users ?? []) {
      if (u.email && adminIds.has(u.id)) emails.push(u.email);
    }
    if (!data?.users?.length || data.users.length < 1000) break;
    page += 1;
  }
  return emails;
}

function originFromRequest(): string {
  // Prefer the published Lovable URL; fall back to a sane default.
  return process.env.SITE_ORIGIN
    || process.env.PUBLIC_SITE_URL
    || "https://mypartb.lovable.app";
}

async function sendRegistrationNotification(opts: {
  userId: string;
  firstName: string; lastName: string; email: string; phone: string;
  requestedRole: string; qaDevices?: string[];
}) {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    console.warn("[registration] notification skipped — missing service role key");
    return;
  }
  const admins = await listAdminEmails();
  if (!admins.length) {
    console.warn("[registration] no admin users found to notify");
    return;
  }
  const origin = originFromRequest();
  const templateData = {
    firstName: opts.firstName,
    lastName: opts.lastName,
    email: opts.email,
    phone: opts.phone,
    requestedRole: opts.requestedRole,
    qaDevices: opts.qaDevices ?? [],
  };
  // One email per admin — each admin is a unique recipient expecting this notification.
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
            templateName: "new-registration-admin",
            recipientEmail: recipient,
            idempotencyKey: `new-registration-${opts.userId}-${recipient.toLowerCase()}`,
            templateData,
          }),
        });
        if (!res.ok) {
          console.error("[registration] send failed", res.status, await res.text());
        }
      } catch (e) {
        console.error("[registration] send threw", e);
      }
    }),
  );
}

export const registerWithNda = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z.object({
      first_name: z.string().trim().min(1).max(100),
      last_name: z.string().trim().min(1).max(100),
      email: z.string().trim().email().max(255),
      phone: z.string().trim().min(7).max(40),
      signature_name: z.string().trim().min(3).max(255),
      accept_nda: z.literal(true),
      requested_role: z.enum(["qa", "agent"]),
      user_agent: z.string().max(1024).optional().nullable(),
      qa_devices: z.array(z.string().trim().min(1).max(80)).max(20).optional().nullable(),
    }).parse(input)
  )
  .handler(async ({ data }) => {
    const fullName = `${data.first_name} ${data.last_name}`.trim();
    const password = randomPassword(24);

    // Reject if user already exists
    const { data: existing } = await supabaseAdmin.auth.admin.listUsers();
    if ((existing?.users ?? []).some((u) => u.email?.toLowerCase() === data.email.toLowerCase())) {
      throw new Error("An account with this email already exists. Try signing in or use a different email.");
    }

    // Create the user — confirmed (so admin can simply un-ban) but banned (disabled) until admin approves.
    const { data: created, error: createErr } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password,
      email_confirm: true,
      user_metadata: { full_name: fullName, phone: data.phone },
      ban_duration: "876000h",
    } as unknown as { email: string; password: string; email_confirm: boolean; user_metadata: Record<string, string>; ban_duration: string });
    if (createErr || !created.user) {
      throw new Error(createErr?.message ?? "Failed to create account");
    }
    const userId = created.user.id;

    try {
      // Ensure profile + role (trigger should fire, but make sure)
      const qaDevices = data.requested_role === "qa" ? (data.qa_devices ?? []) : null;
      await supabaseAdmin.from("profiles").upsert({
        id: userId,
        full_name: fullName,
        phone: data.phone,
        qa_devices: qaDevices,
      });
      await supabaseAdmin.from("user_roles").delete().eq("user_id", userId);
      await supabaseAdmin.from("user_roles").insert({ user_id: userId, role: data.requested_role });

      // Generate + store NDA PDF
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
    } catch (e) {
      // Roll back the auth user so the email can try again
      await supabaseAdmin.auth.admin.deleteUser(userId).catch(() => {});
      throw e instanceof Error ? e : new Error("Registration failed");
    }

    // Notify approvers (don't fail registration if email delivery fails)
    await sendRegistrationNotification({
      userId,
      firstName: data.first_name,
      lastName: data.last_name,
      email: data.email,
      phone: data.phone,
      requestedRole: data.requested_role,
      qaDevices: data.requested_role === "qa" ? (data.qa_devices ?? []) : [],
    });

    // In-app admin notification (always works, no email required)
    try {
      await supabaseAdmin.from("admin_notifications").insert({
        kind: "new_registration",
        title: `New beta registration — ${data.first_name} ${data.last_name}`,
        body: `${data.email} · ${data.phone} · requested role: ${data.requested_role}. Account is disabled until you approve it in the Admin → Staff tab.`,
        metadata: {
          user_id: userId,
          email: data.email,
          phone: data.phone,
          requested_role: data.requested_role,
          full_name: fullName,
          qa_devices: data.requested_role === "qa" ? (data.qa_devices ?? []) : [],
        },
      });
    } catch (e) {
      console.error("[registration] admin notification insert failed", e);
    }

    return { ok: true };
  });