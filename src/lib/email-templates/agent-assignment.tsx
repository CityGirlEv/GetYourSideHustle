import * as React from "react";
import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from "@react-email/components";
import type { TemplateEntry } from "./registry";
import { EmailHeader } from "./email-header";
import { EmailFooter } from "./email-footer";

const SITE_NAME = "Get Part B Optimizer";

interface Props {
  agentName?: string;
  scenarioCode?: string;
  clientName?: string;
  scenarioUrl?: string;
}

const AgentAssignmentEmail = ({ agentName, scenarioCode, clientName, scenarioUrl }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>A new scenario has been assigned to you</Preview>
    <Body style={main}>
      <Container style={container}>
        <EmailHeader />
        <Heading style={h1}>Hi <strong>{agentName || "there"}</strong>,</Heading>
        <Text style={text}>
          A new scenario
          {scenarioCode ? (
            <>
              {" "}
              (<strong>#{scenarioCode}</strong>)
            </>
          ) : (
            ""
          )}{" "}
          has been assigned to you
          {clientName ? (
            <>
              {" "}
              for <strong>{clientName}</strong>
            </>
          ) : (
            ""
          )}
          .
        </Text>
        {scenarioUrl ? (
          <Button style={button} href={scenarioUrl}>
            Open scenario
          </Button>
        ) : null}
        <Text style={footer}>{SITE_NAME}</Text>
        <EmailFooter />
      </Container>
    </Body>
  </Html>
);

export const template = {
  component: AgentAssignmentEmail,
  subject: "New scenario assigned to you",
  displayName: "Agent assignment",
  previewData: {
    agentName: "Alex",
    scenarioCode: "AB12CD",
    clientName: "Jane Doe",
    scenarioUrl: "https://themedicareoptimizer.com/agent/scenario/AB12CD",
  },
} satisfies TemplateEntry;

const main = { backgroundColor: "#ffffff", fontFamily: "Arial, sans-serif" };
const container = { padding: "20px 25px" };
const h1 = { fontSize: "12px", fontWeight: "bold" as const, color: "#000000", margin: "0 0 20px" };
const text = { fontSize: "12px", color: "#55575d", lineHeight: "1.5", margin: "0 0 25px" };
const button = {
  backgroundColor: "#000000",
  color: "#ffffff",
  fontSize: "12px",
  borderRadius: "8px",
  padding: "12px 20px",
  textDecoration: "none",
};
const footer = { fontSize: "12px", color: "#999999", margin: "30px 0 0" };
