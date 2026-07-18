import { multiSelectMatches } from "@/components/ui/multi-select";
import type { MultiSelectOption } from "@/components/ui/multi-select";

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
  source_url: string | null;
  consent_text: string | null;
  user_agent: string | null;
  trustedform_cert_url: string | null;
  trustedform_token: string | null;
  trustedform_ping_url: string | null;
  client_metadata: Record<string, unknown>;
  privacy_acknowledged: boolean;
  contact_authorized: boolean;
  marketing_opt_in: boolean;
  submitted_at: string;
  consent_snapshot: Record<string, unknown>;
};

export type LeadCertificateColumnKey =
  | "submitted"
  | "zip"
  | "name"
  | "scenario"
  | "agency"
  | "assignedAgent"
  | "consents"
  | "ip"
  | "sourceUrl"
  | "trustedform"
  | "certificate";

export const LEAD_CERTIFICATE_COLUMNS: {
  key: LeadCertificateColumnKey;
  label: string;
  align?: "left" | "right";
}[] = [
  { key: "submitted", label: "Submitted" },
  { key: "zip", label: "ZIP" },
  { key: "name", label: "Name" },
  { key: "scenario", label: "Scenario" },
  { key: "agency", label: "Agency" },
  { key: "assignedAgent", label: "Assigned agent" },
  { key: "consents", label: "Consents" },
  { key: "ip", label: "IP" },
  { key: "sourceUrl", label: "Source URL" },
  { key: "trustedform", label: "TrustedForm" },
  { key: "certificate", label: "Certificate" },
];

export type LeadCertificateTableFilters = Record<LeadCertificateColumnKey, string[]>;

export type LeadCertificateSortKey = LeadCertificateColumnKey;
export type LeadCertificateSortDirection = "asc" | "desc";

export function emptyLeadCertificateTableFilters(): LeadCertificateTableFilters {
  return Object.fromEntries(
    LEAD_CERTIFICATE_COLUMNS.map((column) => [column.key, []]),
  ) as LeadCertificateTableFilters;
}

export function leadCertificateZip3(cert: LeadCertificateAuditRow): string | null {
  const meta = cert.client_metadata;
  const intake = meta.intake_snapshot;
  if (intake && typeof intake === "object" && intake !== null) {
    const zip3 = (intake as Record<string, unknown>).zip3;
    if (typeof zip3 === "string" && zip3.trim()) return zip3.trim();
  }
  const direct = meta.zip3;
  if (typeof direct === "string" && direct.trim()) return direct.trim();
  return null;
}

function formatConsents(cert: LeadCertificateAuditRow): string {
  const privacy = cert.privacy_acknowledged ? "✓" : "✗";
  const contact = cert.contact_authorized ? "✓" : "✗";
  const marketing = cert.marketing_opt_in ? "✓" : "—";
  return `Privacy ${privacy} · Contact ${contact} · Marketing ${marketing}`;
}

function assignedAgentLabel(cert: LeadCertificateAuditRow): string {
  return cert.assigned_agent_name?.trim() || "Unassigned";
}

function trustedFormLabel(cert: LeadCertificateAuditRow): string {
  return cert.trustedform_cert_url ? "Has certificate" : "—";
}

function sourceUrlLabel(cert: LeadCertificateAuditRow): string {
  if (!cert.source_url) return "—";
  return cert.source_url.replace(/^https?:\/\//, "");
}

export function leadCertificateColumnValue(
  cert: LeadCertificateAuditRow,
  column: LeadCertificateColumnKey,
): string {
  switch (column) {
    case "submitted":
      return new Date(cert.submitted_at).toLocaleString();
    case "zip": {
      const zip3 = leadCertificateZip3(cert);
      return zip3 ? `${zip3}xx` : "—";
    }
    case "name":
      return cert.consumer_name;
    case "scenario":
      return cert.scenario_code ?? "—";
    case "agency":
      return cert.agency_name;
    case "assignedAgent":
      return assignedAgentLabel(cert);
    case "consents":
      return formatConsents(cert);
    case "ip":
      return cert.ip_address ?? "—";
    case "sourceUrl":
      return sourceUrlLabel(cert);
    case "trustedform":
      return trustedFormLabel(cert);
    case "certificate":
      return `${cert.id.slice(0, 8)}…`;
    default:
      return "";
  }
}

function leadCertificateSortComparable(
  cert: LeadCertificateAuditRow,
  column: LeadCertificateColumnKey,
): string | number {
  switch (column) {
    case "submitted":
      return new Date(cert.submitted_at).getTime();
    case "zip": {
      const zip3 = leadCertificateZip3(cert);
      return zip3 ?? "";
    }
    default:
      return leadCertificateColumnValue(cert, column).toLowerCase();
  }
}

export function leadCertificateFilterOptions(
  rows: LeadCertificateAuditRow[],
  column: LeadCertificateColumnKey,
): MultiSelectOption[] {
  const seen = new Map<string, string>();
  for (const row of rows) {
    const value = leadCertificateColumnValue(row, column);
    if (!seen.has(value)) {
      seen.set(value, value);
    }
  }
  return [...seen.entries()]
    .map(([value, label]) => ({ value, label }))
    .sort((a, b) =>
      a.label.localeCompare(b.label, undefined, { numeric: true, sensitivity: "base" }),
    );
}

export function filterLeadCertificateRows(
  rows: LeadCertificateAuditRow[],
  filters: LeadCertificateTableFilters,
): LeadCertificateAuditRow[] {
  return rows.filter((row) =>
    LEAD_CERTIFICATE_COLUMNS.every((column) =>
      multiSelectMatches(filters[column.key], leadCertificateColumnValue(row, column.key)),
    ),
  );
}

export function hasActiveLeadCertificateFilters(filters: LeadCertificateTableFilters): boolean {
  return LEAD_CERTIFICATE_COLUMNS.some((column) => filters[column.key].length > 0);
}

export function sortLeadCertificateRows(
  rows: LeadCertificateAuditRow[],
  key: LeadCertificateSortKey,
  direction: LeadCertificateSortDirection,
): LeadCertificateAuditRow[] {
  const dir = direction === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
    const av = leadCertificateSortComparable(a, key);
    const bv = leadCertificateSortComparable(b, key);
    if (typeof av === "number" && typeof bv === "number") {
      return (av - bv) * dir;
    }
    return (
      String(av).localeCompare(String(bv), undefined, { numeric: true, sensitivity: "base" }) *
      dir
    );
  });
}

export function nextLeadCertificateSortState(
  currentKey: LeadCertificateSortKey,
  currentDir: LeadCertificateSortDirection,
  clicked: LeadCertificateSortKey,
): { key: LeadCertificateSortKey; direction: LeadCertificateSortDirection } {
  if (currentKey !== clicked) {
    return { key: clicked, direction: "asc" };
  }
  return { key: clicked, direction: currentDir === "asc" ? "desc" : "asc" };
}

export function certificateDetailPayload(cert: LeadCertificateAuditRow) {
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
    source_url: cert.source_url,
    consent_text: cert.consent_text,
    user_agent: cert.user_agent,
    trustedform_cert_url: cert.trustedform_cert_url,
    trustedform_token: cert.trustedform_token,
    trustedform_ping_url: cert.trustedform_ping_url,
    client_metadata: cert.client_metadata,
    privacy_acknowledged: cert.privacy_acknowledged,
    contact_authorized: cert.contact_authorized,
    marketing_opt_in: cert.marketing_opt_in,
    consent_snapshot: cert.consent_snapshot,
  };
}
