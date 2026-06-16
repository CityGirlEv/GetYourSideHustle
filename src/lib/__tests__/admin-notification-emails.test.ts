import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  DEFAULT_ADMIN_NOTIFICATION_EMAILS,
  getAdminNotificationEmails,
  getAdminBccEmails,
} from "@/lib/admin-notification-emails";

describe("getAdminNotificationEmails", () => {
  let prev: string | undefined;

  beforeEach(() => {
    prev = process.env.ADMIN_NOTIFICATION_EMAILS;
  });

  afterEach(() => {
    if (prev === undefined) delete process.env.ADMIN_NOTIFICATION_EMAILS;
    else process.env.ADMIN_NOTIFICATION_EMAILS = prev;
  });

  it("defaults to the real admin BCC inboxes", () => {
    delete process.env.ADMIN_NOTIFICATION_EMAILS;
    expect(getAdminNotificationEmails()).toEqual([
      "evelyn3@cox.net",
      "sharpebanker@yahoo.com",
      "info@mypartb.com",
      "getpartb@gmail.com",
    ]);
  });

  it("excludes primary admins from [BCC] copies (they get *-admin templates directly)", () => {
    delete process.env.ADMIN_NOTIFICATION_EMAILS;
    expect(getAdminBccEmails()).toEqual(["info@mypartb.com", "getpartb@gmail.com"]);
  });

  it("ignores placeholder admin@example.com and falls back to defaults", () => {
    process.env.ADMIN_NOTIFICATION_EMAILS = "admin@example.com";
    expect(getAdminNotificationEmails()).toEqual([...DEFAULT_ADMIN_NOTIFICATION_EMAILS]);
  });

  it("accepts custom real addresses from env", () => {
    process.env.ADMIN_NOTIFICATION_EMAILS = "ops@company.com, alerts@company.com";
    expect(getAdminNotificationEmails()).toEqual(["ops@company.com", "alerts@company.com"]);
  });

  it("merges env with defaults when env includes only placeholders", () => {
    process.env.ADMIN_NOTIFICATION_EMAILS = "admin@example.com, qa@example.com";
    expect(getAdminNotificationEmails()).toEqual([...DEFAULT_ADMIN_NOTIFICATION_EMAILS]);
  });
});
