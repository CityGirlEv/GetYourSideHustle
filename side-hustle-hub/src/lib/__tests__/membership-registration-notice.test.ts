import { describe, expect, it } from "vitest";
import {
  MEMBERSHIP_REGISTRATION_CONTACT_URL,
  ensureMembershipRegistrationNotice,
  membershipRegistrationNoticeHtml,
  membershipRegistrationNoticeText,
} from "../membership-registration-notice";

describe("membership registration notice", () => {
  it("says the email is intended for the person who signed up and links to the contact form", () => {
    const html = membershipRegistrationNoticeHtml();
    expect(html).toMatch(/this email is intended/i);
    expect(html).toMatch(/if you did not create this account/i);
    expect(html).toContain(`href="${MEMBERSHIP_REGISTRATION_CONTACT_URL}"`);
    expect(html).toMatch(/contact GYSH immediately/i);
    expect(membershipRegistrationNoticeText()).toContain(MEMBERSHIP_REGISTRATION_CONTACT_URL);
  });

  it("adds the notice once when a saved template left it out", () => {
    const first = ensureMembershipRegistrationNotice({
      html: "<html><body><p>Welcome</p></body></html>",
      text: "Welcome",
    });
    expect(first.html).toContain(MEMBERSHIP_REGISTRATION_CONTACT_URL);
    expect(first.html).toContain("data-gysh-account-notice");
    expect(first.text).toMatch(/contact GYSH immediately/i);
    const again = ensureMembershipRegistrationNotice(first);
    expect(again.html.match(/data-gysh-account-notice/g)?.length).toBe(1);
  });
});
