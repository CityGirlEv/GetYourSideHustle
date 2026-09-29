import { beforeEach, describe, expect, it } from 'vitest';
import {
  DEFAULT_EMAIL_SEND_SETTINGS,
  getEmailSendSettings,
  shouldAutoSendSignupConfirmation,
  updateEmailSendSettings,
} from '../sendSettings';

describe('email send settings', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('keeps signup confirmation auto-send off until an admin turns it on', () => {
    expect(getEmailSendSettings()).toEqual(DEFAULT_EMAIL_SEND_SETTINGS);
    expect(shouldAutoSendSignupConfirmation()).toBe(false);
  });

  it('lets Admin persist auto-send on, and rejects QA', () => {
    const denied = updateEmailSendSettings({ autoSendSignupConfirmation: true }, 'qa');
    expect(denied.success).toBe(false);
    expect(shouldAutoSendSignupConfirmation()).toBe(false);

    const saved = updateEmailSendSettings({ autoSendSignupConfirmation: true }, 'admin');
    expect(saved.success).toBe(true);
    expect(saved.settings?.autoSendSignupConfirmation).toBe(true);
    expect(shouldAutoSendSignupConfirmation()).toBe(true);

    const off = updateEmailSendSettings({ autoSendSignupConfirmation: false }, 'super_admin');
    expect(off.settings?.autoSendSignupConfirmation).toBe(false);
    expect(shouldAutoSendSignupConfirmation()).toBe(false);
  });
});
