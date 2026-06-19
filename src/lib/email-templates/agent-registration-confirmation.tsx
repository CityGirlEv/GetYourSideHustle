import * as React from "react";
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { TemplateEntry } from "./registry";
import { EmailHeader } from "./email-header";
import { EmailFooter } from "./email-footer";
import { resolveEmailSiteUrl } from "./email-header";

import { SITE_BRAND_NAME, SITE_BRAND_THE } from "@/lib/site-brand";

export interface AgentRegistrationConfirmationProps {
  firstName?: string;
  lastName?: string;
  email?: string;
  signInUrl?: string;
  forgotPasswordUrl?: string;
}

const AgentRegistrationConfirmationEmail = ({
  firstName = "",
  email = "",
  signInUrl,
  forgotPasswordUrl,
}: AgentRegistrationConfirmationProps) => {
  const siteUrl = resolveEmailSiteUrl();
  const loginUrl = signInUrl ?? `${siteUrl}/auth?tab=sign-in`;
  const resetUrl = forgotPasswordUrl ?? loginUrl;
  const greetingName = firstName.trim() || "there";

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>Your agent registration is submitted — next steps</Preview>
      <Body style={main}>
        <Container style={container}>
          <EmailHeader siteUrl={siteUrl} />
          <Heading style={h1}>Registration submitted — next steps</Heading>
          <Text style={text}>
            Hi <strong>{greetingName}</strong>, Your NDA is signed and your account has been
            created on <strong>{SITE_BRAND_THE}</strong>.
          </Text>

          <Section style={alertBox}>
            <Text style={alertTitle}>Your account is under review.</Text>
            <Text style={alertBody}>
              It is <strong>disabled</strong> until an administrator approves it. You will{" "}
              <strong>not</strong> be able to sign in yet.
            </Text>
          </Section>

          <Text style={sectionHeading}>What happens next</Text>
          <Text style={listItem}>
            1. An admin reviews your request (typically within 1 business day).
          </Text>
          <Text style={listItem}>
            2. Once approved, you&apos;ll receive an{" "}
            <strong>email at {email || "your address"}</strong> letting you know your account is
            active.
          </Text>
          <Text style={listItem}>
            3. Return to the sign-in tab and log in with your email and the password you chose
            during registration.
          </Text>

          <Section style={card}>
            <Text style={cardLabel}>Confirm your password</Text>
            <Text style={cardValue}>
              You set a password when you registered. Please confirm you remember it — you will need
              the same password to sign in after approval. If you want to change it later, use{" "}
              <strong>Forgot / Reset Password</strong> on the sign-in page.
            </Text>
            <Text style={cardValueSecondary}>
              If you have previously registered but not created a password, click the{" "}
              <Link href={resetUrl} style={link}>
                Forgot Password
              </Link>{" "}
              link to set a password.
            </Text>
          </Section>

          <Section style={buttonRow}>
            <Button style={button} href={loginUrl}>
              Go to sign-in
            </Button>
          </Section>
          <Text style={footer}>Thank you for joining {SITE_BRAND_THE} as a licensed advisor.</Text>
          <EmailFooter siteUrl={siteUrl} />
        </Container>
      </Body>
    </Html>
  );
};

export const template = {
  component: AgentRegistrationConfirmationEmail,
  subject: "Your agent registration is submitted — next steps",
  displayName: "Agent registration confirmation",
  previewData: {
    firstName: "Jane",
    lastName: "Doe",
    email: "jane@example.com",
    signInUrl: "https://mypartb.com/auth?tab=sign-in",
  },
} satisfies TemplateEntry;

const main = { backgroundColor: "#ffffff", fontFamily: "Arial, sans-serif" };
const container = { padding: "20px 25px" };
const h1 = {
  fontSize: "12px",
  fontWeight: "bold" as const,
  color: "#000000",
  margin: "0 0 16px",
};
const text = { fontSize: "12px", color: "#55575d", lineHeight: "1.6", margin: "0 0 20px" };
const alertBox = {
  border: "1px solid #fcd34d",
  borderRadius: "8px",
  padding: "14px 16px",
  backgroundColor: "#fffbeb",
  margin: "0 0 24px",
};
const alertTitle = {
  fontSize: "12px",
  fontWeight: "bold" as const,
  color: "#92400e",
  margin: "0 0 6px",
};
const alertBody = {
  fontSize: "12px",
  color: "#78350f",
  lineHeight: "1.55",
  margin: 0,
};
const sectionHeading = {
  fontSize: "12px",
  fontWeight: "bold" as const,
  color: "#0f172a",
  margin: "0 0 12px",
};
const listItem = {
  fontSize: "12px",
  color: "#64748b",
  lineHeight: "1.6",
  margin: "0 0 10px",
  paddingLeft: "4px",
};
const card = {
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  padding: "14px 16px",
  backgroundColor: "#f8fafc",
  margin: "0 0 24px",
};
const cardLabel = {
  fontSize: "12px",
  fontWeight: "bold" as const,
  color: "#64748b",
  margin: "0 0 4px",
  textTransform: "uppercase" as const,
  letterSpacing: "0.04em",
};
const cardValue = { fontSize: "12px", color: "#0f172a", margin: 0, lineHeight: "1.5" };
const cardValueSecondary = {
  fontSize: "12px",
  color: "#0f172a",
  margin: "12px 0 0",
  lineHeight: "1.5",
};
const buttonRow = { margin: "0 0 8px" };
const button = {
  backgroundColor: "#002870",
  color: "#ffffff",
  fontSize: "12px",
  borderRadius: "8px",
  padding: "12px 20px",
  textDecoration: "none",
};
const link = { color: "#002870", textDecoration: "underline" };
const footer = { fontSize: "12px", color: "#999999", margin: "24px 0 0" };
