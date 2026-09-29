import { wrapEmailHtml } from './emailChrome';

interface ResendEnv {
  RESEND_API_KEY?: string;
  FROM_EMAIL?: string;
}

interface SendEmailInput {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}

export async function sendViaResend(
  env: ResendEnv,
  input: SendEmailInput,
): Promise<{ ok: boolean; skipped?: boolean; error?: string; id?: string; html?: string }> {
  const html = wrapEmailHtml(input.html);
  if (!env.RESEND_API_KEY) {
    return { ok: false, skipped: true, error: 'RESEND_API_KEY not configured', html };
  }

  const from = env.FROM_EMAIL || 'My Plan, Not My Mood <info@nonnegotiation.com>';
  const to = Array.isArray(input.to) ? input.to : [input.to];

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to,
      subject: input.subject,
      html,
      ...(input.replyTo ? { reply_to: input.replyTo } : {}),
    }),
  });

  if (!response.ok) {
    const body = await response.text();
    return { ok: false, error: body || `Resend error ${response.status}`, html };
  }

  const payload = (await response.json().catch(() => ({}))) as { id?: string };
  return {
    ok: true,
    id: typeof payload.id === 'string' ? payload.id : undefined,
    html,
  };
}

export function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
    },
  });
}

export function corsPreflight(): Response {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function buildSignupPendingHtml(name: string, wantsBeta: boolean): string {
  const betaLine = wantsBeta
    ? '<p>You also opted in as a <strong>Beta Tester</strong>. We will prioritize your review.</p>'
    : '';
  return wrapEmailHtml(`
    <div style="font-family: Inter, Arial, sans-serif; color: #1F1917;">
      <h1 style="color: #C2410C; font-size: 20px;">Thanks for signing up, ${escapeHtml(name)}!</h1>
      <p>We received your request for a <strong>My Plan, Not My Mood</strong> account.</p>
      <p>Your account is <strong>pending administrator approval</strong>. You will receive another email once you are cleared to sign in.</p>
      ${betaLine}
    </div>
  `);
}

export function buildPasswordResetHtml(name: string, resetUrl: string, email: string): string {
  return wrapEmailHtml(`
    <div style="font-family: Inter, Arial, sans-serif; color: #1F1917;">
      <h1 style="color: #C2410C; font-size: 20px;">Reset your password, ${escapeHtml(name)}</h1>
      <p>We received a request to reset the password for <strong>${escapeHtml(email)}</strong>.</p>
      <p>Open this link on the <strong>same browser</strong> where you signed up, then choose a new password.</p>
      <p style="margin: 24px 0;">
        <a href="${escapeHtml(resetUrl)}" style="background: #C2410C; color: #fff; padding: 12px 20px; border-radius: 999px; text-decoration: none; font-weight: 700;">
          Choose a new password
        </a>
      </p>
      <p style="font-size: 13px; color: #3F3832;">Or copy this link: ${escapeHtml(resetUrl)}</p>
      <p style="font-size: 13px; color: #3F3832;">This link expires in one hour. If you did not request a reset, you can ignore this email.</p>
    </div>
  `);
}

export function buildUserApprovedHtml(name: string, loginUrl: string): string {
  return wrapEmailHtml(`
    <div style="font-family: Inter, Arial, sans-serif; color: #1F1917;">
      <h1 style="color: #C2410C; font-size: 20px;">You're approved, ${escapeHtml(name)}!</h1>
      <p>Your account has been activated. Use the button below to sign in.</p>
      <p style="margin: 24px 0;">
        <a href="${escapeHtml(loginUrl)}" style="background: #C2410C; color: #fff; padding: 12px 20px; border-radius: 999px; text-decoration: none; font-weight: 700;">
          Sign In Now
        </a>
      </p>
      <p style="font-size: 13px; color: #3F3832;">Or copy this link: ${escapeHtml(loginUrl)}</p>
    </div>
  `);
}

export function buildSignupConfirmationHtml(name: string, email: string, wantsBeta: boolean): string {
  const betaLine = wantsBeta
    ? '<p>You also asked to join as a <strong>Beta Tester</strong>. We will review that request with your account.</p>'
    : '';
  return wrapEmailHtml(`
    <div style="font-family: Inter, Arial, sans-serif; color: #1F1917;">
      <h1 style="color: #C2410C; font-size: 20px;">We got your signup, ${escapeHtml(name)}</h1>
      <p>Thanks for joining <strong>My Plan, Not My Mood</strong>. This email confirms we received your signup for <strong>${escapeHtml(email)}</strong>.</p>
      <p>Your account is still <strong>pending activation</strong>. You will get another email when you can sign in.</p>
      ${betaLine}
    </div>
  `);
}

export function buildAdminNewSignupHtml(name: string, email: string, wantsBeta: boolean, adminUsersUrl: string, phone = ''): string {
  return wrapEmailHtml(`
    <div style="font-family: Inter, Arial, sans-serif; color: #1F1917;">
      <h1 style="font-size: 18px;">New member signup</h1>
      <ul>
        <li><strong>Name:</strong> ${escapeHtml(name)}</li>
        <li><strong>Email:</strong> ${escapeHtml(email)}</li>
        <li><strong>Phone:</strong> ${escapeHtml(phone.trim() || 'Not provided')}</li>
        <li><strong>Beta tester:</strong> ${wantsBeta ? 'Yes' : 'No'}</li>
      </ul>
      <p><a href="${escapeHtml(adminUsersUrl)}">Open Admin → Users</a> to approve this account.</p>
    </div>
  `);
}
