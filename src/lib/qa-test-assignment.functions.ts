import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { z } from "zod";
import { TEST_CASES, type TestStatus } from "@/lib/test-plan";
import {
  publicSiteUrl,
  sendTransactionalTemplates,
  notifyAdminInboxes,
} from "@/lib/send-transactional-template.server";
import { isEnabledQaAccount, NON_QA_ASSIGNEE_LABELS } from "@/lib/qa-test-assignment.server";

const SKIP_ASSIGNEES = NON_QA_ASSIGNEE_LABELS;

const STATUS_LABELS: Record<TestStatus, string> = {
  not_run: "Not run",
  in_progress: "In progress",
  pass: "Pass",
  fail: "Fail",
  blocked: "Blocked",
  fixed_retest: "Fixed / Retest",
  failed_retest: "Failed / Retest",
};

export type AssignedTestRow = {
  id: string;
  title: string;
  area?: string;
  status: TestStatus;
  statusLabel: string;
  isNew?: boolean;
};

type QaRecipient = { email: string; testerName: string; userId: string };

type QaUserIndex = {
  byFirstName: Map<string, QaRecipient>;
};

function assigneeFirstName(value: string): string {
  const first = value.trim().split(/\s+/)[0] || "";
  if (!first) return "";
  return first.charAt(0).toUpperCase() + first.slice(1);
}

function normalizeAssigneeKey(value: string): string {
  return value.trim().toLowerCase();
}

async function buildEnabledQaUserIndex(): Promise<QaUserIndex> {
  const { data: qaRoles } = await supabaseAdmin
    .from("user_roles")
    .select("user_id")
    .eq("role", "qa");
  const qaIds = new Set((qaRoles ?? []).map((r) => r.user_id));
  if (qaIds.size === 0) return { byFirstName: new Map() };

  const { data: profiles } = await supabaseAdmin.from("profiles").select("id, full_name");
  const profileMap = new Map((profiles ?? []).map((p) => [p.id, p.full_name ?? ""]));
  const { data: authList, error } = await supabaseAdmin.auth.admin.listUsers();
  if (error) throw new Error(error.message);

  const byFirstName = new Map<string, QaRecipient>();
  for (const user of authList.users ?? []) {
    if (!qaIds.has(user.id) || !user.email) continue;

    const bannedUntil = (user as { banned_until?: string | null }).banned_until;
    const banned = !!(bannedUntil && new Date(bannedUntil).getTime() > Date.now());
    const emailConfirmed = !!(user as { email_confirmed_at?: string | null }).email_confirmed_at;
    if (
      !isEnabledQaAccount({
        hasQaRole: true,
        emailConfirmed,
        banned,
      })
    ) {
      continue;
    }

    const fullName = (
      profileMap.get(user.id) ||
      (user.user_metadata?.full_name as string) ||
      user.email ||
      ""
    ).trim();
    const first = normalizeAssigneeKey(fullName.split(/\s+/)[0] || "");
    if (!first) continue;

    byFirstName.set(first, {
      email: user.email,
      testerName: assigneeFirstName(fullName),
      userId: user.id,
    });
  }

  return { byFirstName };
}

async function resolveAssigneeRecipient(
  assigneeLabel: string,
  index?: QaUserIndex,
): Promise<{ email: string; testerName: string } | null> {
  const target = normalizeAssigneeKey(assigneeLabel);
  if (SKIP_ASSIGNEES.has(assigneeLabel.trim()) || !target) return null;

  const qaIndex = index ?? (await buildEnabledQaUserIndex());
  const hit = qaIndex.byFirstName.get(target);
  if (!hit) return null;
  return { email: hit.email, testerName: hit.testerName };
}

function testMeta(testId: string): { id: string; title: string; area?: string } {
  const match = TEST_CASES.find((t) => t.id === testId);
  return {
    id: testId,
    title: match?.title ?? testId,
    area: match?.area,
  };
}

function assigneeMatches(label: string | null | undefined, assigneeLabel: string): boolean {
  if (!label?.trim()) return false;
  const first = label.trim().split(/\s+/)[0] || label;
  return normalizeAssigneeKey(first) === normalizeAssigneeKey(assigneeLabel);
}

