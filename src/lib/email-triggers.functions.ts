import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { z } from "zod";
import {
  publicSiteUrl,
  sendTransactionalTemplates,
} from "@/lib/send-transactional-template.server";
import { getClientIpFromRequest, getUserAgentFromRequest } from "@/lib/request-client-ip";
import {
  buildLeadConsentSnapshot,
  DEFAULT_LEAD_AGENCY_NAME,
} from "@/lib/lead-consent";

const submitExpertContactSchema = z
  .object({
    full_name: z.string().trim().min(1).max(120),
    email: z.string().trim().email().max(255),
    phone: z.string().trim().min(7).max(40),
    scenario_code: z.string().trim().max(64).optional().nullable(),
    scenario_snapshot: z.record(z.string(), z.unknown()).optional().nullable(),
    agency_name: z.string().trim().min(1).max(200).optional().nullable(),
    privacy_acknowledged: z.literal(true),
    contact_authorized: z.literal(true),
    marketing_opt_in: z.boolean(),
    client_metadata: z.record(z.string(), z.unknown()).optional().nullable(),
  })
  .strict();

export const submitExpertContactRequest = createServerFn({ method: "POST" })
  .inputValidator((input) => submitExpertContactSchema.parse(input))
  .handler(async ({ data }) => {
    const request = getRequest();
    const ipAddress = request ? getClientIpFromRequest(request) : null;
    const userAgent = request ? getUserAgentFromRequest(request) : null;
    const submittedAt = new Date().toISOString();
    const agencyName = (data.agency_name?.trim() || DEFAULT_LEAD_AGENCY_NAME).slice(0, 200);
    const scenarioCode = data.scenario_code?.trim().toUpperCase() || null;

    const consentSnapshot = buildLeadConsentSnapshot({
      agencyName,
      scenarioCode,
      privacyAcknowledged: data.privacy_acknowledged,
      contactAuthorized: data.contact_authorized,
      marketingOptIn: data.marketing_opt_in,
    });

    const { data: contactRow, error: contactErr } = await supabaseAdmin
      .from("expert_contact_requests")
      .insert({
        full_name: data.full_name,
        email: data.email,
        phone: data.phone,
        scenario_code: scenarioCode,
        scenario_snapshot: data.scenario_snapshot ? (data.scenario_snapshot as never) : null,
        marketing_opt_in: data.marketing_opt_in,
        agency_name: agencyName,
      })
      .select("id")
      .single();

    if (contactErr || !contactRow) {
      throw new Error(contactErr?.message ?? "Could not save contact request");
    }

    const { data: certificate, error: certErr } = await supabaseAdmin
      .from("lead_certificates")
      .insert({
        expert_contact_request_id: contactRow.id,
        consumer_name: data.full_name,
        email: data.email,
        phone: data.phone,
        scenario_code: scenarioCode,
        agency_name: agencyName,
        ip_address: ipAddress,
        user_agent: userAgent,
        client_metadata: (data.client_metadata ?? {}) as never,
        consent_snapshot: consentSnapshot as never,
        privacy_acknowledged: true,
        contact_authorized: true,
        marketing_opt_in: data.marketing_opt_in,
        submitted_at: submittedAt,
      })
      .select("id")
      .single();

    if (certErr || !certificate) {
      console.error("[lead] certificate insert failed", certErr);
      throw new Error(certErr?.message ?? "Could not create lead certificate");
    }

    await supabaseAdmin
      .from("expert_contact_requests")
      .update({ lead_certificate_id: certificate.id })
      .eq("id", contactRow.id);

    await sendTransactionalTemplates({
      templateName: "contact-request",
      recipientEmail: data.email,
      templateData: {
        email: data.email,
        scenarioCode: scenarioCode ?? undefined,
        recipientName: data.full_name,
      },
      idempotencyKey: `contact-request-${contactRow.id}`,
    });

    return {
      ok: true as const,
      contact_request_id: contactRow.id,
      lead_certificate_id: certificate.id,
    };
  });

export const notifyScenarioClaimed = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z.object({ scenario_code: z.string().trim().min(4).max(64) }).parse(input),
  )
  .handler(async ({ data, context }) => {
    const code = data.scenario_code.trim().toUpperCase();
    const { data: scenario, error } = await supabaseAdmin
      .from("scenarios")
      .select("id, scenario_code, claimed_by, claimed_at, created_by, wants_contact")
      .eq("scenario_code", code)
      .maybeSingle();

    if (error || !scenario) return { ok: false as const, reason: "not_found" as const };
    if (scenario.claimed_by !== context.userId) {
      return { ok: false as const, reason: "not_claimer" as const };
    }
    if (!scenario.claimed_at) {
      return { ok: false as const, reason: "not_claimed" as const };
    }

    const claimedMs = Date.now() - new Date(scenario.claimed_at).getTime();
    if (claimedMs > 2 * 60 * 1000) {
      return { ok: false as const, reason: "stale_claim" as const };
    }

    let recipientEmail: string | null = null;
    const { data: contactReq } = await supabaseAdmin
      .from("expert_contact_requests")
      .select("email")
      .eq("scenario_code", code)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    recipientEmail = contactReq?.email ?? null;

    if (!recipientEmail && scenario.created_by) {
      const { data: creator } = await supabaseAdmin.auth.admin.getUserById(scenario.created_by);
      recipientEmail = creator?.user?.email ?? null;
    }

    if (!recipientEmail) {
      return { ok: false as const, reason: "no_recipient" as const };
    }

    const { data: advisorProfile } = await supabaseAdmin
      .from("profiles")
      .select("full_name")
      .eq("id", context.userId)
      .maybeSingle();
    const { data: advisorAuth } = await supabaseAdmin.auth.admin.getUserById(context.userId);

    const siteUrl = publicSiteUrl().replace(/\/$/, "");
    await sendTransactionalTemplates({
      templateName: "scenario-claimed",
      recipientEmail,
      templateData: {
        advisorName: advisorProfile?.full_name || advisorAuth?.user?.email || "A licensed advisor",
        scenarioCode: code,
        scenarioUrl: `${siteUrl}/scenario/${encodeURIComponent(code)}`,
      },
      idempotencyKey: `scenario-claimed-${scenario.id}-${context.userId}`,
    });

    return { ok: true as const };
  });