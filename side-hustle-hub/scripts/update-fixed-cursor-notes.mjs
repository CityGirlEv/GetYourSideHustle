/**
 * Append Fixed/Cursor notes + update statuses. NEVER replaces/drops existing QA notes.
 * Note format for new Cursor entries:
 *   Previously Failed. <fix> <QA Name>. please re-test.
 *   Previously Conditional Pass. <fix> <QA Name>. please re-test.
 *
 * IMPORTANT: On Windows, wrangler --file + --json does NOT return SELECT row data.
 * Always read notes via d1Select / loadNotesWithHistory (--command).
 */
import { d1ExecFile, loadNotesWithHistory, sqlEscape } from "./_d1-remote.mjs";

const now = new Date().toISOString();

const FAILED_FIXES = [
  {
    caseId: "PROOF-005-TINA",
    qa: "Tina",
    assignee: "tina",
    fix: "Standardized user-facing copy to Teen Hustles (not Junior Hustles) in Workshops speakers/tags and prod D1.",
  },
  {
    caseId: "PROOF-006-LYRIQ",
    qa: "Lyriq",
    assignee: "lyriq",
    fix: "Removed Community timed mock injector that duplicated Chloe King and Ray Patel posts; each post now appears once in the feed.",
  },
  {
    caseId: "PROOF-007-TINA",
    qa: "Tina",
    assignee: "tina",
    fix: "Join copy uses age-appropriate (not age-right); yearly billing shows ~17% savings / 2 months free on paid tiers.",
  },
  {
    caseId: "PROOF-046-LYRIQ",
    qa: "Lyriq",
    assignee: "lyriq",
    fix: "Removed the large DRAFT watermark from generated guide PDFs (member/admin/marketing manuals).",
  },
  {
    caseId: "PROOF-047-LYRIQ",
    qa: "Lyriq",
    assignee: "lyriq",
    fix: "Removed the large DRAFT watermark from generated guide PDFs (member/admin/marketing manuals).",
  },
  {
    caseId: "PROOF-048-LYRIQ",
    qa: "Lyriq",
    assignee: "lyriq",
    fix: "Removed the large DRAFT watermark from generated guide PDFs (member/admin/marketing manuals).",
  },
  {
    caseId: "PROOF-049-LYRIQ",
    qa: "Lyriq",
    assignee: "lyriq",
    fix: "Removed the large DRAFT watermark from generated guide PDFs (member/admin/marketing manuals).",
  },
  {
    caseId: "PROOF-050-LYRIQ",
    qa: "Lyriq",
    assignee: "lyriq",
    fix: "Removed the large DRAFT watermark from generated guide PDFs (member/admin/marketing manuals).",
  },
  {
    caseId: "PROOF-051-LYRIQ",
    qa: "Lyriq",
    assignee: "lyriq",
    fix: "Removed the large DRAFT watermark from generated guide PDFs (member/admin/marketing manuals).",
  },
];

const CONDITIONAL_FIXES = [
  {
    caseId: "NAV-002",
    qa: "Tina",
    assignee: "tina",
    fix: "Footer Join GYSH opens Join; See Memberships now scrolls to Free–Elite pricing (#gysh-membership-plans) so the two CTAs are no longer identical.",
  },
  {
    caseId: "PROOF-019-TINA",
    qa: "Tina",
    assignee: "tina",
    fix: "Digital Products step 1 now explains a one-sentence promise with a concrete buyer-result example.",
  },
  {
    caseId: "PROOF-020-TINA",
    qa: "Tina",
    assignee: "tina",
    fix: "Rewrote Affiliate Marketing (card + guide) around commission links (Amazon, TikTok Shop, brands, etc.) with beginner-friendly steps and disclosure.",
  },
  {
    caseId: "PROOF-021-TINA",
    qa: "Tina",
    assignee: "tina",
    fix: "Rewrote Amazon FBA guide for beginners — plain-English FBA first, free validation before Jungle Scout/Helium 10.",
  },
  {
    caseId: "PROOF-024-TINA",
    qa: "Tina",
    assignee: "tina",
    fix: "AI Asset Studio step 1 is now generic (any AI image tool + editor) with more setup detail; card copy softened too.",
  },
  {
    caseId: "PROOF-031-TINA",
    qa: "Tina",
    assignee: "tina",
    fix: "Book Publishing step 1 now includes coloring books/journals and explains the one-sentence promise with an example.",
  },
  {
    caseId: "PROOF-036-TINA",
    qa: "Tina",
    assignee: "tina",
    fix: "Lowered test evidence max to ~1.5MB and reject oversized base64 before D1 insert (fixes SQLITE_TOOBIG on attach). Compress large screenshots and retry.",
  },
];