async function loadAssignedTestsForAssignee(
  assigneeLabel: string,
  newTestIds: string[],
): Promise<AssignedTestRow[]> {
  const { data: rows } = await supabaseAdmin
    .from("test_results")
    .select("test_id, status, assignee");

  const byId = new Map<string, TestStatus | null>();
  for (const row of rows ?? []) {
    if (assigneeMatches(row.assignee, assigneeLabel)) {
      byId.set(row.test_id, (row.status as TestStatus | null) ?? "not_run");
    }
  }

  for (const t of TEST_CASES) {
    if (t.assignee && assigneeMatches(t.assignee, assigneeLabel) && !byId.has(t.id)) {
      byId.set(t.id, null);
    }
  }

  for (const id of newTestIds) {
    if (!byId.has(id)) byId.set(id, null);
  }

  const newSet = new Set(newTestIds);
  return [...byId.entries()]
    .map(([id, status]) => {
      const resolved = (status ?? "not_run") as TestStatus;
      return {
        ...testMeta(id),
        status: resolved,
        statusLabel: STATUS_LABELS[resolved],
        isNew: newSet.has(id),
      };
    })
    .sort((a, b) => a.id.localeCompare(b.id));
}

async function sendAssigneeAssignmentEmail(
  assignee: string,
  newTestIds: string[],
  index?: QaUserIndex,
): Promise<"sent" | "skipped"> {
  const siteUrl = publicSiteUrl().replace(/\/$/, "");
  const loginUrl = `${siteUrl}/auth?tab=sign-in`;
  const testingUrl = `${siteUrl}/testing`;

  const recipient = await resolveAssigneeRecipient(assignee, index);
  if (!recipient) return "skipped";

  const newTests = newTestIds.map(testMeta);
  const assignedTests = await loadAssignedTestsForAssignee(assignee, newTestIds);
  const idempotencyKey = `beta-test-assignment-${recipient.email}-${testIdsKey(newTestIds)}-${Date.now()}`;

  const result = await sendTransactionalTemplates({
    templateName: "beta-test-assignment",
    recipientEmail: recipient.email,
    templateData: {
      testerName: recipient.testerName,
      loginUrl,
      testingUrl,
      newTests,
      assignedTests,
    },
    idempotencyKey,
  });

  if (result.queued > 0) {
    try {
      await notifyAdminInboxes({
        templateName: "beta-test-assignment",
        templateData: {
          testerName: recipient.testerName,
          loginUrl,
          testingUrl,
          newTests,
          assignedTests,
        },
        idempotencyPrefix: `admin-beta-test-assignment-${recipient.email}-${testIdsKey(newTestIds)}-${Date.now()}`,
      });
    } catch (e) {
      console.warn("[email] failed to notify admins of beta test assignment", e);
    }
  }

  return result.queued > 0 ? "sent" : "skipped";
}

async function sendAssigneeUnassignEmail(
  previousAssignee: string,
  removedTestIds: string[],
  index?: QaUserIndex,
): Promise<"sent" | "skipped"> {
  const siteUrl = publicSiteUrl().replace(/\/$/, "");
  const loginUrl = `${siteUrl}/auth?tab=sign-in`;
  const testingUrl = `${siteUrl}/testing`;

  const recipient = await resolveAssigneeRecipient(previousAssignee, index);
  if (!recipient) return "skipped";

  const removedTests = removedTestIds.map(testMeta);
  const assignedTests = (await loadAssignedTestsForAssignee(previousAssignee, [])).filter(
    (t) => !removedTestIds.includes(t.id),
  );
  const idempotencyKey = `beta-test-unassigned-${recipient.email}-${testIdsKey(removedTestIds)}-${Date.now()}`;

  const result = await sendTransactionalTemplates({
    templateName: "beta-test-unassigned",
    recipientEmail: recipient.email,
    templateData: {
      testerName: recipient.testerName,
      loginUrl,
      testingUrl,
      removedTests,
      assignedTests,
    },
    idempotencyKey,
  });

  return result.queued > 0 ? "sent" : "skipped";
}

function testIdsKey(ids: string[]): string {
  return ids.length ? [...ids].sort().join(",") : "roster";
}

