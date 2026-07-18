import { createFileRoute } from "@tanstack/react-router";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { resolveLeadSourceUrl } from "@/lib/lead-consent";
import { recordLeadEvent } from "@/lib/lead-events.server";
import { isLeadType, LEAD_STATUSES } from "@/lib/lead-types";

function getClientIp(request: Request): string | null {
  const h = request.headers;
  const candidates = [
    h.get("cf-connecting-ip"),
    h.get("x-real-ip"),
    (h.get("x-forwarded-for") || "").split(",")[0]?.trim(),
  ];
  for (const c of candidates) {
    if (c && c.length > 0) return c;
  }
  return null;
}

export const Route = createFileRoute("/api/public/track-lead-event")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        try {
          const body = await request.json().catch(() => ({}) as Record<string, unknown>);
          const leadType = typeof body.lead_type === "string" ? body.lead_type : "";
          if (!isLeadType(leadType)) {
            return new Response("invalid lead_type", { status: 400 });
          }

          const leadStatus =
            body.lead_status === LEAD_STATUSES.COMPLETED
              ? LEAD_STATUSES.COMPLETED
              : LEAD_STATUSES.INTENT;

          const clientMetadata =
            body.client_metadata && typeof body.client_metadata === "object"
              ? (body.client_metadata as Record<string, unknown>)
              : null;

          await recordLeadEvent(supabaseAdmin, {
            leadType,
            leadStatus,
            scenarioCode:
              typeof body.scenario_code === "string" ? body.scenario_code : null,
            path: typeof body.path === "string" ? body.path : null,
            referrer: typeof body.referrer === "string" ? body.referrer : null,
            ctaLabel: typeof body.cta_label === "string" ? body.cta_label : null,
            sourceUrl: resolveLeadSourceUrl(clientMetadata),
            ipAddress: getClientIp(request),
            userAgent: request.headers.get("user-agent"),
            clientMetadata,
          });

          return new Response("ok");
        } catch (e) {
          console.error("track-lead-event handler error", e);
          return new Response("error", { status: 500 });
        }
      },
    },
  },
});
