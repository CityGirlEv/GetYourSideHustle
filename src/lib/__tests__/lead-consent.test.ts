import { describe, expect, it } from "vitest";
import {
  buildLeadConsentSnapshot,
  collectLeadClientMetadata,
  formatLeadConsentText,
  LEAD_CONSENT_FLOW_VERSION,
  LEAD_MARKETING_OPT_IN_LABEL,
  LEAD_OPT_IN_INTRO,
  LEAD_PRIVACY_ACK_LABEL,
  leadContactAuthorizationLabel,
  resolveLeadSourceUrl,
} from "@/lib/lead-consent";
import { LEGAL_OPERATOR_NAME } from "@/lib/legal-content";

describe("lead-consent", () => {
  it("builds a snapshot with required and optional checkbox states", () => {
    const snapshot = buildLeadConsentSnapshot({
      agencyName: LEGAL_OPERATOR_NAME,
      scenarioCode: "abc123",
      privacyAcknowledged: true,
      contactAuthorized: true,
      marketingOptIn: false,
    });

    expect(snapshot.flow_version).toBe(LEAD_CONSENT_FLOW_VERSION);
    expect(snapshot.agency_name).toBe(LEGAL_OPERATOR_NAME);
    expect(snapshot.scenario_code).toBe("ABC123");
    expect(snapshot.checkboxes.privacy_acknowledgment).toMatchObject({
      label: LEAD_PRIVACY_ACK_LABEL,
      checked: true,
      required: true,
    });
    expect(snapshot.checkboxes.contact_authorization.label).toBe(
      leadContactAuthorizationLabel(LEGAL_OPERATOR_NAME),
    );
    expect(LEAD_OPT_IN_INTRO).toContain(LEGAL_OPERATOR_NAME);
    expect(LEAD_OPT_IN_INTRO.toLowerCase()).not.toContain("cms health & wealth insurance partner who");
    expect(snapshot.checkboxes.marketing_opt_in).toMatchObject({
      label: LEAD_MARKETING_OPT_IN_LABEL,
      checked: false,
      required: false,
    });
    expect(snapshot.notices_shown.length).toBeGreaterThan(0);
  });

  it("formats consent text for database audit storage", () => {
    const snapshot = buildLeadConsentSnapshot({
      privacyAcknowledged: true,
      contactAuthorized: true,
      marketingOptIn: true,
    });
    const text = formatLeadConsentText(snapshot);
    expect(text).toContain(LEAD_PRIVACY_ACK_LABEL);
    expect(text).toContain("[x]");
    expect(text).toContain(LEAD_MARKETING_OPT_IN_LABEL);
  });

  it("captures page URL in client metadata and resolves source URL", () => {
    const metadata = collectLeadClientMetadata();
    expect(metadata.pageUrl).toBeTruthy();
    expect(resolveLeadSourceUrl(metadata)).toBe(metadata.pageUrl);
    expect(resolveLeadSourceUrl({ pageUrl: "javascript:alert(1)" })).toBeNull();
  });
});