export async function sendAssignmentEmailsToAssignees(
  assignees: string[],
  testIds: string[] = [],
): Promise<{ sent: number; skipped: number }> {
  let sent = 0;
  let skipped = 0;
  const seen = new Set<string>();
  const index = await buildEnabledQaUserIndex();

  for (const raw of assignees) {
    const assignee = raw.trim();
    if (SKIP_ASSIGNEES.has(assignee)) continue;
    const key = normalizeAssigneeKey(assignee);
    if (seen.has(key)) continue;
    seen.add(key);

    const outcome = await sendAssigneeAssignmentEmail(assignee, testIds, index);
    if (outcome === "sent") sent++;
    else skipped++;
  }

  return { sent, skipped };
}

function devNoteIdempotencySuffix(note: string): string {
  return note.trim().slice(0, 48).replace(/\s+/g, "-");
}

async function sendDevNoteEmail(
  row: {
    testId: string;
    assigneeLabel: string;
    devNote: string;
    devAuthorName?: string;
    status?: string;
  },
  index?: QaUserIndex,
): Promise<"sent" | "skipped"> {
  const siteUrl = publicSiteUrl().replace(/\/$/, "");
  const loginUrl = `${siteUrl}/auth?tab=sign-in`;
  const testingUrl = `${siteUrl}/testing`;
  const meta = testMeta(row.testId);
  const statusLabel =
    row.status && row.status in STATUS_LABELS
      ? STATUS_LABELS[row.status as TestStatus]
      : row.status || "";

  const recipient = await resolveAssigneeRecipient(row.assigneeLabel, index);
  const templateData = {
    testerName: recipient?.testerName ?? (assigneeFirstName(row.assigneeLabel) || "there"),
    loginUrl,
    testingUrl,
    testId: meta.id,
    testTitle: meta.title,
    testArea: meta.area,
    devNote: row.devNote,
    devAuthorName: row.devAuthorName || "Development",
    statusLabel,
  };

  let qaSent = false;
  if (recipient) {
    const idempotencyKey = `beta-test-dev-note-${recipient.email}-${row.testId}-${devNoteIdempotencySuffix(row.devNote)}-${Date.now()}`;
    const result = await sendTransactionalTemplates({
      templateName: "beta-test-dev-note",
      recipientEmail: recipient.email,
      templateData,
      idempotencyKey,
    });
    qaSent = result.queued > 0;
  }

  try {
    await notifyAdminInboxes({
      templateName: "beta-test-dev-note",
      templateData,
      idempotencyPrefix: `admin-beta-test-dev-note-${row.testId}-${devNoteIdempotencySuffix(row.devNote)}-${Date.now()}`,
    });
  } catch (e) {
    console.warn("[email] failed to notify admins of beta test dev note", e);
  }

  return qaSent ? "sent" : "skipped";
}

export async function sendDevNoteEmailsToQaOwners(
  notifications: Array<{
    testId: string;
    assigneeLabel: string;
    devNote: string;
    devAuthorName?: string;
    status?: string;
  }>,
): Promise<{ sent: number; skipped: number }> {
  let sent = 0;
  let skipped = 0;
  const index = await buildEnabledQaUserIndex();

  for (const row of notifications) {
    const note = row.devNote.trim();
    if (!note) continue;
    const outcome = await sendDevNoteEmail({ ...row, devNote: note }, index);
    if (outcome === "sent") sent++;
    else skipped++;
  }

  return { sent, skipped };
}

export async function sendUnassignEmailsToPreviousOwners(
  unassignments: Array<{ testId: string; previousAssignee: string }>,
): Promise<{ sent: number; skipped: number }> {
  const byOwner = new Map<string, string[]>();
  for (const row of unassignments) {
    const prev = row.previousAssignee.trim();
    if (SKIP_ASSIGNEES.has(prev)) continue;
    const list = byOwner.get(prev) ?? [];
    if (!list.includes(row.testId)) list.push(row.testId);
    byOwner.set(prev, list);
  }

  let sent = 0;
  let skipped = 0;
  const index = await buildEnabledQaUserIndex();
  for (const [previousAssignee, testIds] of byOwner) {
    const outcome = await sendAssigneeUnassignEmail(previousAssignee, testIds, index);
    if (outcome === "sent") sent++;
    else skipped++;
  }

  return { sent, skipped };
}

