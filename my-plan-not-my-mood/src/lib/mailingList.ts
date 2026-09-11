import { isValidEmail, normalizeEmail } from './email/sendPayload';

export const MAILING_LIST_STORAGE_KEY = 'myplan_mailing_list_v1';
export const MAX_MAILING_LIST_FIRST_NAME_CHARS = 40;
export const MAILING_LIST_NOT_MEMBERSHIP_NOTE =
  'This is a mailing list sign-up, not a membership. Join / Memberships stays Coming Soon.';
export const MAILING_LIST_FIELDS = ['email', 'firstName'] as const;

export type MailingListSignup = {
  email: string;
  firstName: string;
  subscribedAt: string;
};

export type MailingListInput = {
  email?: string;
  firstName?: string;
};

export type MailingListResult =
  | { ok: true; signup: MailingListSignup }
  | { ok: false; error: string };

function storage(): Storage | null {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  return window.localStorage;
}

export function normalizeMailingListFirstName(value?: string): string {
  return String(value ?? '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function mailingListIsMembership(): boolean {
  return false;
}

export function mailingListCollectsPhoneOrAddress(): boolean {
  return false;
}

export function validateMailingListSignup(input: MailingListInput): MailingListResult {
  const email = input.email ? normalizeEmail(input.email) : '';
  const firstName = normalizeMailingListFirstName(input.firstName);

  if (!email) {
    return { ok: false, error: 'Email is required.' };
  }
  if (!isValidEmail(email)) {
    return { ok: false, error: 'Enter a valid email address.' };
  }
  if (firstName.length > MAX_MAILING_LIST_FIRST_NAME_CHARS) {
    return { ok: false, error: `First name must be ${MAX_MAILING_LIST_FIRST_NAME_CHARS} characters or fewer.` };
  }
  if (firstName.includes('@') || /\d{6,}/.test(firstName)) {
    return { ok: false, error: 'First name cannot include an email or phone number.' };
  }

  return {
    ok: true,
    signup: {
      email,
      firstName,
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
      const firstName = normalizeMailingListFirstName((row as MailingListSignup)?.firstName);
      const subscribedAt =
        typeof (row as MailingListSignup)?.subscribedAt === 'string'
          ? (row as MailingListSignup).subscribedAt
          : '';
      return [{ email, firstName, subscribedAt }];
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
