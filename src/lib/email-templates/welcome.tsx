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

const SITE_NAME = "Get Part B Optimizer";

interface Props {
  recipientName?: string;
  signInUrl?: string;
  forgotPasswordUrl?: string;
  resetPasswordUrl?: string;
  needsPasswordSetup?: boolean;
}

const WelcomeEmail = ({
  recipientName,
  signInUrl,
  forgotPasswordUrl,
  resetPasswordUrl,
  needsPasswordSetup = false,
}: Props) => {
  const siteUrl = resolveEmailSiteUrl();
  const loginUrl = signInUrl ?? `${siteUrl}/auth?tab=sign-in`;
  const resetEntryUrl = forgotPasswordUrl ?? loginUrl;
  const setPasswordUrl = resetPasswordUrl ?? resetEntryUrl;

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>Your {SITE_NAME} account is active</Preview>
      <Body style={main}>
        <Container style={container}>
          <EmailHeader siteUrl={siteUrl} />
          <Heading style={h1}>Hi <strong>{recipientName || "there"}</strong>,</Heading>
          <Text style={text}>Your account is active! An administrator has approved your account.</Text>
          {needsPasswordSetup ? (
            <>
              <Text style={text}>
                You registered before we required passwords, so you never set one. To access{" "}
                {SITE_NAME}, sign in if you already created a password elsewhere, or set your
                password using the link below.
              </Text>
              <Text style={text}>
                When you set your password, QA testers will first confirm which phone and computer
                devices they can test on — the same step new registrants complete.
              </Text>
              <Button style={button} href={setPasswordUrl}>
                Set your password
              </Button>
              <Text style={text}>
                Prefer the sign-in page? Go to the{" "}
                <Link href={loginUrl} style={link}>
                  sign-in page
                </Link>{" "}
                and click <strong>Forgot / Reset Password</strong> to create one.
              </Text>
            </>
          ) : (
            <>
              <Text style={text}>
                An administrator has approved your account. You can now sign in to {SITE_NAME}.
              </Text>
              <Text style={text}>
                Sign in with your email and the password you confirmed during registration.
              </Text>
              <Button style={button} href={loginUrl}>
                Sign in
              </Button>
              <Text style={hint}>
                Need to reset your password?{" "}
                <Link href={resetEntryUrl} style={link}>
                  Use Forgot / Reset Password on the sign-in page
                </Link>
                .
              </Text>
            </>
          )}
          <Text style={footer}>The {SITE_NAME} team</Text>
          <EmailFooter siteUrl={siteUrl} />
        </Container>
      </Body>
    </Html>
  );
};

export const template = {
  component: WelcomeEmail,
  subject: `Your ${SITE_NAME} account is active`,
  displayName: "Welcome",
  previewData: {
    recipientName: "Jane",
    signInUrl: "https://mypartb.com/auth?tab=sign-in",
    forgotPasswordUrl: "https://mypartb.com/auth?tab=sign-in",
    resetPasswordUrl: "https://mypartb.com/auth/verify?token=example&type=recovery",
    needsPasswordSetup: false,
  },
} satisfies TemplateEntry;

const main = { backgroundColor: "#ffffff", fontFamily: "Arial, sans-serif" };
const container = { padding: "20px 25px" };
const h1 = { fontSize: "12px", fontWeight: "bold" as const, color: "#000000", margin: "0 0 20px" };
const text = { fontSize: "12px", color: "#55575d", lineHeight: "1.5", margin: "0 0 16px" };
const button = {
  backgroundColor: "#002870",
  color: "#ffffff",
  fontSize: "12px",
  borderRadius: "8px",
  padding: "12px 20px",
  textDecoration: "none",
  display: "inline-block",
  margin: "0 0 20px",
};
const hint = { fontSize: "12px", color: "#64748b", lineHeight: "1.5", margin: "0 0 24px" };
const link = { color: "#002870", textDecoration: "underline" };
const footer = { fontSize: "12px", color: "#999999", margin: "30px 0 0" };
