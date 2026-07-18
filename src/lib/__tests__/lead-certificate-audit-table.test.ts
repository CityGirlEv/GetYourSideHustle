import { describe, expect, it } from "vitest";
import {
  emptyLeadCertificateTableFilters,
  filterLeadCertificateRows,
  leadCertificateColumnValue,
  leadCertificateFilterOptions,
  nextLeadCertificateSortState,
  sortLeadCertificateRows,
  type LeadCertificateAuditRow,
} from "@/lib/lead-certificate-audit-table";

function sampleCertificate(
  overrides: Partial<LeadCertificateAuditRow> = {},
): LeadCertificateAuditRow {
  return {
    id: "11111111-2222-3333-4444-555555555555",
    expert_contact_request_id: "req-1",
    consumer_name: "Jane Doe",
    email: "jane@example.com",
    phone: "555-0100",
    scenario_code: "ABC123",
    agency_name: "Example Agency",
    assigned_agent_id: null,
    assigned_agent_name: null,
    ip_address: "192.168.1.1",
    source_url: "https://mypartb.com/scenario/ABC123",
    consent_text: "Consent text",
    user_agent: "Mozilla/5.0",
    trustedform_cert_url: "https://cert.trustedform.com/abc",
    trustedform_token: null,
    trustedform_ping_url: null,
    client_metadata: { intake_snapshot: { zip3: "902" } },
    privacy_acknowledged: true,
    contact_authorized: true,
    marketing_opt_in: false,
    submitted_at: "2026-01-15T12:00:00.000Z",
    consent_snapshot: { flow: "expert_opt_in" },
    ...overrides,
  };
}

describe("lead certificate audit table filter + sort", () => {
  const rows = [
    sampleCertificate({
      id: "11111111-2222-3333-4444-555555555555",
      consumer_name: "Jane Doe",
      submitted_at: "2026-01-15T12:00:00.000Z",
      client_metadata: { intake_snapshot: { zip3: "902" } },
      assigned_agent_name: null,
    }),
    sampleCertificate({
      id: "22222222-3333-4444-5555-666666666666",
      consumer_name: "John Smith",
      submitted_at: "2026-02-20T08:30:00.000Z",
      scenario_code: "XYZ789",
      client_metadata: { zip3: "100" },
      assigned_agent_name: "Agent One",
      marketing_opt_in: true,
      trustedform_cert_url: null,
    }),
  ];

  it("sorts by submitted date descending by default helper", () => {
    const sorted = sortLeadCertificateRows(rows, "submitted", "desc");
    expect(sorted.map((row) => row.consumer_name)).toEqual(["John Smith", "Jane Doe"]);
  });

  it("sorts by zip ascending", () => {
    const sorted = sortLeadCertificateRows(rows, "zip", "asc");
    expect(sorted.map((row) => leadCertificateColumnValue(row, "zip"))).toEqual([
      "100xx",
      "902xx",
    ]);
  });

  it("sorts by assigned agent label", () => {
    const sorted = sortLeadCertificateRows(rows, "assignedAgent", "asc");
    expect(sorted.map((row) => leadCertificateColumnValue(row, "assignedAgent"))).toEqual([
      "Agent One",
      "Unassigned",
    ]);
  });

  it("filters by multi-select agency", () => {
    const filters = emptyLeadCertificateTableFilters();
    filters.agency = ["Example Agency"];
    const filtered = filterLeadCertificateRows(rows, filters);
    expect(filtered).toHaveLength(2);
  });

  it("filters by assigned agent", () => {
    const filters = emptyLeadCertificateTableFilters();
    filters.assignedAgent = ["Agent One"];
    const filtered = filterLeadCertificateRows(rows, filters);
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.consumer_name).toBe("John Smith");
  });

  it("builds zip filter options", () => {
    const options = leadCertificateFilterOptions(rows, "zip");
    expect(options.map((option) => option.value).sort()).toEqual(["100xx", "902xx"]);
  });

  it("toggles sort direction on repeated column click", () => {
    expect(nextLeadCertificateSortState("submitted", "desc", "submitted")).toEqual({
      key: "submitted",
      direction: "asc",
    });
    expect(nextLeadCertificateSortState("submitted", "asc", "name")).toEqual({
      key: "name",
      direction: "asc",
    });
  });
});
