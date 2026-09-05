import { error, json } from "./crypto";
import { canAccessTestingPortal, parseRoles } from "./roles";
import {
  inferBetaCasePriority,
  tallyBetaTesterScores,
  type BetaPointCaseInput,
} from "../../src/lib/beta-tester-points";

type Env = { DB: D1Database };

function displayNameFromUser(name: string, email: string): string {
  const first = String(name || "")
    .trim()
    .split(/\s+/)[0];
  if (first) return first;
  const local = String(email || "").split("@")[0] || "";
  return local ? local.charAt(0).toUpperCase() + local.slice(1) : "";
}

export async function handleBetaTesterPoints(
  env: Env,
  user: { role?: string; roles?: string | string[] | null },
): Promise<Response> {
  const roles = parseRoles(
    user.role || "adult",
    Array.isArray(user.roles) ? JSON.stringify(user.roles) : user.roles,
  );
  if (!roles.includes("beta") && !canAccessTestingPortal(roles)) {
    return error("Beta Tester or Testing Portal access is required to view points.", 403);
  }

  const { results: statusRows } = await env.DB.prepare(
    `SELECT case_id, status, assignee, failed_step_index
     FROM test_case_status
     WHERE trim(assignee) != ''`,
  ).all<{
    case_id: string;
    status: string;
    assignee: string;
    failed_step_index: number | null;
  }>();

  let priorFails = new Set<string>();
  try {
    const hist = await env.DB.prepare(
      `SELECT DISTINCT case_id FROM test_case_status_history WHERE status = 'fail'`,
    ).all<{ case_id: string }>();
    priorFails = new Set((hist.results ?? []).map((r) => r.case_id));
  } catch {
    /* history table may be missing in older DBs */
  }

  const generatedPriority = new Map<string, string>();
  try {
    const gen = await env.DB.prepare(`SELECT id, priority FROM generated_test_cases`).all<{
      id: string;
      priority: string;
    }>();
    for (const row of gen.results ?? []) generatedPriority.set(row.id, row.priority);
  } catch {
    /* optional */
  }

  const inputs: BetaPointCaseInput[] = (statusRows ?? []).map((row) => ({
    caseId: row.case_id,
    status: row.status,
    assignee: row.assignee,
    priority: generatedPriority.get(row.case_id) || inferBetaCasePriority(row.case_id),
    failedStepIndex: row.failed_step_index,
    hadPriorFail: priorFails.has(row.case_id),
  }));

  const names: Record<string, string> = {};
  try {
    const users = await env.DB.prepare(`SELECT name, email FROM users`).all<{
      name: string;
      email: string;
    }>();
    for (const u of users.results ?? []) {
      const first = displayNameFromUser(u.name, u.email);
      if (first) names[first.toLowerCase()] = first;
    }
  } catch {
    /* names optional */
  }

  const testers = tallyBetaTesterScores(inputs, names);
  return json({ testers });
}
