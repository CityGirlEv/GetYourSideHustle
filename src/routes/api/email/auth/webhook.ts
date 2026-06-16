import * as React from "react";
import { render } from "@react-email/components";
import {
  parseEmailWebhookPayload,
  WebhookError,
  verifyWebhookRequest,
} from "@/lib/email/webhook-verify";
import { getAuthEmailWebhookSecret } from "@/lib/email/webhook-secret";
import { createClient } from "@supabase/supabase-js";
import { createFileRoute } from "@tanstack/react-router";
import { SignupEmail } from "@/lib/email-templates/signup";
import { InviteEmail } from "@/lib/email-templates/invite";
import { MagicLinkEmail } from "@/lib/email-templates/magic-link";
import { RecoveryEmail } from "@/lib/email-templates/recovery";
import { EmailChangeEmail } from "@/lib/email-templates/email-change";
import { ReauthenticationEmail } from "@/lib/email-templates/reauthentication";
import { getEmailTemplateOverride } from "@/lib/email-templates/overrides.server";
import { ensureEmailBranding } from "@/lib/email-templates/email-branding.server";
import { resolveTemplateContent } from "@/lib/email-templates/template-merge.server";
import {
  getTransactionalFromAddress,
  getTransactionalSenderDomain,
} from "@/lib/send-transactional-email";
import { enqueueAdminEmailCopies } from "@/lib/dispatch-transactional-template.server";
import { triggerEmailQueueProcess } from "@/lib/trigger-email-queue-process";
import { brandRecoveryConfirmationUrl } from "@/lib/auth-recovery";
import { publicSiteUrl } from "@/lib/site-url";

const EMAIL_SUBJECTS: Record<string, string> = {
  signup: "Confirm your email",
  invite: "You've been invited",
  magiclink: "Your login link",
  recovery: "Reset your password",
  email_change: "Confirm your new email",
  reauthentication: "Your verification code",
};

// Template mapping
const EMAIL_TEMPLATES: Record<string, React.ComponentType<any>> = {
  signup: SignupEmail,
  invite: InviteEmail,
  magiclink: MagicLinkEmail,
  recovery: RecoveryEmail,
  email_change: EmailChangeEmail,
  reauthentication: ReauthenticationEmail,
};

// Configuration
const SITE_NAME = "Get Part B Optimizer";

function redactEmail(email: string | null | undefined): string {
  if (!email) return "***";
  const [localPart, domain] = email.split("@");
  if (!localPart || !domain) return "***";
  return `${localPart[0]}***@${domain}`;
}

