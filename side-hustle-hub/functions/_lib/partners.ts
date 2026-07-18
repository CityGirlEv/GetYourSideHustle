/**
 * Co-founder partner accounts — always present in D1 Users Area.
 * Passwords match production login (Tina Admin123, Evelyn Admin).
 */
import { hashPassword, randomSaltHex, type DbUser, type Env } from "./auth";
import { serializeRoles, type GyshRole } from "./roles";

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
    notes: "Portal admin + QA — Testing Portal & schedule (Kids/Junior wizard matrix)",
    joinedAt: "2026-07-16",
  },
] as const;

/** Insert T/E/Lyriq if missing. Does not overwrite existing password hashes. */
export async function ensurePartnerAdmins(env: Env): Promise<void> {
  const now = new Date().toISOString();

  for (const partner of PARTNER_ADMINS) {
    const byId = await env.DB.prepare(`SELECT id, email, password_hash FROM users WHERE id = ?`)
      .bind(partner.id)
      .first<{ id: string; email: string; password_hash: string | null }>();
    const byEmail = await env.DB.prepare(`SELECT id FROM users WHERE email = ?`)
      .bind(partner.email)
      .first<{ id: string }>();

    const rolesJson = serializeRoles([...partner.roles]);

    if (byId || byEmail) {
      // Keep identity + roles/status fresh; leave passwords alone if already set.
      const id = byId?.id ?? byEmail!.id;
      await env.DB.prepare(
        `UPDATE users SET
           name = ?, email = ?, role = 'admin', roles = ?, status = 'active', notes = ?, updated_at = ?
         WHERE id = ?`,
      )
        .bind(partner.name, partner.email, rolesJson, partner.notes, now, id)
        .run();
      continue;
    }

    const salt = randomSaltHex();
    const hash = await hashPassword(partner.password, salt);
    await env.DB.prepare(
      `INSERT INTO users (id, name, email, role, roles, status, joined_at, notes, password_hash, password_salt, created_at, updated_at)
       VALUES (?, ?, ?, 'admin', ?, 'active', ?, ?, ?, ?, ?, ?)`,
    )
      .bind(
        partner.id,
        partner.name,
        partner.email,
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
