import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { resolveLeadSourceUrl } from "@/lib/lead-consent";
import { recordLeadMagnetSignup, recordNewsletterSignup } from "@/lib/email-signup.server";
import { DEFAULT_WORKBOOK_SLUG } from "@/lib/content-factory/lead-magnet-paths";

const clientMetadataSchema = z.record(z.string(), z.unknown()).optional().nullable();

export const subscribeNewsletter = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        email: z.string().trim().email().max(255),
        privacy_acknowledged: z.literal(true),
        educational_opt_in: z.literal(true),
        client_metadata: clientMetadataSchema,
      })
      .strict()
      .parse(input),
  )
  .handler(async ({ data }) => {
    const request = getRequest();
    const result = await recordNewsletterSignup(supabaseAdmin, {
      email: data.email,
      privacyAcknowledged: data.privacy_acknowledged,
      educationalOptIn: data.educational_opt_in,
      request: request ?? null,
      clientMetadata: data.client_metadata ?? null,
    });
    return { ok: true as const, signup_id: result.id, is_new: result.isNew };
  });

export const requestLeadMagnetDownload = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        email: z.string().trim().email().max(255),
        slug: z.string().trim().min(1).max(120).optional().nullable(),
        privacy_acknowledged: z.literal(true),
        pdf_delivery_authorized: z.literal(true),
        newsletter_opt_in: z.boolean(),
        client_metadata: clientMetadataSchema,
      })
      .strict()
      .parse(input),
  )
  .handler(async ({ data }) => {
    const request = getRequest();
    const result = await recordLeadMagnetSignup(supabaseAdmin, {
      email: data.email,
      slug: data.slug?.trim() || DEFAULT_WORKBOOK_SLUG,
      privacyAcknowledged: data.privacy_acknowledged,
      pdfDeliveryAuthorized: data.pdf_delivery_authorized,
      newsletterOptIn: data.newsletter_opt_in,
      request: request ?? null,
      clientMetadata: data.client_metadata ?? null,
    });
    return {
      ok: true as const,
      signup_id: result.id,
      download_url: result.downloadUrl,
      is_new: result.isNew,
    };
  });

/** Resolve source URL from client metadata on the server as a fallback check. */
export function signupSourceUrlFromClientMetadata(
  metadata: Record<string, unknown> | null | undefined,
): string | null {
  return resolveLeadSourceUrl(metadata);
}
