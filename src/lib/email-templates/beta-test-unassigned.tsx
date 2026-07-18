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

export interface UnassignedTestRow {
  id: string;
  title: string;
  area?: string;
}

export interface AssignedTestRow {
  id: string;
  title: string;
  area?: string;
  status: string;
  statusLabel: string;
  isNew?: boolean;
}

export interface BetaTestUnassignedProps {
  testerName?: string;
  loginUrl?: string;
  testingUrl?: string;
  /** Tests removed from this tester in this notification batch. */
  removedTests?: UnassignedTestRow[];
  /** Full roster of tests currently assigned to this tester. */
  assignedTests?: AssignedTestRow[];
}

const BetaTestUnassignedEmail = ({
  testerName,
  loginUrl,
  testingUrl,
  removedTests = [],
  assignedTests = [],
}: BetaTestUnassignedProps) => {
  const siteUrl = resolveEmailSiteUrl();
  const signInUrl = loginUrl ?? `${siteUrl}/auth?tab=sign-in`;
  const portalUrl = testingUrl ?? `${siteUrl}/testing`;
  const count = removedTests.length;
  const preview =
    count === 1
      ? `Beta test re-assigned — ${removedTests[0]?.id ?? "Testing Portal"}`
      : count > 1
        ? `${count} beta tests re-assigned from you`
        : "Beta test assignment update";

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
            {count === 1 ? (
              <>
                A beta test that was assigned to you on <strong>{SITE_BRAND_THE}</strong> has been
                re-assigned and is no longer on your roster.
              </>
            ) : count > 1 ? (
              <>
                <strong>{count}</strong> beta tests that were assigned to you on{" "}
                <strong>{SITE_BRAND_THE}</strong> have been re-assigned and are no longer on your roster.
              </>
            ) : (
              <>
                One or more beta tests on <strong>{SITE_BRAND_THE}</strong> have been re-assigned and are
                no longer on your roster.
              </>
            )}
          </Text>

          {removedTests.length > 0 && (
            <>
              <Text style={sectionHeading}>No longer assigned to you</Text>
              <Section style={card}>
                {removedTests.map((t) => (
                  <Text key={t.id} style={rowText}>
                    <strong>{t.id}</strong>
                    {t.area ? ` · ${t.area}` : ""}
                    <br />
                    <span style={rowTitle}>{t.title}</span>
                  </Text>
                ))}
              </Section>
            </>
          )}

          {assignedTests.length > 0 && (
            <>
              <Text style={sectionHeading}>Your current assignments</Text>
              {(() => {
                const grouped = assignedTests.reduce((acc, test) => {
                  const key = test.status || "not_run";
                  if (!acc[key]) {
                    acc[key] = {
                      label: test.statusLabel || "Not run",
                      tests: [],
                    };
                  }
                  acc[key].tests.push(test);
                  return acc;
                }, {} as Record<string, { label: string; tests: AssignedTestRow[] }>);

                const statusOrder = [
                  "fail",
                  "failed_retest",
                  "blocked",
                  "in_progress",
                  "fixed_retest",
                  "not_run",
                  "pass",
                ];
                const sortedKeys = Object.keys(grouped).sort((a, b) => {
                  const idxA = statusOrder.indexOf(a);
                  const idxB = statusOrder.indexOf(b);
                  if (idxA === -1 && idxB === -1) return a.localeCompare(b);
                  if (idxA === -1) return 1;
                  if (idxB === -1) return -1;
                  return idxA - idxB;
                });

                return sortedKeys.map((statusKey) => {
                  const group = grouped[statusKey]!;
                  const count = group.tests.length;
                  return (
                    <details key={statusKey} style={detailsContainer}>
                      <summary style={summaryStyle(statusKey)}>
                        {group.label} ({count})
                      </summary>
                      <div style={detailsContent}>
                        {group.tests.map((t) => (
                          <Text key={t.id} style={rowText}>
                            <strong>{t.id}</strong>
                            {t.area ? ` · ${t.area}` : ""}
                            {t.isNew ? <span style={newTag}> · New</span> : null}
                            <br />
                            <span style={rowTitle}>{t.title}</span>
                          </Text>
                        ))}
                      </div>
                    </details>
                  );
                });
              })()}
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
            to view your current assignments.
          </Text>
          <Text style={footer}>Thank you for helping us improve {SITE_BRAND_THE}.</Text>
          <EmailFooter siteUrl={siteUrl} />
        </Container>
      </Body>
    </Html>
  );
};

export const template = {
  component: BetaTestUnassignedEmail,
  subject: (data: Record<string, unknown>) => {
    const removed = (data.removedTests as BetaTestUnassignedProps["removedTests"]) ?? [];
    if (removed.length === 1) {
      return `Beta test re-assigned — ${removed[0]?.id ?? "Testing Portal"}`;
    }
    if (removed.length > 1) {
      return `Beta tests re-assigned from you (${removed.length})`;
    }
    return "Beta test assignment update — Testing Portal";
  },
  displayName: "Beta test unassigned",
  previewData: {
    testerName: "Jane",
    loginUrl: "https://www.mypartb.com/auth?tab=sign-in",
    testingUrl: "https://www.mypartb.com/testing",
    removedTests: [
      {
        id: "AUTH-QA-001",
        title: "Sign in with valid credentials",
        area: "Auth",
      },
      {
        id: "INTAKE-QA-002",
        title: "Complete intake with valid ZIP",
        area: "Intake",
      },
    ],
    assignedTests: [
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

const detailsContainer = {
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  backgroundColor: "#f8fafc",
  margin: "0 0 12px",
  padding: "0",
  overflow: "hidden" as const,
};

const summaryStyle = (status: string): React.CSSProperties => {
  const badgeStyle = statusBadge(status);
  return {
    padding: "10px 16px",
    fontWeight: "bold" as const,
    fontSize: "12px",
    color: badgeStyle.color || "#0f172a",
    cursor: "pointer",
    backgroundColor: "#f1f5f9",
    outline: "none",
  };
};

const detailsContent = {
  padding: "12px 16px 2px 16px",
  borderTop: "1px solid #e2e8f0",
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
