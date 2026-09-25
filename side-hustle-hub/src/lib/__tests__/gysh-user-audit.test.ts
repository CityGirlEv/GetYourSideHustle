import { describe, expect, it } from "vitest";
import {
  auditEventsForEmail,
  filterAuditEvents,
  formatLastLoginLabel,
  formatUserAuditAt,
  lastLoginAtFromEvents,
  userAuditActionLabel,
  type UserAuditEvent,
} from "../gysh-user-audit";

const sample: UserAuditEvent[] = [
  {
    at: "2026-08-26T18:00:00.000Z",
    action: "login_failed",
    email: "qa@example.com",
    detail: "bad password",
  },
  {
    at: "2026-08-25T12:00:00.000Z",
    action: "login_ok",
    email: "qa@example.com",
    detail: "member login success",
  },
  {
    at: "2026-08-24T09:00:00.000Z",
    action: "login_ok",
    email: "admin@example.com",
    detail: "admin login success",
  },
];

describe("gysh-user-audit", () => {
  it("labels common audit actions", () => {
    expect(userAuditActionLabel("login_ok")).toBe("Signed in");
    expect(userAuditActionLabel("login_failed")).toBe("Sign-in failed");
    expect(userAuditActionLabel("user_deleted")).toBe("Account deleted");
    expect(userAuditActionLabel("purchase_credit_pack")).toBe("Kid Credit pack purchased");
    expect(userAuditActionLabel("credits_granted")).toBe("Kid Credits granted");
    expect(userAuditActionLabel("credits_removed")).toBe("Kid Credits removed");
    expect(userAuditActionLabel("membership_admin_updated")).toBe("Membership updated by admin");
    expect(userAuditActionLabel("email_sent")).toBe("Email sent");
    expect(userAuditActionLabel("email_failed")).toBe("Email failed");
    expect(userAuditActionLabel("email_skipped")).toBe("Email skipped");
    expect(userAuditActionLabel("custom_event")).toBe("custom event");
  });

  it("filters events by email and finds last login", () => {
    expect(auditEventsForEmail(sample, "QA@example.com")).toHaveLength(2);
    expect(lastLoginAtFromEvents(sample, "qa@example.com")).toBe("2026-08-25T12:00:00.000Z");
    expect(lastLoginAtFromEvents(sample, "nobody@example.com")).toBeNull();
    expect(formatLastLoginLabel(null)).toBe("Never");
  });

  it("formats timestamps", () => {
    expect(formatUserAuditAt("")).toBe("—");
    expect(formatUserAuditAt("not-a-date")).toBe("not-a-date");
    expect(formatUserAuditAt("2026-08-25T12:00:00.000Z")).toMatch(/2026/);
  });

  it("filters the full audit table by email, action, or detail", () => {
    expect(filterAuditEvents(sample, "admin@")).toHaveLength(1);
    expect(filterAuditEvents(sample, "signed in")).toHaveLength(2);
    expect(filterAuditEvents(sample, "bad password")).toHaveLength(1);
    expect(filterAuditEvents(sample, "")).toHaveLength(3);
  });
});
