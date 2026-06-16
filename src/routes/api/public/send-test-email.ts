import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { getEnvVariable } from "@/lib/env";
import * as React from "react";
import { render } from "@react-email/components";
import { TEMPLATES } from "@/lib/email-templates/registry";
import { ALL_TEMPLATES, findTemplate } from "@/lib/email-templates/all-templates.server";
import { getEmailTemplateOverride } from "@/lib/email-templates/overrides.server";
import { ensureEmailBranding } from "@/lib/email-templates/email-branding.server";
import { resolveTemplateContent } from "@/lib/email-templates/template-merge.server";
import {
  AUTH_TEMPLATE_NAMES,
  getAuthTemplateTestData,
} from "@/lib/email-templates/template-sample-props.server";
import {
  getTransactionalFromAddress,
  getTransactionalSenderDomain,
} from "@/lib/send-transactional-email";
import { triggerEmailQueueProcess } from "@/lib/trigger-email-queue-process";
import { getAdminBccEmails } from "@/lib/admin-notification-emails";

function generateUnsubscribeToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function getOrCreateUnsubscribeToken(email: string): Promise<string> {
  const normalized = email.toLowerCase();
  const { data: existing } = await supabaseAdmin
    .from("email_unsubscribe_tokens")
    .select("token, used_at")
    .eq("email", normalized)
    .maybeSingle();
  if (existing?.token && !existing.used_at) return existing.token;
  const token = generateUnsubscribeToken();
  await supabaseAdmin
    .from("email_unsubscribe_tokens")
    .upsert({ token, email: normalized }, { onConflict: "email", ignoreDuplicates: true });
  const { data: stored } = await supabaseAdmin
    .from("email_unsubscribe_tokens")
    .select("token")
    .eq("email", normalized)
    .maybeSingle();
  if (!stored?.token) throw new Error("Failed to create unsubscribe token");
  return stored.token;
}

function adminBccRecipients(): string[] {
  return getAdminBccEmails();
}

export function allTestTemplateNames(): string[] {
  const names = new Set(ALL_TEMPLATES.map((t) => t.name));
  for (const name of Object.keys(TEMPLATES)) {
    names.add(name);
  }
  return Array.from(names).sort();
}

type ResolvedTemplate = {
  templateName: string;
  component: React.ComponentType<any>;
  previewData: Record<string, unknown>;
  resolveSubject: (data: Record<string, unknown>) => string;
};

function resolveTestTemplate(templateName: string): ResolvedTemplate | null {
  const registryEntry = TEMPLATES[templateName];
  const descriptor = findTemplate(templateName);
  if (!registryEntry && !descriptor) return null;

  const component = registryEntry?.component ?? descriptor!.component;
  const previewData = (registryEntry?.previewData ?? descriptor?.sampleProps ?? {}) as Record<
    string,
    unknown
  >;

  const resolveSubject = (data: Record<string, unknown>) => {
    if (registryEntry?.subject) {
      return typeof registryEntry.subject === "function"
        ? registryEntry.subject(data)
        : registryEntry.subject;
    }
    return descriptor?.defaultSubject ?? `[TEST] ${templateName}`;
  };

  return { templateName, component, previewData, resolveSubject };
}

export type SendOneTestEmailResult =
  | { ok: true; messageId: string; templateName: string; recipient: string }
  | { ok: false; templateName: string; error: string };

