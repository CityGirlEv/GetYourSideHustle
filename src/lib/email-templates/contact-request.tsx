import * as React from 'react'
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from '@react-email/components'
import type { TemplateEntry } from './registry'
import { EmailHeader } from './email-header'
import { EmailFooter } from './email-footer'

const SITE_NAME = 'The Medicare Optimizer'

interface Props {
  recipientName?: string
  scenarioCode?: string
}

const ContactRequestEmail = ({ recipientName, scenarioCode }: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>We received your request to be contacted</Preview>
    <Body style={main}>
      <Container style={container}>
        <EmailHeader />
        <Heading style={h1}>
          {recipientName ? `Thanks, ${recipientName}!` : 'Thanks for reaching out!'}
        </Heading>
        <Text style={text}>
          We received your request to be contacted
          {scenarioCode ? <> regarding scenario <strong>#{scenarioCode}</strong></> : ''}.
          A licensed Medicare advisor will follow up with you shortly.
        </Text>
        <Text style={text}>
          If you need immediate help, just reply to this email.
        </Text>
        <Text style={footer}>The {SITE_NAME} team</Text>
        <EmailFooter />
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: ContactRequestEmail,
  subject: 'We received your request — an advisor will reach out soon',
  displayName: 'Contact request received',
  previewData: { recipientName: 'Jane', scenarioCode: 'AB12CD' },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '20px 25px' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: '#000000', margin: '0 0 20px' }
const text = { fontSize: '14px', color: '#55575d', lineHeight: '1.5', margin: '0 0 25px' }
const footer = { fontSize: '12px', color: '#999999', margin: '30px 0 0' }