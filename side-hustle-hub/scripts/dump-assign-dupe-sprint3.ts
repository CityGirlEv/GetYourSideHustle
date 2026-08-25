import { TEST_CASES } from "../src/lib/gysh-test-plan.ts";
import { tomorrowMMDDYY, todayMMDDYY } from "../src/lib/gysh-tasks.ts";

function addDaysMMDDYY(days: number, ref: Date = new Date()): string {
  const d = new Date(ref.getFullYear(), ref.getMonth(), ref.getDate() + days);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  return `${mm}/${dd}/${yy}`;
}

/** Evelyn/Tina copies from calculator triples + former shared-assignee splits. */
const OUR_CASE_IDS = [
  "SCHED-PNL-001-EVELYN",
  "SCHED-PNL-001-TINA",
  "ADULT-002-EVELYN",
  "ADULT-002-TINA",
  "MEMBER-001-EVELYN",
  "MEMBER-001-TINA",
  "SENIOR-001-EVELYN",
  "SENIOR-001-TINA",
  "ADMIN-004-EVELYN",
  "ADMIN-004-TINA",
  "ADMIN-009-EVELYN",
  "ADMIN-009-TINA",
  "ADMIN-010-EVELYN",
  "AUTH-007-EVELYN",
  "AUTH-007-TINA",
  "VIDEO-003-EVELYN",
  "VIDEO-003-TINA",
] as const;

const tomorrow = tomorrowMMDDYY();
const dayAfter = addDaysMMDDYY(2);
const dateAssigned = todayMMDDYY();

const byOwner: Record<string, typeof OUR_CASE_IDS[number][]> = {
  evelyn: [],
  tina: [],
};

for (const id of OUR_CASE_IDS) {
  const t = TEST_CASES.find((c) => c.id === id);
  const owner = (t?.assignees[0] || "").toLowerCase();
  if (owner === "evelyn" || owner === "tina") {
    byOwner[owner]!.push(id);
  }
}

const cases: {
  id: string;
  assignee: string;
  dueDate: string;
  dateAssigned: string;
}[] = [];

for (const owner of ["evelyn", "tina"] as const) {
  const ids = byOwner[owner]!.slice().sort();
  const mid = Math.ceil(ids.length / 2);
  ids.forEach((id, i) => {
    cases.push({
      id,
      assignee: owner,
      dueDate: i < mid ? tomorrow : dayAfter,
      dateAssigned,
    });
  });
}

const tasks: {
  id: string;
  assignedTo: string;
  dueDate: string;
}[] = [];

process.stdout.write(JSON.stringify({ cases, tasks, tomorrow, dayAfter }));
