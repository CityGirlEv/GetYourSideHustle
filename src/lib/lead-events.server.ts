import type { SupabaseClient } from "@supabase/supabase-js";
import type { LeadStatus, LeadType } from "@/lib/lead-types";
import { LEAD_STATUSES } from "@/lib/lead-types";

export type RecordLeadEventInput = {
  leadType: LeadType;
  leadStatus?: LeadStatus;
  email?: string | null;
  fullName?: string | null;
  phone?: string | null;
  scenarioCode?: string | null;
  path?: string | null;
  sourceUrl?: string | null;
  referrer?: string | null;
  ctaLabel?: string | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  expertContactRequestId?: string | null;
  emailSignupId?: string | null;
  clientMetadata?: Record<string, unknown> | null;
};

export async function recordLeadEvent(
  supabase: SupabaseClient,
  input: RecordLeadEventInput,
): Promise<{ id: string | null }> {
  const { data, error } = await supabase
    .from("lead_events")
    .insert({
      lead_type: input.leadType,
      lead_status: input.leadStatus ?? LEAD_STATUSES.INTENT,
      email: input.email?.trim() || null,
      full_name: input.fullName?.trim() || null,
      phone: input.phone?.trim() || null,
      scenario_code: input.scenarioCode?.trim().toUpperCase() || null,
      path: input.path?.slice(0, 1024) ?? null,
      source_url: input.sourceUrl?.slice(0, 2048) ?? null,
      referrer: input.referrer?.slice(0, 1024) ?? null,
      cta_label: input.ctaLabel?.slice(0, 256) ?? null,
      ip_address: input.ipAddress ?? null,
      user_agent: input.userAgent?.slice(0, 1024) ?? null,
      expert_contact_request_id: input.expertContactRequestId ?? null,
      email_signup_id: input.emailSignupId ?? null,
      client_metadata: (input.clientMetadata ?? {}) as never,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[lead-events] insert failed", error.message);
    return { id: null };
  }

  return { id: data?.id ?? null };
}
