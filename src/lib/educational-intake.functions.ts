import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { z } from "zod";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import {
  buildEducationalIntakeConsentSnapshot,
  EDUCATIONAL_INTAKE_AGENCY_NAME,
  formatEducationalIntakeConsentText,
  resolveLeadSourceUrl,
} from "@/lib/lead-consent";
import { recordLeadEvent } from "@/lib/lead-events.server";
import { LEAD_STATUSES, LEAD_TYPES } from "@/lib/lead-types";
import { getClientIpFromRequest, getUserAgentFromRequest } from "@/lib/request-client-ip";
import {
  sendTransactionalTemplates,
} from "@/lib/send-transactional-template.server";

const benefitPrioritySchema = z.enum(["dental", "vision", "hearing", "fitness", "otc"]);

const submitEducationalIntakeSchema = z
  .object({
    zip3: z.string().regex(/^\d{3}$/),
    medicare_enrolled: z.enum(["yes", "no", "unsure"]),
    eligibility_circumstance: z.enum(["turning_65", "special_circumstance", "none"]),
    medications: z.array(z.string().trim().min(1).max(120)).max(40),
    visit_frequency: z.enum(["low", "medium", "high"]),
    preferred_hospital: z.string().trim().max(200),
    benefit_priorities: z.array(benefitPrioritySchema).max(5),
    first_name: z.string().trim().min(1).max(80),
    last_name: z.string().trim().min(1).max(80),
    phone: z.string().trim().min(7).max(40),
    email: z.string().trim().email().max(255),
    partner_contact_consent: z.literal(true),
    client_metadata: z.record(z.string(), z.unknown()).optional().nullable(),
    trustedform_cert_url: z.string().url().max(2048).optional().nullable(),
    trustedform_token: z.string().max(512).optional().nullable(),
    trustedform_ping_url: z.string().url().max(2048).optional().nullable(),
  })
  .strict();

function trustedFormInsertFields(data: {
  trustedform_cert_url?: string | null;
  trustedform_token?: string | null;
  trustedform_ping_url?: string | null;
}): Record<string, string> {
  const out: Record<string, string> = {};
  if (data.trustedform_cert_url) out.trustedform_cert_url = data.trustedform_cert_url;
  if (data.trustedform_token) out.trustedform_token = data.trustedform_token;
  if (data.trustedform_ping_url) out.trustedform_ping_url = data.trustedform_ping_url;
  return out;
}

export const submitEducationalIntake = createServerFn({ method: "POST" })
  .inputValidator((input) => submitEducationalIntakeSchema.parse(input))
  .handler(async ({ data }) => {
    const request = getRequest();
    const ipAddress = request ? getClientIpFromRequest(request) : null;
    const userAgent = request ? getUserAgentFromRequest(request) : null;
    const submittedAt = new Date().toISOString();
    const fullName = `${data.first_name} ${data.last_name}`.trim();
    const sourceUrl = resolveLeadSourceUrl(data.client_metadata);
    const trustedFormFields = trustedFormInsertFields(data);

    const intakeSnapshot = {
      kind: "educational_cost_estimator" as const,
      zip3: data.zip3,
      medicare_enrolled: data.medicare_enrolled,
      eligibility_circumstance: data.eligibility_circumstance,
      medications: data.medications,
      visit_frequency: data.visit_frequency,
      preferred_hospital: data.preferred_hospital || null,
      benefit_priorities: data.benefit_priorities,
      first_name: data.first_name,
      last_name: data.last_name,
    };

    const consentSnapshot = buildEducationalIntakeConsentSnapshot({
      partnerContactConsent: true,
      ipAddress,
      recordedAtUtc: submittedAt,
    });
    const consentText = formatEducationalIntakeConsentText(consentSnapshot);

    const { data: contactRow, error: contactErr } = await supabaseAdmin
      .from("expert_contact_requests")
      .insert({
        full_name: fullName,
        email: data.email,
        phone: data.phone,
        scenario_code: null,
        scenario_snapshot: intakeSnapshot as never,
        marketing_opt_in: false,
        agency_name: EDUCATIONAL_INTAKE_AGENCY_NAME,
        ip_address: ipAddress,
        source_url: sourceUrl,
        consent_text: consentText,
        consent_snapshot: consentSnapshot as never,
        submitted_at: submittedAt,
        ...trustedFormFields,
      })
      .select("id")
      .single();

    if (contactErr || !contactRow) {
      throw new Error(contactErr?.message ?? "Could not save intake submission");
    }

    const { data: certificate, error: certErr } = await supabaseAdmin
      .from("lead_certificates")
      .insert({
        expert_contact_request_id: contactRow.id,
        consumer_name: fullName,
        email: data.email,
        phone: data.phone,
        scenario_code: null,
        agency_name: EDUCATIONAL_INTAKE_AGENCY_NAME,
        ip_address: ipAddress,
        user_agent: userAgent,
        source_url: sourceUrl,
        consent_text: consentText,
        client_metadata: (data.client_metadata ?? {}) as never,
        consent_snapshot: consentSnapshot as never,
        privacy_acknowledged: true,
        contact_authorized: true,
        marketing_opt_in: false,
        submitted_at: submittedAt,
        ...trustedFormFields,
      })
      .select("id")
      .single();

    if (certErr || !certificate) {
      console.error("[educational-intake] certificate insert failed", certErr);
      throw new Error(certErr?.message ?? "Could not create lead certificate");
    }

    await supabaseAdmin
      .from("expert_contact_requests")
      .update({ lead_certificate_id: certificate.id })
      .eq("id", contactRow.id);

    await recordLeadEvent(supabaseAdmin, {
      leadType: LEAD_TYPES.EDUCATIONAL_INTAKE_SUBMIT,
      leadStatus: LEAD_STATUSES.COMPLETED,
      email: data.email,
      fullName,
      phone: data.phone,
      sourceUrl,
      ipAddress,
      userAgent,
      expertContactRequestId: contactRow.id,
      clientMetadata: {
        ...(data.client_metadata ?? {}),
        intake_snapshot: intakeSnapshot,
      },
    });

    await sendTransactionalTemplates({
      templateName: "contact-request",
      recipientEmail: data.email,
      templateData: {
        email: data.email,
        recipientName: fullName,
      },
      idempotencyKey: `educational-intake-${contactRow.id}`,
    });

    return {
      ok: true as const,
      contact_request_id: contactRow.id,
      lead_certificate_id: certificate.id,
      submitted_at: submittedAt,
    };
  });

export type SubmitEducationalIntakeInput = z.infer<typeof submitEducationalIntakeSchema>;
