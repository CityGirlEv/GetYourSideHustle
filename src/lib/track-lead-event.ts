import { createClientOnlyFn } from "@tanstack/react-start";
import { collectLeadClientMetadata } from "@/lib/lead-consent";
import type { LeadStatus, LeadType } from "@/lib/lead-types";
import { LEAD_STATUSES } from "@/lib/lead-types";

export const trackLeadEvent = createClientOnlyFn(
  (opts: {
    leadType: LeadType;
    leadStatus?: LeadStatus;
    scenarioCode?: string | null;
    ctaLabel?: string | null;
  }): void => {
    void fetch("/api/public/track-lead-event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        lead_type: opts.leadType,
        lead_status: opts.leadStatus ?? LEAD_STATUSES.INTENT,
        path: window.location.pathname,
        referrer: document.referrer || null,
        scenario_code: opts.scenarioCode ?? null,
        cta_label: opts.ctaLabel ?? null,
        client_metadata: collectLeadClientMetadata(),
      }),
      keepalive: true,
    }).catch(() => {});
  },
);
