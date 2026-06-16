import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

// The server function module imports TanStack's createMiddleware, which is
// not usable inside the vitest environment, so we assert the contract by
// reading the source file rather than importing it.
const SRC = readFileSync(resolve(__dirname, "../email-template-admin.functions.ts"), "utf8");

describe("sendEmailTemplateTest server function", () => {
  it("is exported and admin-gated", () => {
    expect(SRC).toMatch(/export const sendEmailTemplateTest/);
    expect(SRC).toMatch(/sendEmailTemplateTest[\s\S]*verifyAdmin\(context\.userId\)/);
  });

  it("enqueues into the transactional queue with a [TEST] subject prefix", () => {
    expect(SRC).toMatch(/queue_name: ['"]transactional_emails['"]/);
    expect(SRC).toMatch(/\[TEST\] \$\{merged\.subject\}/);
  });

  it("validates recipient as an email and caps payload sizes", () => {
    expect(SRC).toMatch(/recipient: z\.string\(\)\.email\(\)/);
    expect(SRC).toMatch(/html: z\.string\(\)\.min\(1\)\.max\(200_000\)/);
  });
});
