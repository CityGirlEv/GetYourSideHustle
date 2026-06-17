import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { z } from "zod";
import { sendAssignmentEmailsToAssignees } from "@/lib/qa-test-assignment.functions";
import { dedupeEmailLogRows } from "@/lib/email-log-sort";
import { resolveRecipientDisplays } from "@/lib/email-recipient-names.server";

async function verifyAdmin(userId: string) {
  const { data: callerRoles } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId);
  if (!(callerRoles ?? []).some((r) => r.role === "admin")) {
    throw new Error("Admin access required");
  }
}

export type StaffEmailLogEntry = {
  id: string;
  template_name: string;
  recipient_email: string;
  recipient_name: string;
  status: string;
  error_message: string | null;
  created_at: string;
};

export type StaffEmailTemplateGroup = {
  templateName: string;
  displayName: string;
  entries: StaffEmailLogEntry[];
};

const TEMPLATE_LABELS: Record<string, string> = {
  "beta-test-assignment": "Beta test assignment",
  "beta-test-unassigned": "Beta test unassigned",
  "beta-test-dev-note": "Beta test dev note",
  "qa-registration-confirmation": "QA registration",
  "qa-daily-summary-admin": "QA daily summary (admin)",
  "account-enabled-admin": "Account enabled (admin)",
  "account-enabled": "Account enabled",
  welcome: "Welcome",
};

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function templateDisplayName(name: string): string {
  if (UUID_RE.test(name)) return "Email send";
  return TEMPLATE_LABELS[name] ?? name.replace(/-/g, " ");
}

export const listStaffEmailHistory = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        recipientEmail: z.string().email(),
        limit: z.number().int().min(1).max(100).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }): Promise<StaffEmailTemplateGroup[]> => {
    await verifyAdmin(context.userId);
    const limit = data.limit ?? 40;
    const email = data.recipientEmail.trim().toLowerCase();
    const { data: rows, error } = await supabaseAdmin
      .from("email_send_log")
      .select("id, message_id, template_name, status, error_message, created_at, recipient_email")
      .order("created_at", { ascending: false })
      .limit(limit * 3);
    if (error) throw new Error(error.message);

    const deduped = dedupeEmailLogRows(
      (rows ?? []).filter((r) => (r.recipient_email ?? "").trim().toLowerCase() === email),
    ).slice(0, limit);

    const displayByRaw = await resolveRecipientDisplays(
      deduped.map((row) => row.recipient_email),
    );

    const byTemplate = new Map<string, StaffEmailLogEntry[]>();
    for (const row of deduped) {
      const key = row.template_name;
      const list = byTemplate.get(key) ?? [];
      const recipient = displayByRaw.get(row.recipient_email) ?? {
        recipient_name: row.recipient_email,
        recipient_email: row.recipient_email,
      };
      list.push({
        id: row.id,
        template_name: row.template_name,
        recipient_email: recipient.recipient_email,
        recipient_name: recipient.recipient_name,
        status: row.status,
        error_message: row.error_message,
        created_at: row.created_at,
      });
      byTemplate.set(key, list);
    }

    return [...byTemplate.entries()]
      .map(([templateName, entries]) => ({
        templateName,
        displayName: templateDisplayName(templateName),
        entries,
      }))
      .sort((a, b) => {
        const aLatest = a.entries[0]?.created_at ?? "";
        const bLatest = b.entries[0]?.created_at ?? "";
        return bLatest.localeCompare(aLatest);
      });
  });

/** Manually send beta-test-assignment roster emails (admin-triggered only). */
export const sendStaffAssignmentEmails = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        assignees: z.array(z.string().min(1).max(80)).min(1).max(50),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await verifyAdmin(context.userId);
    return sendAssignmentEmailsToAssignees(data.assignees);
  });

import { sendTransactionalTemplates, publicSiteUrl } from "@/lib/send-transactional-template.server";

export const sendTemplateToUser = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        recipientEmail: z.string().email(),
        templateName: z.string().min(1).max(120),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    await verifyAdmin(context.userId);
    const email = data.recipientEmail.trim().toLowerCase();
    const templateName = data.templateName;

    // Fetch user details to enrich template data
    const { data: authList } = await supabaseAdmin.auth.admin.listUsers();
    const targetUser = (authList?.users ?? []).find(
      (u) => (u.email ?? "").toLowerCase() === email,
    );
    let fullName = "";
    if (targetUser) {
      const { data: prof } = await supabaseAdmin
        .from("profiles")
        .select("full_name")
        .eq("id", targetUser.id)
        .maybeSingle();
      fullName = prof?.full_name ?? (targetUser.user_metadata?.full_name as string) ?? "";
    }

    const first = fullName.trim().split(/\s+/)[0] || "";
    const testerName = first.charAt(0).toUpperCase() + first.slice(1);

    const siteUrl = publicSiteUrl().replace(/\/$/, "");
    const loginUrl = `${siteUrl}/auth?tab=sign-in`;
    const testingUrl = `${siteUrl}/testing`;

    const templateData: Record<string, unknown> = {
      testerName: testerName || undefined,
      recipientName: fullName || undefined,
      fullName: fullName || undefined,
      email,
      recipient: email,
      loginUrl,
      testingUrl,
      signInUrl: loginUrl,
      forgotPasswordUrl: loginUrl,
    };

    if (templateName === "welcome") {
      templateData.recipientName = fullName || undefined;
      templateData.signInUrl = `${siteUrl}/auth?tab=sign-in`;
      templateData.forgotPasswordUrl = `${siteUrl}/auth?tab=sign-in`;
    }
    if (templateName === "beta-test-assignment") {
      templateData.newTests = [];
      templateData.assignedTests = [];
    }
    if (templateName === "beta-test-unassigned") {
      templateData.removedTests = [];
      templateData.assignedTests = [];
    }

    const idempotencyKey = `manual-${templateName}-${email}-${Date.now()}`;

    const result = await sendTransactionalTemplates({
      templateName,
      recipientEmail: email,
      templateData,
      idempotencyKey,
    });

    return { ok: result.queued > 0, queued: result.queued };
  });
