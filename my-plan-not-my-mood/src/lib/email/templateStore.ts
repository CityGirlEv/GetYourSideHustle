import { getRolePermissions, type UserOrRoleInput } from '../userAuth';
import { wrapEmailHtml } from './emailChrome';

export interface ManagedEmailTemplate {
  id: string;
  name: string;
  subject: string;
  html: string;
  isSystem: boolean;
  updatedAt: string;
}

const STORAGE_KEY = 'myplan_email_templates_v1';

export const SYSTEM_EMAIL_TEMPLATES: ManagedEmailTemplate[] = [
  {
    id: 'signup-confirmation',
    name: 'Signup confirmation (to the person who signed up)',
    subject: 'We got your signup — My Plan, Not My Mood',
    html: wrapEmailHtml(`<div style="font-family: Inter, Arial, sans-serif; color: #1F1917;">
  <h1 style="color: #C2410C; font-size: 20px;">We got your signup, {{name}}</h1>
  <p>Thanks for joining <strong>My Plan, Not My Mood</strong>. This email confirms we received your signup for <strong>{{email}}</strong>.</p>
  <p>Your account is still <strong>pending activation</strong>. You will get another email when you can sign in.</p>
  <p>If you asked to be a Beta Tester: <strong>{{wantsBeta}}</strong>.</p>
</div>`),
    isSystem: true,
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'signup-pending',
    name: 'Signup received (pending approval)',
    subject: 'My Plan, Not My Mood — signup received (pending approval)',
    html: wrapEmailHtml(`<div style="font-family: Inter, Arial, sans-serif; color: #1F1917;">
  <h1 style="color: #C2410C; font-size: 20px;">Thanks for signing up, {{name}}!</h1>
  <p>We received your request for a <strong>My Plan, Not My Mood</strong> account.</p>
  <p>Your account is <strong>pending administrator approval</strong>. You will receive another email once you are cleared to sign in.</p>
</div>`),
    isSystem: true,
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'user-approved',
    name: 'User approved — sign in',
    subject: 'You are approved — sign in to My Plan, Not My Mood',
    html: wrapEmailHtml(`<div style="font-family: Inter, Arial, sans-serif; color: #1F1917;">
  <h1 style="color: #C2410C; font-size: 20px;">You're approved, {{name}}!</h1>
  <p>Your account has been activated. Use the button below to open the sign-in page with your email ready.</p>
  <p style="margin: 24px 0;">
    <a href="{{loginUrl}}" style="background: #C2410C; color: #fff; padding: 12px 20px; border-radius: 999px; text-decoration: none; font-weight: 700;">Sign In Now</a>
  </p>
  <p style="font-size: 13px; color: #3F3832;">Or copy this link: {{loginUrl}}</p>
</div>`),
    isSystem: true,
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'password-reset',
    name: 'Password reset',
    subject: 'Reset your My Plan, Not My Mood password',
    html: wrapEmailHtml(`<div style="font-family: Inter, Arial, sans-serif; color: #1F1917;">
  <h1 style="color: #C2410C; font-size: 20px;">Reset your password, {{name}}</h1>
  <p>We received a request to reset the password for <strong>{{email}}</strong>.</p>
  <p>Open this link on the <strong>same browser</strong> where you signed up, then choose a new password.</p>
  <p style="margin: 24px 0;">
    <a href="{{resetUrl}}" style="background: #C2410C; color: #fff; padding: 12px 20px; border-radius: 999px; text-decoration: none; font-weight: 700;">Choose a new password</a>
  </p>
  <p style="font-size: 13px; color: #3F3832;">Or copy this link: {{resetUrl}}</p>
  <p style="font-size: 13px; color: #3F3832;">This link expires in one hour. If you did not request a reset, you can ignore this email.</p>
</div>`),
    isSystem: true,
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
  {
    id: 'admin-new-signup',
    name: 'Admin alert — new signup',
    subject: 'New signup pending approval: {{name}}',
    html: wrapEmailHtml(`<div style="font-family: Inter, Arial, sans-serif; color: #1F1917;">
  <h1 style="font-size: 18px;">New member signup</h1>
  <ul>
    <li><strong>Name:</strong> {{name}}</li>
    <li><strong>Email:</strong> {{email}}</li>
    <li><strong>Phone:</strong> {{phone}}</li>
    <li><strong>Beta tester:</strong> {{wantsBeta}}</li>
  </ul>
  <p><a href="{{adminUsersUrl}}">Open Admin → Users</a> to approve this account.</p>
</div>`),
    isSystem: true,
    updatedAt: '2026-01-01T00:00:00.000Z',
  },
];

export function canManageEmailTemplates(userOrRole?: UserOrRoleInput): boolean {
  return getRolePermissions(userOrRole).canManageEmailTemplates;
}

export function emailTemplateAccessError(userOrRole?: UserOrRoleInput): string | null {
  if (!canManageEmailTemplates(userOrRole)) {
    return 'Access denied. Only Admin and Super Admin can manage email templates.';
  }
  return null;
}

function readStored(): ManagedEmailTemplate[] {
  if (typeof window === 'undefined') return [];
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeStored(templates: ManagedEmailTemplate[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
}

export function getEmailTemplates(): ManagedEmailTemplate[] {
  const stored = readStored();
  const storedById = new Map(stored.map((t) => [t.id, t]));
  const system = SYSTEM_EMAIL_TEMPLATES.map((def) => storedById.get(def.id) ?? def);
  const custom = stored.filter((t) => !t.isSystem && !SYSTEM_EMAIL_TEMPLATES.some((s) => s.id === t.id));
  return [...system, ...custom];
}

export function getEmailTemplate(id: string): ManagedEmailTemplate | undefined {
  return getEmailTemplates().find((t) => t.id === id);
}

export function upsertEmailTemplate(
  input: { id?: string; name: string; subject: string; html: string },
  actor?: UserOrRoleInput,
): { success: boolean; template?: ManagedEmailTemplate; error?: string } {
  const denied = emailTemplateAccessError(actor);
  if (denied) return { success: false, error: denied };

  const name = input.name.trim();
  const subject = input.subject.trim();
  const html = input.html.trim();
  if (!name || !subject || !html) {
    return { success: false, error: 'Name, subject, and HTML body are required.' };
  }

  const existing = input.id ? getEmailTemplate(input.id) : undefined;
  const template: ManagedEmailTemplate = {
    id: existing?.id || `custom-${Date.now()}`,
    name,
    subject,
    html,
    isSystem: Boolean(existing?.isSystem),
    updatedAt: new Date().toISOString(),
  };

  const stored = readStored().filter((t) => t.id !== template.id);
  stored.push(template);
  writeStored(stored);
  return { success: true, template };
}

export function deleteEmailTemplate(
  id: string,
  actor?: UserOrRoleInput,
): { success: boolean; error?: string } {
  const denied = emailTemplateAccessError(actor);
  if (denied) return { success: false, error: denied };

  const existing = getEmailTemplate(id);
  if (!existing) return { success: false, error: 'Email template not found.' };
  if (existing.isSystem) {
    return { success: false, error: 'System templates cannot be deleted. Reset them instead.' };
  }

  writeStored(readStored().filter((t) => t.id !== id));
  return { success: true };
}

export function resetEmailTemplate(
  id: string,
  actor?: UserOrRoleInput,
): { success: boolean; template?: ManagedEmailTemplate; error?: string } {
  const denied = emailTemplateAccessError(actor);
  if (denied) return { success: false, error: denied };

  const def = SYSTEM_EMAIL_TEMPLATES.find((t) => t.id === id);
  if (!def) return { success: false, error: 'Only system templates can be reset.' };

  writeStored(readStored().filter((t) => t.id !== id));
  return { success: true, template: def };
}
