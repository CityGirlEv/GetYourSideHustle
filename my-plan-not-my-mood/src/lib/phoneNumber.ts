export const PHONE_REQUIRED_ERROR =
  'Enter a phone number so we can call you if we need to.';

export const PHONE_INVALID_ERROR = 'Enter a valid 10-digit US phone number.';

export function digitsOnly(value: string): string {
  return String(value ?? '').replace(/\D/g, '');
}

/** US 10-digit national number, stripping a leading country code 1. */
export function normalizePhoneDigits(value: string): string {
  let digits = digitsOnly(value);
  if (digits.length === 11 && digits.startsWith('1')) {
    digits = digits.slice(1);
  }
  return digits;
}

export function isValidPhoneNumber(value: string): boolean {
  const digits = normalizePhoneDigits(value);
  return digits.length === 10 && digits[0] !== '0' && digits[0] !== '1';
}

export function formatPhoneDisplay(value: string): string {
  const digits = normalizePhoneDigits(value);
  if (digits.length !== 10) return String(value ?? '').trim();
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

export function phoneTelHref(value: string): string | null {
  const digits = normalizePhoneDigits(value);
  if (digits.length !== 10) return null;
  return `tel:+1${digits}`;
}

export function phoneSignupError(value: string | undefined): string | null {
  const trimmed = String(value ?? '').trim();
  if (!trimmed) return PHONE_REQUIRED_ERROR;
  if (!isValidPhoneNumber(trimmed)) return PHONE_INVALID_ERROR;
  return null;
}

/** Empty is allowed; a filled value must be a valid US number. */
export function optionalPhoneSignupError(value: string | undefined): string | null {
  const trimmed = String(value ?? '').trim();
  if (!trimmed) return null;
  if (!isValidPhoneNumber(trimmed)) return PHONE_INVALID_ERROR;
  return null;
}

export function storePhoneNumber(value: string): string {
  return formatPhoneDisplay(value);
}
