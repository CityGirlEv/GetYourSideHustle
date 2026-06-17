import { describe, expect, it } from "vitest";
import { formatEmailLogRecipient } from "@/lib/email-recipient-names.server";

describe("formatEmailLogRecipient", () => {
  it("uses resolved profile name when available", () => {
    const map = new Map([["jane@example.com", "Jane Tester"]]);
    expect(formatEmailLogRecipient("jane@example.com", map)).toEqual({
      recipient_name: "Jane Tester",
      recipient_email: "jane@example.com",
    });
  });

  it("falls back to email when no name is known", () => {
    const map = new Map<string, string>();
    expect(formatEmailLogRecipient("unknown@example.com", map)).toEqual({
      recipient_name: "unknown@example.com",
      recipient_email: "unknown@example.com",
    });
  });

  it("labels legacy uuid recipient values", () => {
    const map = new Map<string, string>();
    expect(
      formatEmailLogRecipient("37babcbf-4a0e-44fa-871e-f86b95aad059", map),
    ).toEqual({
      recipient_name: "Unknown recipient",
      recipient_email: "37babcbf-4a0e-44fa-871e-f86b95aad059",
    });
  });
});
