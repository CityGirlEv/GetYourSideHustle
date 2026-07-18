import * as React from "react";
import { Body, Container, Head, Heading, Html, Link, Preview, Text } from "@react-email/components";
import type { TemplateEntry } from "./registry";
import { EmailHeader } from "./email-header";
import { EmailFooter } from "./email-footer";
import { SITE_BRAND_NAME, SITE_BRAND_TEAM_SIGNATURE } from "@/lib/site-brand";
import { WORKBOOK_DISPLAY_TITLE } from "@/lib/content-factory/lead-magnet-paths";

interface Props {
  recipientName?: string;
  workbookTitle?: string;
  downloadUrl?: string;
  landingUrl?: string;
}

const LeadMagnetDeliveryEmail = ({
  recipientName,
  workbookTitle,
  downloadUrl,
  landingUrl,
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your {WORKBOOK_DISPLAY_TITLE} PDF is ready</Preview>
    <Body style={main}>
      <Container style={container}>
        <EmailHeader />
        <Heading style={h1}>
          Hi <strong>{recipientName || "there"}</strong>,
        </Heading>
        <Text style={text}>
          Here is your educational PDF: <strong>{workbookTitle || WORKBOOK_DISPLAY_TITLE}</strong>.
          Print it, fill it in, and use it to gather your facts before comparing plans on your own terms.
        </Text>
        {downloadUrl ? (
          <Text style={text}>
            Download your workbook:{" "}
            <Link href={downloadUrl} style={link}>
              {downloadUrl}
            </Link>
          </Text>
        ) : null}
        {landingUrl ? (
          <Text style={text}>
            Workbook page:{" "}
            <Link href={landingUrl} style={link}>
              {landingUrl}
            </Link>
          </Text>
        ) : null}
        <Text style={text}>
          Educational only — {SITE_BRAND_NAME} does not sell insurance or enroll you in coverage.
        </Text>
        <Text style={footer}>{SITE_BRAND_TEAM_SIGNATURE}</Text>
        <EmailFooter />
      </Container>
    </Body>
  </Html>
);

export const template = {
  component: LeadMagnetDeliveryEmail,
  subject: `Your ${WORKBOOK_DISPLAY_TITLE} (PDF)`,
  displayName: "Lead magnet PDF delivery",
  previewData: {
    recipientName: "Jane",
    workbookTitle: WORKBOOK_DISPLAY_TITLE,
    downloadUrl: "https://www.mypartb.com/downloads/PBO_Turning_65_Workbook.pdf",
    landingUrl: "https://www.mypartb.com/workbook",
  },
} satisfies TemplateEntry;

const main = { backgroundColor: "#ffffff", fontFamily: "Arial, sans-serif" };
const container = { padding: "20px 25px" };
const h1 = { fontSize: "12px", fontWeight: "bold" as const, color: "#000000", margin: "0 0 20px" };
const text = { fontSize: "12px", color: "#55575d", lineHeight: "1.5", margin: "0 0 25px" };
const link = { color: "#2563eb" };
const footer = { fontSize: "12px", color: "#999999", margin: "30px 0 0" };
