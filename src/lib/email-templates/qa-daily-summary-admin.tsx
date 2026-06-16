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

export interface QaCompletedTestRow {
  id: string;
  title: string;
  area?: string;
  status: string;
  statusLabel: string;
  assignee: string;
  severity?: string;
  noteSnippet?: string;
  updatedAtLabel?: string;
}

export interface QaTesterDaySummary {
  assignee: string;
  pass: number;
  fail: number;
  blocked: number;
  other: number;
  total: number;
}

export interface QaDailySummaryAdminProps {
  reportDateLabel?: string;
  testingUrl?: string;
  qaDashboardUrl?: string;
  completedTests?: QaCompletedTestRow[];
  testerSummaries?: QaTesterDaySummary[];
  totals?: {
    pass: number;
    fail: number;
    blocked: number;
    other: number;
    total: number;
  };
}

const QaDailySummaryAdminEmail = ({
  reportDateLabel = "Today",
  testingUrl,
  qaDashboardUrl,
  completedTests = [],
  testerSummaries = [],
  totals = { pass: 0, fail: 0, blocked: 0, other: 0, total: 0 },
}: QaDailySummaryAdminProps) => {
  const siteUrl = resolveEmailSiteUrl();
  const portalUrl = testingUrl ?? `${siteUrl}/testing`;
  const dashboardUrl = qaDashboardUrl ?? `${siteUrl}/qa`;
  const preview =
    totals.total > 0
      ? `QA daily summary — ${totals.total} test${totals.total === 1 ? "" : "s"} completed`
      : "QA daily summary — no tests completed today";

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>{preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <EmailHeader siteUrl={siteUrl} />
          <Heading style={h1}>QA daily summary</Heading>
          <Text style={text}>
            End-of-day report for <strong>{reportDateLabel}</strong>. Below are the tests QA marked
            complete in the Testing Portal on {SITE_NAME}.
          </Text>

          <Section style={statsCard}>
            <Text style={statsRow}>
              <span style={statLabel}>Completed today</span>
              <span style={statValue}>{totals.total}</span>
            </Text>
            <Text style={statsRow}>
              <span style={statPass}>Pass</span>
              <span style={statValue}>{totals.pass}</span>
            </Text>
            <Text style={statsRow}>
              <span style={statFail}>Fail</span>
              <span style={statValue}>{totals.fail}</span>
            </Text>
            <Text style={statsRow}>
              <span style={statBlocked}>Blocked</span>
              <span style={statValue}>{totals.blocked}</span>
            </Text>
            {totals.other > 0 && (
              <Text style={statsRow}>
                <span style={statOther}>Retest / other</span>
                <span style={statValue}>{totals.other}</span>
              </Text>
            )}
          </Section>

          {testerSummaries.length > 0 && (
            <>
              <Text style={sectionHeading}>By tester</Text>
              <Section style={card}>
                {testerSummaries.map((t) => (
                  <Text key={t.assignee} style={rowText}>
                    <strong>{t.assignee}</strong>
                    {" · "}
                    {t.total} completed
                    {t.pass > 0 ? ` · ${t.pass} pass` : ""}
                    {t.fail > 0 ? ` · ${t.fail} fail` : ""}
                    {t.blocked > 0 ? ` · ${t.blocked} blocked` : ""}
                    {t.other > 0 ? ` · ${t.other} retest` : ""}
                  </Text>
                ))}
              </Section>
            </>
          )}

          {completedTests.length > 0 ? (
            <>
              <Text style={sectionHeading}>Tests completed</Text>
              <Section style={card}>
                {completedTests.map((t) => (
                  <Text key={`${t.id}-${t.updatedAtLabel ?? ""}`} style={rowText}>
                    <strong>{t.id}</strong>
                    {t.area ? ` · ${t.area}` : ""}
                    {" · "}
                    <span style={statusStyle(t.status)}>{t.statusLabel}</span>
                    {" · "}
                    {t.assignee}
                    {t.severity ? ` · ${t.severity} severity` : ""}
                    {t.updatedAtLabel ? ` · ${t.updatedAtLabel}` : ""}
                    <br />
                    <span style={rowTitle}>{t.title}</span>
                    {t.noteSnippet ? (
                      <>
                        <br />
                        <span style={noteSnippet}>&ldquo;{t.noteSnippet}&rdquo;</span>
                      </>
                    ) : null}
                  </Text>
                ))}
              </Section>
            </>
          ) : (
            <Text style={text}>
              No tests were marked complete today. QA may still have tests in progress on the{" "}
              <Link href={portalUrl} style={link}>
                Testing Portal
              </Link>
              .
            </Text>
          )}

          <Section style={buttonRow}>
            <Button style={button} href={portalUrl}>
              Open Testing Portal
            </Button>
          </Section>
          <Text style={text}>
            For coverage charts and failure breakdowns, open the{" "}
            <Link href={dashboardUrl} style={link}>
              QA dashboard
            </Link>
            .
          </Text>
          <EmailFooter siteUrl={siteUrl} />
        </Container>
      </Body>
    </Html>
  );
};