/** After account enable: send roster assignment email if QA user has pending tests. */
export async function sendAssignmentEmailOnUserEnable(userId: string): Promise<"sent" | "skipped"> {
  const { data: userData, error } = await supabaseAdmin.auth.admin.getUserById(userId);
  if (error) throw new Error(error.message);
  const user = userData.user;
  if (!user?.email) return "skipped";

  const bannedUntil = (user as { banned_until?: string | null }).banned_until;
  const banned = !!(bannedUntil && new Date(bannedUntil).getTime() > Date.now());
  const emailConfirmed = !!(user as { email_confirmed_at?: string | null }).email_confirmed_at;
  const { data: roleRow } = await supabaseAdmin
    .from("user_roles")
    .select("role")
    .eq("user_id", userId)
    .eq("role", "qa")
    .maybeSingle();
  if (
    !isEnabledQaAccount({
      hasQaRole: !!roleRow,
      emailConfirmed,
      banned,
    })
  ) {
    return "skipped";
  }

  const { data: prof } = await supabaseAdmin
    .from("profiles")
    .select("full_name")
    .eq("id", userId)
    .maybeSingle();
  const fullName = (
    prof?.full_name ||
    (user.user_metadata?.full_name as string) ||
    user.email ||
    ""
  ).trim();
  const assigneeLabel = fullName.split(/\s+/)[0] || "";
  if (!assigneeLabel) return "skipped";

  const assignedTests = await loadAssignedTestsForAssignee(assigneeLabel, []);
  if (assignedTests.length === 0) return "skipped";

  const outcome = await sendAssigneeAssignmentEmail(assigneeLabel, []);
  return outcome;
}

export const sendBetaTestAssignmentByAssignees = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        assignees: z.array(z.string().min(1).max(80)).min(1).max(50),
        /** When omitted or empty, sends the full current roster (no "new" tests). */
        testIds: z.array(z.string().min(1).max(80)).max(50).optional(),
      })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: callerRoles } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);
    if (!(callerRoles ?? []).some((r) => r.role === "admin")) {
      throw new Error("Admin access required");
    }
    return sendAssignmentEmailsToAssignees(data.assignees, data.testIds ?? []);
  });

/** Manual/admin-only — not called from Testing Portal save. */
export const notifyBetaTestAssignments = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        assignments: z
          .array(
            z.object({
              testId: z.string().min(1).max(80),
              assignee: z.string().min(1).max(80),
            }),
          )
          .min(1)
          .max(50),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    const byAssignee = new Map<string, string[]>();
    for (const row of data.assignments) {
      const assignee = row.assignee.trim();
      if (SKIP_ASSIGNEES.has(assignee)) continue;
      const list = byAssignee.get(assignee) ?? [];
      if (!list.includes(row.testId)) list.push(row.testId);
      byAssignee.set(assignee, list);
    }

    let sent = 0;
    let skipped = 0;
    for (const [assignee, testIds] of byAssignee) {
      const result = await sendAssignmentEmailsToAssignees([assignee], testIds);
      sent += result.sent;
      skipped += result.skipped;
    }
    return { sent, skipped };
  });

export const notifyBetaTestUnassignments = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        unassignments: z
          .array(
            z.object({
              testId: z.string().min(1).max(80),
              previousAssignee: z.string().min(1).max(80),
            }),
          )
          .min(1)
          .max(50),
      })
      .parse(input),
  )
  .handler(async ({ data }) => sendUnassignEmailsToPreviousOwners(data.unassignments));

export const notifyBetaTestDevNotes = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        notifications: z
          .array(
            z.object({
              testId: z.string().min(1).max(80),
              assigneeLabel: z.string().min(1).max(80),
              devNote: z.string().min(1).max(4000),
              devAuthorName: z.string().max(120).optional(),
              status: z.string().max(40).optional(),
            }),
          )
          .min(1)
          .max(50),
      })
      .parse(input),
  )
  .handler(async ({ data }) => sendDevNoteEmailsToQaOwners(data.notifications));

export const getAssignedTestsForAssignee = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({
        assigneeLabel: z.string().min(1).max(80),
      })
      .parse(input),
  )
  .handler(async ({ data }) => {
    return loadAssignedTestsForAssignee(data.assigneeLabel, []);
  });
