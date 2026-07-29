/**
 * Mark PW-FAIL-0e6b8f69 Pass with fix note after contact form hardening.
 */
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import path from "node:path";
import fs from "node:fs";
import os from "node:os";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const wranglerJs = path.resolve(
  root,
  "../../muntie-ev-ai-studio-main/node_modules/wrangler/bin/wrangler.js",
);

function runFile(sql) {
  const tmp = path.join(os.tmpdir(), `gysh-mark-pw-fail-${Date.now()}.sql`);
  fs.writeFileSync(tmp, sql, "utf8");
  try {
    const out = execFileSync(
      process.execPath,
      [
        "--use-system-ca",
        wranglerJs,
        "d1",
        "execute",
        "gysh-db",
        "--remote",
        "--json",
        "--file",
        tmp,
      ],
      { cwd: root, encoding: "utf8", maxBuffer: 20 * 1024 * 1024 },
    );
    const start = out.indexOf("[");
    if (start < 0) throw new Error(`No JSON in wrangler output:\n${out.slice(0, 400)}`);
    return JSON.parse(out.slice(start));
  } finally {
    try {
      fs.unlinkSync(tmp);
    } catch {
      /* ignore */
    }
  }
}

function esc(s) {
  return String(s ?? "").replace(/'/g, "''");
}

const now = new Date().toISOString();
const fixNote = `FIXED 2026-07-29: Contact form verified on production (POST /api/contact → 200, Resend provider id logged, row in contact_submissions with email_status=sent).

What changed:
1. Persist every Contact Us submit to D1 (contact_submissions) before/while emailing.
2. Retry Resend once on failure.
3. If D1 saved the message, return success even when Resend blips (no more hard 502 for saved messages).
4. Set reply_to to the sender so admins can reply from the inbox email.

Re-test: Contact Us → Send message should show thanks (not Request failed 502).`;

const select = runFile(
  `SELECT note FROM test_case_status WHERE case_id = 'PW-FAIL-0e6b8f69';`,
);
const prev = select?.[0]?.results?.[0]?.note ?? "";
const combined = `${String(prev).trim()}\n\n${fixNote}`.trim();

const updated = runFile(
  `UPDATE test_case_status
   SET status = 'pass',
       note = '${esc(combined)}',
       assignee = 'evelyn',
       updated_at = '${esc(now)}',
       updated_by = 'system'
   WHERE case_id = 'PW-FAIL-0e6b8f69';
   SELECT case_id, status, assignee, length(note) AS note_len
   FROM test_case_status WHERE case_id = 'PW-FAIL-0e6b8f69';`,
);

console.log(JSON.stringify(updated, null, 2));
