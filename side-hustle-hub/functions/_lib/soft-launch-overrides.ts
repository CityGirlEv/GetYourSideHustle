/**
 * Persist Content Factory calendar item field overrides (title, day, copy, etc.).
 */
import { error, json, type DbUser, type Env } from "./auth";

const OWNERS = new Set(["Tina", "Evelyn", "Both"]);
const CHANNELS = new Set([
  "facebook_gysh",
  "facebook_kevina",
  "youtube_gysh",
  "tiktok_gysh",
  "instagram_gysh",
  "website",
  "newsletter",
  "ads",
  "personal_amplify",
]);

export type SoftLaunchItemPatch = {
  sprint?: number;
  day?: string;
  channel?: string;
  title?: string;
  owner?: string;
  postTime?: string | null;
  copy?: string | null;
  imagePrompt?: string | null;
  videoPrompt?: string | null;
  hedraStartImagePrompt?: string | null;
  hedraVideoPrompt?: string | null;
  relatedTestIds?: string[] | null;
  artifacts?: string[] | null;
  websiteActions?: string[] | null;
  notes?: string | null;
  /** Explicit CF status — same as Task List. Null clears back to auto. */
  status?: "not_started" | "in_progress" | "blocked" | "done" | null;
};

function asStringArray(value: unknown): string[] | null | undefined {
  if (value === null) return null;
  if (value === undefined) return undefined;
  if (!Array.isArray(value)) return undefined;
  return value.map((v) => String(v ?? "").trim()).filter(Boolean);
}

function asOptionalString(value: unknown): string | null | undefined {
  if (value === null) return null;
  if (value === undefined) return undefined;
  return String(value);
}

/** Validate and strip unknown keys from a client patch. */
export function sanitizeSoftLaunchPatch(
  raw: unknown,
  opts?: { lenient?: boolean },
): SoftLaunchItemPatch | { error: string } {
  const lenient = opts?.lenient === true;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    return lenient ? {} : { error: "patch object is required." };
  }
  const body = raw as Record<string, unknown>;
  const patch: SoftLaunchItemPatch = {};
  const reject = (message: string): SoftLaunchItemPatch | { error: string } | null => {
    if (lenient) return null;
    return { error: message };
  };

  if ("sprint" in body) {
    const sprint = Math.floor(Number(body.sprint));
    if (![2, 3, 4, 5].includes(sprint)) {
      const failed = reject("sprint must be 2, 3, 4, or 5.");
      if (failed) return failed;
    } else {
      patch.sprint = sprint;
    }
  }
  if ("day" in body) {
    const day = String(body.day || "").trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) {
      const failed = reject("day must be YYYY-MM-DD.");
      if (failed) return failed;
    } else {
      patch.day = day;
    }
  }
  if ("channel" in body) {
    const channel = String(body.channel || "").trim();
    if (!CHANNELS.has(channel)) {
      const failed = reject("Invalid channel.");
      if (failed) return failed;
    } else {
      patch.channel = channel;
    }
  }
  if ("title" in body) {
    const title = String(body.title ?? "").trim();
    if (!title) {
      const failed = reject("title cannot be empty.");
      if (failed) return failed;
    } else {
      patch.title = title;
    }
  }
  if ("owner" in body) {
    const owner = String(body.owner || "").trim();
    if (!OWNERS.has(owner)) {
      const failed = reject("owner must be Tina, Evelyn, or Both.");
      if (failed) return failed;
    } else {
      patch.owner = owner;
    }
  }
  if ("postTime" in body) patch.postTime = asOptionalString(body.postTime);
  if ("copy" in body) patch.copy = asOptionalString(body.copy);
  if ("imagePrompt" in body) patch.imagePrompt = asOptionalString(body.imagePrompt);
  if ("videoPrompt" in body) patch.videoPrompt = asOptionalString(body.videoPrompt);
  if ("hedraStartImagePrompt" in body) {
    patch.hedraStartImagePrompt = asOptionalString(body.hedraStartImagePrompt);
  }
  if ("hedraVideoPrompt" in body) {
    patch.hedraVideoPrompt = asOptionalString(body.hedraVideoPrompt);
  }
  if ("notes" in body) patch.notes = asOptionalString(body.notes);
  if ("status" in body || "cfStatus" in body || "markedDone" in body) {
    if (body.status === null || body.cfStatus === null || body.markedDone === false) {
      patch.status = null;
    } else if (body.markedDone === true) {
      patch.status = "done";
    } else {
      const raw = body.status ?? body.cfStatus;
      const st = String(raw || "").trim().toLowerCase();
      if (st === "open") {
        patch.status = "not_started";
      } else if (
        st === "not_started" ||
        st === "in_progress" ||
        st === "blocked" ||
        st === "done"
      ) {
        patch.status = st;
      } else {
        const failed = reject(
          "status must be not_started, in_progress, blocked, done, or null.",
        );
        if (failed) return failed;
      }
    }
  }
  if ("relatedTestIds" in body) {
    const arr = asStringArray(body.relatedTestIds);
    if (arr === undefined) {
      const failed = reject("relatedTestIds must be an array of strings.");
      if (failed) return failed;
    } else {
      patch.relatedTestIds = arr;
    }
  }
  if ("artifacts" in body) {
    const arr = asStringArray(body.artifacts);
    if (arr === undefined) {
      const failed = reject("artifacts must be an array of strings.");
      if (failed) return failed;
    } else {
      patch.artifacts = arr;
    }
  }
  if ("websiteActions" in body) {
    const arr = asStringArray(body.websiteActions);
    if (arr === undefined) {
      const failed = reject("websiteActions must be an array of strings.");
      if (failed) return failed;
    } else {
      patch.websiteActions = arr;
    }
  }

  if (Object.keys(patch).length === 0) {
    return lenient ? {} : { error: "No valid fields to update." };
  }
  return patch;
}

