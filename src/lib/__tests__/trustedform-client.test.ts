import { describe, expect, it } from "vitest";
import {
  readTrustedFormFields,
  TRUSTEDFORM_CERT_FIELD,
  TRUSTEDFORM_PING_FIELD,
  TRUSTEDFORM_TOKEN_FIELD,
  trustedFormVerifyDomain,
} from "@/lib/trustedform-client";

describe("trustedform-client", () => {
  it("reads hidden TrustedForm fields from a form", () => {
    const form = document.createElement("form");
    const cert = document.createElement("input");
    cert.name = TRUSTEDFORM_CERT_FIELD;
    cert.value = "https://cert.trustedform.com/abc123";
    const token = document.createElement("input");
    token.name = TRUSTEDFORM_TOKEN_FIELD;
    token.value = "token-value";
    const ping = document.createElement("input");
    ping.name = TRUSTEDFORM_PING_FIELD;
    ping.value = "https://cert.trustedform.com/abc123/ping";
    form.append(cert, token, ping);

    expect(readTrustedFormFields(form)).toEqual({
      certUrl: "https://cert.trustedform.com/abc123",
      token: "token-value",
      pingUrl: "https://cert.trustedform.com/abc123/ping",
    });
  });

  it("returns nulls when TrustedForm fields are missing", () => {
    const form = document.createElement("form");
    expect(readTrustedFormFields(form)).toEqual({
      certUrl: null,
      token: null,
      pingUrl: null,
    });
  });

  it("uses mypartb.com for domain verification", () => {
    expect(trustedFormVerifyDomain()).toBe("mypartb.com");
  });
});
