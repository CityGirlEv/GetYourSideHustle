// PHI client-side encryption: AES-256-GCM with PBKDF2-derived key.
// The passphrase never leaves the browser. The server only ever sees ciphertext.

const PBKDF2_ITERATIONS = 600_000;
const VERIFIER_PLAINTEXT = "muntie-phi-verifier-v1";

const enc = new TextEncoder();
const dec = new TextDecoder();

function b64encode(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let s = "";
  for (let i = 0; i < bytes.byteLength; i++) s += String.fromCharCode(bytes[i]);
  return btoa(s);
}
function b64decode(s: string): Uint8Array {
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export async function deriveKey(passphrase: string, saltB64: string, iterations = PBKDF2_ITERATIONS): Promise<CryptoKey> {
  const baseKey = await crypto.subtle.importKey(
    "raw", enc.encode(passphrase), "PBKDF2", false, ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: b64decode(saltB64), iterations, hash: "SHA-256" },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function encryptJSON(key: CryptoKey, data: unknown): Promise<{ iv: string; ciphertext: string }> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const buf = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(JSON.stringify(data)));
  return { iv: b64encode(iv), ciphertext: b64encode(buf) };
}

export async function decryptJSON<T = unknown>(key: CryptoKey, ivB64: string, ciphertextB64: string): Promise<T> {
  const buf = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: b64decode(ivB64) }, key, b64decode(ciphertextB64),
  );
  return JSON.parse(dec.decode(buf)) as T;
}

export async function createVerifier(key: CryptoKey): Promise<{ iv: string; ciphertext: string }> {
  return encryptJSON(key, VERIFIER_PLAINTEXT);
}

export async function checkVerifier(key: CryptoKey, iv: string, ciphertext: string): Promise<boolean> {
  try {
    const v = await decryptJSON<string>(key, iv, ciphertext);
    return v === VERIFIER_PLAINTEXT;
  } catch {
    return false;
  }
}

export function newSaltB64(): string {
  return b64encode(crypto.getRandomValues(new Uint8Array(16)));
}

export { PBKDF2_ITERATIONS };
