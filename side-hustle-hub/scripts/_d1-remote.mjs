/**
 * Safe remote D1 helpers for Windows.
 * - SELECT/short reads: --command (PowerShell-quoted) — --file does NOT return row data with --json
 * - UPDATE/long SQL: --file
 */
import { execSync } from "node:child_process";
import { writeFileSync, mkdtempSync, rmSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

export function sqlEscape(s) {
  return String(s).replace(/'/g, "''");
}

/** Run SELECT / short SQL; return parsed wrangler JSON array. */
export function d1Select(sql) {
  const psSql = String(sql).replace(/'/g, "''");
  const cmd = `npx wrangler d1 execute gysh-db --remote --json --command '${psSql}'`;
  const out = execSync(cmd, {
    cwd: process.cwd(),
    shell: "powershell.exe",
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
    maxBuffer: 50 * 1024 * 1024,
  });
  const start = out.indexOf("[");
  if (start < 0) throw new Error(`No JSON from D1:\n${out.slice(0, 500)}`);
  return JSON.parse(out.slice(start));
}

/** Run UPDATE/DDL via --file (long payloads). */
export function d1ExecFile(sql) {
  const dir = mkdtempSync(join(tmpdir(), "gysh-d1-"));
  const file = join(dir, "q.sql");
  const body = sql.trim().endsWith(";") ? `${sql.trim()}\n` : `${sql.trim()};\n`;
  writeFileSync(file, body, "utf8");
  try {
    execSync(`npx wrangler d1 execute gysh-db --remote --file "${file}"`, {
      cwd: process.cwd(),
      shell: "powershell.exe",
      stdio: ["ignore", "pipe", "pipe"],
      maxBuffer: 50 * 1024 * 1024,
    });
  } finally {
    try {
      rmSync(dir, { recursive: true, force: true });
    } catch {
      /* ignore */
    }
  }
}

export function parseNotes(raw) {
  if (Array.isArray(raw)) {
    return raw.filter((e) => e && typeof e === "object" && String(e.text ?? "").trim());
  }
  const trimmed = String(raw ?? "").trim();
  if (!trimmed) return [];
  if (trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.filter((e) => e && typeof e === "object" && String(e.text ?? "").trim());
      }
    } catch {
      /* fall through */
    }
  }
  return [
    {
      id: "legacy",
      author: "Prior note",
      createdAt: "1970-01-01T00:00:00.000Z",
      updatedAt: "1970-01-01T00:00:00.000Z",
      text: trimmed,
    },
  ];
}

/** Load current notes + all non-empty history notes for a case. */
export function loadNotesWithHistory(caseId) {
  const id = sqlEscape(caseId);
  const current = d1Select(
    `SELECT case_id, note, original_assignee, assignee, status FROM test_case_status WHERE case_id = '${id}'`,
  )?.[0]?.results?.[0];
  if (!current) return null;

  const histRows =
    d1Select(
      `SELECT note FROM test_case_status_history WHERE case_id = '${id}' AND note IS NOT NULL AND TRIM(note) != '' ORDER BY changed_at DESC LIMIT 40`,
    )?.[0]?.results ?? [];

  const byId = new Map();
  for (const list of [parseNotes(current.note), ...histRows.map((r) => parseNotes(r.note))]) {
    for (const e of list) {
      const eid = String(e.id || "").trim() || `legacy-${String(e.text).slice(0, 24)}`;
      const text = String(e.text ?? "").trim();
      if (!text) continue;
      if (!byId.has(eid)) {
        byId.set(eid, {
          id: eid,
          author: String(e.author || "Prior note").trim() || "Prior note",
          createdAt: e.createdAt || "1970-01-01T00:00:00.000Z",
          updatedAt: e.updatedAt || e.createdAt || "1970-01-01T00:00:00.000Z",
          text,
        });
      }
    }
  }

  const entries = [...byId.values()].sort(
    (a, b) =>
      String(a.createdAt).localeCompare(String(b.createdAt)) || a.id.localeCompare(b.id),
  );
  return { row: current, entries };
}
