import { createHash } from "node:crypto";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { htmlToPlainText } from "@/lib/email-templates/overrides.server";
import { ensureEmailBranding } from "@/lib/email-templates/email-branding.server";
import { escapeHtml, renderLearningMarkdown } from "@/lib/learning-center";
import {
  getTransactionalFromAddress,
  getTransactionalSenderDomain,
} from "@/lib/send-transactional-email";
import { triggerEmailQueueProcess } from "@/lib/trigger-email-queue-process";
import {
  insertContentDispatchLog,
  updateContentDispatchLog,
} from "@/lib/content-factory/dispatch-log";

export interface NewsletterFeaturedArticle {
  slug: string;
  title: string;
  excerpt: string;
  featuredImage?: string;
}

export interface NewsletterSendInput {
  recipient: string;
  subject: string;
  body: string;
  templateLabel: string;
  userId: string;
  draftId?: string | null;
  batchId?: string | null;
  dispatchKind?: "test" | "broadcast";
  requestUrl?: string;
  featuredArticles?: NewsletterFeaturedArticle[];
  siteUrl?: string;
}

export function hashContentBody(body: string): string {
  return createHash("sha256").update(body).digest("hex").slice(0, 16);
}

export function parseNewsletterSubject(
  body: string,
  fallbackTitle: string,
): { subject: string; body: string } {
  const lines = body.replace(/\r\n/g, "\n").split("\n");
  if (lines[0]?.trim().toLowerCase().startsWith("subject:")) {
    const subject = lines[0].slice("subject:".length).trim();
    const rest = lines.slice(1).join("\n").replace(/^\n+/, "");
    return { subject: subject || fallbackTitle, body: rest };
  }
  return { subject: fallbackTitle, body };
}

export function personalizeNewsletterBody(body: string, fullName = "there"): string {
  return body.replace(/\{\{fullName\}\}/g, fullName);
}

export function newsletterBodyToHtml(
  body: string,
  options?: { featuredArticles?: NewsletterFeaturedArticle[]; siteUrl?: string },
): string {
  if (options?.featuredArticles?.length && options.siteUrl) {
    return buildNewsletterEmailHtml(body, options.featuredArticles, options.siteUrl);
  }
  const content = renderLearningMarkdown(body);
  return `<div style="font-family:system-ui,-apple-system,sans-serif;line-height:1.6;color:#1a1a1a;">${content}</div>`;
}

