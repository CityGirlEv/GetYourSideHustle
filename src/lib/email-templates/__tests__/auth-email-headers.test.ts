import { describe, it, expect } from "vitest";
import * as React from "react";
import { render } from "@react-email/components";
import { SignupEmail } from "../signup";
import { InviteEmail } from "../invite";
import { MagicLinkEmail } from "../magic-link";
import { RecoveryEmail } from "../recovery";
import { EmailChangeEmail } from "../email-change";
import { ReauthenticationEmail } from "../reauthentication";
import { DEFAULT_EMAIL_SITE_URL } from "../email-header";
import { EMAIL_LOGO_CACHE_VERSION } from "@/lib/email-logo-version";

const MYPARTB = "https://www.mypartb.com";
const ASSET_LOGO = `${DEFAULT_EMAIL_SITE_URL}/email-logo.png?v=${EMAIL_LOGO_CACHE_VERSION}`;

const authTemplates = [
  {
    name: "signup",
    component: SignupEmail,
    props: {
      siteName: "The Part B Optimizer Benchmark Tool",
      siteUrl: MYPARTB,
      recipient: "user@example.com",
      confirmationUrl: `${MYPARTB}/confirm`,
    },
  },
  {
    name: "invite",
    component: InviteEmail,
    props: {
      siteName: "The Part B Optimizer Benchmark Tool",
      siteUrl: MYPARTB,
      confirmationUrl: `${MYPARTB}/invite`,
    },
  },
  {
    name: "magic-link",
    component: MagicLinkEmail,
    props: {
      siteName: "The Part B Optimizer Benchmark Tool",
      siteUrl: MYPARTB,
      recipient: "user@example.com",
      confirmationUrl: `${MYPARTB}/magic`,
    },
  },
  {
    name: "recovery",
    component: RecoveryEmail,
    props: {
      siteName: "The Part B Optimizer Benchmark Tool",
      siteUrl: MYPARTB,
      recipient: "user@example.com",
      confirmationUrl: `${MYPARTB}/reset`,
    },
  },
  {
    name: "email-change",
    component: EmailChangeEmail,
    props: {
      siteName: "The Part B Optimizer Benchmark Tool",
      siteUrl: MYPARTB,
      email: "new@example.com",
      oldEmail: "old@example.com",
      newEmail: "new@example.com",
      confirmationUrl: `${MYPARTB}/email-change`,
    },
  },
  {
    name: "reauthentication",
    component: ReauthenticationEmail,
    props: {
      siteUrl: MYPARTB,
      token: "123456",
    },
  },
] as const;

describe("auth email headers", () => {
  it.each(authTemplates)(
    "$name loads the logo from the app asset host when siteUrl is mypartb.com",
    async ({ component, props }) => {
      const html = await render(React.createElement(component as any, props as any));
      expect(html).toContain(ASSET_LOGO);
      expect(html).not.toMatch(/src="https:\/\/www\.mypartb\.com\/email-logo\.png"/);
      expect(html).toContain("email-brand-logo");
      expect(html).toContain('alt="Part B Optimizer Benchmark Tool"');
    },
  );
});
