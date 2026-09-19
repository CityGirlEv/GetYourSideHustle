import { isValidEmail, normalizeEmail } from './email/sendPayload';
import { validateHearAboutUs } from './hearAboutUs';

export const MAILING_LIST_STORAGE_KEY = 'myplan_mailing_list_v1';
export const MAX_MAILING_LIST_NAME_CHARS = 40;
export const MAX_MAILING_LIST_FIRST_NAME_CHARS = MAX_MAILING_LIST_NAME_CHARS;
export const MAILING_LIST_NOT_MEMBERSHIP_NOTE =
  'This is a mailing list sign-up, not a membership. Join / Memberships stays Coming Soon.';
export const MAILING_LIST_FIELDS = ['email', 'firstName', 'lastName', 'heardAbout'] as const;

export type MailingListSignup = {
  email: string;
  firstName: string;
  lastName: string;
  heardAbout: string;
  subscribedAt: string;
};

export type MailingListInput = {
  email?: string;
  firstName?: string;
  lastName?: string;
  heardAbout?: string;
};

export type MailingListResult =
  | { ok: true; signup: MailingListSignup }
  | { ok: false; error: string };

function storage(): Storage | null {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  return window.localStorage;
}

export function normalizeMailingListName(value?: string): string {
  return String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** @deprecated Use normalizeMailingListName */
export function normalizeMailingListFirstName(value?: string): string {
  return normalizeMailingListName(value);
}

export function mailingListIsMembership(): boolean {
  return false;
}

export function mailingListCollectsPhoneOrAddress(): boolean {
  return false;
}

function looksLikeExtraPii(value: string): boolean {
  return value.includes('@') || /\d{6,}/.test(value);
}

function validateOptionalName(value: string, label: string): MailingListResult | null {
  if (value.length > MAX_MAILING_LIST_NAME_CHARS) {
    return { ok: false, error: `${label} must be ${MAX_MAILING_LIST_NAME_CHARS} characters or fewer.` };
  }
  if (looksLikeExtraPii(value)) {
    return { ok: false, error: `${label} cannot include an email or phone number.` };
  }
  return null;
}

export function validateMailingListSignup(input: MailingListInput): MailingListResult {
  const email = input.email ? normalizeEmail(input.email) : '';
  const firstName = normalizeMailingListName(input.firstName);
  const lastName = normalizeMailingListName(input.lastName);
  const heard = validateHearAboutUs(input.heardAbout, false);

  if (!email) {
    return { ok: false, error: 'Email is required.' };
  }
  if (!isValidEmail(email)) {
    return { ok: false, error: 'Enter a valid email address.' };
  }
  const firstNameError = validateOptionalName(firstName, 'First name');
  if (firstNameError) return firstNameError;
  const lastNameError = validateOptionalName(lastName, 'Last name');
  if (lastNameError) return lastNameError;
  if (!heard.ok) return { ok: false, error: heard.error };

  return {
    ok: true,
    signup: {
      email,
      firstName,
      lastName,
      heardAbout: heard.value,
      subscribedAt: new Date().toISOString(),
    },
  };
}

export function readMailingListSignups(): MailingListSignup[] {
  const raw = storage()?.getItem(MAILING_LIST_STORAGE_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.flatMap((row) => {
      const email = typeof (row as MailingListSignup)?.email === 'string' ? normalizeEmail((row as MailingListSignup).email) : '';
      if (!isValidEmail(email)) return [];
      const firstName = normalizeMailingListName((row as MailingListSignup)?.firstName);
      const lastName = normalizeMailingListName((row as MailingListSignup)?.lastName);
      const heard = validateHearAboutUs((row as MailingListSignup)?.heardAbout, false);
      const subscribedAt =
        typeof (row as MailingListSignup)?.subscribedAt === 'string'
          ? (row as MailingListSignup).subscribedAt
          : '';
      return [{ email, firstName, lastName, heardAbout: heard.ok ? heard.value : '', subscribedAt }];
    });
  } catch {
    return [];
  }
}

export function isOnMailingList(email?: string, existing = readMailingListSignups()): boolean {
  const normalized = email ? normalizeEmail(email) : '';
  if (!normalized) return false;
  return existing.some((row) => row.email === normalized);
}

export function subscribeToMailingList(
  input: MailingListInput,
  existing = readMailingListSignups(),
): MailingListResult {
  const validated = validateMailingListSignup(input);
  if (!validated.ok) return validated;
  if (isOnMailingList(validated.signup.email, existing)) {
    return { ok: false, error: 'That email is already on the mailing list.' };
  }

  const next = [...existing, validated.signup];
  try {
    storage()?.setItem(MAILING_LIST_STORAGE_KEY, JSON.stringify(next));
  } catch {
    return { ok: false, error: 'Could not save the mailing list sign-up.' };
  }
  return validated;
}