export function mergeSoftLaunchPatches(
  base: SoftLaunchItemPatch,
  next: SoftLaunchItemPatch,
): SoftLaunchItemPatch {
  const out: SoftLaunchItemPatch = { ...base };
  for (const [key, value] of Object.entries(next) as [keyof SoftLaunchItemPatch, SoftLaunchItemPatch[keyof SoftLaunchItemPatch]][]) {
    if (value === null) {
      delete out[key];
    } else if (value !== undefined) {
      (out as Record<string, unknown>)[key] = value;
    }
  }
  return out;
}

export async function ensureSoftLaunchOverridesTable(env: Env): Promise<void> {
  await env.DB.prepare(
    `CREATE TABLE IF NOT EXISTS soft_launch_item_overrides (
      item_id TEXT PRIMARY KEY,
      patch_json TEXT NOT NULL DEFAULT '{}',
      updated_at TEXT NOT NULL,
      updated_by TEXT NOT NULL DEFAULT ''
    )`,
  ).run();
}

type OverrideRow = {
  item_id: string;
  patch_json: string;
  updated_at: string;
  updated_by: string;
};

export function parsePatchJson(raw: string): SoftLaunchItemPatch {
  try {
    const parsed = JSON.parse(raw || "{}");
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    const sanitized = sanitizeSoftLaunchPatch(parsed, { lenient: true });
    if ("error" in sanitized) return {};
    return sanitized;
  } catch {
    return {};
  }
}

export async function listSoftLaunchOverrides(env: Env): Promise<Response> {
  await ensureSoftLaunchOverridesTable(env);
  const { results } = await env.DB.prepare(
    `SELECT item_id, patch_json, updated_at, updated_by FROM soft_launch_item_overrides`,
  ).all<OverrideRow>();

  const overrides: Record<
    string,
    { patch: SoftLaunchItemPatch; updatedAt: string; updatedBy: string }
  > = {};
  for (const row of results ?? []) {
    overrides[row.item_id] = {
      patch: parsePatchJson(row.patch_json),
      updatedAt: row.updated_at,
      updatedBy: row.updated_by,
    };
  }
  return json({ overrides });
}

export async function upsertSoftLaunchOverride(
  env: Env,
  request: Request,
  actor: DbUser,
): Promise<Response> {
  await ensureSoftLaunchOverridesTable(env);
  let body: { itemId?: string; patch?: unknown; replace?: boolean };
  try {
    body = await request.json();
  } catch {
    return error("Invalid JSON body.");
  }

  const itemId = String(body.itemId || "").trim();
  if (!itemId) return error("itemId is required.");

  const sanitized = sanitizeSoftLaunchPatch(body.patch);
  if ("error" in sanitized) return error(sanitized.error);

  const existing = await env.DB.prepare(
    `SELECT patch_json FROM soft_launch_item_overrides WHERE item_id = ?`,
  )
    .bind(itemId)
    .first<{ patch_json: string }>();

  const prev = existing ? parsePatchJson(existing.patch_json) : {};
  const next = body.replace ? sanitized : mergeSoftLaunchPatches(prev, sanitized);
  const now = new Date().toISOString();
  const by = actor.email || actor.name || "";

  await env.DB.prepare(
    `INSERT INTO soft_launch_item_overrides (item_id, patch_json, updated_at, updated_by)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(item_id) DO UPDATE SET
       patch_json = excluded.patch_json,
       updated_at = excluded.updated_at,
       updated_by = excluded.updated_by`,
  )
    .bind(itemId, JSON.stringify(next), now, by)
    .run();

  return json({
    ok: true,
    itemId,
    patch: next,
    updatedAt: now,
    updatedBy: by,
  });
}

export async function deleteSoftLaunchOverride(
  env: Env,
  request: Request,
  _actor: DbUser,
): Promise<Response> {
  await ensureSoftLaunchOverridesTable(env);
  let body: { itemId?: string };
  try {
    body = await request.json();
  } catch {
    return error("Invalid JSON body.");
  }
  const itemId = String(body.itemId || "").trim();
  if (!itemId) return error("itemId is required.");
  await env.DB.prepare(`DELETE FROM soft_launch_item_overrides WHERE item_id = ?`)
    .bind(itemId)
    .run();
  return json({ ok: true, itemId });
}

export async function handleSoftLaunchOverrides(
  env: Env,
  request: Request,
  actor: DbUser,
): Promise<Response> {
  const method = request.method.toUpperCase();
  if (method === "GET") return listSoftLaunchOverrides(env);
  if (method === "PUT" || method === "POST") return upsertSoftLaunchOverride(env, request, actor);
  if (method === "DELETE") return deleteSoftLaunchOverride(env, request, actor);
  return error("Method not allowed.", 405);
}
