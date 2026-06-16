import { describe, it, expect } from "vitest";
import { Route as TestEmailRoute } from "@/routes/api/public/send-test-email";
import { Route as TransactionalSendRoute } from "@/routes/api/email/transactional/send";

const testEmailHandler = (TestEmailRoute as any).options.server.handlers.POST as (ctx: {
  request: Request;
}) => Promise<Response>;
const sendHandler = (TransactionalSendRoute as any).options.server.handlers.POST as (ctx: {
  request: Request;
}) => Promise<Response>;

describe("send-test-email endpoint authorization", () => {
  it("is disabled (503) when TEST_EMAIL_SECRET is not configured", async () => {
    const prev = process.env.TEST_EMAIL_SECRET;
    delete process.env.TEST_EMAIL_SECRET;
    try {
      const res = await testEmailHandler({
        request: new Request("https://example.test/api/public/send-test-email", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recipient: "a@b.com", template: "welcome" }),
        }),
      });
      expect(res.status).toBe(503);
    } finally {
      if (prev !== undefined) process.env.TEST_EMAIL_SECRET = prev;
    }
  });

  it("rejects (401) when the secret query param does not match", async () => {
    const prev = process.env.TEST_EMAIL_SECRET;
    process.env.TEST_EMAIL_SECRET = "real-secret";
    try {
      const res = await testEmailHandler({
        request: new Request("https://example.test/api/public/send-test-email?secret=wrong", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ recipient: "a@b.com" }),
        }),
      });
      expect(res.status).toBe(401);
    } finally {
      if (prev === undefined) delete process.env.TEST_EMAIL_SECRET;
      else process.env.TEST_EMAIL_SECRET = prev;
    }
  });
});

describe("transactional send endpoint authorization", () => {
  it("rejects requests without an Authorization header", async () => {
    const res = await sendHandler({
      request: new Request("https://example.test/api/email/transactional/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ templateName: "welcome", recipientEmail: "a@b.com" }),
      }),
    });
    expect(res.status).toBe(401);
  });
});
