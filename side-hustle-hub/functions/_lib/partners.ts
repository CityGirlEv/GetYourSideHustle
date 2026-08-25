/**
 * Co-founder / partner accounts — insert if missing in D1 Users Area.
 * Existing rows keep roles/status/passwords from Users Area (never force-reset).
 */
import { hashPassword, randomSaltHex, type DbUser, type Env } from "./auth";
import { partnerEnsurePlan } from "./partner-ensure-plan";
import { serializeRoles, type GyshRole } from "./roles";

export { partnerEnsurePlan } from "./partner-ensure-plan";

export const PARTNER_ADMINS = [
  {
    id: "u-tina",
    name: "Tina Marie Barham",
    email: "tinamariebarham@gmail.com",
    role: "admin" as const,
    roles: ["admin", "qa"] as GyshRole[],
    password: "Admin123",
    notes: "Co-founder — kids / Kevina Starr focus; portal admin + QA Testing Portal",
    joinedAt: "2026-07-01",
  },
  {
    id: "u-ev",
    name: "Evelyn Irving",
    email: "evelyn3@cox.net",
    role: "admin" as const,
    roles: ["admin", "qa", "dev"] as GyshRole[],
    password: "Admin",
    notes: "Co-founder — adult hustles & tech; portal admin + QA + Dev (owns failed tests)",
    joinedAt: "2026-07-01",
  },
  {
    id: "u-lyriq",
    name: "Lyriq",
    email: "leegaulden1222@icloud.com",
    role: "admin" as const,
    roles: ["admin", "qa"] as GyshRole[],
    password: "Lyriq123",
    notes: "Portal admin + QA — Testing Portal & schedule (Kids/Teens wizard matrix)",
    joinedAt: "2026-07-16",
  },
  {
    // Prod D1 id (Users Area). Keep stable so ensure never creates a duplicate email row.
    id: "u-68587a47-82b7-4dbd-8672-3880e770254f",
    name: "Candace Jackson",
    email: "candacejackson1@icloud.com",
    role: "qa" as const,
    roles: ["qa"] as GyshRole[],
    password: "Candace123",
    notes: "QA — Testing Portal (roles managed in Users Area)",
    joinedAt: "2026-08-01",
  },
] as const;

/** Insert partner accounts if missing. Does not overwrite roles, status, or passwords. */
export async function ensurePartnerAdmins(env: Env): Promise<void> {
  const now = new Date().toISOString();

  for (const partner of PARTNER_ADMINS) {
    const byId = await env.DB.prepare(`SELECT id, email, password_hash FROM users WHERE id = ?`)
      .bind(partner.id)
      .first<{ id: string; email: string; password_hash: string | null }>();
    const byEmail = await env.DB.prepare(`SELECT id, password_hash FROM users WHERE email = ?`)
      .bind(partner.email)
      .first<{ id: string; password_hash: string | null }>();

    const existing = byEmail ?? byId ?? null;
    const plan = partnerEnsurePlan(existing);

    if (plan.action === "noop") {
      continue;
    }

    if (plan.action === "backfill-password" && existing) {
      const id = existing.id;
      const salt = randomSaltHex();
      const hash = await hashPassword(partner.password, salt);
      await env.DB.prepare(
        `UPDATE users SET password_hash = ?, password_salt = ?, updated_at = ? WHERE id = ?`,
      )
        .bind(hash, salt, now, id)
        .run();
      continue;
    }

    // insert
    const rolesJson = serializeRoles([...partner.roles]);
    const salt = randomSaltHex();
    const hash = await hashPassword(partner.password, salt);
    await env.DB.prepare(
      `INSERT INTO users (id, name, email, role, roles, status, joined_at, notes, password_hash, password_salt, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, 'active', ?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        partner.id,
        partner.name,
        partner.email,
        partner.role,
        rolesJson,
        partner.joinedAt,
        partner.notes,
        hash,
        salt,
        now,
        now,
      )
      .run();
  }

  // Prevent duplicate alias account
  await env.DB.prepare(`DELETE FROM users WHERE email = 'evvelyn3@cox.net'`).run();
}

export type { DbUser };
