/** Shown on membership registration email. Link goes to the public contact form. */
export const MEMBERSHIP_REGISTRATION_CONTACT_URL = "https://getyoursidehustle.com/contact";

const NOTICE_MARKER = "data-gysh-account-notice";

export function membershipRegistrationNoticeHtml(
  contactUrl: string = MEMBERSHIP_REGISTRATION_CONTACT_URL,
): string {
  return `<p style="margin:16px 0 0;padding:12px 14px;background:#fff4e8;border-radius:12px;border-left:4px solid #9B2F28;" ${NOTICE_MARKER}="1">This email is intended for the person who created this GYSH membership. If you did not create this account, <a href="${contactUrl}" style="color:#9B2F28;font-weight:700;">contact GYSH immediately</a>.</p>`;
}

export function membershipRegistrationNoticeText(
  contactUrl: string = MEMBERSHIP_REGISTRATION_CONTACT_URL,
): string {
  return `This email is intended for the person who created this GYSH membership. If you did not create this account, contact GYSH immediately: ${contactUrl}`;
}

/** Keep the notice on the sent email even when a saved template omits it. */
export function ensureMembershipRegistrationNotice(rendered: {
  html: string;
  text: string;
}): { html: string; text: string } {
  const html = rendered.html.includes(NOTICE_MARKER)
    ? rendered.html
    : rendered.html.includes("</body>")
      ? rendered.html.replace("</body>", `${membershipRegistrationNoticeHtml()}</body>`)
      : `${rendered.html}${membershipRegistrationNoticeHtml()}`;
  const text = /did not create this account/i.test(rendered.text)
    ? rendered.text
    : `${rendered.text}\n\n${membershipRegistrationNoticeText()}`;
  return { html, text };
}
