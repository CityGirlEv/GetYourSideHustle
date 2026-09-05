/**
 * End Sprint 4 → Sprint 5 (rollover all open tasks/tests/plan, then lock Sprint 4).
 * Uses local Pages Functions (remote D1) — same path as Schedule → End Sprint.
 *
 *   node --use-system-ca scripts/end-sprint-4-to-5.mjs
 *   node --use-system-ca scripts/end-sprint-4-to-5.mjs --dry-run
 */
const BASE = process.env.GYSH_API_BASE || "http://127.0.0.1:8788";
const FROM = 4;
const TO = 5;
/** Tue+2 due for Sprint 5 (same as dueDateForSprint(5)). */
const TO_DUE = "09/03/26";
const TO_LABEL = "Sprint 5";
const ACTOR = "Tina";
const dryRun = process.argv.includes("--dry-run");

const DONE_TEST = new Set(["pass", "conditional_approval"]);

function cookieFromLogin(res) {
  const multi = typeof res.headers.getSetCookie === "function" ? res.headers.getSetCookie() : [];
  if (multi.length) return multi.map((c) => c.split(";")[0]).join("; ");
  const single = res.headers.get("set-cookie") || "";
  return single.split(";")[0] || "";
}

function parseNotes(raw) {
  const trimmed = String(raw ?? "").trim();
  if (!trimmed) return [];
  if (trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed.filter((e) => e && typeof e === "object");
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

function appendRolloverNote(raw) {
  const entries = parseNotes(raw);
  const text = `Rolled over from Sprint ${FROM}`;
  if (entries.some((e) => /Rolled over from Sprint\s*4|Rolling over from Sprint\s*4/i.test(String(e.text || "")))) {
    return JSON.stringify(entries);
  }
  const now = new Date().toISOString();
  entries.push({
    id: `n-roll-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
    author: ACTOR,
    createdAt: now,
    updatedAt: now,
    text,
  });
  return JSON.stringify(entries);
}

async function api(path, { method = "GET", body, cookie } = {}) {
  const res = await fetch(`${BASE}/api/${path}`, {
    method,
    headers: {
      accept: "application/json",
      ...(cookie ? { cookie } : {}),
      ...(body !== undefined ? { "content-type": "application/json" } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  let data;
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    data = { raw: text };
  }
  if (!res.ok) {
    throw new Error(`${method} ${path} → ${res.status}: ${data.error || text.slice(0, 300)}`);
  }
  return data;
}

async function main() {
  const login = await fetch(`${BASE}/api/auth/login`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: "tinamariebarham@gmail.com", password: "Admin123" }),
  });
  if (!login.ok) throw new Error(`Login failed: ${login.status} ${await login.text()}`);
  const cookie = cookieFromLogin(login);
  if (!cookie) throw new Error("No session cookie from login");

  const closed = await api("closed-sprints", { cookie });
  const closedSet = new Set((closed.closed || []).map(Number));
  console.log("Closed sprints:", [...closedSet].sort((a, b) => a - b).join(", ") || "(none)");
  if (closedSet.has(FROM)) {
    console.log(`Sprint ${FROM} already closed — nothing to do.`);
    return;
  }

  const [tasksPayload, tests, plan] = await Promise.all([
    api("tasks", { cookie }),
    api("test-statuses", { cookie }),
    api("agile-plan", { cookie }),
  ]);
  const tasks = tasksPayload.tasks || [];
  const openTasks = tasks.filter((t) => Number(t.sprint) === FROM && t.status !== "done");
  const openTestIds = [
    ...new Set([
      ...Object.keys(tests.sprints || {}).filter(
        (id) => Number(tests.sprints[id]) === FROM && !DONE_TEST.has(String(tests.statuses?.[id] || "not_run")),
      ),
    ]),
  ];
  const openPlan = (plan.items || []).filter((i) => Number(i.sprint) === FROM && i.status !== "done");

  console.log(dryRun ? "=== DRY RUN ===" : "=== LIVE END SPRINT ===");
  console.log(`Open tasks on S${FROM}:`, openTasks.length);
  console.log(`Open tests on S${FROM}:`, openTestIds.length);
  console.log(`Open plan on S${FROM}:`, openPlan.length);

  const taskDelta = openTasks.map((t) => ({
    ...t,
    sprint: TO,
    dueDate: TO_DUE,
    status: t.status === "not_started" ? "in_progress" : t.status,
    notes: appendRolloverNote(t.notes),
  }));

  const testBatch = openTestIds.map((caseId) => {
    const st = String(tests.statuses?.[caseId] || "not_run");
    const workStatus = st === "rolled_over" ? "not_run" : st;
    return {
      caseId,
      status: workStatus,
      note: appendRolloverNote(tests.notes?.[caseId] ?? ""),
      assignee: tests.assignees?.[caseId] ?? "",
      sprint: TO,
      dueDate: TO_DUE,
    };
  });

  const nextPlanItems = (plan.items || []).map((i) => {
    if (Number(i.sprint) !== FROM || i.status === "done") return i;
    return {
      ...i,
      sprint: TO,
      status: "carried",
      dateLabel: TO_LABEL,
    };
  });

  if (dryRun) {
    console.log("Would roll tasks:", taskDelta.map((t) => t.id));
    console.log("Would roll tests:", testBatch.map((t) => t.caseId));
    console.log(
      "Would carry plan:",
      openPlan.map((i) => i.id),
    );
    console.log(`Would close Sprint ${FROM}`);
    return;
  }

  if (taskDelta.length > 0) {
    await api("tasks", { method: "PUT", cookie, body: { tasks: taskDelta } });
    console.log(`Rolled ${taskDelta.length} task(s) → S${TO}`);
  } else {
    console.log("No open tasks to roll.");
  }

  if (testBatch.length > 0) {
    const chunk = 40;
    for (let i = 0; i < testBatch.length; i += chunk) {
      const slice = testBatch.slice(i, i + chunk);
      await api("test-statuses", { method: "PUT", cookie, body: { items: slice } });
      console.log(`Rolled tests ${Math.min(i + slice.length, testBatch.length)} / ${testBatch.length}`);
    }
  } else {
    console.log("No open tests to roll.");
  }

  if (openPlan.length > 0) {
    await api("agile-plan", {
      method: "PUT",
      cookie,
      body: { items: nextPlanItems, retro: plan.retro || [] },
    });
    console.log(`Carried ${openPlan.length} plan item(s) → S${TO}`);
  } else {
    console.log("No open plan items to carry.");
  }

  const after = await api("closed-sprints", {
    method: "POST",
    cookie,
    body: { sprintIndex: FROM },
  });
  console.log("Closed sprints now:", (after.closed || []).join(", "));
  console.log(`Done — Sprint ${FROM} locked; open work on Sprint ${TO}.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
