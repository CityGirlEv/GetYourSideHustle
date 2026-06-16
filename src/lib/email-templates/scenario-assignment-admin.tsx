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

export interface ScenarioAssignmentRow {
  scenarioCode: string;
  wantsContact?: boolean;
}

export interface AgentAssignmentGroup {
  agentName: string;
  agentEmail?: string;
  scenarios: ScenarioAssignmentRow[];
}

export interface ScenarioAssignmentAdminProps {
  scenarioCode?: string;
  agentName?: string;
  agentEmail?: string;
  assignedBy?: string;
  adminUrl?: string;
  assignmentsByAgent?: AgentAssignmentGroup[];
}

const ScenarioAssignmentAdminEmail = ({
  scenarioCode = "",
  agentName = "",
  agentEmail = "",
  assignedBy = "",
  adminUrl,
  assignmentsByAgent = [],
}: ScenarioAssignmentAdminProps) => {
  const siteUrl = resolveEmailSiteUrl();
  const dashboardUrl = adminUrl ?? `${siteUrl}/admin`;
  const who = agentName || agentEmail || "an agent";

  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>
        Scenario {scenarioCode || "assignment"} assigned to {who}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <EmailHeader siteUrl={siteUrl} />
          <Heading style={h1}>Scenario assigned to agent</Heading>
          <Text style={text}>
            An administrator assigned scenario <strong>{scenarioCode || "—"}</strong> to{" "}
            <strong>{who}</strong>
            {agentEmail ? <> ({agentEmail})</> : null}.
            {assignedBy ? <> Assigned by {assignedBy}.</> : null}
          </Text>

          <Section style={card}>
            <Text style={rowText}>
              <span style={rowLabel}>Scenario ID: </span>
              <span style={rowValue}>{scenarioCode || "—"}</span>
            </Text>
            <Text style={rowText}>
              <span style={rowLabel}>Agent: </span>
              <span style={rowValue}>{who}</span>
            </Text>
            {agentEmail ? (
              <Text style={rowText}>
                <span style={rowLabel}>Agent email: </span>
                <span style={rowValue}>{agentEmail}</span>
              </Text>
            ) : null}
            {assignedBy ? (
              <Text style={rowText}>
                <span style={rowLabel}>Assigned by: </span>
                <span style={rowValue}>{assignedBy}</span>
              </Text>
            ) : null}
          </Section>

          {assignmentsByAgent.length > 0 ? (
            <>
              <Text style={sectionHeading}>Current assignments by agent</Text>
              {assignmentsByAgent.map((group) => (
                <Section key={group.agentEmail ?? group.agentName} style={card}>
                  <Text style={groupTitle}>
                    {group.agentName || group.agentEmail || "Agent"}
                    {group.agentEmail && group.agentName ? (
                      <span style={muted}> · {group.agentEmail}</span>
                    ) : null}
                  </Text>
                  {group.scenarios.map((s) => (
                    <Text key={s.scenarioCode} style={scenarioRow}>
                      <strong>{s.scenarioCode}</strong>
                      {s.wantsContact ? " · consumer opt-in" : ""}
                    </Text>
                  ))}
                </Section>
              ))}
            </>
          ) : (
            <Text style={text}>No other active scenario assignments on file.</Text>
          )}

          <Button style={button} href={dashboardUrl}>
            Open admin dashboard
          </Button>
          <Text style={footer}>Automated notification for {SITE_NAME} administrators.</Text>
          <EmailFooter />
        </Container>
      </Body>
    </Html>
  );
};

export const template = {
  component: ScenarioAssignmentAdminEmail,
  subject: (data: Record<string, unknown>) => {
    const code = (data?.scenarioCode as string) || "Scenario";
    const agent = (data?.agentName as string) || (data?.agentEmail as string) || "agent";
    return `Scenario assigned — ${code} → ${agent}`;
  },
  displayName: "Scenario assignment (admin notification)",
  previewData: {
    scenarioCode: "SCN-2026-ABCD-1234",
    agentName: "Alex Morgan",
    agentEmail: "alex@example.com",
    assignedBy: "Evelyn Admin",
    adminUrl: "https://mypartb.com/admin",
    assignmentsByAgent: [
      {
        agentName: "Alex Morgan",
        agentEmail: "alex@example.com",
        scenarios: [
          { scenarioCode: "SCN-2026-ABCD-1234", wantsContact: true },
          { scenarioCode: "SCN-2026-WXYZ-5678", wantsContact: false },
        ],
      },
      {
        agentName: "Jamie Lee",
        agentEmail: "jamie@example.com",
        scenarios: [{ scenarioCode: "SCN-2026-EFGH-9012", wantsContact: true }],
      },
    ],
  },
} satisfies TemplateEntry;

const main = {
  backgroundColor: "#ffffff",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif',
};
const container = { padding: "32px 24px", maxWidth: "560px" };
const h1 = { fontSize: "12px", fontWeight: 700, color: "#0f172a", margin: "0 0 16px" };
const text = { fontSize: "12px", color: "#334155", lineHeight: "1.6", margin: "0 0 20px" };
const sectionHeading = {
  fontSize: "12px",
  fontWeight: 700,
  color: "#0f172a",
  textTransform: "uppercase" as const,
  letterSpacing: "0.04em",
  margin: "24px 0 12px",
};
const card = {
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  padding: "14px 18px",
  backgroundColor: "#f8fafc",
  marginBottom: "12px",
};
const rowText = { fontSize: "12px", color: "#0f172a", margin: "6px 0", lineHeight: "1.5" };
const rowLabel = { color: "#64748b", fontWeight: 600 };
const rowValue = { color: "#0f172a" };
const groupTitle = { fontSize: "12px", fontWeight: 700, color: "#0f172a", margin: "0 0 8px" };
const muted = { fontWeight: 400, color: "#64748b" };
const scenarioRow = { fontSize: "12px", color: "#334155", margin: "4px 0", lineHeight: "1.5" };
const button = {
  backgroundColor: "#0f172a",
  color: "#ffffff",
  fontSize: "12px",
  borderRadius: "8px",
  padding: "12px 20px",
  textDecoration: "none",
  display: "inline-block",
  marginTop: "8px",
};
const footer = { fontSize: "12px", color: "#64748b", margin: "24px 0 0" };
