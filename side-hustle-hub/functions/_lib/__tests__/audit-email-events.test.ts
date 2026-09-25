import { describe, expect, it } from "vitest";
import {
  emailLogRowToAuditEvent,
  emailStatusToAuditAction,
  mergeAuditEventsWithEmails,
} from "../audit-email-events";

describe("audit-email-events", () => {
  it("maps email_log statuses to audit actions", () => {
    expect(emailStatusToAuditAction("sent")).toBe("email_sent");
    expect(emailStatusToAuditAction("failed")).toBe("email_failed");
    expect(emailStatusToAuditAction("skipped")).toBe("email_skipped");
  });

  it("puts subject and template in the detail line", () => {
    expect(
      emailLogRowToAuditEvent({
        toEmail: "QA@example.com",
        subject: "Welcome to GYSH",
        templateSlug: "welcome",
        status: "sent",
        createdAt: "2026-09-24T15:00:00.000Z",
      }),
    ).toEqual({
      at: "2026-09-24T15:00:00.000Z",
      action: "email_sent",
      email: "qa@example.com",
      detail: "Welcome to GYSH · welcome",
    });
  });

  it("merges email rows into audit events newest first", () => {
    const merged = mergeAuditEventsWithEmails(
      [
        {
          at: "2026-09-24T12:00:00.000Z",
          action: "login_ok",
          email: "qa@example.com",
          detail: "member login success",
        },
      ],
      [
        {
          toEmail: "qa@example.com",
          subject: "Password reset",
          templateSlug: "password_reset",
          status: "sent",
          createdAt: "2026-09-24T14:00:00.000Z",
        },
      ],
      10,
    );
    expect(merged.map((e) => e.action)).toEqual(["email_sent", "login_ok"]);
  });
});
