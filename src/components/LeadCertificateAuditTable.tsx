import { Fragment, useState } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export type LeadCertificateAuditRow = {
  id: string;
  expert_contact_request_id: string | null;
  consumer_name: string;
  email: string;
  phone: string;
  scenario_code: string | null;
  agency_name: string;
  assigned_agent_id: string | null;
  assigned_agent_name: string | null;
  ip_address: string | null;
  user_agent: string | null;
  client_metadata: Record<string, unknown>;
  privacy_acknowledged: boolean;
  contact_authorized: boolean;
  marketing_opt_in: boolean;
  submitted_at: string;
  consent_snapshot: Record<string, unknown>;
};

function certificateDetailPayload(cert: LeadCertificateAuditRow) {
  return {
    certificate_id: cert.id,
    expert_contact_request_id: cert.expert_contact_request_id,
    consumer_name: cert.consumer_name,
    email: cert.email,
    phone: cert.phone,
    scenario_code: cert.scenario_code,
    agency_name: cert.agency_name,
    assigned_agent: cert.assigned_agent_id
      ? { id: cert.assigned_agent_id, name: cert.assigned_agent_name }
      : null,
    submitted_at: cert.submitted_at,
    ip_address: cert.ip_address,
    user_agent: cert.user_agent,
    client_metadata: cert.client_metadata,
    privacy_acknowledged: cert.privacy_acknowledged,
    contact_authorized: cert.contact_authorized,
    marketing_opt_in: cert.marketing_opt_in,
    consent_snapshot: cert.consent_snapshot,
  };
}

export function LeadCertificateAuditTable({
  certificates,
}: {
  certificates: LeadCertificateAuditRow[];
}) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (certificates.length === 0) return null;

  return (
    <Card className="glass p-4 space-y-3">
      <div>
        <h3 className="font-display font-bold">Lead certificates (consent audit trail)</h3>
        <p className="text-xs text-muted-foreground">
          Immutable record of consent language shown and checkbox responses at submission. Click a
          row to view the full certificate JSON. Most recent 500 shown.
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-secondary/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-3 py-2 w-8" aria-label="Expand" />
              <th className="px-3 py-2">Submitted</th>
              <th className="px-3 py-2">Name</th>
              <th className="px-3 py-2">Scenario</th>
              <th className="px-3 py-2">Agency</th>
              <th className="px-3 py-2">Assigned agent</th>
              <th className="px-3 py-2">Consents</th>
              <th className="px-3 py-2">IP</th>
              <th className="px-3 py-2">Certificate</th>
            </tr>
          </thead>
          <tbody>
            {certificates.map((cert) => {
              const expanded = expandedId === cert.id;
              return (
                <Fragment key={cert.id}>
                  <tr
                    className="border-t border-border align-top cursor-pointer hover:bg-secondary/30"
                    onClick={() => setExpandedId(expanded ? null : cert.id)}
                  >
                    <td className="px-3 py-2">
                      {expanded ? (
                        <ChevronDown className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      )}
                    </td>
                    <td className="px-3 py-2 text-muted-foreground tabular-nums whitespace-nowrap">
                      {new Date(cert.submitted_at).toLocaleString()}
                    </td>
                    <td className="px-3 py-2">{cert.consumer_name}</td>
                    <td className="px-3 py-2 font-mono text-xs">{cert.scenario_code ?? "—"}</td>
                    <td className="px-3 py-2 text-xs">{cert.agency_name}</td>
                    <td className="px-3 py-2 text-xs">
                      {cert.assigned_agent_name ?? (
                        <span className="text-muted-foreground">Unassigned</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-xs">
                      Privacy {cert.privacy_acknowledged ? "✓" : "✗"} · Contact{" "}
                      {cert.contact_authorized ? "✓" : "✗"} · Marketing{" "}
                      {cert.marketing_opt_in ? "✓" : "—"}
                    </td>
                    <td className="px-3 py-2 text-xs font-mono">{cert.ip_address ?? "—"}</td>
                    <td className="px-3 py-2 text-xs font-mono">{cert.id.slice(0, 8)}…</td>
                  </tr>
                  {expanded && (
                    <tr className="border-t border-border bg-secondary/20">
                      <td colSpan={9} className="px-3 py-3">
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <p className="text-xs font-medium text-muted-foreground">
                            Full certificate record
                          </p>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            onClick={(e) => {
                              e.stopPropagation();
                              void navigator.clipboard.writeText(
                                JSON.stringify(certificateDetailPayload(cert), null, 2),
                              );
                            }}
                          >
                            Copy JSON
                          </Button>
                        </div>
                        <pre className="max-h-80 overflow-auto rounded-md border bg-background p-3 text-[11px] leading-relaxed font-mono whitespace-pre-wrap break-all">
                          {JSON.stringify(certificateDetailPayload(cert), null, 2)}
                        </pre>
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
