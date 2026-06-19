import React from "react";
import { render } from "@react-email/components";
import { InviteEmail } from "../src/lib/email-templates/invite.tsx";

const html = await render(
  React.createElement(InviteEmail, {
    siteName: "Part B Optimizer",
    siteUrl: "https://mypartb.pages.dev",
    confirmationUrl: "https://example.com/confirm",
  }),
);
console.log("logo:", html.includes("email-footer-logo"));
console.log("MEDICARE:", html.includes("MEDICARE"));
console.log("header bg:", html.includes("e4ebf8"));
const idx = html.indexOf("MEDICARE");
console.log(html.slice(Math.max(0, idx - 400), idx + 200));
