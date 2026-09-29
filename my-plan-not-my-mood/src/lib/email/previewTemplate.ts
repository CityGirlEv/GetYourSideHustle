import { wrapEmailHtml } from './emailChrome';
import { buildLoginUrl } from './templates';
import type { ManagedEmailTemplate } from './templateStore';

export const EMAIL_PREVIEW_VARS: Record<string, string> = {
  name: 'Angela Harris',
  email: 'Angela@AngelaHarris.com',
  loginUrl: 'https://nonnegotiation.com/?auth=login&email=angela%40angelaharris.com',
  resetUrl: 'https://nonnegotiation.com/?reset=preview-token',
  adminUsersUrl: 'https://nonnegotiation.com/admin',
  wantsBeta: 'Yes',
  phone: '(619) 555-0100',
};

export function applyEmailPreviewPlaceholders(
  text: string,
  vars: Record<string, string> = EMAIL_PREVIEW_VARS,
): string {
  return text.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key: string) => vars[key] ?? '');
}

export function renderEmailPreviewHtml(
  html: string,
  vars: Record<string, string> = EMAIL_PREVIEW_VARS,
): string {
  return wrapEmailHtml(applyEmailPreviewPlaceholders(html, vars));
}

export function emailVarsForRecipient(
  user: { name: string; email: string; wantsBeta?: boolean; phone?: string },
  appUrl = 'https://nonnegotiation.com',
): Record<string, string> {
  const base = appUrl.replace(/\/$/, '') || 'https://nonnegotiation.com';
  return {
    ...EMAIL_PREVIEW_VARS,
    name: user.name,
    email: user.email,
    loginUrl: buildLoginUrl(base, user.email),
    resetUrl: `${base}/?reset=preview-token`,
    adminUsersUrl: `${base}/admin?tab=users`,
    wantsBeta: user.wantsBeta ? 'Yes' : 'No',
    phone: user.phone?.trim() || 'Not provided',
  };
}

export function renderManagedEmail(
  template: Pick<ManagedEmailTemplate, 'subject' | 'html'>,
  vars: Record<string, string> = EMAIL_PREVIEW_VARS,
): { subject: string; html: string } {
  return {
    subject: applyEmailPreviewPlaceholders(template.subject, vars),
    html: wrapEmailHtml(applyEmailPreviewPlaceholders(template.html, vars)),
  };
}

export function buildTemplateTestPayload(
  template: Pick<ManagedEmailTemplate, 'subject' | 'html'>,
  recipient: { name: string; email: string },
  appUrl = 'https://nonnegotiation.com',
): { subject: string; html: string } {
  return renderManagedEmail(
    template,
    emailVarsForRecipient({ name: recipient.name, email: recipient.email, wantsBeta: true }, appUrl),
  );
}
