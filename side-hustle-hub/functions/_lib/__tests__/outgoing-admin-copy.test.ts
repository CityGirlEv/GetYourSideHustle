import { describe, expect, it } from "vitest";
import { outgoingAdminCopy, adminRecipients } from "../email";
import { ADMIN_EMAIL, ADMIN_NOTIFY_CC } from "../email-brand";

describe("outgoingAdminCopy", () => {
  it("BCCs info@ and Evelyn on member mail, without duplicating the member To", () => {
    const bcc = outgoingAdminCopy("lorraine.simon.lsl@gmail.com");
    expect(bcc).toContain(ADMIN_EMAIL);
    expect(bcc).toContain("evelyn3@cox.net");
    expect(bcc).toContain(ADMIN_NOTIFY_CC[0]);
    expect(bcc).not.toContain("lorraine.simon.lsl@gmail.com");
  });

  it("does not BCC an address already in To (admin-facing sends)", () => {
    const bcc = outgoingAdminCopy([ADMIN_EMAIL, "evelyn3@cox.net"]);
    expect(bcc).not.toContain(ADMIN_EMAIL);
    expect(bcc).not.toContain("evelyn3@cox.net");
    expect(bcc.length).toBeGreaterThan(0);
  });

  it("uses CONTACT_TO when set", () => {
    const bcc = outgoingAdminCopy("member@example.com", { CONTACT_TO: "ops@getyoursidehustle.com" });
    expect(bcc).toContain("ops@getyoursidehustle.com");
  });
});

describe("adminRecipients", () => {
  it("still includes partner admins on ops alerts", () => {
    const recips = adminRecipients({} as never);
    expect(recips).toContain(ADMIN_EMAIL);
    expect(recips).toContain("evelyn3@cox.net");
    expect(recips).toContain("tinamariebarham@gmail.com");
  });
});