const EVELYN_REVIEW = [
  {
    caseId: "PROOF-025-TINA",
    qa: "Tina",
    assignee: "evelyn",
    fix: "Reassigned to Evelyn for Property Management guide content review as Tina requested.",
  },
  {
    caseId: "PROOF-030-TINA",
    qa: "Tina",
    assignee: "evelyn",
    fix: "Reassigned to Evelyn for AI Agents guide content review as Tina requested.",
  },
];

function noteId() {
  return `n-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function cursorNoteText(prefix, fix, qa) {
  const body = String(fix || "").trim().replace(/[.!?]+$/, "");
  return `${prefix}. ${body}. ${qa}. please re-test.`;
}

/** Append or refresh ONLY the latest Cursor "Previously…" note — keep every other entry. */
function upsertCursorNote(entries, text) {
  const nonCursorBefore = entries.filter(
    (e) => String(e.author || "").toLowerCase() !== "cursor",
  ).length;

  const preserved = entries.filter((e) => {
    const author = String(e.author || "").toLowerCase();
    const body = String(e.text || "");
    if (author !== "cursor") return true;
    return !/^Previously (Failed|Conditional Pass)\./i.test(body.trim());
  });

  preserved.push({
    id: noteId(),
    author: "Cursor",
    createdAt: now,
    updatedAt: now,
    text,
  });

  const nonCursorAfter = preserved.filter(
    (e) => String(e.author || "").toLowerCase() !== "cursor",
  ).length;
  if (nonCursorAfter < nonCursorBefore) {
    throw new Error(
      `Refusing note write: non-Cursor notes would drop (${nonCursorBefore} → ${nonCursorAfter})`,
    );
  }
  return JSON.stringify(preserved);
}

function applyFix(item, prefix, { status = "fixed_cursor" } = {}) {
  const loaded = loadNotesWithHistory(item.caseId);
  if (!loaded) {
    console.log(`skip missing ${item.caseId}`);
    return;
  }
  const { row, entries } = loaded;
  const qaCount = entries.filter((e) => String(e.author || "").toLowerCase() !== "cursor").length;
  if (qaCount === 0) {
    console.warn(
      `warn ${item.caseId}: no QA notes in current+history — writing Cursor stamp only`,
    );
  }

  const note = upsertCursorNote(entries, cursorNoteText(prefix, item.fix, item.qa));
  const original =
    String(row.original_assignee || row.assignee || item.assignee || "").trim() || item.assignee;
  const assignee = item.assignee;
  const clearSteps =
    status === "fixed_cursor"
      ? `failed_step_index = NULL,
    checked_steps_json = '[]',`
      : "";

  d1ExecFile(`
UPDATE test_case_status
SET status = '${sqlEscape(status)}',
    note = '${sqlEscape(note)}',
    assignee = '${sqlEscape(assignee)}',
    original_assignee = '${sqlEscape(original)}',
    ${clearSteps}
    updated_at = '${now}',
    updated_by = 'Cursor'
WHERE case_id = '${sqlEscape(item.caseId)}'
`);
  console.log(
    `${status} ← ${item.caseId} → ${assignee} (${prefix}) [kept ${qaCount} QA + history entries]`,
  );
}

for (const item of FAILED_FIXES) applyFix(item, "Previously Failed");
for (const item of CONDITIONAL_FIXES) applyFix(item, "Previously Conditional Pass");
for (const item of EVELYN_REVIEW)
  applyFix(item, "Previously Conditional Pass", { status: "conditional_approval" });

console.log("Done. PW-JOIN-002 left as fail (contact 502 / Resend).");
