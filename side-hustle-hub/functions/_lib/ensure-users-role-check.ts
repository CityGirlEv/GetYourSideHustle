/**
 * Ensure users.role CHECK allows all app roles (senior, beta, dev, …).
 * Older D1 schemas only allowed admin/qa/kid/junior/adult — senior + beta signup failed.
 */
export async function ensureUsersRoleCheckAllowsAllRoles(db: D1Database): Promise<void> {
  const row = await db
    .prepare(`SELECT sql FROM sqlite_master WHERE type = 'table' AND name = 'users'`)
    .first<{ sql: string | null }>();
  const sql = String(row?.sql || "");
  if (!sql) return;
  // Already expanded (or no CHECK — treat as fine).
  if (!/CHECK\s*\(\s*role\s+IN/i.test(sql)) return;
  if (
    sql.includes("'senior'") &&
    sql.includes("'beta'") &&
    sql.includes("'dev'")
  ) {
    return;
  }

  await db.batch([
    db.prepare(`PRAGMA foreign_keys = OFF`),
    db.prepare(`
      CREATE TABLE users_role_check_v2 (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        role TEXT NOT NULL CHECK (role IN ('admin', 'qa', 'dev', 'kid', 'junior', 'adult', 'senior', 'beta')),
        status TEXT NOT NULL CHECK (status IN ('active', 'pending', 'disabled', 'deleted')),
        joined_at TEXT NOT NULL,
        notes TEXT NOT NULL DEFAULT '',
        password_hash TEXT,
        password_salt TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL,
        roles TEXT,
        membership_tier TEXT NOT NULL DEFAULT 'free',
        audience TEXT NOT NULL DEFAULT 'adult',
        parent_user_id TEXT,
        activated_at TEXT,
        activated_by TEXT NOT NULL DEFAULT '',
        deactivated_at TEXT,
        deactivated_by TEXT NOT NULL DEFAULT ''
      )
    `),
    db.prepare(`
      INSERT INTO users_role_check_v2 (
        id, name, email, role, status, joined_at, notes, password_hash, password_salt,
        created_at, updated_at, roles, membership_tier, audience, parent_user_id,
        activated_at, activated_by, deactivated_at, deactivated_by
      )
      SELECT
        id, name, email, role, status, joined_at, notes, password_hash, password_salt,
        created_at, updated_at, roles,
        COALESCE(membership_tier, 'free'),
        COALESCE(audience, 'adult'),
        parent_user_id, activated_at,
        COALESCE(activated_by, ''),
        deactivated_at,
        COALESCE(deactivated_by, '')
      FROM users
    `),
    db.prepare(`DROP TABLE users`),
    db.prepare(`ALTER TABLE users_role_check_v2 RENAME TO users`),
    db.prepare(`PRAGMA foreign_keys = ON`),
  ]);
}
