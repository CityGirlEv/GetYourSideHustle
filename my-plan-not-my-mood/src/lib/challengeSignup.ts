import { isValidEmail, normalizeEmail } from './email/sendPayload';
import { phoneSignupError, storePhoneNumber } from './phoneNumber';

export type ChallengeSignupField = 'email' | 'phone' | 'goal';

export type ChallengeSignupValues = {
  email: string;
  phone: string;
  goal: string;
};

export type ChallengeSignupResult =
  | { ok: true; values: ChallengeSignupValues }
  | { ok: false; error: string; field: ChallengeSignupField };

export function validateChallengeSignup(input: {
  email?: string;
  phone?: string;
  goal?: string;
}): ChallengeSignupResult {
  const email = input.email ? normalizeEmail(input.email) : '';
  if (!email) return { ok: false, field: 'email', error: 'Email is required.' };
  if (!isValidEmail(email)) return { ok: false, field: 'email', error: 'Enter a valid email address.' };
  const phoneError = phoneSignupError(input.phone);
  if (phoneError) return { ok: false, field: 'phone', error: phoneError };
  const goal = String(input.goal ?? '').replace(/\s+/g, ' ').trim();
  if (!goal) return { ok: false, field: 'goal', error: 'A 7-day goal is required.' };
  return {
    ok: true,
    values: { email, phone: storePhoneNumber(String(input.phone ?? '')), goal },
  };
}
