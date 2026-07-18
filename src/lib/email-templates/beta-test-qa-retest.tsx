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

export interface BetaTestQaRetestProps {
  testerName?: string;
  loginUrl?: string;
  testingUrl?: string;
  testId?: string;
  testTitle?: string;
  testArea?: string;
  statusLabel?: string;
  /** fixed_retest | failed_retest */
  status?: string;
  devAuthorName?: string;
  devNote?: string;
}

function retestMessage(status: string | undefined): string {
  if (status === "failed_retest") {
    return "Development has reviewed this test and sent it back to you for re-review. The test is still marked Failed / Retest — please verify the issue and update your QA notes as needed.";
  }
  return "Development has reviewed this test and marked it Fixed / Retest. Please log in and re-run the test in the Testing Portal to confirm the fix.";
}

const BetaTestQaRetestEmail = ({
  testerName,
  loginUrl,
  testingUrl,
  testId,
  testTitle,
  testArea,
  statusLabel,
  status,
  devAuthorName,
  devNote,
}: BetaTestQaRetestProps) => {
  const siteUrl = resolveEmailSiteUrl();
  const signInUrl = loginUrl ?? `${siteUrl}/auth?tab=sign-in`;
  const portalUrl = testingUrl ?? `${siteUrl}/testing`;
  const preview = testId
    ? `QA retest — ${testId}`
    : "A beta test was returned to you for retest";

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
            A developer reviewed a beta test assigned to you in the{" "}
            <strong>{SITE_BRAND_THE}</strong> Testing Portal and returned it to QA.
          </Text>
          <Text style={text}>{retestMessage(status)}</Text>

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

          {devNote?.trim() ? (
            <>
              <Text style={sectionHeading}>Developer note</Text>
              <Section style={noteCard}>
                {devAuthorName ? (
                  <Text style={authorLine}>
                    From <strong>{devAuthorName}</strong>
                  </Text>
                ) : null}
                <Text style={noteText}>{devNote.trim()}</Text>
              </Section>
            </>
          ) : null}

          <Section style={buttonRow}>
            <Button style={button} href={signInUrl}>
              Log in to {SITE_BRAND_THE}
            </Button>
          </Section>
          <Text style={text}>
            After signing in, open the{" "}
            <Link href={portalUrl} style={link}>
              Testing Portal
            </Link>{" "}
            to retest and update the result.
          </Text>
          <Text style={footer}>Thank you for helping us improve {SITE_BRAND_THE}.</Text>
          <EmailFooter siteUrl={siteUrl} />
        </Container>
      </Body>
    </Html>
  );
};

export const template = {
  component: BetaTestQaRetestEmail,
  subject: (data: Record<string, unknown>) => {
    const testId = (data.testId as string) || "Testing Portal";
    const status = data.status as string | undefined;
    if (status === "failed_retest") {
      return `${testId} — dev reviewed, please re-review`;
    }
    return `${testId} — dev fixed, please retest`;
  },
  displayName: "Beta test QA retest",
  previewData: {
    testerName: "Jane",
    loginUrl: "https://www.mypartb.com/auth?tab=sign-in",
    testingUrl: "https://www.mypartb.com/testing",
    testId: "AUTH-QA-001",
    testTitle: "Sign in with valid credentials",
    testArea: "Auth",
    status: "fixed_retest",
    statusLabel: "Fixed / Retest",
    devAuthorName: "Alex (Dev)",
    devNote: "Fixed the redirect loop after password reset. Please retest on iOS Safari.",
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
