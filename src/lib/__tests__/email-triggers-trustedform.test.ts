import { describe, expect, it } from "vitest";

// Mirror server helper — keep in sync with email-triggers.functions.ts
function trustedFormInsertFields(data: {
  trustedform_cert_url?: string | null;
  trustedform_token?: string | null;
  trustedform_ping_url?: string | null;
}): Record<string, string> {
  const out: Record<string, string> = {};
  if (data.trustedform_cert_url) out.trustedform_cert_url = data.trustedform_cert_url;
  if (data.trustedform_token) out.trustedform_token = data.trustedform_token;
  if (data.trustedform_ping_url) out.trustedform_ping_url = data.trustedform_ping_url;
  return out;
}

describe("trustedFormInsertFields", () => {
  it("omits empty TrustedForm fields so inserts work before migration", () => {
    expect(
      trustedFormInsertFields({
        trustedform_cert_url: null,
        trustedform_token: null,
        trustedform_ping_url: null,
      }),
    ).toEqual({});
  });

  it("includes populated TrustedForm fields", () => {
    expect(
      trustedFormInsertFields({
        trustedform_cert_url: "https://cert.trustedform.com/abc",
        trustedform_token: "tok",
        trustedform_ping_url: null,
      }),
    ).toEqual({
      trustedform_cert_url: "https://cert.trustedform.com/abc",
      trustedform_token: "tok",
    });
  });
});
