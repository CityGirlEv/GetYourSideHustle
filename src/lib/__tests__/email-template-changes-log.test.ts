import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const SRC = readFileSync(resolve(__dirname, "../email-template-admin.functions.ts"), "utf8");

describe("listEmailTemplateChanges server function", () => {
  it("is exported and admin-gated", () => {
    expect(SRC).toMatch(/export const listEmailTemplateChanges/);
    expect(SRC).toMatch(/listEmailTemplateChanges[\s\S]*verifyAdmin\(context\.userId\)/);
  });

  it("reads template save/delete actions from audit_logs", () => {
    expect(SRC).toMatch(/from\(['"]audit_logs['"]\)/);
    expect(SRC).toMatch(/SAVE_EMAIL_TEMPLATE_OVERRIDE/);
    expect(SRC).toMatch(/DELETE_EMAIL_TEMPLATE_OVERRIDE/);
  });
});
