/** Persist Beta Tester NDA acceptances (version + timestamp + IP + user id). */

import { error, json } from "./crypto";
import {
  BETA_NDA_VERSION,
  betaNdaAcceptanceError,
  formatBetaNdaAcceptanceNote,
  type BetaNdaAcceptanceInput,
} from "./beta-tester-nda";
import { parseRoles } from "./roles";
const BETA_REWARD_NOT_QUALIFIED = "Not yet qualified";

function emptyBetaTesterStats() {
  return { testsCompleted: 0, recordedMs: 0, rewardLevel: BETA_REWARD_NOT_QUALIFIED };
}

export type BetaNdaRecord = {
  id: string;
  userId: string;
  ndaVersion: string;
  legalName: string;
  email: string;
  signature: string;
  acceptedAt: string;
  ipAddress: string;
  userAgent: string;
};

export function clientIpFromRequest(request: Request): string {
  const cf = request.headers.get("cf-connecting-ip") || request.headers.get("CF-Connecting-IP");
  if (cf?.trim()) return cf.trim();
  const xff = request.headers.get("x-forwarded-for");
  if (xff?.trim()) return xff.split(",")[0]!.trim();
  const realIp = request.headers.get("x-real-ip");
  return realIp?.trim() || "";
}

export function userAgentFromRequest(request: Request): string {
  return (request.headers.get("user-agent") || "").slice(0, 400);
}

export function buildBetaNdaRecord(input: {
  userId: string;
  legalName: string;
  email: string;
  signature: string;
  acceptedAt: string;
  ipAddress: string;
  userAgent: string;
  ndaVersion?: string;
  id?: string;
}): BetaNdaRecord {
  return {
    id: input.id || `nda-${input.userId}-${BETA_NDA_VERSION}`,
    userId: input.userId,
    ndaVersion: input.ndaVersion || BETA_NDA_VERSION,
    legalName: input.legalName.trim().replace(/\s+/g, " "),
    email: input.email.trim().toLowerCase(),
    signature: input.signature.trim().replace(/\s+/g, " "),
    acceptedAt: input.acceptedAt,
    ipAddress: input.ipAddress,
    userAgent: input.userAgent,
  };
}

export function publicBetaNdaReceipt(row: BetaNdaRecord) {
  return {
    version: row.ndaVersion,
    acceptedAt: row.acceptedAt,
    legalName: row.legalName,
    userId: row.userId,
  };
}

export async function recordBetaNdaAcceptance(
  db: D1Database,
  row: BetaNdaRecord,
): Promise<{ ok: boolean; missingTable?: boolean; already?: boolean }> {
  try {
    await db
      .prepare(
        `INSERT INTO beta_nda_acceptances
          (id, user_id, nda_version, legal_name, email, signature, accepted_at, ip_address, user_agent, created_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        row.id,
        row.userId,
        row.ndaVersion,
        row.legalName,
        row.email,
        row.signature,
        row.acceptedAt,
        row.ipAddress,
        row.userAgent,
        row.acceptedAt,
      )
      .run();
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("no such table")) return { ok: false, missingTable: true };
    if (msg.includes("UNIQUE")) return { ok: true, already: true };
    throw e;
  }
}

export async function getBetaNdaAcceptance(
  db: D1Database,
  userId: string,
  version: string = BETA_NDA_VERSION,
): Promise<BetaNdaRecord | null> {
  try {
    const row = await db
      .prepare(
        `SELECT id, user_id, nda_version, legal_name, email, signature, accepted_at, ip_address, user_agent
         FROM beta_nda_acceptances
         WHERE user_id = ? AND nda_version = ?
         LIMIT 1`,
      )
      .bind(userId, version)
      .first<{
        id: string;
        user_id: string;
        nda_version: string;
        legal_name: string;
        email: string;
        signature: string;
        accepted_at: string;
        ip_address: string;
        user_agent: string;
      }>();
    if (!row) return null;
    return {
      id: row.id,
      userId: row.user_id,
      ndaVersion: row.nda_version,
      legalName: row.legal_name,
      email: row.email,
      signature: row.signature,
      acceptedAt: row.accepted_at,
      ipAddress: row.ip_address,
      userAgent: row.user_agent,
    };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (msg.includes("no such table")) return null;
    throw e;
  }
}

export async function acceptBetaNdaForUser(
  db: D1Database,
  request: Request,
  user: { id: string; email: string },
  input: BetaNdaAcceptanceInput,
): Promise<{ record: BetaNdaRecord; note: string } | { error: string }> {
  const err = betaNdaAcceptanceError(input);
  if (err) return { error: err };
  const ndaEmail = String(input.email ?? "")
    .trim()
    .toLowerCase();
  if (ndaEmail !== user.email.trim().toLowerCase()) {
    return { error: "NDA email must match your account email." };
  }
  const now = new Date().toISOString();
  const record = buildBetaNdaRecord({
    userId: user.id,
    legalName: String(input.legalName ?? ""),
    email: ndaEmail,
    signature: String(input.signature ?? ""),
    acceptedAt: now,
    ipAddress: clientIpFromRequest(request),
    userAgent: userAgentFromRequest(request),
  });
  await recordBetaNdaAcceptance(db, record);
  return {
    record,
    note: formatBetaNdaAcceptanceNote({
      legalName: record.legalName,
      email: record.email,
      acceptedAt: record.acceptedAt,
    }),
  };
}

export function currentBetaNdaVersionResponse(): Response {
  return json({ version: BETA_NDA_VERSION });
}

export async function handleAcceptBetaNda(
  db: D1Database,
  request: Request,
  user: { id: string; email: string; roles?: string | string[] | null; role?: string },
): Promise<Response> {
  const roles = parseRoles(user.role || "adult", Array.isArray(user.roles) ? JSON.stringify(user.roles) : user.roles);
  if (!roles.includes("beta")) {
    return error("Beta Tester role is required to accept this NDA.", 403);
  }
  let body: BetaNdaAcceptanceInput;
  try {
    body = (await request.json()) as BetaNdaAcceptanceInput;
  } catch {
    return error("Invalid JSON body.");
  }
  const result = await acceptBetaNdaForUser(db, request, user, body);
  if ("error" in result) return error(result.error);
  return json({
    ok: true,
    testingUnlocked: true,
    nda: publicBetaNdaReceipt(result.record),
    stats: emptyBetaTesterStats(),
  });
}

export async function handleBetaTestingDashboard(
  db: D1Database,
  user: { id: string; roles?: string | string[] | null; role?: string },
): Promise<Response> {
  const roles = parseRoles(user.role || "adult", Array.isArray(user.roles) ? JSON.stringify(user.roles) : user.roles);
  if (!roles.includes("beta")) {
    return error("Beta Tester access required.", 403);
  }
  const row = await getBetaNdaAcceptance(db, user.id, BETA_NDA_VERSION);
  const nda = row ? publicBetaNdaReceipt(row) : null;
  const testsCompleted = 0;
  const recordedMs = 0;
  return json({
    version: BETA_NDA_VERSION,
    testingUnlocked: Boolean(nda),
    nda,
    stats: {
      testsCompleted,
      recordedMs,
      rewardLevel: BETA_REWARD_NOT_QUALIFIED,
    },
  });
}
