/**
 * Persist admin navigational links between tasks, tests, and Content Factory items.
 */
import { error, json, type DbUser, type Env } from "./auth";

export type AdminEntityKind = "task" | "test" | "cf";

const KINDS = new Set<AdminEntityKind>(["task", "test", "cf"]);
const KIND_RANK: Record<AdminEntityKind, number> = { cf: 0, task: 1, test: 2 };

export type AdminEntityRef = { kind: AdminEntityKind; id: string };

function parseKind(value: unknown): AdminEntityKind | null {
  const k = String(value || "").trim().toLowerCase();
  return KINDS.has(k as AdminEntityKind) ? (k as AdminEntityKind) : null;
}

function parseId(value: unknown): string {
  return String(value || "").trim();
}

/** Canonical edge order so (task,A,test,B) always stores the same way. */
export function normalizeEntityEdge(
  a: AdminEntityRef,
  b: AdminEntityRef,
): [AdminEntityRef, AdminEntityRef] {
  if (KIND_RANK[a.kind] < KIND_RANK[b.kind]) return [a, b];
  if (KIND_RANK[a.kind] > KIND_RANK[b.kind]) return [b, a];
  return a.id <= b.id ? [a, b] : [b, a];
}

export async function ensureAdminEntityLinksTable(env: Env): Promise<void> {
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS admin_entity_links (
      id TEXT PRIMARY KEY,
      a_kind TEXT NOT NULL CHECK (a_kind IN ('task', 'test', 'cf')),
      a_id TEXT NOT NULL,
      b_kind TEXT NOT NULL CHECK (b_kind IN ('task', 'test', 'cf')),
      b_id TEXT NOT NULL,
      suppressed INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      created_by TEXT NOT NULL DEFAULT '',
      UNIQUE (a_kind, a_id, b_kind, b_id)
    )`,
  ).run();
  await env.DB.prepare(
    `CREATE INDEX IF NOT EXISTS idx_admin_entity_links_a ON admin_entity_links (a_kind, a_id)`,
  ).run();
  await env.DB.prepare(
    `CREATE INDEX IF NOT EXISTS idx_admin_entity_links_b ON admin_entity_links (b_kind, b_id)`,
  ).run();
}

type LinkRow = {
  id: string;
  a_kind: string;
  a_id: string;
  b_kind: string;
  b_id: string;
  suppressed: number;
  created_at: string;
  created_by: string;
};

function publicLink(row: LinkRow) {
  return {
    id: row.id,
    aKind: row.a_kind as AdminEntityKind,
    aId: row.a_id,
    bKind: row.b_kind as AdminEntityKind,
    bId: row.b_id,
    suppressed: Number(row.suppressed) === 1,
    createdAt: row.created_at,
    createdBy: row.created_by,
  };
}

function parsePair(body: Record<string, unknown>): {
  ok: true;
  a: AdminEntityRef;
  b: AdminEntityRef;
} | { ok: false; error: string } {
  const aKind = parseKind(body.aKind ?? body.a_kind);
  const bKind = parseKind(body.bKind ?? body.b_kind);
  const aId = parseId(body.aId ?? body.a_id);
  const bId = parseId(body.bId ?? body.b_id);
  if (!aKind || !bKind) return { ok: false, error: "aKind and bKind must be task, test, or cf." };
  if (!aId || !bId) return { ok: false, error: "aId and bId are required." };
  if (aKind === bKind && aId === bId) {
    return { ok: false, error: "Cannot link an entity to itself." };
  }
  const [a, b] = normalizeEntityEdge({ kind: aKind, id: aId }, { kind: bKind, id: bId });
  return { ok: true, a, b };
}

export async function listAdminEntityLinks(env: Env): Promise<Response> {
  await ensureAdminEntityLinksTable(env);
  const { results } = await env.DB.prepare(
    `SELECT id, a_kind, a_id, b_kind, b_id, suppressed, created_at, created_by
     FROM admin_entity_links
     ORDER BY created_at ASC`,
  ).all<LinkRow>();
  return json({ links: (results ?? []).map(publicLink) });
}

/** Create or restore a navigational link (clears suppression). */
export async function createAdminEntityLink(
  env: Env,
  request: Request,
  actor: DbUser,
): Promise<Response> {
  await ensureAdminEntityLinksTable(env);
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return error("Invalid JSON body.");
  }
  const pair = parsePair(body);
  if (!pair.ok) return error(pair.error);

  const existing = await env.DB.prepare(
    `SELECT id, suppressed FROM admin_entity_links
     WHERE a_kind = ? AND a_id = ? AND b_kind = ? AND b_id = ?`,
  )
    .bind(pair.a.kind, pair.a.id, pair.b.kind, pair.b.id)
    .first<{ id: string; suppressed: number }>();

  const now = new Date().toISOString();
  if (existing) {
    await env.DB.prepare(
      `UPDATE admin_entity_links
       SET suppressed = 0, created_at = ?, created_by = ?
       WHERE id = ?`,
    )
      .bind(now, actor.email || actor.name || "", existing.id)
      .run();
    return json({
      ok: true,
      link: {
        id: existing.id,
        aKind: pair.a.kind,
        aId: pair.a.id,
        bKind: pair.b.kind,
        bId: pair.b.id,
        suppressed: false,
        createdAt: now,
        createdBy: actor.email || actor.name || "",
      },
    });
  }

  const id = `ael-${crypto.randomUUID()}`;
  await env.DB.prepare(
    `INSERT INTO admin_entity_links
      (id, a_kind, a_id, b_kind, b_id, suppressed, created_at, created_by)
     VALUES (?, ?, ?, ?, ?, 0, ?, ?)`,
  )
    .bind(id, pair.a.kind, pair.a.id, pair.b.kind, pair.b.id, now, actor.email || actor.name || "")
    .run();

  return json(
    {
      ok: true,
      link: {
        id,
        aKind: pair.a.kind,
        aId: pair.a.id,
        bKind: pair.b.kind,
        bId: pair.b.id,
        suppressed: false,
        createdAt: now,
        createdBy: actor.email || actor.name || "",
      },
    },
    201,
  );
}

/**
 * Unlink a pair: delete a manual row, or insert/update suppressed=1 for catalog edges.
 */
export async function unlinkAdminEntityLink(
  env: Env,
  request: Request,
  actor: DbUser,
): Promise<Response> {
  await ensureAdminEntityLinksTable(env);
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return error("Invalid JSON body.");
  }
  const pair = parsePair(body);
  if (!pair.ok) return error(pair.error);

  const existing = await env.DB.prepare(
    `SELECT id, suppressed FROM admin_entity_links
     WHERE a_kind = ? AND a_id = ? AND b_kind = ? AND b_id = ?`,
  )
    .bind(pair.a.kind, pair.a.id, pair.b.kind, pair.b.id)
    .first<{ id: string; suppressed: number }>();

  const now = new Date().toISOString();
  if (existing && Number(existing.suppressed) === 0) {
    // Manual link → remove entirely
    await env.DB.prepare(`DELETE FROM admin_entity_links WHERE id = ?`).bind(existing.id).run();
    return json({ ok: true, action: "deleted" });
  }

  if (existing && Number(existing.suppressed) === 1) {
    return json({ ok: true, action: "already_suppressed" });
  }

  const id = `ael-${crypto.randomUUID()}`;
  await env.DB.prepare(
    `INSERT INTO admin_entity_links
      (id, a_kind, a_id, b_kind, b_id, suppressed, created_at, created_by)
     VALUES (?, ?, ?, ?, ?, 1, ?, ?)`,
  )
    .bind(id, pair.a.kind, pair.a.id, pair.b.kind, pair.b.id, now, actor.email || actor.name || "")
    .run();

  return json({ ok: true, action: "suppressed" });
}

export async function handleAdminEntityLinks(
  env: Env,
  request: Request,
  actor: DbUser,
): Promise<Response> {
  const method = request.method.toUpperCase();
  if (method === "GET") return listAdminEntityLinks(env);
  if (method === "POST") return createAdminEntityLink(env, request, actor);
  if (method === "DELETE") return unlinkAdminEntityLink(env, request, actor);
  return error("Method not allowed.", 405);
}
