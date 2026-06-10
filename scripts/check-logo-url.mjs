import React from "react";
import { render } from "@react-email/components";
import { SignupEmail } from "../src/lib/email-templates/signup.tsx";

const html = await render(
  React.createElement(SignupEmail, {
    siteName: "Test",
    siteUrl: "https://getpartb.com",
    recipient: "a@b.com",
    confirmationUrl: "https://x.com",
  }),
);
const match = html.match(/src="[^"]*email-logo[^"]*"/);
console.log("logo src:", match?.[0] ?? "MISSING");
