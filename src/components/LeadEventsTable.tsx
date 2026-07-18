import { LEAD_TYPE_LABELS, isLeadType, type LeadType } from "@/lib/lead-types";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

export type LeadEventRow = {
  id: string;
  lead_type: LeadType;
  lead_status: string;
  email: string | null;
  full_name: string | null;
  phone: string | null;
  scenario_code: string | null;
  path: string | null;
  source_url: string | null;
  cta_label: string | null;
  ip_address: string | null;
  created_at: string;
};

function typeBadgeVariant(type: string): "default" | "secondary" | "outline" {
  if (type === "agent_opt_in_submit") return "default";
  if (type === "agent_cta_click") return "secondary";
  return "outline";
}

function leadTypeLabel(type: string): string {
  if (isLeadType(type)) return LEAD_TYPE_LABELS[type as LeadType];
  return type.replace(/_/g, " ");
}

export function LeadEventsTable({ events }: { events: LeadEventRow[] }) {
  if (events.length === 0) {
    return (
      <Card id="lead-events" className="glass scroll-mt-24 p-4 space-y-2">
        <h3 className="font-display font-bold">Lead events (all types)</h3>
        <p className="text-xs text-muted-foreground">No lead events recorded yet.</p>
      </Card>
    );
  }

  const clickCount = events.filter((e) => e.lead_type === "agent_cta_click").length;
  const submitCount = events.filter((e) => e.lead_type === "agent_opt_in_submit").length;

  return (
    <Card id="lead-events" className="glass scroll-mt-24 p-4 space-y-3">
      <div>
        <h3 className="font-display font-bold">Lead events (all types)</h3>
        <p className="text-xs text-muted-foreground">
          Agent CTA clicks are intent leads; completed opt-ins include contact info. Newsletter and
          lead-magnet signups are separate types. Showing {events.length} most recent.
        </p>
        <p className="text-[11px] text-muted-foreground mt-1">
          In this list: {clickCount} agent CTA click(s), {submitCount} completed agent opt-in(s).
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-3 py-2">When</th>
              <th className="px-3 py-2">Type</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Contact</th>
              <th className="px-3 py-2">Scenario</th>
              <th className="px-3 py-2">Page / CTA</th>
              <th className="px-3 py-2">IP</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id} className="border-t border-border align-top">
                <td className="px-3 py-2 text-muted-foreground tabular-nums whitespace-nowrap text-xs">
                  {new Date(event.created_at).toLocaleString()}
                </td>
                <td className="px-3 py-2">
                  <Badge variant={typeBadgeVariant(event.lead_type)} className="text-[10px]">
                    {leadTypeLabel(event.lead_type)}
                  </Badge>
                </td>
                <td className="px-3 py-2 text-xs capitalize">{event.lead_status}</td>
                <td className="px-3 py-2 text-xs">
                  {event.email ? (
                    <div>
                      <div>{event.full_name ?? "—"}</div>
                      <div className="text-muted-foreground">{event.email}</div>
                    </div>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>
                <td className="px-3 py-2 font-mono text-xs">{event.scenario_code ?? "—"}</td>
                <td className="px-3 py-2 text-xs max-w-[14rem]">
                  <div className="truncate" title={event.path ?? undefined}>
                    {event.path ?? "—"}
                  </div>
                  {event.cta_label ? (
                    <div className="text-[10px] text-muted-foreground truncate" title={event.cta_label}>
                      {event.cta_label}
                    </div>
                  ) : null}
                </td>
                <td className="px-3 py-2 font-mono text-xs">{event.ip_address ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