export async function sendOneTestEmail(
  templateName: string,
  recipient: string,
  opts?: { skipAdminBcc?: boolean },
): Promise<SendOneTestEmailResult> {
  const resolved = resolveTestTemplate(templateName);
  if (!resolved) {
    return { ok: false, templateName, error: `Template '${templateName}' not found` };
  }

  const messageId = crypto.randomUUID();
  const templateData = AUTH_TEMPLATE_NAMES.has(templateName)
    ? getAuthTemplateTestData(templateName, recipient)
    : resolved.previewData;
  const element = React.createElement(resolved.component, templateData);
  const renderedHtml = await render(element);
  const renderedText = await render(element, { plainText: true });
  const renderedSubject = resolved.resolveSubject(templateData);

  const override = await getEmailTemplateOverride(templateName);
  const merged = resolveTemplateContent({
    templateName,
    templateData,
    renderedHtml,
    renderedText,
    renderedSubject,
    override,
  });
  let html = merged.html;
  let plainText = merged.text;
  let subject = merged.subject;

  const unsubscribeToken = await getOrCreateUnsubscribeToken(recipient);
  const siteUrl =
    (resolved.previewData.siteUrl as string | undefined) ??
    getEnvVariable("PUBLIC_SITE_URL") ??
    "https://mypartb.pages.dev";
  html = await ensureEmailBranding(html, { siteUrl, unsubscribeToken });

  await supabaseAdmin.from("email_send_log").insert({
    message_id: messageId,
    template_name: templateName,
    recipient_email: recipient,
    status: "pending",
  });

  const { error: enqueueError } = await supabaseAdmin.rpc("enqueue_email", {
    queue_name: "transactional_emails",
    payload: {
      message_id: messageId,
      to: recipient,
      from: getTransactionalFromAddress(),
      sender_domain: getTransactionalSenderDomain(),
      subject,
      html,
      text: plainText,
      purpose: "transactional",
      label: templateName,
      idempotency_key: messageId,
      unsubscribe_token: unsubscribeToken,
      queued_at: new Date().toISOString(),
    },
  });

  if (enqueueError) {
    await supabaseAdmin.from("email_send_log").insert({
      message_id: messageId,
      template_name: templateName,
      recipient_email: recipient,
      status: "failed",
      error_message: `Enqueue failed: ${enqueueError.message}`,
    });
    return { ok: false, templateName, error: `Failed to enqueue email: ${enqueueError.message}` };
  }

  try {
    const admins = adminBccRecipients();
    const isAdminTemplate = templateName.endsWith("-admin");
    const normalizedRecipient = recipient.toLowerCase();
    if (!opts?.skipAdminBcc && !isAdminTemplate) {
      for (const adminEmail of admins) {
        if (!adminEmail || adminEmail === normalizedRecipient) continue;
        const adminToken = await getOrCreateUnsubscribeToken(adminEmail);
        const bccMessageId = crypto.randomUUID();
        await supabaseAdmin.from("email_send_log").insert({
          message_id: bccMessageId,
          template_name: `${templateName} (bcc)`,
          recipient_email: adminEmail,
          status: "pending",
        });
        const { error: bccErr } = await supabaseAdmin.rpc("enqueue_email", {
          queue_name: "transactional_emails",
          payload: {
            message_id: bccMessageId,
            to: adminEmail,
            from: getTransactionalFromAddress(),
            sender_domain: getTransactionalSenderDomain(),
            subject: `[BCC] ${subject}`,
            html,
            text: plainText,
            purpose: "transactional",
            label: `${templateName}-bcc`,
            idempotency_key: `${messageId}-bcc-${adminEmail}`,
            unsubscribe_token: adminToken,
            queued_at: new Date().toISOString(),
          },
        });
        if (bccErr) {
          console.error("Failed to enqueue test-email admin BCC", {
            error: bccErr,
            templateName,
          });
        }
      }
    }
  } catch (bccErr) {
    console.error("Test email admin BCC threw", bccErr);
  }

  return { ok: true, messageId, templateName, recipient };
}

/**
 * Public endpoint for sending a test email.
 * Protected by a simple secret query param for abuse prevention.
 */
export const Route = createFileRoute("/api/public/send-test-email")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const url = new URL(request.url);
        const secret = url.searchParams.get("secret");
        const expectedSecret = getEnvVariable("TEST_EMAIL_SECRET");

        if (!expectedSecret) {
          return Response.json(
            { error: "Endpoint disabled: TEST_EMAIL_SECRET is not configured" },
            { status: 503 },
          );
        }
        if (secret !== expectedSecret) {
          return Response.json({ error: "Unauthorized" }, { status: 401 });
        }

        let recipient: string;
        let templateName: string | undefined;
        let sendAll = false;
        try {
          const body = await request.json();
          recipient = body.recipient;
          templateName = body.template;
          sendAll = body.all === true;
        } catch {
          return Response.json({ error: "Invalid JSON" }, { status: 400 });
        }

        if (!recipient || !recipient.includes("@")) {
          return Response.json({ error: "Valid recipient email required" }, { status: 400 });
        }

        if (sendAll) {
          const names = allTestTemplateNames();
          const results: SendOneTestEmailResult[] = [];
          for (const name of names) {
            results.push(await sendOneTestEmail(name, recipient, { skipAdminBcc: true }));
            await new Promise((r) => setTimeout(r, 250));
          }
          await triggerEmailQueueProcess(request.url);
          const sent = results.filter((r) => r.ok);
          const failed = results.filter((r) => !r.ok);
          return Response.json({
            success: failed.length === 0,
            sent: sent.length,
            failed: failed.length,
            templates: names,
            results,
            recipient,
            note: "Emails queued from noreply@mypartb.com. Requires RESEND_API_KEY for the verified Resend account.",
          });
        }

        const result = await sendOneTestEmail(templateName || "welcome", recipient);
        if (!result.ok) {
          return Response.json({ error: result.error }, { status: 404 });
        }

        await triggerEmailQueueProcess(request.url);

        return Response.json({
          success: true,
          messageId: result.messageId,
          template: result.templateName,
          recipient: result.recipient,
          note: "Email queued from noreply@mypartb.com. Requires RESEND_API_KEY for the verified Resend account.",
        });
      },
    },
  },
});
