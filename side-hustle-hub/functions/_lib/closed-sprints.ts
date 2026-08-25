/**
 * Persist closed/locked sprint indexes in D1.
 * Once closed, items remaining in that sprint cannot be modified until an admin
 * re-opens the sprint — except Evelyn, who may bypass the lock.
 */
import { error, json, type DbUser, type Env } from "./auth";
import { canBypassSprintLock } from "./roles";
import { sprintLabel } from "./sprints";

export const SPRINT_LOCKED_MESSAGE =
  "This sprint is closed and locked. No further modifications can be made to items in it.";

export { canBypassSprintLock };

function sprintIndexIsClosed(
  closed: Set<number> | readonly number[],
  sprintIndex: number,
): boolean {
  const idx = Math.floor(Number(sprintIndex));
  if (!Number.isFinite(idx) || idx < 0) return false;
  if (closed instanceof Set) return closed.has(idx);
  return closed.includes(idx);
}

/** True when a closed sprint should block this actor (Evelyn bypasses). */
export function closedSprintBlocksActor(
  closed: Set<number> | readonly number[],
  sprintIndex: number,
  actor?: { email?: string; name?: string } | null,
): boolean {
  if (canBypassSprintLock(actor)) return false;
  return sprintIndexIsClosed(closed, sprintIndex);
}

/**
 * Moving a task out of a closed sprint into an open sprint / backlog.
 * Allowed for every actor — does not reopen the closed sprint.
 */
export function isUnlockMoveToOpenSprint(
  closed: Set<number> | readonly number[],
  fromSprint: number,
  toSprint: number,
): boolean {
  if (!Number.isFinite(fromSprint) || !Number.isFinite(toSprint)) return false;
  if (fromSprint === toSprint) return false;
  return sprintIndexIsClosed(closed, fromSprint) && !sprintIndexIsClosed(closed, toSprint);
}

export async function ensureClosedSprintsTable(env: Env): Promise<void> {
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS closed_sprints (
      sprint_index INTEGER PRIMARY KEY,
      closed_at TEXT NOT NULL,
      closed_by TEXT NOT NULL DEFAULT ''
    )`,
  ).run();
}

export async function listClosedSprintIndexes(env: Env): Promise<number[]> {
  await ensureClosedSprintsTable(env);
  const { results } = await env.DB.prepare(
    `SELECT sprint_index FROM closed_sprints ORDER BY sprint_index ASC`,
  ).all<{ sprint_index: number }>();
  return (results ?? [])
    .map((r) => Number(r.sprint_index))
    .filter((n) => Number.isFinite(n) && n >= 0);
}

export async function isSprintClosed(env: Env, sprintIndex: number): Promise<boolean> {
  if (!Number.isFinite(sprintIndex) || sprintIndex < 0) return false;
  await ensureClosedSprintsTable(env);
  const row = await env.DB.prepare(
    `SELECT sprint_index FROM closed_sprints WHERE sprint_index = ?`,
  )
    .bind(Math.floor(sprintIndex))
    .first<{ sprint_index: number }>();
  return Boolean(row);
}

/** Reject with 403 when sprint is closed/locked (Evelyn may bypass). */
export async function rejectIfSprintLocked(
  env: Env,
  sprintIndex: number | null | undefined,
  actor?: DbUser | null,
): Promise<Response | null> {
  if (sprintIndex === null || sprintIndex === undefined) return null;
  const idx = Number(sprintIndex);
  if (!Number.isFinite(idx) || idx < 0) return null;
  if (canBypassSprintLock(actor)) return null;
  if (await isSprintClosed(env, idx)) {
    return error(`${SPRINT_LOCKED_MESSAGE} (${sprintLabel(idx)})`, 403);
  }
  return null;
}

export async function listClosedSprints(env: Env): Promise<Response> {
  await ensureClosedSprintsTable(env);
  const { results } = await env.DB.prepare(
    `SELECT sprint_index, closed_at, closed_by FROM closed_sprints ORDER BY sprint_index ASC`,
  ).all<{ sprint_index: number; closed_at: string; closed_by: string }>();
  const closed = (results ?? []).map((r) => ({
    sprintIndex: Number(r.sprint_index),
    closedAt: r.closed_at,
    closedBy: r.closed_by || "",
  }));
  return json({
    closed: closed.map((c) => c.sprintIndex),
    details: closed,
  });
}

export async function closeSprint(
  env: Env,
  request: Request,
  actor: DbUser,
): Promise<Response> {
  let body: { sprintIndex?: unknown };
  try {
    body = await request.json();
  } catch {
    return error("Invalid JSON body.");
  }
  const sprintIndex = Math.floor(Number(body.sprintIndex));
  if (!Number.isFinite(sprintIndex) || sprintIndex < 0) {
    return error("sprintIndex must be a non-negative sprint number.");
  }

  await ensureClosedSprintsTable(env);
  const now = new Date().toISOString();
  const closedBy = String(actor.email || actor.name || "").trim() || "unknown";

  await env.DB.prepare(
    `INSERT INTO closed_sprints (sprint_index, closed_at, closed_by)
     VALUES (?, ?, ?)
     ON CONFLICT(sprint_index) DO NOTHING`,
  )
    .bind(sprintIndex, now, closedBy)
    .run();

  return listClosedSprints(env);
}

/** Admin: unlock a closed sprint by removing it from closed_sprints. */
export async function reopenSprint(
  env: Env,
  request: Request,
  _actor: DbUser,
): Promise<Response> {
  let body: { sprintIndex?: unknown };
  try {
    body = await request.json();
  } catch {
    return error("Invalid JSON body.");
  }
  const sprintIndex = Math.floor(Number(body.sprintIndex));
  if (!Number.isFinite(sprintIndex) || sprintIndex < 0) {
    return error("sprintIndex must be a non-negative sprint number.");
  }

  await ensureClosedSprintsTable(env);
  await env.DB.prepare(`DELETE FROM closed_sprints WHERE sprint_index = ?`)
    .bind(sprintIndex)
    .run();

  return listClosedSprints(env);
}
