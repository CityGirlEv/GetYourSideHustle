import { getRolePermissions, type UserOrRoleInput } from '../userAuth';
import { DEFAULT_FROM_EMAIL } from './sendPayload';

export interface EmailSendSettings {
  autoSendSignupConfirmation: boolean;
}

const STORAGE_KEY = 'myplan_email_send_settings_v1';

export const DEFAULT_EMAIL_SEND_SETTINGS: EmailSendSettings = {
  autoSendSignupConfirmation: false,
};

export function canManageEmailSendSettings(userOrRole?: UserOrRoleInput): boolean {
  return getRolePermissions(userOrRole).canManageEmailTemplates;
}

export function emailSendSettingsAccessError(userOrRole?: UserOrRoleInput): string | null {
  if (!canManageEmailSendSettings(userOrRole)) {
    return 'Access denied. Only Admin and Super Admin can change email send settings.';
  }
  return null;
}

function readStored(): Partial<EmailSendSettings> {
  if (typeof window === 'undefined') return {};
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

export function getEmailSendSettings(): EmailSendSettings {
  const stored = readStored();
  return {
    autoSendSignupConfirmation: stored.autoSendSignupConfirmation === true,
  };
}

export function shouldAutoSendSignupConfirmation(): boolean {
  return getEmailSendSettings().autoSendSignupConfirmation;
}

export function getConfiguredFromEmail(): string {
  return DEFAULT_FROM_EMAIL;
}

export function updateEmailSendSettings(
  patch: Partial<EmailSendSettings>,
  actor?: UserOrRoleInput,
): { success: boolean; settings?: EmailSendSettings; error?: string } {
  const denied = emailSendSettingsAccessError(actor);
  if (denied) return { success: false, error: denied };

  const current = getEmailSendSettings();
  const next: EmailSendSettings = {
    autoSendSignupConfirmation:
      typeof patch.autoSendSignupConfirmation === 'boolean'
        ? patch.autoSendSignupConfirmation
        : current.autoSendSignupConfirmation,
  };

  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  }
  return { success: true, settings: next };
}
