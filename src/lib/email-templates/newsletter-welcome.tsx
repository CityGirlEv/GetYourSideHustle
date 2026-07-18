import * as React from "react";
import { Body, Container, Head, Heading, Html, Link, Preview, Text } from "@react-email/components";
import type { TemplateEntry } from "./registry";
import { EmailHeader } from "./email-header";
import { EmailFooter } from "./email-footer";
import { SITE_BRAND_NAME, SITE_BRAND_TEAM_SIGNATURE } from "@/lib/site-brand";

interface Props {
  recipientName?: string;
  learningCenterUrl?: string;
}

const NewsletterWelcomeEmail = ({ recipientName, learningCenterUrl }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>You are subscribed to Medicare education from {SITE_BRAND_NAME}</Preview>
    <Body style={main}>
      <Container style={container}>
        <EmailHeader />
        <Heading style={h1}>
          Hi <strong>{recipientName || "there"}</strong>,
        </Heading>
        <Text style={text}>
          Thanks for subscribing to the {SITE_BRAND_NAME} Learning Center roundup. You will receive
          calm, educational Medicare tips — no sales pressure and no enrollment solicitations.
        </Text>
        {learningCenterUrl ? (
          <Text style={text}>
            Browse our guides anytime:{" "}
            <Link href={learningCenterUrl} style={link}>
              {learningCenterUrl}
            </Link>
          </Text>
        ) : null}
        <Text style={text}>You can unsubscribe anytime using the link in our emails.</Text>
        <Text style={footer}>{SITE_BRAND_TEAM_SIGNATURE}</Text>
        <EmailFooter />
      </Container>
    </Body>
  </Html>
);

export const template = {
  component: NewsletterWelcomeEmail,
  subject: `You're subscribed — ${SITE_BRAND_NAME} Learning Center`,
  displayName: "Newsletter welcome",
  previewData: {
    recipientName: "Jane",
    learningCenterUrl: "https://www.mypartb.com/learning-center",
  },
} satisfies TemplateEntry;

const main = { backgroundColor: "#ffffff", fontFamily: "Arial, sans-serif" };
const container = { padding: "20px 25px" };
const h1 = { fontSize: "12px", fontWeight: "bold" as const, color: "#000000", margin: "0 0 20px" };
const text = { fontSize: "12px", color: "#55575d", lineHeight: "1.5", margin: "0 0 25px" };
const link = { color: "#2563eb" };
const footer = { fontSize: "12px", color: "#999999", margin: "30px 0 0" };
