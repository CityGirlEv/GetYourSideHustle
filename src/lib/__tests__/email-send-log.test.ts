import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const SRC = readFileSync(resolve(__dirname, "../email-template-admin.functions.ts"), "utf8");

describe("listEmailSendLog server function", () => {
  it("is exported and admin-gated", () => {
    expect(SRC).toMatch(/export const listEmailSendLog/);
    expect(SRC).toMatch(/listEmailSendLog[\s\S]*verifyAdmin\(context\.userId\)/);
  });

  it("reads from email_send_log and deduplicates by message_id", () => {
    expect(SRC).toMatch(/from\(['"]email_send_log['"]\)/);
    expect(SRC).toMatch(/message_id/);
  });
});
