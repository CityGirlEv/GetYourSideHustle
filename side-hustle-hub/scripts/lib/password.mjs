/** PBKDF2 password helpers shared by seed + docs (Node crypto).
 * Salt must be hex-decoded bytes so hashes match Workers Web Crypto verify.
 */
import crypto from "node:crypto";

const ITERATIONS = 100_000;
const KEYLEN = 32;
const DIGEST = "sha256";

export function hashPassword(password, salt = crypto.randomBytes(16).toString("hex")) {
  const saltBuf = Buffer.from(salt, "hex");
  const hash = crypto.pbkdf2Sync(password, saltBuf, ITERATIONS, KEYLEN, DIGEST).toString("hex");
  return { salt, hash, iterations: ITERATIONS };
}

export function verifyPassword(password, salt, expectedHash) {
  const { hash } = hashPassword(password, salt);
  const a = Buffer.from(hash, "hex");
  const b = Buffer.from(expectedHash, "hex");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
