import type { SupabaseClient } from "@supabase/supabase-js";
import {
  buildLeadMagnetSignupConsentSnapshot,
  buildNewsletterSignupConsentSnapshot,
  formatEmailSignupConsentText,
  normalizeSignupEmail,
  type EmailSignupConsentSnapshot,
} from "@/lib/lead-consent";
import { recordLeadEvent } from "@/lib/lead-events.server";
import { LEAD_STATUSES, LEAD_TYPES } from "@/lib/lead-types";
import { getClientIpFromRequest, getUserAgentFromRequest } from "@/lib/request-client-ip";
import { sendTransactionalTemplates, publicSiteUrl } from "@/lib/send-transactional-template.server";
import {
  DEFAULT_WORKBOOK_SLUG,
  leadMagnetPdfPublicPath,
  workbookLandingUrl,
} from "@/lib/content-factory/lead-magnet-paths";
import { DEFAULT_WORKBOOK_LEAD_MAGNET } from "@/lib/content-factory/batch-seed";

export type EmailSignupKind = "newsletter" | "lead_magnet";

export interface RecordEmailSignupInput {
  email: string;
  signupKind: EmailSignupKind;
  leadMagnetSlug?: string | null;
  fullName?: string | null;
  consentSnapshot: EmailSignupConsentSnapshot;
  marketingOptIn: boolean;
  ipAddress: string | null;
  userAgent: string | null;
  sourceUrl: string | null;
  clientMetadata?: Record<string, unknown> | null;
}

export interface RecordEmailSignupResult {
  id: string;
  email: string;
  signupKind: EmailSignupKind;
  isNew: boolean;
}

function pdfDownloadUrl(slug: string): string {
  const origin = publicSiteUrl().replace(/\/$/, "");
  return `${origin}${leadMagnetPdfPublicPath(slug)}`;
}

async function upsertEmailSignup(
  supabase: SupabaseClient,
  input: RecordEmailSignupInput,
): Promise<RecordEmailSignupResult> {
  const emailNormalized = normalizeSignupEmail(input.email);
  const consentText = formatEmailSignupConsentText(input.consentSnapshot);
  const submittedAt = new Date().toISOString();
  const row = {
    email: input.email.trim(),
    email_normalized: emailNormalized,
    signup_kind: input.signupKind,
    lead_magnet_slug:
      input.signupKind === "lead_magnet" ? input.leadMagnetSlug ?? DEFAULT_WORKBOOK_SLUG : null,
    full_name: input.fullName?.trim() || null,
    ip_address: input.ipAddress,
    user_agent: input.userAgent,
    source_url: input.sourceUrl,
    consent_flow_version: input.consentSnapshot.flow_version,
    consent_text: consentText,
    consent_snapshot: {
      ...input.consentSnapshot,
      client_metadata: input.clientMetadata ?? {},
    } as never,
    marketing_opt_in: input.marketingOptIn,
    submitted_at: submittedAt,
  };

  if (input.signupKind === "newsletter") {
    const { data: existing } = await supabase
      .from("email_signups")
      .select("id")
      .eq("signup_kind", "newsletter")
      .eq("email_normalized", emailNormalized)
      .maybeSingle();

    if (existing?.id) {
      const { data: updated, error } = await supabase
        .from("email_signups")
        .update(row)
        .eq("id", existing.id)
        .select("id, email, signup_kind")
        .single();
      if (error || !updated) throw new Error(error?.message ?? "Could not update newsletter signup");
      await logEmailSignupLeadEvent(supabase, input, updated.id);
      return { id: updated.id, email: updated.email, signupKind: "newsletter", isNew: false };
    }
  }

  if (input.signupKind === "lead_magnet") {
    const slug = row.lead_magnet_slug!;
    const { data: existing } = await supabase
      .from("email_signups")
      .select("id")
      .eq("signup_kind", "lead_magnet")
      .eq("email_normalized", emailNormalized)
      .eq("lead_magnet_slug", slug)
      .maybeSingle();

    if (existing?.id) {
      const { data: updated, error } = await supabase
        .from("email_signups")
        .update(row)
        .eq("id", existing.id)
        .select("id, email, signup_kind")
        .single();
      if (error || !updated) throw new Error(error?.message ?? "Could not update lead magnet signup");
      await logEmailSignupLeadEvent(supabase, input, updated.id);
      return { id: updated.id, email: updated.email, signupKind: "lead_magnet", isNew: false };
    }
  }

  const { data: inserted, error } = await supabase
    .from("email_signups")
    .insert(row)
    .select("id, email, signup_kind")
    .single();
  if (error || !inserted) throw new Error(error?.message ?? "Could not save email signup");
  await logEmailSignupLeadEvent(supabase, input, inserted.id);
  return {
    id: inserted.id,
    email: inserted.email,
    signupKind: inserted.signup_kind as EmailSignupKind,
    isNew: true,
  };
}

