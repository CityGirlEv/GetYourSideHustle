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

import { SITE_BRAND_NAME as SITE_NAME } from "@/lib/site-brand";

export interface BetaTestDevNoteProps {
  testerName?: string;
  loginUrl?: string;
  testingUrl?: string;
  testId?: string;
  testTitle?: string;
  testArea?: string;
  devNote?: string;
  devAuthorName?: string;
  statusLabel?: string;
}

const BetaTestDevNoteEmail = ({
  testerName,
  loginUrl,
  testingUrl,
  testId,
  testTitle,
  testArea,
  devNote,
  devAuthorName,
  statusLabel,
}: BetaTestDevNoteProps) => {
  const siteUrl = resolveEmailSiteUrl();
  const signInUrl = loginUrl ?? `${siteUrl}/auth?tab=sign-in`;
  const portalUrl = testingUrl ?? `${siteUrl}/testing`;
  const preview = testId
    ? `Dev note on ${testId} — Testing Portal`
    : "New dev note on your beta test";

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <EmailHeader siteUrl={siteUrl} />
          <Heading style={h1}>
            Hi <strong>{testerName || "there"}</strong>,
          </Heading>
          <Text style={text}>Hope this email finds you well.</Text>
          <Text style={text}>
            A developer left a note on a beta test assigned to you in the{" "}
            <strong>{SITE_NAME}</strong> Testing Portal.
          </Text>

          <Section style={card}>
            <Text style={rowText}>
              <strong>{testId || "Test"}</strong>
              {testArea ? ` · ${testArea}` : ""}
              {statusLabel ? (
                <>
                  <br />
                  <span style={statusLine}>Status: {statusLabel}</span>
                </>
              ) : null}
              <br />
              <span style={rowTitle}>{testTitle || "Beta test"}</span>
            </Text>
          </Section>

          <Text style={sectionHeading}>Developer note</Text>
          <Section style={noteCard}>
            {devAuthorName ? (
              <Text style={authorLine}>
                From <strong>{devAuthorName}</strong>
              </Text>
            ) : null}
            <Text style={noteText}>{devNote || "—"}</Text>
          </Section>

          <Section style={buttonRow}>
            <Button style={button} href={signInUrl}>
              Log in to {SITE_NAME}
            </Button>
          </Section>
          <Text style={text}>
            After signing in, open the{" "}
            <Link href={portalUrl} style={link}>
              Testing Portal
            </Link>{" "}
            to review the test and respond.
          </Text>
          <Text style={footer}>Thank you for helping us improve {SITE_NAME}.</Text>
          <EmailFooter siteUrl={siteUrl} />
        </Container>
      </Body>
    </Html>
  );
};

export const template = {
  component: BetaTestDevNoteEmail,
  subject: (data: Record<string, unknown>) => {
    const testId = (data.testId as string) || "Testing Portal";
    return `Dev note on ${testId} — please review`;
  },
  displayName: "Beta test dev note",
  previewData: {
    testerName: "Jane",
    loginUrl: "https://mypartb.com/auth?tab=sign-in",
    testingUrl: "https://mypartb.com/testing",
    testId: "AUTH-QA-001",
    testTitle: "Sign in with valid credentials",
    testArea: "Auth",
    devNote: "Fixed the redirect loop after password reset. Please retest on iOS Safari.",
    devAuthorName: "Alex (Dev)",
    statusLabel: "Fixed / Retest",
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
const sectionHeading = {
  fontSize: "12px",
  fontWeight: "bold" as const,
  color: "#0f172a",
  margin: "0 0 10px",
};
const card = {
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  padding: "16px 20px",
  backgroundColor: "#f8fafc",
  margin: "0 0 24px",
};
const noteCard = {
  border: "1px solid #cbd5e1",
  borderRadius: "8px",
  padding: "16px 20px",
  backgroundColor: "#ffffff",
  margin: "0 0 24px",
};
const rowText = { fontSize: "12px", color: "#0f172a", margin: "0", lineHeight: "1.5" };
const rowTitle = { color: "#334155" };
const statusLine = { color: "#1d4ed8", fontWeight: 600 as const };
const authorLine = { fontSize: "11px", color: "#64748b", margin: "0 0 10px" };
const noteText = {
  fontSize: "12px",
  color: "#0f172a",
  margin: "0",
  lineHeight: "1.6",
  whiteSpace: "pre-wrap" as const,
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
