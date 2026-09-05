import type { AppUser } from '../userAuth';
import { getEmailTemplate } from './templateStore';
import { buildTemplateTestPayload, emailVarsForRecipient, renderManagedEmail } from './previewTemplate';
import { shouldAutoSendSignupConfirmation } from './sendSettings';
import {
  SIGNUP_CONFIRMATION_TEMPLATE_ID,
  buildOutboundSubject,
  validateSendEmailBody,
} from './sendPayload';
import { buildLoginUrl, buildSignupConfirmationHtml, buildSignupConfirmationSubject } from './templates';

export interface EmailApiResult {
  ok: boolean;
  skipped?: boolean;
  error?: string;
}

const DEFAULT_APP_URL = 'https://nonnegotiation.com';

function getAppUrl(): string {
  const viteAppUrl = typeof import.meta !== 'undefined'
    ? (import.meta as ImportMeta & { env?: { VITE_APP_URL?: string } }).env?.VITE_APP_URL
    : undefined;
  if (viteAppUrl) {
    return viteAppUrl;
  }
  if (typeof window !== 'undefined' && window.location?.origin) {
    return window.location.origin;
  }
  return DEFAULT_APP_URL;
}

async function postEmailEndpoint(path: string, body: Record<string, unknown>): Promise<EmailApiResult> {
  try {
    const response = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (response.status === 503 || response.status === 404 || response.status === 405) {
      return { ok: true, skipped: true };
    }

    if (!response.ok) {
      const data = (await response.json().catch(() => ({}))) as { error?: string };
      return { ok: false, error: data.error || `Email API failed (${response.status})` };
    }

    return { ok: true };
  } catch {
    // Local dev without Pages Functions — do not block signup UX
    return { ok: true, skipped: true };
  }
}

export async function sendRenderedEmail(payload: {
  to: string;
  subject: string;
  html: string;
  test?: boolean;
  templateId?: string;
  templateName?: string;
}): Promise<EmailApiResult> {
  const parsed = validateSendEmailBody(payload);
  if (!parsed.ok) {
    return { ok: false, error: parsed.error };
  }

  return postEmailEndpoint('/api/email/send', {
    to: parsed.to,
    subject: buildOutboundSubject(parsed.subject, Boolean(payload.test)),
    html: parsed.html,
    test: Boolean(payload.test),
    templateId: payload.templateId || '',
    templateName: payload.templateName || '',
    appUrl: getAppUrl(),
  });
}

export async function sendTestEmail(payload: {
  to: string;
  subject: string;
  html: string;
  templateId?: string;
  templateName?: string;
}): Promise<EmailApiResult> {
  return sendRenderedEmail({ ...payload, test: true });
}

export async function sendTemplateTestEmail(
  template: { subject: string; html: string },
  to: string,
  actorName = 'Admin',
): Promise<EmailApiResult> {
  const rendered = buildTemplateTestPayload(template, { name: actorName, email: to }, getAppUrl());
  return sendTestEmail({
    to,
    subject: rendered.subject,
    html: rendered.html,
  });
}

export async function sendSignupConfirmationEmail(
  user: Pick<AppUser, 'name' | 'email' | 'wantsBeta'> & { phone?: string },
): Promise<EmailApiResult> {
  const template = getEmailTemplate(SIGNUP_CONFIRMATION_TEMPLATE_ID);
  const rendered = template
    ? renderManagedEmail(template, emailVarsForRecipient(user, getAppUrl()))
    : {
        subject: buildSignupConfirmationSubject(),
        html: buildSignupConfirmationHtml({
          name: user.name,
          email: user.email,
          wantsBeta: user.wantsBeta,
          phone: user.phone,
        }),
      };

  return sendRenderedEmail({
    to: user.email,
    subject: rendered.subject,
    html: rendered.html,
    templateId: SIGNUP_CONFIRMATION_TEMPLATE_ID,
    templateName: template?.name || 'Signup confirmation',
  });
}

export { shouldAutoSendSignupConfirmation };

export async function sendSignupPendingEmail(
  user: Pick<AppUser, 'name' | 'email' | 'wantsBeta'> & { phone?: string },
): Promise<EmailApiResult> {
  return postEmailEndpoint('/api/email/signup-pending', {
    name: user.name,
    email: user.email,
    phone: user.phone,
    wantsBeta: user.wantsBeta,
    appUrl: getAppUrl(),
  });
}

export async function sendPasswordResetEmail(payload: {
  name: string;
  email: string;
  resetUrl: string;
}): Promise<EmailApiResult> {
  return postEmailEndpoint('/api/email/password-reset', {
    name: payload.name,
    email: payload.email,
    resetUrl: payload.resetUrl,
    appUrl: getAppUrl(),
  });
}

export async function sendUserApprovedEmail(user: Pick<AppUser, 'name' | 'email'>): Promise<EmailApiResult> {
  const appUrl = getAppUrl();
  return postEmailEndpoint('/api/email/user-approved', {
    name: user.name,
    email: user.email,
    loginUrl: buildLoginUrl(appUrl, user.email),
    appUrl,
  });
}

export function shouldSendApprovalEmail(previousStatus: string | undefined, nextStatus: string | undefined): boolean {
  return previousStatus === 'pending' && nextStatus === 'active';
}
