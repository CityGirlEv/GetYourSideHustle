/**
 * Mark Cursor-fixed failed tests as fixed_cursor with stamped notes.
 * Usage: node scripts/mark-fixed-cursor.mjs
 *
 * Never drops QA notes — reads via --command and merges history.
 */
import { d1ExecFile, loadNotesWithHistory, sqlEscape } from "./_d1-remote.mjs";

const now = new Date().toISOString();
const stamp = now.replace("T", " ").replace(/\.\d{3}Z$/, " UTC");

const FIXES = [
  {
    caseId: "PROOF-005-TINA",
    assignee: "tina",
    fix: "Standardized user-facing copy to Teen Hustles (not Junior Hustles) in Workshops speakers/tags + seed/prod D1.",
  },
  {
    caseId: "PROOF-006-LYRIQ",
    assignee: "lyriq",
    fix: "Removed Community timed mock injector that duplicated Chloe King and Ray Patel posts; those posts now appear once in the initial feed.",
  },
  {
    caseId: "PROOF-007-TINA",
    assignee: "tina",
    fix: "Join copy uses age-appropriate (not age-right); yearly billing shows ~17% savings / 2 months free on paid tiers.",
  },
  {
    caseId: "PROOF-046-LYRIQ",
    assignee: "lyriq",
    fix: "Removed large DRAFT watermark from generated guide PDFs (member/admin/marketing manuals).",
  },
  {
    caseId: "PROOF-047-LYRIQ",
    assignee: "lyriq",
    fix: "Removed large DRAFT watermark from generated guide PDFs (member/admin/marketing manuals).",
  },
  {
    caseId: "PROOF-048-LYRIQ",
    assignee: "lyriq",
    fix: "Removed large DRAFT watermark from generated guide PDFs (member/admin/marketing manuals).",
  },
  {
    caseId: "PROOF-049-LYRIQ",
    assignee: "lyriq",
    fix: "Removed large DRAFT watermark from generated guide PDFs (member/admin/marketing manuals).",
  },
  {
    caseId: "PROOF-050-LYRIQ",
    assignee: "lyriq",
    fix: "Removed large DRAFT watermark from generated guide PDFs (member/admin/marketing manuals).",
  },
  {
    caseId: "PROOF-051-LYRIQ",
    assignee: "lyriq",
    fix: "Removed large DRAFT watermark from generated guide PDFs (member/admin/marketing manuals).",
  },
];

function noteId() {
  return `n-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function appendCursorNote(entries, fixText) {
  const nonCursorBefore = entries.filter(
    (e) => String(e.author || "").toLowerCase() !== "cursor",
  ).length;
  const next = [...entries];
  next.push({
    id: noteId(),
    author: "Cursor",
    createdAt: now,
    updatedAt: now,
    text: `Fixed by Cursor · ${stamp}: ${fixText}`,
  });
  const nonCursorAfter = next.filter(
    (e) => String(e.author || "").toLowerCase() !== "cursor",
  ).length;
  if (nonCursorAfter < nonCursorBefore) {
    throw new Error(`Refusing note drop (${nonCursorBefore} → ${nonCursorAfter})`);
  }
  return JSON.stringify(next);
}

for (const item of FIXES) {
  const loaded = loadNotesWithHistory(item.caseId);
  if (!loaded) {
    console.log(`skip missing ${item.caseId}`);
    continue;
  }
  const { row, entries } = loaded;
  const note = appendCursorNote(entries, item.fix);
  const original = String(row.original_assignee || item.assignee).trim() || item.assignee;
  d1ExecFile(`
UPDATE test_case_status
SET status = 'fixed_cursor',
    note = '${sqlEscape(note)}',
    assignee = '${sqlEscape(original)}',
    original_assignee = '${sqlEscape(original)}',
    failed_step_index = NULL,
    checked_steps_json = '[]',
    updated_at = '${now}',
    updated_by = 'Cursor'
WHERE case_id = '${sqlEscape(item.caseId)}'
`);
  console.log(`fixed_cursor ← ${item.caseId} → ${original} [kept ${entries.length} prior]`);
}

console.log("Done. PW-JOIN-002 left as fail (contact email 502 / Resend infra).");
