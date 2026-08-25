import { TEST_CASES } from "../src/lib/gysh-test-plan.ts";
import { tomorrowMMDDYY, todayMMDDYY } from "../src/lib/gysh-tasks.ts";

const due = tomorrowMMDDYY();
const dateAssigned = todayMMDDYY();
const ids = new Set([
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
  "ADMIN-010-LYRIQ",
  "AUTH-007-EVELYN",
  "AUTH-007-TINA",
  "AUTH-007-LYRIQ",
  "VIDEO-003-EVELYN",
  "VIDEO-003-TINA",
]);

const cases = TEST_CASES.filter((t) => ids.has(t.id)).map((t) => ({
  id: t.id,
  assignee: t.assignees[0],
  dueDate: due,
  dateAssigned,
}));

process.stdout.write(JSON.stringify({ cases }));
