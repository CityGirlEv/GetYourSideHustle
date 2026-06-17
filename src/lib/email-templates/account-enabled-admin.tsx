import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import type { TemplateEntry } from "./registry";
import { EmailHeader } from "./email-header";
import { EmailFooter } from "./email-footer";

import { SITE_BRAND_NAME as SITE_NAME } from "@/lib/site-brand";

export interface AccountEnabledAdminProps {
  fullName?: string;
  email?: string;
  role?: string;
  enabledBy?: string;
}

const AccountEnabledAdminEmail = ({
  fullName = "",
  email = "",
  role = "",
  enabledBy = "",
}: AccountEnabledAdminProps) => {
  const who = fullName || email || "A user";
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>Account enabled — {who}</Preview>
      <Body style={main}>
        <Container style={container}>
          <EmailHeader />
          <Heading style={h1}>An account was enabled</Heading>
          <Text style={text}>
            An administrator just enabled a {SITE_NAME} account. They can now sign in.
          </Text>
          <Section style={card}>
            <Row label="Name" value={fullName || "—"} />
            <Row label="Email" value={email || "—"} />
            <Row label="Role" value={role || "—"} />
            {enabledBy && <Row label="Enabled by" value={enabledBy} />}
          </Section>
          <Hr style={hr} />
          <Text style={footer}>This is an automated notification for administrators.</Text>
          <EmailFooter />
        </Container>
      </Body>
    </Html>
  );
};

const Row = ({ label, value }: { label: string; value: string }) => (
  <Text style={rowText}>
    <span style={rowLabel}>{label}: </span>
    <span style={rowValue}>{value}</span>
  </Text>
);

export const template = {
  component: AccountEnabledAdminEmail,
  subject: (data: Record<string, any>) => {
    const who = data?.fullName || data?.email || "a user";
    return `Account enabled — ${who}`;
  },
  displayName: "Account enabled (admin notification)",
  previewData: {
    fullName: "Jane Doe",
    email: "jane@example.com",
    role: "qa",
    enabledBy: "evelyn3@cox.net",
  },
} satisfies TemplateEntry;

const main = {
  backgroundColor: "#ffffff",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif',
};
const container = { padding: "32px 24px", maxWidth: "560px" };
const h1 = { fontSize: "22px", fontWeight: 700, color: "#0f172a", margin: "0 0 16px" };
const text = { fontSize: "14px", color: "#334155", lineHeight: "1.6", margin: "0 0 20px" };
const card = {
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  padding: "16px 20px",
  backgroundColor: "#f8fafc",
};
const rowText = { fontSize: "14px", color: "#0f172a", margin: "6px 0", lineHeight: "1.5" };
const rowLabel = { color: "#64748b", fontWeight: 600 };
const rowValue = { color: "#0f172a" };
const hr = { borderColor: "#e2e8f0", margin: "24px 0" };
const footer = { fontSize: "12px", color: "#64748b", margin: 0 };
