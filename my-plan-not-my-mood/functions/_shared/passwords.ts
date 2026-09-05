/** Password hashing + session cookies for My Plan D1 users (Workers / Pages Functions). */

export function bytesToHex(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  return [...arr].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function hexToBytes(hex: string): Uint8Array {
  const clean = hex.replace(/[^0-9a-f]/gi, '');
  const out = new Uint8Array(clean.length / 2);
  for (let i = 0; i < out.length; i++) {
    out[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

export async function createSalt(): Promise<string> {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return bytesToHex(bytes);
}

export async function hashPassword(password: string, saltHex: string): Promise<string> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey('raw', enc.encode(password), 'PBKDF2', false, [
    'deriveBits',
  ]);
  const bits = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: hexToBytes(saltHex),
      iterations: 100_000,
      hash: 'SHA-256',
    },
    keyMaterial,
    256,
  );
  return bytesToHex(bits);
}

export async function verifyPassword(
  password: string,
  saltHex: string,
  expectedHash: string,
): Promise<boolean> {
  if (!saltHex || !expectedHash) return false;
  // Legacy localStorage plaintext (import / transition)
  if (saltHex === 'plain') {
    return password === expectedHash;
  }
  const actual = await hashPassword(password, saltHex);
  if (actual.length !== expectedHash.length) return false;
  let diff = 0;
  for (let i = 0; i < actual.length; i++) {
    diff |= actual.charCodeAt(i) ^ expectedHash.charCodeAt(i);
  }
  return diff === 0;
}

export function createToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  return bytesToHex(bytes);
}

export const SESSION_COOKIE = 'nmp_session';
export const SESSION_DAYS = 30;

export function sessionCookieHeader(token: string, secure: boolean): string {
  const maxAge = SESSION_DAYS * 24 * 60 * 60;
  const parts = [
    `${SESSION_COOKIE}=${token}`,
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${maxAge}`,
  ];
  if (secure) parts.push('Secure');
  return parts.join('; ');
}

export function clearSessionCookieHeader(secure: boolean): string {
  const parts = [`${SESSION_COOKIE}=`, 'Path=/', 'HttpOnly', 'SameSite=Lax', 'Max-Age=0'];
  if (secure) parts.push('Secure');
  return parts.join('; ');
}

export function readCookie(request: Request, name: string): string {
  const raw = request.headers.get('Cookie') || '';
  for (const part of raw.split(';')) {
    const [k, ...rest] = part.trim().split('=');
    if (k === name) return decodeURIComponent(rest.join('=') || '');
  }
  return '';
}

/** Cookie session, or `Authorization: Bearer <token>` (local Vite → prod proxy). */
export function readSessionToken(request: Request): string {
  const fromCookie = readCookie(request, SESSION_COOKIE);
  if (fromCookie) return fromCookie;
  const auth = request.headers.get('Authorization') || '';
  const m = auth.match(/^Bearer\s+(.+)$/i);
  return m?.[1]?.trim() || '';
}

export function requestWantsSecureCookie(request: Request): boolean {
  const url = new URL(request.url);
  if (url.protocol === 'https:') return true;
  const proto = request.headers.get('x-forwarded-proto') || '';
  return proto.split(',')[0]?.trim() === 'https';
}
