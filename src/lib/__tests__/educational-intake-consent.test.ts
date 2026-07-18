import { describe, expect, it } from "vitest";
import {
  buildEducationalIntakeConsentSnapshot,
  EDUCATIONAL_INTAKE_AGENCY_NOTICE,
  EDUCATIONAL_INTAKE_CONTACT_CONSENT_LABEL,
  EDUCATIONAL_INTAKE_CONSENT_FLOW_VERSION,
  formatEducationalIntakeConsentText,
} from "@/lib/lead-consent";

describe("educational intake consent", () => {
  it("builds a compliance record with consent text, checked state, IP, and UTC timestamp", () => {
    const recordedAt = "2026-06-09T12:34:56.789Z";
    const snapshot = buildEducationalIntakeConsentSnapshot({
      partnerContactConsent: true,
      ipAddress: "203.0.113.10",
      recordedAtUtc: recordedAt,
    });

    expect(snapshot.flow_version).toBe(EDUCATIONAL_INTAKE_CONSENT_FLOW_VERSION);
    expect(snapshot.intake_kind).toBe("educational_cost_estimator");
    expect(snapshot.notices_shown).toContain(EDUCATIONAL_INTAKE_AGENCY_NOTICE);
    expect(snapshot.checkboxes.partner_contact_consent).toMatchObject({
      label: EDUCATIONAL_INTAKE_CONTACT_CONSENT_LABEL,
      checked: true,
      required: true,
    });
    expect(snapshot.compliance_records).toHaveLength(1);
    expect(snapshot.compliance_records[0]).toEqual({
      consent_text: EDUCATIONAL_INTAKE_CONTACT_CONSENT_LABEL,
      checked: true,
      ip_address: "203.0.113.10",
      recorded_at_utc: recordedAt,
    });
  });

  it("formats consent text for audit storage", () => {
    const snapshot = buildEducationalIntakeConsentSnapshot({
      partnerContactConsent: true,
      ipAddress: null,
      recordedAtUtc: "2026-06-09T00:00:00.000Z",
    });
    const text = formatEducationalIntakeConsentText(snapshot);
    expect(text).toContain(EDUCATIONAL_INTAKE_CONTACT_CONSENT_LABEL);
    expect(text).toContain("[x]");
    expect(text).toContain("Compliance records:");
    expect(text).toContain("ip=unknown");
  });
});
