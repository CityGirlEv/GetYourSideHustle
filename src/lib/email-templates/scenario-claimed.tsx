import * as React from 'react'
import {
  Body,
  Button,
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
  advisorName?: string
  scenarioCode?: string
  scenarioUrl?: string
}

const ScenarioClaimedEmail = ({
  recipientName,
  advisorName,
  scenarioCode,
  scenarioUrl,
}: Props) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your Medicare scenario was claimed by an advisor</Preview>
    <Body style={main}>
      <Container style={container}>
        <EmailHeader />
        <Heading style={h1}>
          {recipientName ? `Hi ${recipientName},` : 'Good news!'}
        </Heading>
        <Text style={text}>
          {advisorName ? <><strong>{advisorName}</strong></> : 'A licensed advisor'}{' '}
          has claimed your scenario
          {scenarioCode ? <> (<strong>#{scenarioCode}</strong>)</> : ''} and will
          be in touch shortly to walk you through your Medicare options.
        </Text>
        {scenarioUrl ? (
          <Button style={button} href={scenarioUrl}>
            View your scenario
          </Button>
        ) : null}
        <Text style={footer}>The {SITE_NAME} team</Text>
        <EmailFooter />
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: ScenarioClaimedEmail,
  subject: 'An advisor has claimed your Medicare scenario',
  displayName: 'Scenario claimed',
  previewData: {
    recipientName: 'Jane',
    advisorName: 'Alex Morgan',
    scenarioCode: 'AB12CD',
    scenarioUrl: 'https://themedicareoptimizer.com/scenario/AB12CD',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, sans-serif' }
const container = { padding: '20px 25px' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: '#000000', margin: '0 0 20px' }
const text = { fontSize: '14px', color: '#55575d', lineHeight: '1.5', margin: '0 0 25px' }
const button = { backgroundColor: '#000000', color: '#ffffff', fontSize: '14px', borderRadius: '8px', padding: '12px 20px', textDecoration: 'none' }
const footer = { fontSize: '12px', color: '#999999', margin: '30px 0 0' }