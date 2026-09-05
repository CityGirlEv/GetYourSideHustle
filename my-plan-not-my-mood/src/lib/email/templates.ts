import { wrapEmailHtml } from './emailChrome';

export interface SignupEmailPayload {
  name: string;
  email: string;
  wantsBeta: boolean;
  phone?: string;
}

export interface ApprovalEmailPayload {
  name: string;
  email: string;
  loginUrl: string;
}

export function buildLoginUrl(appUrl: string, email: string): string {
  const base = appUrl.replace(/\/$/, '');
  const params = new URLSearchParams({ auth: 'login', email: email.trim().toLowerCase() });
  return `${base}/?${params.toString()}`;
}

export function buildSignupConfirmationSubject(): string {
  return 'We got your signup — My Plan, Not My Mood';
}

export function buildSignupConfirmationHtml(payload: SignupEmailPayload): string {
  const betaLine = payload.wantsBeta
    ? '<p>You also asked to join as a <strong>Beta Tester</strong>. We will review that request with your account.</p>'
    : '';
  return wrapEmailHtml(`
    <div style="font-family: Inter, Arial, sans-serif; color: #1F1917;">
      <h1 style="color: #C2410C; font-size: 20px;">We got your signup, ${escapeHtml(payload.name)}</h1>
      <p>Thanks for joining <strong>My Plan, Not My Mood</strong>. This email confirms we received your signup for <strong>${escapeHtml(payload.email)}</strong>.</p>
      <p>Your account is still <strong>pending activation</strong>. You will get another email when you can sign in.</p>
      ${betaLine}
    </div>
  `);
}

export function buildSignupPendingSubject(): string {
  return 'My Plan, Not My Mood — signup received (pending approval)';
}

export function buildSignupPendingHtml(payload: SignupEmailPayload): string {
  const betaLine = payload.wantsBeta
    ? '<p>You also opted in as a <strong>Beta Tester</strong>. We will prioritize your review.</p>'
    : '';
  return wrapEmailHtml(`
    <div style="font-family: Inter, Arial, sans-serif; color: #1F1917;">
      <h1 style="color: #C2410C; font-size: 20px;">Thanks for signing up, ${escapeHtml(payload.name)}!</h1>
      <p>We received your request for a <strong>My Plan, Not My Mood</strong> account.</p>
      <p>Your account is <strong>pending administrator approval</strong>. You will receive another email once you are cleared to sign in.</p>
      ${betaLine}
    </div>
  `);
}

export function buildUserApprovedSubject(): string {
  return 'You are approved — sign in to My Plan, Not My Mood';
}

export function buildUserApprovedHtml(payload: ApprovalEmailPayload): string {
  return wrapEmailHtml(`
    <div style="font-family: Inter, Arial, sans-serif; color: #1F1917;">
      <h1 style="color: #C2410C; font-size: 20px;">You're approved, ${escapeHtml(payload.name)}!</h1>
      <p>Your account has been activated. Use the button below to open the sign-in page with your email ready.</p>
      <p style="margin: 24px 0;">
        <a href="${escapeHtml(payload.loginUrl)}" style="background: #C2410C; color: #fff; padding: 12px 20px; border-radius: 999px; text-decoration: none; font-weight: 700;">
          Sign In Now
        </a>
      </p>
      <p style="font-size: 13px; color: #3F3832;">Or copy this link: ${escapeHtml(payload.loginUrl)}</p>
    </div>
  `);
}

export interface PasswordResetEmailPayload {
  name: string;
  email: string;
  resetUrl: string;
}

export function buildPasswordResetSubject(): string {
  return 'Reset your My Plan, Not My Mood password';
}

export function buildPasswordResetHtml(payload: PasswordResetEmailPayload): string {
  return wrapEmailHtml(`
    <div style="font-family: Inter, Arial, sans-serif; color: #1F1917;">
      <h1 style="color: #C2410C; font-size: 20px;">Reset your password, ${escapeHtml(payload.name)}</h1>
      <p>We received a request to reset the password for <strong>${escapeHtml(payload.email)}</strong>.</p>
      <p>Open this link on the <strong>same browser</strong> where you signed up, then choose a new password.</p>
      <p style="margin: 24px 0;">
        <a href="${escapeHtml(payload.resetUrl)}" style="background: #C2410C; color: #fff; padding: 12px 20px; border-radius: 999px; text-decoration: none; font-weight: 700;">
          Choose a new password
        </a>
      </p>
      <p style="font-size: 13px; color: #3F3832;">Or copy this link: ${escapeHtml(payload.resetUrl)}</p>
      <p style="font-size: 13px; color: #3F3832;">This link expires in one hour. If you did not request a reset, you can ignore this email.</p>
    </div>
  `);
}

export function buildAdminNewSignupSubject(name: string): string {
  return `New signup pending approval: ${name}`;
}

export function buildAdminNewSignupHtml(payload: SignupEmailPayload, adminUsersUrl: string): string {
  return wrapEmailHtml(`
    <div style="font-family: Inter, Arial, sans-serif; color: #1F1917;">
      <h1 style="font-size: 18px;">New member signup</h1>
      <ul>
        <li><strong>Name:</strong> ${escapeHtml(payload.name)}</li>
        <li><strong>Email:</strong> ${escapeHtml(payload.email)}</li>
        <li><strong>Phone:</strong> ${escapeHtml(payload.phone?.trim() || 'Not provided')}</li>
        <li><strong>Beta tester:</strong> ${payload.wantsBeta ? 'Yes' : 'No'}</li>
      </ul>
      <p><a href="${escapeHtml(adminUsersUrl)}">Open Admin → Users</a> to approve this account.</p>
    </div>
  `);
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
