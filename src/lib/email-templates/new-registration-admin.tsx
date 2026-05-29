import {
  Body, Container, Head, Heading, Hr, Html, Preview, Section, Text,
} from '@react-email/components'
import type { TemplateEntry } from './registry'

const SITE_NAME = 'The Medicare Optimizer'

export interface NewRegistrationAdminProps {
  firstName?: string
  lastName?: string
  email?: string
  phone?: string
  requestedRole?: string
  qaDevices?: string[]
}

const NewRegistrationAdminEmail = ({
  firstName = '',
  lastName = '',
  email = '',
  phone = '',
  requestedRole = '',
  qaDevices = [],
}: NewRegistrationAdminProps) => {
  const fullName = `${firstName} ${lastName}`.trim() || 'A new user'
  const devicesLabel = qaDevices.length ? qaDevices.join(', ') : 'None specified'
  return (
    <Html lang="en" dir="ltr">
      <Head />
      <Preview>New beta registration — {fullName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={h1}>New beta access request</Heading>
          <Text style={text}>
            <b>{fullName}</b> just signed the NDA and registered for {SITE_NAME}. The
            account has been created but is <b>disabled</b> until an administrator
            approves it.
          </Text>
          <Section style={card}>
            <Row label="Name" value={fullName} />
            <Row label="Email" value={email} />
            <Row label="Phone" value={phone} />
            <Row label="Requested role" value={requestedRole} />
            {requestedRole === 'qa' && <Row label="QA devices" value={devicesLabel} />}
          </Section>
          <Hr style={hr} />
          <Text style={footer}>
            Sign in to the Admin Portal → Staff tab to review and enable the account.
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const Row = ({ label, value }: { label: string; value: string }) => (
  <Text style={rowText}>
    <span style={rowLabel}>{label}: </span>
    <span style={rowValue}>{value}</span>
  </Text>
)

export const template = {
  component: NewRegistrationAdminEmail,
  subject: (data: Record<string, any>) => {
    const name = `${data?.firstName ?? ''} ${data?.lastName ?? ''}`.trim()
    return `New beta registration${name ? ` — ${name}` : ''}`
  },
  displayName: 'New registration (admin notification)',
  previewData: {
    firstName: 'Jane',
    lastName: 'Doe',
    email: 'jane@example.com',
    phone: '(555) 555-1234',
    requestedRole: 'qa',
    qaDevices: ['iPhone', 'MacBook'],
  },
} satisfies TemplateEntry

const main = {
  backgroundColor: '#ffffff',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif',
}
const container = { padding: '32px 24px', maxWidth: '560px' }
const h1 = { fontSize: '22px', fontWeight: 700, color: '#0f172a', margin: '0 0 16px' }
const text = { fontSize: '14px', color: '#334155', lineHeight: '1.6', margin: '0 0 20px' }
const card = {
  border: '1px solid #e2e8f0',
  borderRadius: '8px',
  padding: '16px 20px',
  backgroundColor: '#f8fafc',
}
const rowText = { fontSize: '14px', color: '#0f172a', margin: '6px 0', lineHeight: '1.5' }
const rowLabel = { color: '#64748b', fontWeight: 600 }
const rowValue = { color: '#0f172a' }
const hr = { borderColor: '#e2e8f0', margin: '24px 0' }
const footer = { fontSize: '12px', color: '#64748b', margin: 0 }