function resolveAbsoluteAssetUrl(path: string, siteUrl: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${siteUrl.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

export function renderNewsletterFeaturedGuidesHtml(
  articles: NewsletterFeaturedArticle[],
  siteUrl: string,
): string {
  if (!articles.length) return "";

  const rows = articles
    .map((article) => {
      const url = `${siteUrl.replace(/\/$/, "")}/learning-center/${article.slug}`;
      const imageCell = article.featuredImage
        ? `<td style="width:168px;padding:0 16px 18px 0;vertical-align:top;">
            <img src="${escapeHtml(resolveAbsoluteAssetUrl(article.featuredImage, siteUrl))}" alt="" width="168" height="112" style="display:block;width:168px;height:112px;object-fit:cover;border-radius:10px;border:1px solid #e5e7eb;" />
          </td>`
        : "";

      return `<tr>
        ${imageCell}
        <td style="vertical-align:top;padding-bottom:18px;">
          <a href="${escapeHtml(url)}" style="color:#1d4ed8;font-weight:700;text-decoration:none;font-size:17px;line-height:1.35;">${escapeHtml(article.title)}</a>
          ${article.excerpt ? `<p style="margin:8px 0 0;color:#4b5563;font-size:14px;line-height:1.55;">${escapeHtml(article.excerpt)}</p>` : ""}
        </td>
      </tr>`;
    })
    .join("");

  return `<h2 style="font-size:20px;font-weight:700;margin:24px 0 12px;color:#111827;">Featured guides</h2>
<table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin:0;">${rows}</table>`;
}

export function buildNewsletterEmailHtml(
  body: string,
  featuredArticles: NewsletterFeaturedArticle[],
  siteUrl: string,
): string {
  const marker = "## Featured guides";
  const markerIndex = body.indexOf(marker);
  let before = body;
  let after = "";

  if (markerIndex !== -1) {
    before = body.slice(0, markerIndex).trimEnd();
    const afterMarker = body.slice(markerIndex + marker.length);
    const nextHeading = afterMarker.search(/\n## /);
    after = (nextHeading === -1 ? "" : afterMarker.slice(nextHeading)).trim();
  }

  const introHtml = before ? renderLearningMarkdown(before) : "";
  const guidesHtml = renderNewsletterFeaturedGuidesHtml(featuredArticles, siteUrl);
  const restHtml = after ? renderLearningMarkdown(after) : "";

  return `<div style="font-family:system-ui,-apple-system,sans-serif;line-height:1.6;color:#1a1a1a;">${introHtml}${guidesHtml}${restHtml}</div>`;
}

async function getOrCreateUnsubscribeToken(email: string): Promise<string> {
  const { data: existing } = await supabaseAdmin
    .from("email_unsubscribe_tokens")
    .select("token")
    .eq("email", email)
    .maybeSingle();
  if (existing?.token) return existing.token;

  const token = crypto.randomUUID();
  await supabaseAdmin.from("email_unsubscribe_tokens").insert({ email, token });
  return token;
}

/** Queue a newsletter test/broadcast email through Resend and record dispatch + email logs. */
export async function sendNewsletterEmail(input: NewsletterSendInput): Promise<{
  messageId: string;
  dispatchLogId: string;
}> {
  const parsed = parseNewsletterSubject(input.body, input.subject);
  const personalized = personalizeNewsletterBody(parsed.body);
  const bodyHash = hashContentBody(personalized);
  const bodyPreview = personalized.replace(/\s+/g, " ").trim().slice(0, 240);
  const messageId = crypto.randomUUID();
  const dispatchKind = input.dispatchKind ?? "test";
  const testSubject =
    dispatchKind === "test" ? `[TEST] ${parsed.subject}` : parsed.subject;

  const dispatchLog = await insertContentDispatchLog({
    channel: "newsletter",
    dispatchKind,
    draftId: input.draftId ?? null,
    batchId: input.batchId ?? null,
    recipient: input.recipient,
    subject: testSubject,
    templateLabel: input.templateLabel,
    bodyPreview,
    bodyHash,
    messageId,
    status: "pending",
    sentBy: input.userId,
    metadata: { source: input.templateLabel },
  });

  const unsubscribeToken = await getOrCreateUnsubscribeToken(input.recipient);
  const html = newsletterBodyToHtml(personalized, {
    featuredArticles: input.featuredArticles,
    siteUrl: input.siteUrl,
  });
  const brandedHtml = await ensureEmailBranding(html, { unsubscribeToken });
  const text = htmlToPlainText(brandedHtml);

  await supabaseAdmin.from("email_send_log").insert({
    message_id: messageId,
    template_name: `${input.templateLabel} (${dispatchKind})`,
    recipient_email: input.recipient,
    status: "pending",
    metadata: {
      draft_id: input.draftId ?? null,
      batch_id: input.batchId ?? null,
      body_hash: bodyHash,
      dispatch_log_id: dispatchLog.id,
    },
  });

  const { error } = await supabaseAdmin.rpc("enqueue_email", {
    queue_name: "transactional_emails",
    payload: {
      message_id: messageId,
      to: input.recipient,
      from: getTransactionalFromAddress(),
      sender_domain: getTransactionalSenderDomain(),
      subject: testSubject,
      html: brandedHtml,
      text,
      purpose: "transactional",
      label: `${input.templateLabel}-${dispatchKind}`,
      idempotency_key: messageId,
      unsubscribe_token: unsubscribeToken,
      queued_at: new Date().toISOString(),
    },
  });

  if (error) {
    await supabaseAdmin.from("email_send_log").insert({
      message_id: messageId,
      template_name: `${input.templateLabel} (${dispatchKind})`,
      recipient_email: input.recipient,
      status: "failed",
      error_message: `Enqueue failed: ${error.message}`,
    });
    await updateContentDispatchLog(dispatchLog.id, {
      status: "failed",
      errorMessage: `Enqueue failed: ${error.message}`,
    });
    throw new Error(`Failed to enqueue newsletter: ${error.message}`);
  }

  await updateContentDispatchLog(dispatchLog.id, { status: "queued" });
  await triggerEmailQueueProcess(input.requestUrl);

  await supabaseAdmin.from("audit_logs").insert({
    user_id: input.userId,
    action: dispatchKind === "test" ? "SEND_NEWSLETTER_TEST" : "SEND_NEWSLETTER_BROADCAST",
    entity_type: "newsletter",
    entity_id: input.draftId ?? input.templateLabel,
    metadata: {
      recipient: input.recipient,
      subject: testSubject,
      body_hash: bodyHash,
      dispatch_log_id: dispatchLog.id,
    } as never,
  });

  return { messageId, dispatchLogId: dispatchLog.id };
}