export const template = {
  component: QaDailySummaryAdminEmail,
  subject: (data: Record<string, unknown>) => {
    const label = String(data.reportDateLabel ?? "Today");
    const total = Number((data.totals as QaDailySummaryAdminProps["totals"])?.total ?? 0);
    if (total > 0) {
      return `QA daily summary — ${label} (${total} completed)`;
    }
    return `QA daily summary — ${label} (none completed)`;
  },
  displayName: "QA daily summary (admin)",
  previewData: {
    reportDateLabel: "Monday, June 9, 2026",
    testingUrl: "https://mypartb.com/testing",
    qaDashboardUrl: "https://mypartb.com/qa",
    totals: { pass: 5, fail: 2, blocked: 1, other: 1, total: 9 },
    testerSummaries: [
      { assignee: "Catria", pass: 3, fail: 1, blocked: 0, other: 0, total: 4 },
      { assignee: "Evelyn", pass: 2, fail: 1, blocked: 1, other: 1, total: 5 },
    ],
    completedTests: [
      {
        id: "AUTH-001-IOS",
        title: "User can sign up with email + password",
        area: "Auth",
        status: "pass",
        statusLabel: "Pass",
        assignee: "Catria",
        updatedAtLabel: "4:12 PM ET",
        noteSnippet: "Passed on iPhone Safari.",
      },
      {
        id: "INTAKE-003-WIN",
        title: "ZIP3 county dropdown scopes plan lookup",
        area: "Intake",
        status: "fail",
        statusLabel: "Fail",
        assignee: "Evelyn",
        severity: "high",
        updatedAtLabel: "6:45 PM ET",
        noteSnippet: "County list empty for ZIP 021.",
      },
    ],
  },
} satisfies TemplateEntry;

function statusStyle(status: string): React.CSSProperties {
  switch (status) {
    case "pass":
      return { color: "#047857", fontWeight: 600 };
    case "fail":
    case "failed_retest":
      return { color: "#b91c1c", fontWeight: 600 };
    case "blocked":
      return { color: "#b45309", fontWeight: 600 };
    default:
      return { color: "#1d4ed8", fontWeight: 600 };
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
const statsCard = {
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  padding: "16px 20px",
  backgroundColor: "#f1f5f9",
  margin: "0 0 24px",
};
const statsRow = {
  fontSize: "12px",
  color: "#0f172a",
  margin: "4px 0",
  lineHeight: "1.5",
  display: "flex" as const,
  justifyContent: "space-between" as const,
};
const statLabel = { fontWeight: 600, color: "#334155" };
const statValue = { fontWeight: 700, color: "#0f172a" };
const statPass = { fontWeight: 600, color: "#047857" };
const statFail = { fontWeight: 600, color: "#b91c1c" };
const statBlocked = { fontWeight: 600, color: "#b45309" };
const statOther = { fontWeight: 600, color: "#1d4ed8" };
const card = {
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  padding: "16px 20px",
  backgroundColor: "#f8fafc",
  margin: "0 0 24px",
};
const rowText = { fontSize: "12px", color: "#0f172a", margin: "0 0 14px", lineHeight: "1.5" };
const rowTitle = { color: "#334155" };
const noteSnippet = { color: "#64748b", fontSize: "12px", fontStyle: "italic" as const };
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
