import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { z } from "zod";
import { PRIVACY_CONTACT_EMAIL } from "@/lib/legal-content";

const baseFields = {
  full_name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(255),
};

async function recordPrivacyRequest(opts: {
  kind: "delete_data" | "privacy_contact";
  title: string;
  body: string;
  metadata: Record<string, unknown>;
}) {
  try {
    await supabaseAdmin.from("admin_notifications").insert({
      kind: opts.kind,
      title: opts.title,
      body: opts.body,
      metadata: opts.metadata as never,
    });
  } catch (e) {
    console.error("[privacy] admin notification insert failed", e);
    throw new Error("Could not submit your request. Please email us directly.");
  }
}

export const submitDeleteDataRequest = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        ...baseFields,
        scenario_code: z.string().trim().max(64).optional().nullable(),
        details: z.string().trim().min(10).max(4000),
        confirm: z.literal(true),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const scenario = data.scenario_code?.trim().toUpperCase() || null;
    await recordPrivacyRequest({
      kind: "delete_data",
      title: `Delete data request — ${data.full_name}`,
      body: `${data.email}${scenario ? ` · scenario ${scenario}` : ""}. Review in Admin notifications.`,
      metadata: {
        email: data.email,
        full_name: data.full_name,
        scenario_code: scenario,
        details: data.details,
        privacy_inbox: PRIVACY_CONTACT_EMAIL,
      },
    });
    return { ok: true as const };
  });

export const submitPrivacyContactRequest = createServerFn({ method: "POST" })
  .inputValidator((input) =>
    z
      .object({
        ...baseFields,
        subject: z.string().trim().min(3).max(200),
        message: z.string().trim().min(10).max(4000),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    await recordPrivacyRequest({
      kind: "privacy_contact",
      title: `Privacy inquiry — ${data.subject}`,
      body: `${data.full_name} · ${data.email}. Review in Admin notifications.`,
      metadata: {
        email: data.email,
        full_name: data.full_name,
        subject: data.subject,
        message: data.message,
        privacy_inbox: PRIVACY_CONTACT_EMAIL,
      },
    });
    return { ok: true as const };
  });
