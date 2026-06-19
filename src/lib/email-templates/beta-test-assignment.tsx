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

export interface AssignedTestRow {
  id: string;
  title: string;
  area?: string;
  status: string;
  statusLabel: string;
  isNew?: boolean;
}

export interface BetaTestAssignmentProps {
  testerName?: string;
  loginUrl?: string;
  testingUrl?: string;
  /** Tests assigned in this notification batch. */
  newTests?: Array<{ id: string; title: string; area?: string }>;
  /** Full roster of tests currently assigned to this tester. */
  assignedTests?: AssignedTestRow[];
}

const BetaTestAssignmentEmail = ({
  testerName,
  loginUrl,
  testingUrl,
  newTests = [],
  assignedTests = [],
}: BetaTestAssignmentProps) => {
  const siteUrl = resolveEmailSiteUrl();
  const signInUrl = loginUrl ?? `${siteUrl}/auth?tab=sign-in`;
  const portalUrl = testingUrl ?? `${siteUrl}/testing`;
  const newCount = newTests.length;
  const roster =
    assignedTests.length > 0
      ? assignedTests
      : newTests.map((t) => ({
          ...t,
          status: "not_run",
          statusLabel: "Not run",
          isNew: true,
        }));
  const preview =
    newCount === 1
      ? `New beta test assigned — ${newTests[0]?.id ?? "Testing Portal"}`
      : newCount > 1
        ? `${newCount} new beta tests assigned to you`
        : `Your beta test assignments (${roster.length})`;

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <EmailHeader siteUrl={siteUrl} />
          <Heading style={h1}>Hi <strong>{testerName || "there"}</strong>,</Heading>
          <Text style={text}>Hope this email finds you well.</Text>
          <Text style={text}>
            {newCount === 1 ? (
              <>
                A new beta test has been assigned to you on <strong>{SITE_BRAND_THE}</strong>. When you
                have a moment, please log in, open the Testing Portal, and run through the steps
                below.
              </>
            ) : newCount > 1 ? (
              <>
                <strong>{newCount}</strong> new beta tests have been assigned to you on{" "}
                <strong>{SITE_BRAND_THE}</strong>. When you have a moment, please log in and work through
                them in the Testing Portal.
              </>
            ) : (
              <>
                Here is your current beta test assignment list on <strong>{SITE_BRAND_THE}</strong>. Log
                in anytime to update status and add notes in the Testing Portal.
              </>
            )}
          </Text>

          {newTests.length > 0 && (
            <>
              <Text style={sectionHeading}>Newly assigned</Text>
              <Section style={card}>
                {newTests.map((t) => (
                  <Text key={`new-${t.id}`} style={rowText}>
                    <strong>{t.id}</strong>
                    {t.area ? ` · ${t.area}` : ""}
                    <br />
                    <span style={rowTitle}>{t.title}</span>
                  </Text>
                ))}
              </Section>
            </>
          )}

          {roster.length > 0 && (
            <>
              <Text style={sectionHeading}>Your current assignments</Text>
              <Section style={card}>
                {roster.map((t) => (
                  <Text key={t.id} style={rowText}>
                    <strong>{t.id}</strong>
                    {t.area ? ` · ${t.area}` : ""}
                    {" · "}
                    <span style={statusBadge(t.status)}>{t.statusLabel}</span>
                    {t.isNew ? <span style={newTag}> · New</span> : null}
                    <br />
                    <span style={rowTitle}>{t.title}</span>
                  </Text>
                ))}
              </Section>
            </>
          )}

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
            to view your assignments, update status, and add notes.
          </Text>
          <Text style={footer}>Thank you for helping us improve {SITE_BRAND_THE}.</Text>
          <EmailFooter siteUrl={siteUrl} />
        </Container>
      </Body>
    </Html>
  );
};

export const template = {
  component: BetaTestAssignmentEmail,
  subject: (data: Record<string, unknown>) => {
    const newTests = (data.newTests as BetaTestAssignmentProps["newTests"]) ?? [];
    if (newTests.length === 1) {
      return `New beta test assigned — ${newTests[0]?.id ?? "Testing Portal"}`;
    }
    if (newTests.length > 1) {
      return `New beta tests assigned to you (${newTests.length})`;
    }
    return "New beta test assigned — Testing Portal";
  },
  displayName: "Beta test assignment",
  previewData: {
    testerName: "Jane",
    loginUrl: "https://mypartb.com/auth?tab=sign-in",
    testingUrl: "https://mypartb.com/testing",
    newTests: [
      {
        id: "AUTH-QA-001",
        title: "Sign in with valid credentials",
        area: "Auth",
      },
    ],
    assignedTests: [
      {
        id: "AUTH-QA-001",
        title: "Sign in with valid credentials",
        area: "Auth",
        status: "not_run",
        statusLabel: "Not run",
        isNew: true,
      },
      {
        id: "INTAKE-QA-002",
        title: "Complete intake with valid ZIP",
        area: "Intake",
        status: "pass",
        statusLabel: "Pass",
      },
      {
        id: "SCEN-QA-007",
        title: "Save scenario and retrieve by code",
        area: "Scenario",
        status: "in_progress",
        statusLabel: "In progress",
      },
    ],
  },
} satisfies TemplateEntry;

function statusBadge(status: string): React.CSSProperties {
  switch (status) {
    case "pass":
      return { color: "#047857", fontWeight: 600 };
    case "fail":
    case "failed_retest":
      return { color: "#b91c1c", fontWeight: 600 };
    case "blocked":
      return { color: "#b45309", fontWeight: 600 };
    case "in_progress":
    case "fixed_retest":
      return { color: "#1d4ed8", fontWeight: 600 };
    default:
      return { color: "#64748b", fontWeight: 600 };
  }
}

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
const rowText = { fontSize: "12px", color: "#0f172a", margin: "0 0 14px", lineHeight: "1.5" };
const rowTitle = { color: "#334155" };
const newTag = { color: "#002870", fontWeight: 600 as const };
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