async function logEmailSignupLeadEvent(
  supabase: SupabaseClient,
  input: RecordEmailSignupInput,
  signupId: string,
): Promise<void> {
  const leadType =
    input.signupKind === "newsletter"
      ? LEAD_TYPES.NEWSLETTER_SIGNUP
      : LEAD_TYPES.LEAD_MAGNET_SIGNUP;

  await recordLeadEvent(supabase, {
    leadType,
    leadStatus: LEAD_STATUSES.COMPLETED,
    email: input.email,
    sourceUrl: input.sourceUrl,
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
    emailSignupId: signupId,
    clientMetadata: input.clientMetadata ?? null,
  });
}

export async function recordNewsletterSignup(
  supabase: SupabaseClient,
  opts: {
    email: string;
    privacyAcknowledged: boolean;
    educationalOptIn: boolean;
    request: Request | null;
    clientMetadata?: Record<string, unknown> | null;
    sendWelcomeEmail?: boolean;
  },
): Promise<RecordEmailSignupResult> {
  const consentSnapshot = buildNewsletterSignupConsentSnapshot({
    privacyAcknowledged: opts.privacyAcknowledged,
    educationalOptIn: opts.educationalOptIn,
  });
  const result = await upsertEmailSignup(supabase, {
    email: opts.email,
    signupKind: "newsletter",
    consentSnapshot,
    marketingOptIn: opts.educationalOptIn,
    ipAddress: opts.request ? getClientIpFromRequest(opts.request) : null,
    userAgent: opts.request ? getUserAgentFromRequest(opts.request) : null,
    sourceUrl:
      typeof opts.clientMetadata?.pageUrl === "string" ? opts.clientMetadata.pageUrl : null,
    clientMetadata: opts.clientMetadata,
  });

  if (opts.sendWelcomeEmail !== false) {
    await sendTransactionalTemplates({
      templateName: "newsletter-welcome",
      recipientEmail: opts.email,
      templateData: {
        recipientName: "there",
        learningCenterUrl: `${publicSiteUrl().replace(/\/$/, "")}/learning-center`,
      },
      idempotencyKey: `newsletter-welcome-${result.id}`,
    });
  }

  return result;
}

export async function recordLeadMagnetSignup(
  supabase: SupabaseClient,
  opts: {
    email: string;
    slug?: string;
    workbookTitle?: string;
    privacyAcknowledged: boolean;
    pdfDeliveryAuthorized: boolean;
    newsletterOptIn: boolean;
    request: Request | null;
    clientMetadata?: Record<string, unknown> | null;
  },
): Promise<RecordEmailSignupResult & { downloadUrl: string }> {
  const slug = opts.slug?.trim() || DEFAULT_WORKBOOK_SLUG;
  const workbookTitle = opts.workbookTitle?.trim() || DEFAULT_WORKBOOK_LEAD_MAGNET.title;
  const consentSnapshot = buildLeadMagnetSignupConsentSnapshot({
    workbookTitle,
    slug,
    privacyAcknowledged: opts.privacyAcknowledged,
    pdfDeliveryAuthorized: opts.pdfDeliveryAuthorized,
    newsletterOptIn: opts.newsletterOptIn,
  });

  const result = await upsertEmailSignup(supabase, {
    email: opts.email,
    signupKind: "lead_magnet",
    leadMagnetSlug: slug,
    consentSnapshot,
    marketingOptIn: opts.newsletterOptIn,
    ipAddress: opts.request ? getClientIpFromRequest(opts.request) : null,
    userAgent: opts.request ? getUserAgentFromRequest(opts.request) : null,
    sourceUrl:
      typeof opts.clientMetadata?.pageUrl === "string" ? opts.clientMetadata.pageUrl : null,
    clientMetadata: opts.clientMetadata,
  });

  const downloadUrl = pdfDownloadUrl(slug);

  if (opts.newsletterOptIn) {
    await recordNewsletterSignup(supabase, {
      email: opts.email,
      privacyAcknowledged: true,
      educationalOptIn: true,
      request: opts.request,
      clientMetadata: opts.clientMetadata,
      sendWelcomeEmail: false,
    }).catch((err) => {
      console.error("[email-signup] newsletter upsert from lead magnet failed", err);
    });
  }

  await sendTransactionalTemplates({
    templateName: "lead-magnet-delivery",
    recipientEmail: opts.email,
    templateData: {
      recipientName: "there",
      workbookTitle,
      downloadUrl,
      landingUrl: workbookLandingUrl(slug),
    },
    idempotencyKey: `lead-magnet-delivery-${result.id}`,
  });

  return { ...result, downloadUrl };
}