export const Route = createFileRoute("/api/email/auth/webhook")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const apiKey = getAuthEmailWebhookSecret();

        if (!apiKey) {
          console.error("AUTH_EMAIL_WEBHOOK_SECRET not configured");
          return Response.json({ error: "Server configuration error" }, { status: 500 });
        }

        // Verify signature + timestamp, then parse payload.
        let payload: any;
        let run_id = "";
        try {
          const verified = await verifyWebhookRequest({
            req: request,
            secret: apiKey,
            parser: parseEmailWebhookPayload,
          });
          payload = verified.payload;
          run_id = payload.run_id;
        } catch (error) {
          if (error instanceof WebhookError) {
            switch (error.code) {
              case "invalid_signature":
              case "missing_timestamp":
              case "invalid_timestamp":
              case "stale_timestamp":
                console.error("Invalid webhook signature", { error: error.message });
                return Response.json({ error: "Invalid signature" }, { status: 401 });
              case "invalid_payload":
              case "invalid_json":
                console.error("Invalid webhook payload", { error: error.message });
                return Response.json({ error: "Invalid webhook payload" }, { status: 400 });
            }
          }

          console.error("Webhook verification failed", { error });
          return Response.json({ error: "Invalid webhook payload" }, { status: 400 });
        }

        if (!run_id) {
          console.error("Webhook payload missing run_id");
          return Response.json({ error: "Invalid webhook payload" }, { status: 400 });
        }

        if (payload.version !== "1") {
          console.error("Unsupported payload version", { version: payload.version, run_id });
          return Response.json(
            { error: `Unsupported payload version: ${payload.version}` },
            { status: 400 },
          );
        }

        // The email action type is in payload.data.action_type (e.g., "signup", "recovery")
        // payload.type is the hook event type ("auth")
        const emailType = payload.data.action_type;
        console.log("Received auth event", {
          emailType,
          email_redacted: redactEmail(payload.data.email),
          run_id,
        });

        const EmailTemplate = EMAIL_TEMPLATES[emailType];
        if (!EmailTemplate) {
          console.error("Unknown email type", { emailType, run_id });
          return Response.json({ error: `Unknown email type: ${emailType}` }, { status: 400 });
        }

        // Build template props from payload.data (HookData structure)
        const confirmationUrl =
          emailType === "recovery"
            ? brandRecoveryConfirmationUrl(payload.data.url)
            : payload.data.url;

        const templateProps = {
          siteName: SITE_NAME,
          siteUrl: publicSiteUrl(),
          recipient: payload.data.email,
          confirmationUrl,
          token: payload.data.token,
          email: payload.data.email,
          oldEmail: payload.data.old_email,
          newEmail: payload.data.new_email,
        };

        // Render React Email to HTML and plain text
        const element = React.createElement(EmailTemplate, templateProps);
        let html = await render(element);
        let text = await render(element, { plainText: true });
        const renderedSubject = EMAIL_SUBJECTS[emailType] || "Notification";

        const override = await getEmailTemplateOverride(emailType);
        const merged = resolveTemplateContent({
          templateName: emailType,
          templateData: templateProps,
          renderedHtml: html,
          renderedText: text,
          renderedSubject,
          override,
        });
        html = merged.html;
        text = merged.text;
        let subject = merged.subject;

        html = await ensureEmailBranding(html, { siteUrl: templateProps.siteUrl });
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !supabaseServiceKey) {
          console.error("Missing Supabase environment variables");
          return Response.json({ error: "Server configuration error" }, { status: 500 });
        }

        const supabase = createClient(supabaseUrl, supabaseServiceKey);
        const messageId = crypto.randomUUID();

        // Log pending BEFORE enqueue so we have a record even if enqueue crashes
        await supabase.from("email_send_log").insert({
          message_id: messageId,
          template_name: emailType,
          recipient_email: payload.data.email,
          status: "pending",
        });

        const { error: enqueueError } = await supabase.rpc("enqueue_email", {
          queue_name: "auth_emails",
          payload: {
            run_id,
            message_id: messageId,
            to: payload.data.email,
            from: getTransactionalFromAddress(),
            sender_domain: getTransactionalSenderDomain(),
            subject,
            html,
            text,
            purpose: "transactional",
            label: emailType,
            queued_at: new Date().toISOString(),
          },
        });

        if (enqueueError) {
          console.error("Failed to enqueue auth email", { error: enqueueError, run_id, emailType });
          await supabase.from("email_send_log").insert({
            message_id: messageId,
            template_name: emailType,
            recipient_email: payload.data.email,
            status: "failed",
            error_message: "Failed to enqueue email",
          });
          return Response.json({ error: "Failed to enqueue email" }, { status: 500 });
        }

        console.log("Auth email enqueued", {
          emailType,
          email_redacted: redactEmail(payload.data.email),
          run_id,
        });

        await enqueueAdminEmailCopies(supabase, {
          templateName: emailType,
          idempotencyKey: run_id || messageId,
          normalizedPrimaryEmail: payload.data.email.trim().toLowerCase(),
          resolvedSubject: subject,
          html,
          plainText: text,
        });

        await triggerEmailQueueProcess(request.url);

        return Response.json({ success: true, queued: true });
      },
    },
  },
});
